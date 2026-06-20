import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if credentials are default placeholders or blank
const isConfigured =
  supabaseUrl &&
  supabaseUrl !== "https://your-project-id.supabase.co" &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes("your-anon-key-placeholder");

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  if (typeof window !== "undefined") {
    console.warn(
      "TaskFlow Warning: Supabase variables are missing or default in .env.local. Falling back to browser LocalStorage."
    );
  }
}
