"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { PropertyForm } from "@/app/properties/PropertyForm";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import { canAddProperty, MembershipTier } from "@/lib/membership";
import {
  createProperty,
  emptyPropertyFormData,
  listProperties,
  PropertyFormData,
  uploadPropertyPhoto,
} from "@/lib/properties";

export default function AddPropertyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { seniorMode, profile, preferencesLoading, t } = usePreferences();
  const [formData, setFormData] = useState<PropertyFormData>(emptyPropertyFormData);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || preferencesLoading) return;

    const checkLimit = async () => {
      try {
        const properties = await listProperties(user.id);
        const tier = (profile?.membershipTier ?? "basic") as MembershipTier;
        setLimitReached(!canAddProperty(tier, properties.length));
      } catch {
        setErrorMessage(t("properties.errorLoading"));
      }
    };

    checkLimit();
  }, [preferencesLoading, profile?.membershipTier, t, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || limitReached) return;

    setSaving(true);
    setErrorMessage("");

    try {
      await createProperty(user.id, formData);
      router.push("/properties");
    } catch {
      setErrorMessage(t("properties.errorSaving"));
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (
    photoType: "property" | "panel" | "meter",
    file: File
  ) => {
    if (!user) return;

    setErrorMessage("");
    try {
      const url = await uploadPropertyPhoto(user.id, file, photoType);
      const field =
        photoType === "property"
          ? "propertyPhotoUrl"
          : photoType === "panel"
            ? "panelPhotoUrl"
            : "meterPhotoUrl";
      setFormData((current) => ({ ...current, [field]: url }));
    } catch {
      setErrorMessage(t("properties.errorPhotoUpload"));
    }
  };

  if (loading || preferencesLoading) {
    return (
      <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
        <Header />
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className={`text-gray-600 ${seniorMode ? "text-xl" : ""}`}>
              {t("properties.loading")}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
      <Header />
      <main className={`flex-1 px-4 sm:px-6 lg:px-8 ${seniorMode ? "py-16" : "py-12"}`}>
        <div className="mx-auto max-w-4xl">
          <Link href="/properties" className={`font-bold text-yellow-700 hover:text-yellow-800 ${seniorMode ? "text-lg" : ""}`}>
            {t("properties.backToProperties")}
          </Link>
          <div className="mb-8 mt-4">
            <h2 className={`font-bold text-gray-900 ${seniorMode ? "text-5xl" : "text-4xl"}`}>
              {t("properties.addTitle")}
            </h2>
            <p className={`mt-3 text-gray-600 ${seniorMode ? "text-xl" : "text-lg"}`}>
              {t("properties.addSubtitle")}
            </p>
          </div>

          {limitReached ? (
            <div className={`rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6 font-semibold text-yellow-800 ${seniorMode ? "text-xl" : ""}`}>
              {t("properties.limitReached")}
            </div>
          ) : (
            <section className={`rounded-2xl border-2 border-gray-200 bg-white shadow-lg ${seniorMode ? "p-10" : "p-8"}`}>
              <PropertyForm
                data={formData}
                errorMessage={errorMessage}
                seniorMode={seniorMode}
                submitLabel={t("properties.create")}
                saving={saving}
                t={t}
                onChange={setFormData}
                onSubmit={handleSubmit}
                onPhotoUpload={handlePhotoUpload}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
