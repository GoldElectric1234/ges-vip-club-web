"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import { getPropertyLimitLabel, MEMBERSHIP_RULES, MembershipTier } from "@/lib/membership";
import { Language } from "@/lib/translations";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const {
    language,
    seniorMode,
    profile,
    preferencesLoading,
    setLanguage,
    setSeniorMode,
    updateProfile,
    t,
  } = usePreferences();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (profile) {
      queueMicrotask(() => {
        setFullName(profile.fullName);
        setPhone(profile.phone);
      });
    }
  }, [profile]);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");
    setErrorMessage("");

    const updated = await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
    });

    if (updated) {
      setStatusMessage(t("settings.profileUpdated"));
    } else {
      setErrorMessage(t("error.savingSettings"));
    }

    setSaving(false);
  };

  const handleLanguageChange = async (nextLanguage: Language) => {
    setStatusMessage("");
    setErrorMessage("");
    await setLanguage(nextLanguage);
    setStatusMessage(t("settings.languageSaved"));
  };

  const handleSeniorModeChange = async (enabled: boolean) => {
    setStatusMessage("");
    setErrorMessage("");
    await setSeniorMode(enabled);
    setStatusMessage(t("settings.preferencesSaved"));
  };

  if (loading || preferencesLoading) {
    return (
      <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
        <Header />
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <p className={`text-gray-600 ${seniorMode ? "text-xl" : ""}`}>
              {t("settings.loading")}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const membershipTier: MembershipTier = profile?.membershipTier ?? "basic";
  const membershipRule = MEMBERSHIP_RULES[membershipTier];

  return (
    <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h2 className={`font-bold text-gray-900 ${seniorMode ? "text-5xl" : "text-4xl"}`}>
              {t("settings.title")}
            </h2>
            <p className={`mt-3 text-gray-600 ${seniorMode ? "text-xl" : "text-lg"}`}>
              {t("settings.subtitle")}
            </p>
          </div>

          {(statusMessage || errorMessage) && (
            <div
              className={`mb-6 rounded-lg border-2 p-4 font-semibold ${
                errorMessage
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-green-200 bg-green-50 text-green-800"
              } ${seniorMode ? "p-6 text-lg" : ""}`}
            >
              {errorMessage || statusMessage}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg">
              <h3 className={`font-bold text-gray-900 ${seniorMode ? "text-3xl" : "text-2xl"}`}>
                {t("settings.profileInfo")}
              </h3>

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
                <div>
                  <label className={`mb-2 block font-semibold text-gray-700 ${seniorMode ? "text-lg" : ""}`}>
                    {t("settings.name")}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none ${
                      seniorMode ? "px-6 py-4 text-lg" : ""
                    }`}
                  />
                </div>

                <div>
                  <label className={`mb-2 block font-semibold text-gray-700 ${seniorMode ? "text-lg" : ""}`}>
                    {t("settings.email")}
                  </label>
                  <input
                    type="email"
                    value={profile?.email || user.email || ""}
                    readOnly
                    className={`w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-600 ${
                      seniorMode ? "px-6 py-4 text-lg" : ""
                    }`}
                  />
                </div>

                <div>
                  <label className={`mb-2 block font-semibold text-gray-700 ${seniorMode ? "text-lg" : ""}`}>
                    {t("settings.phone")}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="(555) 123-4567"
                    className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none ${
                      seniorMode ? "px-6 py-4 text-lg" : ""
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={`rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-white shadow-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 ${
                    seniorMode ? "px-8 py-4 text-xl" : "px-6 py-3"
                  }`}
                >
                  {saving ? t("settings.saving") : t("settings.updateProfile")}
                </button>
              </form>
            </section>

            <aside className="space-y-8">
              <section className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg">
                <h3 className={`font-bold text-gray-900 ${seniorMode ? "text-3xl" : "text-2xl"}`}>
                  {t("settings.preferences")}
                </h3>

                <div className="mt-6 space-y-6">
                  <div>
                    <p className={`mb-3 font-semibold text-gray-700 ${seniorMode ? "text-lg" : ""}`}>
                      {t("settings.language")}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["en", "es"] as Language[]).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleLanguageChange(option)}
                          className={`rounded-lg border-2 px-4 py-3 font-bold transition-colors ${
                            language === option
                              ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                              : "border-gray-200 text-gray-700 hover:border-yellow-300"
                          } ${seniorMode ? "py-4 text-lg" : ""}`}
                        >
                          {option === "en" ? t("settings.english") : t("settings.spanish")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex min-h-16 touch-manipulation items-start gap-3 rounded-lg border-2 border-gray-200 p-4">
                    <input
                      type="checkbox"
                      checked={seniorMode}
                      onChange={(event) => handleSeniorModeChange(event.target.checked)}
                      className={`mt-1 shrink-0 ${seniorMode ? "h-6 w-6" : "h-5 w-5"}`}
                    />
                    <span>
                      <span className={`block font-bold text-gray-900 ${seniorMode ? "text-xl" : ""}`}>
                        {t("settings.seniorMode")}
                      </span>
                      <span className={`mt-1 block text-gray-600 ${seniorMode ? "text-lg" : "text-sm"}`}>
                        {t("settings.seniorModeDescription")}
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-8 shadow-lg">
                <h3 className={`font-bold text-gray-900 ${seniorMode ? "text-3xl" : "text-2xl"}`}>
                  {t("settings.membershipRules")}
                </h3>
                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="font-semibold text-gray-600">{t("settings.currentPlan")}</dt>
                    <dd className={`font-bold text-yellow-700 ${seniorMode ? "text-2xl" : "text-xl"}`}>
                      {membershipRule.displayName}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-600">{t("settings.propertyLimit")}</dt>
                    <dd className="font-bold text-gray-900">
                      {getPropertyLimitLabel(membershipTier)}
                    </dd>
                  </div>
                </dl>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
