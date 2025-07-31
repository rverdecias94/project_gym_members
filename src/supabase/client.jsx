import { createClient } from "@supabase/supabase-js";

/* export const supabase = createClient("https://gjgclazfoptzgjdbxvgd.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZ2NsYXpmb3B0emdqZGJ4dmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE1Nzg0NjUsImV4cCI6MjAyNzE1NDQ2NX0.xQxCL9lSKQalJ3RoYwxKdKUnwDKOya_fbp1F4agB_rM") */


export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);