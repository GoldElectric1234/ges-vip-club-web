"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/app/components/RoleGuard";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import {
  AppLoading,
} from "@/components/ui";
import {
  GesBrandBadge,
  GesBrandCard,
  GesBrandDivider,
  GesBrandEmptyState,
  GesBrandHero,
  GesBrandKpiCard,
  GesBrandPanel,
} from "@/components/ges-brand";
import {
  listMemberProperties,
  type ListMemberPropertiesResult,
  type MemberPropertySummary,
} from "@/lib/properties-read";

export default function PropertiesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { seniorMode, preferencesLoading, t } = usePreferences();
  const [properties, setProperties] = useState<MemberPropertySummary[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [status, setStatus] = useState<ListMemberPropertiesResult["status"]>("empty");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;

    const loadProperties = async () => {
      setPageLoading(true);
      const result = await listMemberProperties(user.id);

      if (result.status === "success") {
        setProperties(result.properties);
      } else {
        setProperties([]);
      }

      setStatus(result.status);
      setPageLoading(false);
    };

    loadProperties();
  }, [user]);

  if (loading || preferencesLoading || pageLoading) {
    return (
      <div className={`mx-auto grid max-w-6xl gap-4 ${seniorMode ? "text-lg" : ""}`}>
        <AppLoading label={t("properties.loading")} lines={5} className="w-full" />
        <AppLoading lines={4} compact className="w-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <RoleGuard allowedRoles={["member"]}>
      <div className={`mx-auto max-w-6xl space-y-6 ${seniorMode ? "text-lg" : ""}`}>
        <GesBrandHero
          eyebrow={t("brand.fullName")}
          title={t("properties.title")}
          subtitle={t("properties.subtitle")}
          rightMeta={t("properties.readOnlyBadge")}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <GesBrandKpiCard
            label={t("properties.title")}
            value={properties.length}
            helper={t("properties.limitLabel")}
            tone="info"
          />
          <GesBrandKpiCard
            label={t("properties.type.residential")}
            value={properties.filter((p) => p.propertyType === "residential").length}
            helper={t("properties.subtitle")}
            tone="gold"
          />
          <GesBrandKpiCard
            label={t("properties.type.commercial")}
            value={properties.filter((p) => p.propertyType === "commercial").length}
            helper={t("properties.subtitle")}
            tone="warning"
          />
        </div>

        {status === "error" ? (
          <GesBrandPanel title={t("properties.title")}>
            <GesBrandCard className="border-[#FCA5A5] bg-[#FEF2F2] p-4">
              <p className="text-sm font-bold text-[#991B1B]">{t("properties.errorLoading")}</p>
            </GesBrandCard>
          </GesBrandPanel>
        ) : null}

        {status === "empty" ? (
          <GesBrandPanel title={t("properties.title")}>
            <GesBrandEmptyState
              title={t("properties.emptyTitle")}
              message={t("properties.emptyDescription")}
            />
          </GesBrandPanel>
        ) : (
          <div className={`grid gap-6 md:grid-cols-2 ${seniorMode ? "gap-8" : ""}`}>
            {properties.map((property) => (
              <GesBrandCard key={property.id} className="overflow-hidden" hoverLift>
                <div className="flex min-h-36 bg-gray-100">
                  {property.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={property.photoUrl}
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
                      <GesBrandBadge
                        label={t(`properties.type.${property.propertyType}`)}
                        tone="gold"
                        className="mb-2"
                      />
                      <h3 className={`font-bold text-[var(--ges-text-dark)] ${seniorMode ? "text-3xl" : "text-2xl"}`}>
                        {property.propertyName || property.address}
                      </h3>
                      <p className={`mt-2 text-[var(--ges-text-muted)] ${seniorMode ? "text-lg" : ""}`}>
                        {property.address}
                      </p>
                      <p className={`text-[var(--ges-text-muted)] ${seniorMode ? "text-lg" : ""}`}>
                        {property.city}, {property.state} {property.zipCode}
                      </p>
                    </div>
                  </div>

                  <GesBrandDivider className="my-4" />

                  <dl className={`grid gap-4 sm:grid-cols-2 ${seniorMode ? "text-lg" : ""}`}>
                    <div>
                      <dt className="font-semibold text-[var(--ges-text-muted)]">{t("properties.field.mainServiceSize")}</dt>
                      <dd className="font-bold text-[var(--ges-text-dark)]">{t("properties.notProvided")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[var(--ges-text-muted)]">{t("properties.field.mainBreakerSize")}</dt>
                      <dd className="font-bold text-[var(--ges-text-dark)]">{t("properties.notProvided")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[var(--ges-text-muted)]">{t("properties.field.utilityCompany")}</dt>
                      <dd className="font-bold text-[var(--ges-text-dark)]">{t("properties.notProvided")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[var(--ges-text-muted)]">{t("properties.field.lastElectricalInspection")}</dt>
                      <dd className="font-bold text-[var(--ges-text-dark)]">{t("properties.notProvided")}</dd>
                    </div>
                  </dl>

                  <Link
                    href={`/properties/${property.id}`}
                    className="mt-6 inline-flex rounded-lg border border-[var(--ges-border-strong)] px-4 py-2 font-semibold text-[var(--ges-text-dark)] hover:bg-[var(--ges-surface-subtle)]"
                  >
                    {t("properties.viewDetails")}
                  </Link>
                </div>
              </GesBrandCard>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
