export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';
  return Response.json({ supabaseUrl, supabasePublishableKey }, { headers: { 'cache-control': 'private, no-store' } });
}
