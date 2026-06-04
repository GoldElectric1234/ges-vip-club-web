// Dashboard Types
export interface Property {
  id: string;
  address: string;
  propertyType: "residential" | "commercial";
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  propertyId: string;
  serviceType: string;
  description: string;
  status:
    | "submitted"
    | "under-review"
    | "scheduled"
    | "in-progress"
    | "completed";
  requestedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  quickbooksRefId?: string;
}

export interface MembershipPlan {
  id: string;
  name: "Basic" | "Gold" | "Platinum";
  price: number;
  renewalDate: string;
  status: "active" | "expired" | "pending";
}

export interface QuickbooksReference {
  customerId?: string;
  lastSyncDate?: string;
  pendingInvoices: number;
  totalOutstanding: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: string;
  membershipPlan: MembershipPlan;
  properties: Property[];
  recentServiceRequests: ServiceRequest[];
  quickbooksRef?: QuickbooksReference;
}
