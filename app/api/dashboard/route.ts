const supabaseUrl = "https://xagptutyzrkmjyjnwfoi.supabase.co";
const supabasePublishableKey = "sb_publishable_ce5Gp3GX1ODYHdaX3pfXIw_MNxMyK_Y";

export async function GET() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_attempo_dashboard`, {
      method: "POST",
      headers: {
        apikey: supabasePublishableKey,
        authorization: `Bearer ${supabasePublishableKey}`,
        "content-type": "application/json",
      },
      body: "{}",
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Supabase ${response.status}: ${detail.slice(0, 300)}`);
    }

    const dashboard = await response.json();
    return Response.json(dashboard, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown dashboard error" },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
