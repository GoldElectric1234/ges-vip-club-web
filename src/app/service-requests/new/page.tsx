"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import { listProperties, PropertyRecord } from "@/lib/properties";
import {
  createServiceRequest,
  emptyServiceRequestFormData,
  ServiceRequestCategory,
  ServiceRequestFormData,
  ServiceRequestPriority,
  uploadServiceRequestPhoto,
} from "@/lib/service-requests";

const serviceCategories: ServiceRequestCategory[] = [
  "electrical-repair",
  "panel-upgrade",
  "ev-charger",
  "generator",
  "lighting",
  "troubleshooting",
  "emergency-service",
  "other",
];

const servicePriorities: ServiceRequestPriority[] = ["normal", "priority", "emergency"];

export default function NewServiceRequestPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { seniorMode, preferencesLoading, t } = usePreferences();
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [formData, setFormData] = useState<ServiceRequestFormData>(
    emptyServiceRequestFormData
  );
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;

    const loadProperties = async () => {
      setPageLoading(true);
      setErrorMessage("");
      try {
        const loaded = await listProperties(user.id);
        setProperties(loaded);
        setFormData((current) => ({
          ...current,
          propertyId: current.propertyId || loaded[0]?.id || "",
        }));
      } catch {
        setErrorMessage(t("properties.errorLoading"));
      } finally {
        setPageLoading(false);
      }
    };

    loadProperties();
  }, [t, user]);

  const updateField = <K extends keyof ServiceRequestFormData>(
    field: K,
    value: ServiceRequestFormData[K]
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoUpload = async (files: File[]) => {
    if (!user) return;

    setErrorMessage("");
    setUploadingPhotos(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadServiceRequestPhoto(user.id, file))
      );
      setFormData((current) => ({
        ...current,
        photoUrls: [...current.photoUrls, ...uploadedUrls],
      }));
    } catch {
      setErrorMessage(t("serviceRequests.errorPhotoUpload"));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (photoUrl: string) => {
    setFormData((current) => ({
      ...current,
      photoUrls: current.photoUrls.filter((url) => url !== photoUrl),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setErrorMessage("");

    try {
      await createServiceRequest(user.id, formData);
      router.push("/service-requests");
    } catch {
      setErrorMessage(t("serviceRequests.errorSaving"));
      setSaving(false);
    }
  };

  if (loading || preferencesLoading || pageLoading) {
    return (
      <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
        <Header />
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className={`text-gray-600 ${seniorMode ? "text-xl" : ""}`}>
              {t("serviceRequests.loading")}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const inputClass = `w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-yellow-500 focus:outline-none ${
    seniorMode ? "px-6 py-4 text-lg" : ""
  }`;
  const labelClass = `mb-2 block font-semibold text-gray-800 ${
    seniorMode ? "text-lg" : ""
  }`;
  const optionButtonClass = (active: boolean) =>
    `min-h-14 rounded-lg border-2 px-4 py-3 text-left font-bold transition ${
      active
        ? "border-yellow-600 bg-yellow-100 text-yellow-950 shadow-sm"
        : "border-gray-300 bg-white text-gray-800 hover:border-yellow-500 hover:bg-yellow-50"
    } ${seniorMode ? "min-h-16 px-5 py-4 text-lg" : ""}`;

  return (
    <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
      <Header />
      <main className={`flex-1 px-4 sm:px-6 lg:px-8 ${seniorMode ? "py-16" : "py-12"}`}>
        <div className="mx-auto max-w-4xl">
          <Link
            href="/service-requests"
            className={`font-bold text-yellow-700 hover:text-yellow-800 ${
              seniorMode ? "text-lg" : ""
            }`}
          >
            {t("serviceRequests.backToRequests")}
          </Link>

          <div className="mb-8 mt-4">
            <h2 className={`font-bold text-gray-900 ${seniorMode ? "text-5xl" : "text-4xl"}`}>
              {t("serviceRequests.newTitle")}
            </h2>
            <p className={`mt-3 text-gray-600 ${seniorMode ? "text-xl" : "text-lg"}`}>
              {t("serviceRequests.newSubtitle")}
            </p>
          </div>

          {properties.length === 0 ? (
            <section className={`rounded-lg border-2 border-yellow-300 bg-yellow-50 p-6 font-semibold text-yellow-900 ${seniorMode ? "text-xl" : ""}`}>
              {t("serviceRequests.noProperties")}
            </section>
          ) : (
            <section className={`rounded-lg border-2 border-gray-200 bg-white shadow-lg ${seniorMode ? "p-6 sm:p-10" : "p-5 sm:p-8"}`}>
              <form onSubmit={handleSubmit} className={`space-y-6 ${seniorMode ? "space-y-8" : ""}`}>
                {errorMessage && (
                  <div className={`rounded-lg border-2 border-red-300 bg-red-50 p-4 font-semibold text-red-900 ${seniorMode ? "p-6 text-lg" : ""}`}>
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className={labelClass}>{t("serviceRequests.field.property")}</label>
                  <select
                    value={formData.propertyId}
                    onChange={(event) => updateField("propertyId", event.target.value)}
                    className={inputClass}
                    required
                  >
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.propertyName || property.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    {t("serviceRequests.field.serviceCategory")}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {serviceCategories.map((type) => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={formData.serviceType === type}
                        onClick={() => updateField("serviceType", type)}
                        className={optionButtonClass(formData.serviceType === type)}
                      >
                        {t(`serviceRequests.type.${type}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t("serviceRequests.field.priority")}</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {servicePriorities.map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        aria-pressed={formData.priority === priority}
                        onClick={() => updateField("priority", priority)}
                        className={optionButtonClass(formData.priority === priority)}
                      >
                        {t(`serviceRequests.priority.${priority}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t("serviceRequests.field.description")}</label>
                  <textarea
                    value={formData.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    className={inputClass}
                    rows={seniorMode ? 7 : 5}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t("serviceRequests.field.preferredDate")}</label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(event) => updateField("preferredDate", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("serviceRequests.field.preferredTime")}</label>
                    <input
                      type="time"
                      value={formData.preferredTime}
                      onChange={(event) => updateField("preferredTime", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t("serviceRequests.field.contactName")}</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(event) => updateField("contactName", event.target.value)}
                      className={inputClass}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("serviceRequests.field.contactPhone")}</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(event) => updateField("contactPhone", event.target.value)}
                      className={inputClass}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="rounded-lg border-2 border-gray-200 p-4">
                  <label className={labelClass}>{t("serviceRequests.field.photos")}</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      handlePhotoUpload(Array.from(event.target.files ?? []));
                      event.currentTarget.value = "";
                    }}
                    className={`w-full text-gray-800 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-100 file:px-4 file:py-2 file:font-bold file:text-yellow-900 hover:file:bg-yellow-200 ${
                      seniorMode ? "text-lg file:px-6 file:py-3" : ""
                    }`}
                  />

                  {uploadingPhotos && (
                    <p className={`mt-3 font-semibold text-gray-700 ${seniorMode ? "text-lg" : "text-sm"}`}>
                      {t("serviceRequests.uploadingPhotos")}
                    </p>
                  )}

                  {formData.photoUrls.length > 0 && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {formData.photoUrls.map((url) => (
                        <div key={url} className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={t("serviceRequests.photo")}
                            className="h-32 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(url)}
                            className={`w-full bg-gray-100 px-3 py-2 font-bold text-gray-800 hover:bg-gray-200 ${
                              seniorMode ? "py-3 text-lg" : "text-sm"
                            }`}
                          >
                            {t("serviceRequests.removePhoto")}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving || uploadingPhotos}
                  className={`rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-white shadow-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 ${
                    seniorMode ? "w-full px-8 py-5 text-xl md:w-auto" : "w-full px-6 py-3 md:w-auto"
                  }`}
                >
                  {saving ? t("serviceRequests.saving") : t("serviceRequests.submit")}
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
