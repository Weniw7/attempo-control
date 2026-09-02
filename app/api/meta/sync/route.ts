import { env } from "cloudflare:workers";

type RuntimeEnv = {
  META_WEBHOOK_VERIFY_TOKEN?: string;
  META_INSTAGRAM_ACCESS_TOKEN?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type GraphParticipant = { id?: string; username?: string; name?: string };
type GraphMessage = {
  id?: string;
  created_time?: string;
  from?: GraphParticipant;
  to?: { data?: GraphParticipant[] };
  message?: string;
};
type GraphConversation = {
  id?: string;
  updated_time?: string;
  participants?: { data?: GraphParticipant[] };
  messages?: { data?: GraphMessage[]; paging?: { next?: string } };
};
type GraphPage<T> = { data?: T[]; paging?: { next?: string } };

const runtimeEnv = env as RuntimeEnv;
const accountId = "17841464852576267";
const organizationId = "7c958ab7-f949-4557-9460-f70da79b9d1f";
const graphBase = "https://graph.instagram.com/v26.0";

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = runtimeEnv.SUPABASE_URL;
  const key = runtimeEnv.SUPABASE_SERVICE_ROLE_KEY;
  const missing = [
    !url ? "SUPABASE_URL" : null,
    !key ? "SUPABASE_SERVICE_ROLE_KEY" : null,
  ].filter(Boolean);
  if (missing.length) throw new Error(`Missing runtime variable(s): ${missing.join(", ")}`);

  const supabaseBase = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  const response = await fetch(`${supabaseBase}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 400)}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function graphRequest<T>(pathOrUrl: string, init: RequestInit = {}): Promise<T> {
  const token = runtimeEnv.META_INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error("META_INSTAGRAM_ACCESS_TOKEN is missing");
  const url = pathOrUrl.startsWith("https://") ? pathOrUrl : `${graphBase}/${pathOrUrl}`;
  const response = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Instagram Graph API ${response.status}: ${detail.slice(0, 500)}`);
  }
  return response.json() as Promise<T>;
}

async function repairSubscription() {
  const current = await graphRequest<GraphPage<{ id?: string; subscribed_fields?: string[] }>>(
    `${accountId}/subscribed_apps`,
  );
  const hasMessages = current.data?.some((item) => item.subscribed_fields?.includes("messages"));
  if (hasMessages) return false;

  await graphRequest(`${accountId}/subscribed_apps?subscribed_fields=messages`, {
    method: "POST",
  });
  return true;
}

async function collectPages<T>(firstUrl: string, nested = false) {
  const rows: T[] = [];
  let next: string | undefined = firstUrl;
  for (let page = 0; next && page < 20; page += 1) {
    const result = await graphRequest<GraphPage<T>>(next);
    rows.push(...(result.data ?? []));
    next = result.paging?.next;
    if (nested) break;
  }
  return rows;
}

async function messagesForConversation(conversation: GraphConversation) {
  const messages = [...(conversation.messages?.data ?? [])];
  let next = conversation.messages?.paging?.next;
  for (let page = 0; next && page < 20; page += 1) {
    const result = await graphRequest<GraphPage<GraphMessage>>(next);
    messages.push(...(result.data ?? []));
    next = result.paging?.next;
  }
  return messages;
}

async function upsertConversation(conversation: GraphConversation) {
  const messages = await messagesForConversation(conversation);
  const participant =
    conversation.participants?.data?.find((item) => item.id && item.id !== accountId) ??
    messages.map((item) => item.from).find((item) => item?.id && item.id !== accountId) ??
    messages.flatMap((item) => item.to?.data ?? []).find((item) => item.id && item.id !== accountId);
  if (!participant?.id) return { messagesSeen: messages.length, messagesUpserted: 0 };

  const displayName = participant.name || participant.username || `Instagram ${participant.id.slice(-6)}`;
  const contacts = await supabaseRequest<Array<{ id: string }>>(
    "contacts?on_conflict=organization_id,instagram_user_id&select=id",
    {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        organization_id: organizationId,
        instagram_user_id: participant.id,
        instagram_handle: participant.username ?? null,
        full_name: displayName,
        contact_type: "other",
        status: "active",
        updated_at: new Date().toISOString(),
      }),
    },
  );
  const contactId = contacts[0]?.id;
  if (!contactId) throw new Error(`Contact upsert failed for ${participant.id}`);

  const latestAt = conversation.updated_time || messages[0]?.created_time || new Date().toISOString();
  const conversations = await supabaseRequest<Array<{ id: string }>>(
    "conversations?on_conflict=organization_id,channel,external_thread_id&select=id",
    {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        organization_id: organizationId,
        contact_id: contactId,
        channel: "instagram",
        external_thread_id: participant.id,
        subject: `Instagram · ${displayName}`,
        priority: "medium",
        status: "open",
        approval_status: "not_required",
        last_message_at: latestAt,
        updated_at: new Date().toISOString(),
      }),
    },
  );
  const conversationId = conversations[0]?.id;
  if (!conversationId) throw new Error(`Conversation upsert failed for ${participant.id}`);

  let messagesUpserted = 0;
  for (const message of messages) {
    if (!message.id) continue;
    const outbound = message.from?.id === accountId;
    await supabaseRequest("messages?on_conflict=organization_id,external_message_id", {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        organization_id: organizationId,
        conversation_id: conversationId,
        external_message_id: message.id,
        direction: outbound ? "outbound" : "inbound",
        sender_name: outbound ? "Attempo" : displayName,
        body: message.message || "[Mensaje multimedia]",
        ai_generated: false,
        sent_at: message.created_time ?? null,
      }),
    });
    messagesUpserted += 1;
  }

  return { messagesSeen: messages.length, messagesUpserted };
}

export async function POST(request: Request) {
  const expected = runtimeEnv.META_WEBHOOK_VERIFY_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || !supplied || !timingSafeEqual(expected, supplied)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const triggerSource = request.headers.get("x-sync-source") === "cron" ? "cron" : "manual";
  let runId: string | undefined;

  try {
    const runs = await supabaseRequest<Array<{ id: string }>>("instagram_sync_runs?select=id", {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({ status: "running", trigger_source: triggerSource }),
    });
    runId = runs[0]?.id;

    const subscriptionRepaired = await repairSubscription();
    const fields = encodeURIComponent(
      "id,updated_time,participants,messages.limit(100){id,created_time,from,to,message}",
    );
    const conversations = await collectPages<GraphConversation>(
      `${accountId}/conversations?platform=instagram&fields=${fields}&limit=100`,
    );

    let messagesSeen = 0;
    let messagesUpserted = 0;
    for (const conversation of conversations) {
      const result = await upsertConversation(conversation);
      messagesSeen += result.messagesSeen;
      messagesUpserted += result.messagesUpserted;
    }

    if (runId) {
      await supabaseRequest(`instagram_sync_runs?id=eq.${runId}`, {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({
          status: "succeeded",
          conversations_seen: conversations.length,
          messages_seen: messagesSeen,
          messages_upserted: messagesUpserted,
          subscription_repaired: subscriptionRepaired,
          finished_at: new Date().toISOString(),
        }),
      });
    }

    return Response.json({
      ok: true,
      subscriptionRepaired,
      conversationsSeen: conversations.length,
      messagesSeen,
      messagesUpserted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    if (runId) {
      await supabaseRequest(`instagram_sync_runs?id=eq.${runId}`, {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({ status: "failed", error_message: message.slice(0, 1000), finished_at: new Date().toISOString() }),
      }).catch(() => undefined);
    }
    return Response.json({ error: message }, { status: 502 });
  }
}
