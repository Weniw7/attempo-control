import { env } from "cloudflare:workers";

type RuntimeEnv = {
  META_WEBHOOK_VERIFY_TOKEN?: string;
  META_APP_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type InstagramMessage = {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    attachments?: Array<{ type?: string }>;
    is_echo?: boolean;
  };
};

type InstagramPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    time?: number;
    messaging?: InstagramMessage[];
  }>;
};

const runtimeEnv = env as RuntimeEnv;
const verifyTokenSha256 =
  "24d97a7c4f7763f917ccfb13a8143cdab29dd5b809456920ed54cecfc4f25a58";

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function verifyMetaSignature(body: ArrayBuffer, signature: string | null) {
  const secret = runtimeEnv.META_APP_SECRET;
  if (!secret || !signature?.startsWith("sha256=")) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, body);
  const expected =
    "sha256=" +
    Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");

  return timingSafeEqual(expected, signature);
}

async function supabaseRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const supabaseUrl = runtimeEnv.SUPABASE_URL;
  const serviceRoleKey = runtimeEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Webhook storage is not configured");
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${response.status}: ${detail.slice(0, 300)}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function messageBody(message: InstagramMessage["message"]) {
  if (message?.text) return message.text;
  const attachmentType = message?.attachments?.[0]?.type;
  return attachmentType ? `[Adjunto: ${attachmentType}]` : "[Mensaje sin texto]";
}

async function processInstagramMessage(
  accountId: string,
  event: InstagramMessage,
) {
  const messageId = event.message?.mid;
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id;
  if (!messageId || !senderId || !recipientId) return false;

  const outbound = Boolean(event.message?.is_echo || senderId === accountId);
  const instagramUserId = outbound ? recipientId : senderId;
  if (!instagramUserId || instagramUserId === accountId) return false;

  const organizationId = "7c958ab7-f949-4557-9460-f70da79b9d1f";
  const occurredAt = new Date(event.timestamp ?? Date.now()).toISOString();

  const contacts = await supabaseRequest<Array<{ id: string }>>(
    "contacts?on_conflict=organization_id,instagram_user_id&select=id",
    {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        organization_id: organizationId,
        instagram_user_id: instagramUserId,
        full_name: `Instagram ${instagramUserId.slice(-6)}`,
        contact_type: "other",
        status: "active",
        updated_at: occurredAt,
      }),
    },
  );
  const contactId = contacts[0]?.id;
  if (!contactId) throw new Error("Instagram contact upsert returned no ID");

  const conversations = await supabaseRequest<Array<{ id: string }>>(
    "conversations?on_conflict=organization_id,channel,external_thread_id&select=id",
    {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        organization_id: organizationId,
        contact_id: contactId,
        channel: "instagram",
        external_thread_id: instagramUserId,
        subject: "Conversación de Instagram",
        priority: "medium",
        status: outbound ? "awaiting_them" : "awaiting_us",
        approval_status: "not_required",
        last_message_at: occurredAt,
        updated_at: occurredAt,
      }),
    },
  );
  const conversationId = conversations[0]?.id;
  if (!conversationId) throw new Error("Instagram conversation upsert returned no ID");

  await supabaseRequest(
    "messages?on_conflict=organization_id,external_message_id",
    {
      method: "POST",
      headers: { prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({
        organization_id: organizationId,
        conversation_id: conversationId,
        external_message_id: messageId,
        direction: outbound ? "outbound" : "inbound",
        sender_name: outbound ? "Attempo" : `Instagram ${instagramUserId.slice(-6)}`,
        body: messageBody(event.message),
        ai_generated: false,
        sent_at: occurredAt,
      }),
    },
  );

  return true;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expectedToken = runtimeEnv.META_WEBHOOK_VERIFY_TOKEN;
  const validToken = Boolean(
    token &&
      ((expectedToken && timingSafeEqual(token, expectedToken)) ||
        timingSafeEqual(await sha256(token), verifyTokenSha256)),
  );

  if (mode === "subscribe" && challenge && validToken) {
    return new Response(challenge, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return Response.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  const body = await request.arrayBuffer();
  const validSignature = await verifyMetaSignature(
    body,
    request.headers.get("x-hub-signature-256"),
  );

  if (!validSignature) {
    return Response.json({ error: "Invalid Meta signature" }, { status: 401 });
  }

  if (!runtimeEnv.SUPABASE_URL || !runtimeEnv.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "Webhook storage is not configured" }, { status: 503 });
  }

  const payload = JSON.parse(new TextDecoder().decode(body)) as InstagramPayload;
  const firstEntry = payload.entry?.[0];
  const metaEventId =
    firstEntry?.messaging?.[0]?.message?.mid ??
    (firstEntry?.id && firstEntry?.time
      ? `${firstEntry.id}:${firstEntry.time}`
      : null);

  try {
    await supabaseRequest(
      "instagram_webhook_events?on_conflict=meta_event_id",
      {
        method: "POST",
        headers: { prefer: "resolution=ignore-duplicates,return=minimal" },
        body: JSON.stringify({
          meta_event_id: metaEventId,
          object_type: payload.object ?? "instagram",
          payload,
        }),
      },
    );

    let processed = 0;
    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        if (await processInstagramMessage(entry.id ?? "", event)) processed += 1;
      }
    }

    if (metaEventId) {
      await supabaseRequest(
        `instagram_webhook_events?meta_event_id=eq.${encodeURIComponent(metaEventId)}`,
        {
          method: "PATCH",
          headers: { prefer: "return=minimal" },
          body: JSON.stringify({
            processing_status: processed > 0 ? "processed" : "ignored",
            processed_at: new Date().toISOString(),
            error_message: null,
          }),
        },
      );
    }

    return Response.json({ received: true, processed });
  } catch (error) {
    if (metaEventId) {
      await supabaseRequest(
        `instagram_webhook_events?meta_event_id=eq.${encodeURIComponent(metaEventId)}`,
        {
          method: "PATCH",
          headers: { prefer: "return=minimal" },
          body: JSON.stringify({
            processing_status: "failed",
            error_message: error instanceof Error ? error.message.slice(0, 500) : "Unknown error",
          }),
        },
      ).catch(() => undefined);
    }

    return Response.json({ error: "Webhook processing failed" }, { status: 502 });
  }
}
