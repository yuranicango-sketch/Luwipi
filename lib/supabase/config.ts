export const SUPABASE_URL=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL??"https://sohyyocenodzqypjglix.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY=process.env.SUPABASE_PUBLISHABLE_KEY??process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??"sb_publishable_0gL0rYpL6pRalgre_h4HQg_D2vzyo_l";
export const SUPABASE_SECRET_KEY=process.env.SUPABASE_SECRET_KEY;
export function hasSupabaseSecret(){return Boolean(SUPABASE_SECRET_KEY)}
