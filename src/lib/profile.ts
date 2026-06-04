import { User } from "@supabase/supabase-js";
import { Language } from "@/lib/translations";
import { MembershipTier } from "@/lib/membership";
import { supabase } from "@/lib/supabase";

export interface ProfileSettings {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  preferredLanguage: Language;
  seniorModeEnabled: boolean;
  membershipTier: MembershipTier;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  preferred_language: Language | null;
  senior_mode: boolean | null;
  membership_plan: MembershipTier | null;
}

export interface ProfileUpdate {
  fullName?: string;
  phone?: string;
  preferredLanguage?: Language;
  seniorModeEnabled?: boolean;
}

export function profileFromUser(user: User): ProfileSettings {
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: String(user.user_metadata?.full_name ?? ""),
    phone: "",
    preferredLanguage: "en",
    seniorModeEnabled: false,
    membershipTier: "basic",
  };
}

function mapProfile(row: ProfileRow): ProfileSettings {
  return {
    id: row.id,
    email: "",
    fullName: row.full_name ?? "",
    phone: row.phone ?? "",
    preferredLanguage: row.preferred_language ?? "en",
    seniorModeEnabled: row.senior_mode ?? false,
    membershipTier: row.membership_plan ?? "basic",
  };
}

export async function ensureProfile(user: User): Promise<ProfileSettings> {
  const fallback = profileFromUser(user);
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,full_name,phone,preferred_language,senior_mode,membership_plan"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Profile lookup failed. Has the Phase 1 schema been applied?", error);
    return fallback;
  }

  if (data) {
    return {
      ...mapProfile(data as ProfileRow),
      email: fallback.email,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fallback.fullName,
      preferred_language: fallback.preferredLanguage,
      senior_mode: fallback.seniorModeEnabled,
      membership_plan: fallback.membershipTier,
    })
    .select(
      "id,full_name,phone,preferred_language,senior_mode,membership_plan"
    )
    .single();

  if (insertError) {
    console.warn("Profile creation failed. Has the Phase 1 schema been applied?", insertError);
    return fallback;
  }

  return {
    ...mapProfile(inserted as ProfileRow),
    email: fallback.email,
  };
}

export async function updateProfileSettings(
  userId: string,
  update: ProfileUpdate
): Promise<ProfileSettings | null> {
  const payload: Record<string, string | boolean | null> = {};

  if (update.fullName !== undefined) payload.full_name = update.fullName;
  if (update.phone !== undefined) payload.phone = update.phone;
  if (update.preferredLanguage !== undefined) payload.preferred_language = update.preferredLanguage;
  if (update.seniorModeEnabled !== undefined) {
    payload.senior_mode = update.seniorModeEnabled;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select(
      "id,full_name,phone,preferred_language,senior_mode,membership_plan"
    )
    .single();

  if (error) {
    console.warn("Profile update failed. Has the Phase 1 schema been applied?", error);
    return null;
  }

  return mapProfile(data as ProfileRow);
}
