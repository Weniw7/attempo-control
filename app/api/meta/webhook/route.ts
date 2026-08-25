import { env } from "cloudflare:workers";

type RuntimeEnv = {
  META_WEBHOOK_VERIFY_TOKEN?: string;
  META_APP_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const runtimeEnv = env as RuntimeEnv;

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expectedToken = runtimeEnv.META_WEBHOOK_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    challenge &&
    expectedToken &&
    token &&
    timingSafeEqual(token, expectedToken)
  ) {
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

  const supabaseUrl = runtimeEnv.SUPABASE_URL;
  const serviceRoleKey = runtimeEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "Webhook storage is not configured" }, { status: 503 });
  }

  const payload = JSON.parse(new TextDecoder().decode(body)) as {
    object?: string;
    entry?: Array<{ id?: string; time?: number; messaging?: Array<{ message?: { mid?: string } }> }>;
  };
  const firstEntry = payload.entry?.[0];
  const metaEventId =
    firstEntry?.messaging?.[0]?.message?.mid ??
    (firstEntry?.id && firstEntry?.time
      ? `${firstEntry.id}:${firstEntry.time}`
      : null);

  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/rest/v1/instagram_webhook_events`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        "content-type": "application/json",
        prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify({
        meta_event_id: metaEventId,
        object_type: payload.object ?? "instagram",
        payload,
      }),
    },
  );

  if (!response.ok) {
    return Response.json({ error: "Webhook storage failed" }, { status: 502 });
  }

  return Response.json({ received: true });
}
