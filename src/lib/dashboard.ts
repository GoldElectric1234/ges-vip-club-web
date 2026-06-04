import { UserProfile } from "@/lib/types";

type DashboardStatus =
  | "submitted"
  | "under-review"
  | "scheduled"
  | "in-progress"
  | "completed"
  | "active"
  | "pending"
  | "expired";

// Mock data service - in production, this would fetch from Supabase
export async function getDashboardData(userId: string): Promise<UserProfile> {
  // This would be replaced with actual Supabase queries
  return {
    id: userId,
    email: "member@ges-electric.com",
    fullName: "John Doe",
    phone: "(555) 123-4567",
    createdAt: new Date().toISOString(),
    membershipPlan: {
      id: "gold-001",
      name: "Gold",
      price: 79,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
    },
    properties: [
      {
        id: "prop-001",
        address: "123 Main Street, Springfield, IL 62701",
        propertyType: "residential",
        createdAt: new Date().toISOString(),
      },
      {
        id: "prop-002",
        address: "456 Oak Avenue, Springfield, IL 62702",
        propertyType: "residential",
        createdAt: new Date().toISOString(),
      },
    ],
    recentServiceRequests: [
      {
        id: "req-001",
        propertyId: "prop-001",
        serviceType: "Inspection",
        description: "Annual electrical system inspection",
        status: "completed",
        requestedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        quickbooksRefId: "INV-2024-001",
      },
      {
        id: "req-002",
        propertyId: "prop-001",
        serviceType: "Panel Upgrade",
        description: "Outlet installation in kitchen",
        status: "under-review",
        requestedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        quickbooksRefId: "EST-2024-005",
      },
    ],
    quickbooksRef: {
      customerId: "CUST-12345",
      lastSyncDate: new Date().toISOString(),
      pendingInvoices: 1,
      totalOutstanding: 2499.99,
    },
  };
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function daysUntilRenewal(renewalDate: string): number {
  const now = new Date();
  const renewal = new Date(renewalDate);
  const diffTime = renewal.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getStatusColor(
  status: DashboardStatus
): string {
  switch (status) {
    case "active":
    case "completed":
      return "text-green-600";
    case "submitted":
    case "under-review":
    case "in-progress":
    case "pending":
      return "text-yellow-600";
    case "scheduled":
      return "text-blue-600";
    case "expired":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function getStatusBgColor(
  status: DashboardStatus
): string {
  switch (status) {
    case "active":
    case "completed":
      return "bg-green-50";
    case "submitted":
    case "under-review":
    case "in-progress":
    case "pending":
      return "bg-yellow-50";
    case "scheduled":
      return "bg-blue-50";
    case "expired":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
}

export function formatServiceRequestStatus(status: DashboardStatus): string {
  switch (status) {
    case "in-progress":
      return "In Progress";
    case "under-review":
      return "Under Review";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
