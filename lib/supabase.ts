import { createClient } from "@supabase/supabase-js";

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

type Database = {
  public: {
    Tables: {
      testimonials: {
        Row: Testimonial;
        Insert: {
          id?: string;
          name: string;
          text: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<Testimonial, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
