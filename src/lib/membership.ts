export type MembershipTier = "basic" | "gold" | "platinum" | "enterprise";

export interface MembershipRule {
  tier: MembershipTier;
  displayName: string;
  propertyLimit: number | null;
  requiresAdminOverride: boolean;
}

export const MEMBERSHIP_RULES: Record<MembershipTier, MembershipRule> = {
  basic: {
    tier: "basic",
    displayName: "Basic",
    propertyLimit: 1,
    requiresAdminOverride: false,
  },
  gold: {
    tier: "gold",
    displayName: "Gold",
    propertyLimit: 3,
    requiresAdminOverride: false,
  },
  platinum: {
    tier: "platinum",
    displayName: "Platinum",
    propertyLimit: 10,
    requiresAdminOverride: false,
  },
  enterprise: {
    tier: "enterprise",
    displayName: "Enterprise",
    propertyLimit: null,
    requiresAdminOverride: true,
  },
};

export function getMembershipRule(tier: MembershipTier): MembershipRule {
  return MEMBERSHIP_RULES[tier];
}

export function getPropertyLimitLabel(tier: MembershipTier): string {
  const rule = getMembershipRule(tier);
  return rule.propertyLimit === null
    ? "Custom / Unlimited by administrator"
    : `${rule.propertyLimit} ${rule.propertyLimit === 1 ? "property" : "properties"}`;
}

export function canAddProperty(tier: MembershipTier, currentPropertyCount: number): boolean {
  const limit = getMembershipRule(tier).propertyLimit;
  return limit === null || currentPropertyCount < limit;
}
