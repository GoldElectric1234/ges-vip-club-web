"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import {
  getMemberPropertyById,
  type GetMemberPropertyByIdResult,
} from "@/lib/properties-read";

function PropertyDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { seniorMode, preferencesLoading, t } = usePreferences();
  const [result, setResult] = useState<GetMemberPropertyByIdResult | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (!user || !params.id) {
      return;
    }

    let cancelled = false;
    const loadProperty = async () => {
      setPageLoading(true);
      const next = await getMemberPropertyById(user.id, params.id);
      if (!cancelled) {
        setResult(next);
        setPageLoading(false);
      }
    };

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [loading, params.id, router, user]);

  if (loading || preferencesLoading || pageLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className={`text-gray-600 ${seniorMode ? "text-xl" : ""}`}>{t("properties.loading")}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={seniorMode ? "text-lg" : ""}>
      <main className={seniorMode ? "py-16" : "py-12"}>
        <div className="mx-auto max-w-4xl">
          <Link
            href="/properties"
            className={`font-bold text-yellow-700 hover:text-yellow-800 ${seniorMode ? "text-lg" : ""}`}
          >
            {t("properties.backToProperties")}
          </Link>

          {result?.status === "error" ? (
            <section className="mt-6 rounded-2xl border-2 border-red-200 bg-red-50 p-6">
              <h2 className="font-bold text-red-900">{t("properties.detailErrorTitle")}</h2>
              <p className="mt-2 text-red-800">{t("properties.detailErrorMessage")}</p>
            </section>
          ) : null}

          {result?.status === "not_found" ? (
            <section className="mt-6 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6">
              <h2 className="font-bold text-gray-900">{t("properties.notFound")}</h2>
              <p className="mt-2 text-gray-700">{t("properties.detailNotFoundHelp")}</p>
            </section>
          ) : null}

          {result?.status === "success" ? (
            <section className="mt-6 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
              <h2 className={`font-bold text-gray-900 ${seniorMode ? "text-4xl" : "text-3xl"}`}>
                {result.property.propertyName || result.property.address || t("properties.title")}
              </h2>

              <p className="mt-3 text-gray-700">
                {t(`properties.type.${result.property.propertyType}`)}
              </p>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-gray-600">{t("properties.field.address")}</dt>
                  <dd className="font-bold text-gray-900">{result.property.address || t("properties.notProvided")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-600">{t("properties.field.city")}</dt>
                  <dd className="font-bold text-gray-900">{result.property.city || t("properties.notProvided")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-600">{t("properties.field.state")}</dt>
                  <dd className="font-bold text-gray-900">{result.property.state || t("properties.notProvided")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-600">{t("properties.field.zipCode")}</dt>
                  <dd className="font-bold text-gray-900">{result.property.zipCode || t("properties.notProvided")}</dd>
                </div>
              </dl>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function PropertyDetailPage() {
  return (
    <RoleGuard allowedRoles={["member"]}>
      <PropertyDetailContent />
    </RoleGuard>
  );
}
