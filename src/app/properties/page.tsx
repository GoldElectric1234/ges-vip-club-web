"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import { canAddProperty, getPropertyLimitLabel, MembershipTier } from "@/lib/membership";
import { deleteProperty, listProperties, PropertyRecord } from "@/lib/properties";

export default function PropertiesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { seniorMode, profile, preferencesLoading, t } = usePreferences();
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");

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
      } catch {
        setErrorMessage(t("properties.errorLoading"));
      } finally {
        setPageLoading(false);
      }
    };

    loadProperties();
  }, [t, user]);

  if (loading || preferencesLoading || pageLoading) {
    return (
      <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
        <Header />
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className={`text-gray-600 ${seniorMode ? "text-xl" : ""}`}>
              {t("properties.loading")}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const tier = profile?.membershipTier ?? "basic";
  const canAdd = canAddProperty(tier as MembershipTier, properties.length);

  const handleDelete = async (propertyId: string) => {
    if (!user || deletingId) return;
    if (!window.confirm(t("properties.confirmDelete"))) return;

    setDeletingId(propertyId);
    setErrorMessage("");
    try {
      await deleteProperty(user.id, propertyId);
      setProperties((current) => current.filter((property) => property.id !== propertyId));
    } catch {
      setErrorMessage(t("properties.errorDeleting"));
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
      <Header />

      <main className={`flex-1 px-4 sm:px-6 lg:px-8 ${seniorMode ? "py-16" : "py-12"}`}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className={`font-bold text-gray-900 ${seniorMode ? "text-5xl" : "text-4xl"}`}>
                {t("properties.title")}
              </h2>
              <p className={`mt-3 text-gray-600 ${seniorMode ? "text-xl" : "text-lg"}`}>
                {t("properties.subtitle")}
              </p>
              <p className={`mt-2 font-semibold text-yellow-700 ${seniorMode ? "text-lg" : "text-sm"}`}>
                {t("properties.limitLabel")}: {properties.length} / {getPropertyLimitLabel(tier as MembershipTier)}
              </p>
            </div>

            {canAdd ? (
              <Link
                href="/properties/new"
                className={`rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-center font-bold text-white shadow-lg hover:from-yellow-600 hover:to-yellow-700 ${
                  seniorMode ? "px-8 py-4 text-xl" : "px-6 py-3"
                }`}
              >
                {t("properties.addProperty")}
              </Link>
            ) : (
              <p className={`rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 font-semibold text-yellow-800 ${seniorMode ? "text-lg" : "text-sm"}`}>
                {t("properties.limitReached")}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className={`mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-4 font-semibold text-red-800 ${seniorMode ? "p-6 text-lg" : ""}`}>
              {errorMessage}
            </div>
          )}

          {properties.length === 0 && !errorMessage ? (
            <section className={`rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center ${seniorMode ? "p-12" : "p-8"}`}>
              <h3 className={`font-bold text-gray-900 ${seniorMode ? "text-3xl" : "text-2xl"}`}>
                {t("properties.emptyTitle")}
              </h3>
              <p className={`mx-auto mt-3 max-w-2xl text-gray-600 ${seniorMode ? "text-xl" : ""}`}>
                {t("properties.emptyDescription")}
              </p>
            </section>
          ) : (
            <div className={`grid gap-6 md:grid-cols-2 ${seniorMode ? "gap-8" : ""}`}>
              {properties.map((property) => (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="flex min-h-36 bg-gray-100">
                    {property.propertyPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={property.propertyPhotoUrl}
                        alt={property.propertyName || property.address}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-gray-500">
                        <span className={`font-bold ${seniorMode ? "text-xl" : ""}`}>
                          {t("properties.noPhoto")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={seniorMode ? "p-8" : "p-6"}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className={`mb-2 inline-flex rounded-full bg-yellow-100 px-3 py-1 font-bold text-yellow-800 ${seniorMode ? "text-base" : "text-xs"}`}>
                          {t(`properties.type.${property.propertyType}`)}
                        </p>
                        <h3 className={`font-bold text-gray-900 ${seniorMode ? "text-3xl" : "text-2xl"}`}>
                          {property.propertyName || property.address}
                        </h3>
                        <p className={`mt-2 text-gray-700 ${seniorMode ? "text-lg" : ""}`}>
                          {property.address}
                        </p>
                        <p className={`text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
                          {property.city}, {property.state} {property.zipCode}
                        </p>
                      </div>
                    </div>

                    <dl className={`mt-6 grid gap-4 sm:grid-cols-2 ${seniorMode ? "text-lg" : ""}`}>
                      <div>
                        <dt className="font-semibold text-gray-600">{t("properties.field.mainServiceSize")}</dt>
                        <dd className="font-bold text-gray-900">{property.mainServiceSize || t("properties.notProvided")}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-600">{t("properties.field.mainBreakerSize")}</dt>
                        <dd className="font-bold text-gray-900">{property.mainBreakerSize || t("properties.notProvided")}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-600">{t("properties.field.utilityCompany")}</dt>
                        <dd className="font-bold text-gray-900">{property.utilityCompany || t("properties.notProvided")}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-600">{t("properties.field.lastElectricalInspection")}</dt>
                        <dd className="font-bold text-gray-900">{property.lastElectricalInspection || t("properties.notProvided")}</dd>
                      </div>
                    </dl>

                    <div className={`mt-6 flex flex-col gap-3 sm:flex-row ${seniorMode ? "text-lg" : ""}`}>
                      <Link
                        href={`/properties/${property.id}/edit`}
                        className={`rounded-lg border-2 border-yellow-500 text-center font-bold text-yellow-700 hover:bg-yellow-50 ${
                          seniorMode ? "px-6 py-3" : "px-4 py-2"
                        }`}
                      >
                        {t("properties.edit")}
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === property.id}
                        onClick={() => handleDelete(property.id)}
                        className={`rounded-lg border-2 border-red-600 text-center font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 ${
                          seniorMode ? "px-6 py-3" : "px-4 py-2"
                        }`}
                      >
                        {deletingId === property.id ? t("properties.deleting") : t("properties.delete")}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
