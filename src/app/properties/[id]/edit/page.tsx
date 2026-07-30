"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/app/components/RoleGuard";
import { usePreferences } from "@/app/preferences/context";
import {
  GesBrandHero,
  GesBrandPanel,
} from "@/components/ges-brand";

function EditPropertyContent() {
  const params = useParams<{ id: string }>();
  const { seniorMode, t } = usePreferences();

  return (
    <div className={`mx-auto max-w-4xl space-y-6 ${seniorMode ? "text-lg" : ""}`}>
      <GesBrandHero
        eyebrow={t("brand.fullName")}
        title={t("properties.readOnlyModeTitle")}
        subtitle={t("properties.readOnlyModeMessage")}
        rightMeta={t("properties.readOnlyBadge")}
      />

      <GesBrandPanel title={t("properties.readOnlyModeTitle")}>
        <p className="text-sm text-[var(--ges-text-muted)]">{t("properties.readOnlyModeMessage")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={params.id ? `/properties/${params.id}` : "/properties"}
            className="inline-flex rounded-lg border border-[var(--ges-border-strong)] px-4 py-2 font-semibold text-[var(--ges-text-dark)] hover:bg-[var(--ges-surface-subtle)]"
          >
            {t("properties.viewDetails")}
          </Link>
          <Link
            href="/properties"
            className="inline-flex rounded-lg border border-[var(--ges-border-strong)] px-4 py-2 font-semibold text-[var(--ges-text-dark)] hover:bg-[var(--ges-surface-subtle)]"
          >
            {t("properties.backToProperties")}
          </Link>
        </div>
      </GesBrandPanel>
    </div>
  );
}

export default function EditPropertyPage() {
  return (
    <RoleGuard allowedRoles={["member"]}>
      <EditPropertyContent />
    </RoleGuard>
  );
}
