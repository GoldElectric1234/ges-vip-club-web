"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { PropertyForm } from "@/app/properties/PropertyForm";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import {
  deleteProperty,
  emptyPropertyFormData,
  getProperty,
  PropertyFormData,
  uploadPropertyPhoto,
  updateProperty,
} from "@/lib/properties";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { seniorMode, preferencesLoading, t } = usePreferences();
  const [formData, setFormData] = useState<PropertyFormData>(emptyPropertyFormData);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || !params.id) return;

    const loadProperty = async () => {
      setPageLoading(true);
      setErrorMessage("");
      try {
        const property = await getProperty(user.id, params.id);
        if (!property) {
          setErrorMessage(t("properties.notFound"));
          return;
        }
        setFormData({
          propertyName: property.propertyName,
          propertyType: property.propertyType,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode,
          yearBuilt: property.yearBuilt,
          mainServiceSize: property.mainServiceSize,
          mainPanelBrand: property.mainPanelBrand,
          mainBreakerSize: property.mainBreakerSize,
          utilityCompany: property.utilityCompany,
          generatorInstalled: property.generatorInstalled,
          generatorBrand: property.generatorBrand,
          solarInstalled: property.solarInstalled,
          solarSystemSize: property.solarSystemSize,
          lastElectricalInspection: property.lastElectricalInspection,
          propertyPhotoUrl: property.propertyPhotoUrl,
          panelPhotoUrl: property.panelPhotoUrl,
          meterPhotoUrl: property.meterPhotoUrl,
          notes: property.notes,
        });
      } catch {
        setErrorMessage(t("properties.errorLoading"));
      } finally {
        setPageLoading(false);
      }
    };

    loadProperty();
  }, [params.id, t, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !params.id) return;

    setSaving(true);
    setErrorMessage("");

    try {
      await updateProperty(user.id, params.id, formData);
      router.push("/properties");
    } catch {
      setErrorMessage(t("properties.errorSaving"));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !params.id || deleting) return;
    if (!window.confirm(t("properties.confirmDelete"))) return;

    setDeleting(true);
    setErrorMessage("");

    try {
      await deleteProperty(user.id, params.id);
      router.push("/properties");
    } catch {
      setErrorMessage(t("properties.errorDeleting"));
      setDeleting(false);
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

  if (loading || preferencesLoading || pageLoading) {
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
              {t("properties.editTitle")}
            </h2>
            <p className={`mt-3 text-gray-600 ${seniorMode ? "text-xl" : "text-lg"}`}>
              {t("properties.editSubtitle")}
            </p>
          </div>

          <section className={`rounded-2xl border-2 border-gray-200 bg-white shadow-lg ${seniorMode ? "p-10" : "p-8"}`}>
            <PropertyForm
              data={formData}
              errorMessage={errorMessage}
              seniorMode={seniorMode}
              submitLabel={t("properties.update")}
              saving={saving}
              t={t}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onPhotoUpload={handlePhotoUpload}
            />
            <div className={`mt-8 border-t-2 border-gray-100 pt-6 ${seniorMode ? "mt-10 pt-8" : ""}`}>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className={`rounded-lg border-2 border-red-600 font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 ${
                  seniorMode ? "w-full px-8 py-5 text-xl md:w-auto" : "w-full px-6 py-3 md:w-auto"
                }`}
              >
                {deleting ? t("properties.deleting") : t("properties.delete")}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
