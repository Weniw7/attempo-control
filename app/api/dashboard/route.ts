import { env } from "cloudflare:workers";

type RuntimeEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const runtimeEnv = env as RuntimeEnv;
const organizationId = "7c958ab7-f949-4557-9460-f70da79b9d1f";

async function supabaseGet<T>(path: string): Promise<T> {
  const supabaseUrl = runtimeEnv.SUPABASE_URL;
  const serviceRoleKey = runtimeEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server credentials are not configured");
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`, {
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${response.status}: ${detail.slice(0, 300)}`);
  }

  return (await response.json()) as T;
}

export async function GET() {
  try {
    const org = encodeURIComponent(organizationId);
    const [contacts, conversations, messages, suppliers, opportunities, costScenarios] =
      await Promise.all([
        supabaseGet<Array<{ id: string; full_name: string; company: string | null; contact_type: string; instagram_handle: string | null; notes: string | null }>>(
          `contacts?organization_id=eq.${org}&select=id,full_name,company,contact_type,instagram_handle,notes&order=updated_at.desc`,
        ),
        supabaseGet<Array<{ id: string; contact_id: string | null; subject: string | null; classification: string | null; priority: string; status: string; summary: string | null; suggested_reply: string | null; last_message_at: string | null }>>(
          `conversations?organization_id=eq.${org}&classification=neq.system_test&select=id,contact_id,subject,classification,priority,status,summary,suggested_reply,last_message_at&order=last_message_at.desc.nullslast`,
        ),
        supabaseGet<Array<{ id: string; conversation_id: string; direction: string; sender_name: string | null; body: string; sent_at: string | null }>>(
          `messages?organization_id=eq.${org}&select=id,conversation_id,direction,sender_name,body,sent_at&order=sent_at.asc.nullsfirst`,
        ),
        supabaseGet<Array<{ id: string; contact_id: string | null; name: string; country: string | null; currency: string; moq: number | null; gsm_min: number | null; gsm_max: number | null; materials: string[] | null; lead_time_min_days: number | null; lead_time_max_days: number | null; pipeline_status: string; next_action: string | null; notes: string | null }>>(
          `suppliers?organization_id=eq.${org}&select=id,contact_id,name,country,currency,moq,gsm_min,gsm_max,materials,lead_time_min_days,lead_time_max_days,pipeline_status,next_action,notes&order=updated_at.desc`,
        ),
        supabaseGet<Array<{ id: string; title: string; opportunity_type: string; stage: string; expected_revenue: number | null; probability: number | null; next_action: string | null; due_date: string | null }>>(
          `opportunities?organization_id=eq.${org}&select=id,title,opportunity_type,stage,expected_revenue,probability,next_action,due_date&order=updated_at.desc`,
        ),
        supabaseGet<Array<{ id: string }>>(
          `cost_scenarios?organization_id=eq.${org}&select=id`,
        ),
      ]);

    const contactById = new Map(contacts.map((contact) => [contact.id, contact]));
    const messagesByConversation = new Map<string, typeof messages>();
    for (const message of messages) {
      const list = messagesByConversation.get(message.conversation_id) ?? [];
      list.push(message);
      messagesByConversation.set(message.conversation_id, list);
    }

    return Response.json({
      metrics: {
        suppliers: suppliers.length,
        conversations: conversations.length,
        opportunities: opportunities.length,
        costScenarios: costScenarios.length,
      },
      conversations: conversations.map((conversation) => ({
        ...conversation,
        contact: conversation.contact_id ? contactById.get(conversation.contact_id) ?? null : null,
        messages: messagesByConversation.get(conversation.id) ?? [],
      })),
      suppliers,
      opportunities,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown dashboard error" },
      { status: 500 },
    );
  }
}
