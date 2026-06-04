"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/app/auth/context";
import {
  ensureProfile,
  ProfileSettings,
  profileFromUser,
  ProfileUpdate,
  updateProfileSettings,
} from "@/lib/profile";
import {
  getDefaultLanguage,
  Language,
  saveLanguagePreference,
  t as translate,
} from "@/lib/translations";

interface PreferencesContextType {
  language: Language;
  seniorMode: boolean;
  profile: ProfileSettings | null;
  preferencesLoading: boolean;
  setLanguage: (language: Language) => Promise<void>;
  setSeniorMode: (enabled: boolean) => Promise<void>;
  updateProfile: (update: ProfileUpdate) => Promise<ProfileSettings | null>;
  refreshProfile: () => Promise<void>;
  t: (key: string) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [language, setLanguageState] = useState<Language>("en");
  const [seniorMode, setSeniorModeState] = useState(false);
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    const loadProfile = async () => {
      setPreferencesLoading(true);

      if (!user) {
        setProfile(null);
        setLanguageState(getDefaultLanguage());
        setSeniorModeState(localStorage.getItem("ges-senior-mode") === "true");
        setPreferencesLoading(false);
        return;
      }

      const loadedProfile = await ensureProfile(user);
      setProfile(loadedProfile);
      setLanguageState(loadedProfile.preferredLanguage);
      setSeniorModeState(loadedProfile.seniorModeEnabled);
      saveLanguagePreference(loadedProfile.preferredLanguage);
      localStorage.setItem("ges-senior-mode", String(loadedProfile.seniorModeEnabled));
      setPreferencesLoading(false);
    };

    loadProfile();
  }, [loading, user]);

  const persistProfileUpdate = async (update: ProfileUpdate) => {
    if (!user) return null;

    const updated = await updateProfileSettings(user.id, update);
    if (updated) {
      setProfile(updated);
      return updated;
    }

    const fallback = {
      ...profileFromUser(user),
      ...profile,
      fullName: update.fullName ?? profile?.fullName ?? "",
      phone: update.phone ?? profile?.phone ?? "",
      preferredLanguage: update.preferredLanguage ?? profile?.preferredLanguage ?? language,
      seniorModeEnabled: update.seniorModeEnabled ?? profile?.seniorModeEnabled ?? seniorMode,
    };
    setProfile(fallback);
    return fallback;
  };

  const setLanguage = async (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    saveLanguagePreference(nextLanguage);
    await persistProfileUpdate({ preferredLanguage: nextLanguage });
  };

  const setSeniorMode = async (enabled: boolean) => {
    setSeniorModeState(enabled);
    localStorage.setItem("ges-senior-mode", String(enabled));
    await persistProfileUpdate({ seniorModeEnabled: enabled });
  };

  const updateProfile = async (update: ProfileUpdate) => {
    const updated = await persistProfileUpdate(update);
    if (updated?.preferredLanguage) {
      setLanguageState(updated.preferredLanguage);
      saveLanguagePreference(updated.preferredLanguage);
    }
    if (updated) {
      setSeniorModeState(updated.seniorModeEnabled);
      localStorage.setItem("ges-senior-mode", String(updated.seniorModeEnabled));
    }
    return updated;
  };

  const refreshProfile = async () => {
    if (!user) return;
    setPreferencesLoading(true);
    const loadedProfile = await ensureProfile(user);
    setProfile(loadedProfile);
    setLanguageState(loadedProfile.preferredLanguage);
    setSeniorModeState(loadedProfile.seniorModeEnabled);
    setPreferencesLoading(false);
  };

  const value = {
    language,
    seniorMode,
    profile,
    preferencesLoading,
    setLanguage,
    setSeniorMode,
    updateProfile,
    refreshProfile,
    t: (key: string) => translate(key, language),
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
