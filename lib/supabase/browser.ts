"use client";
import {createBrowserClient} from "@supabase/ssr";
export function createBrowserSupabaseClient(){
 const url=document.documentElement.dataset.supabaseUrl;
 const key=document.documentElement.dataset.supabaseKey;
 if(!url||!key)throw new Error("Supabase client configuration unavailable");
 return createBrowserClient(url,key);
}
