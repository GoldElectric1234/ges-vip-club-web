import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      membership_rules: {
        Row: {
          tier: "basic" | "gold" | "platinum" | "enterprise";
          display_name: string;
          property_limit: number | null;
          requires_admin_override: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tier: "basic" | "gold" | "platinum" | "enterprise";
          display_name: string;
          property_limit?: number | null;
          requires_admin_override?: boolean;
        };
        Update: {
          display_name?: string;
          property_limit?: number | null;
          requires_admin_override?: boolean;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          preferred_language: "en" | "es";
          senior_mode: boolean;
          membership_plan: "basic" | "gold" | "platinum" | "enterprise";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          preferred_language?: "en" | "es";
          senior_mode?: boolean;
          membership_plan?: "basic" | "gold" | "platinum" | "enterprise";
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          preferred_language?: "en" | "es";
          senior_mode?: boolean;
          membership_plan?: "basic" | "gold" | "platinum" | "enterprise";
        };
      };
      properties: {
        Row: {
          id: string;
          user_id: string;
          property_name: string;
          property_type: "residential" | "commercial";
          address: string;
          city: string;
          state: string;
          zip_code: string;
          year_built: number | null;
          main_service_size: string | null;
          main_panel_brand: string | null;
          main_breaker_size: string | null;
          utility_company: string | null;
          generator_installed: boolean;
          generator_brand: string | null;
          solar_installed: boolean;
          solar_system_size: string | null;
          last_electrical_inspection: string | null;
          property_photo_url: string | null;
          panel_photo_url: string | null;
          meter_photo_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_name: string;
          property_type: "residential" | "commercial";
          address: string;
          city: string;
          state: string;
          zip_code: string;
          year_built?: number | null;
          main_service_size?: string | null;
          main_panel_brand?: string | null;
          main_breaker_size?: string | null;
          utility_company?: string | null;
          generator_installed?: boolean;
          generator_brand?: string | null;
          solar_installed?: boolean;
          solar_system_size?: string | null;
          last_electrical_inspection?: string | null;
          property_photo_url?: string | null;
          panel_photo_url?: string | null;
          meter_photo_url?: string | null;
          notes?: string | null;
        };
        Update: {
          property_name?: string;
          property_type?: "residential" | "commercial";
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          year_built?: number | null;
          main_service_size?: string | null;
          main_panel_brand?: string | null;
          main_breaker_size?: string | null;
          utility_company?: string | null;
          generator_installed?: boolean;
          generator_brand?: string | null;
          solar_installed?: boolean;
          solar_system_size?: string | null;
          last_electrical_inspection?: string | null;
          property_photo_url?: string | null;
          panel_photo_url?: string | null;
          meter_photo_url?: string | null;
          notes?: string | null;
        };
      };
      service_requests: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          service_type:
            | "electrical-repair"
            | "panel-upgrade"
            | "ev-charger"
            | "generator"
            | "lighting"
            | "troubleshooting"
            | "emergency-service"
            | "other";
          priority: "normal" | "priority" | "emergency";
          status:
            | "submitted"
            | "under-review"
            | "scheduled"
            | "in-progress"
            | "completed";
          description: string;
          preferred_date: string | null;
          preferred_time: string | null;
          photo_urls: string[] | null;
          contact_name: string | null;
          contact_phone: string | null;
          timeline_history: Array<Record<string, string>> | null;
          ai_estimate_status: "not-requested" | "pending" | "ready" | "needs-review";
          ai_estimate_summary: string | null;
          ai_estimate_metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          service_type:
            | "electrical-repair"
            | "panel-upgrade"
            | "ev-charger"
            | "generator"
            | "lighting"
            | "troubleshooting"
            | "emergency-service"
            | "other";
          priority?: "normal" | "priority" | "emergency";
          status?:
            | "submitted"
            | "under-review"
            | "scheduled"
            | "in-progress"
            | "completed";
          description: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          photo_urls?: string[] | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          timeline_history?: Array<Record<string, string>> | null;
          ai_estimate_status?: "not-requested" | "pending" | "ready" | "needs-review";
          ai_estimate_summary?: string | null;
          ai_estimate_metadata?: Record<string, unknown>;
        };
        Update: {
          property_id?: string;
          service_type?:
            | "electrical-repair"
            | "panel-upgrade"
            | "ev-charger"
            | "generator"
            | "lighting"
            | "troubleshooting"
            | "emergency-service"
            | "other";
          priority?: "normal" | "priority" | "emergency";
          status?:
            | "submitted"
            | "under-review"
            | "scheduled"
            | "in-progress"
            | "completed";
          description?: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          photo_urls?: string[] | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          timeline_history?: Array<Record<string, string>> | null;
          ai_estimate_status?: "not-requested" | "pending" | "ready" | "needs-review";
          ai_estimate_summary?: string | null;
          ai_estimate_metadata?: Record<string, unknown>;
        };
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          plan: "basic" | "gold" | "platinum" | "enterprise";
          start_date: string;
          renewal_date: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: "basic" | "gold" | "platinum" | "enterprise";
          start_date?: string;
          renewal_date?: string | null;
          active?: boolean;
        };
        Update: {
          plan?: "basic" | "gold" | "platinum" | "enterprise";
          start_date?: string;
          renewal_date?: string | null;
          active?: boolean;
        };
      };
    };
  };
};
