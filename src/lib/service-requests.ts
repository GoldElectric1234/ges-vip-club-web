import { supabase } from "@/lib/supabase";

export type ServiceRequestPriority = "normal" | "priority" | "emergency";
export type ServiceRequestCategory =
  | "electrical-repair"
  | "panel-upgrade"
  | "ev-charger"
  | "generator"
  | "lighting"
  | "troubleshooting"
  | "emergency-service"
  | "other";
export type ServiceRequestStatus =
  | "submitted"
  | "under-review"
  | "scheduled"
  | "in-progress"
  | "completed";
export type ServiceRequestEstimateStatus =
  | "not-requested"
  | "pending"
  | "ready"
  | "needs-review";

export interface ServiceRequestTimelineItem {
  status: ServiceRequestStatus;
  note: string;
  createdAt: string;
}

export interface ServiceRequestFormData {
  propertyId: string;
  serviceType: ServiceRequestCategory;
  priority: ServiceRequestPriority;
  description: string;
  preferredDate: string;
  preferredTime: string;
  photoUrls: string[];
  contactName: string;
  contactPhone: string;
}

export interface ServiceRequestRecord extends ServiceRequestFormData {
  id: string;
  userId: string;
  status: ServiceRequestStatus;
  aiEstimateStatus: ServiceRequestEstimateStatus;
  aiEstimateSummary: string;
  propertyName: string;
  propertyAddress: string;
  createdAt: string;
  timeline: ServiceRequestTimelineItem[];
}

interface ServiceRequestRow {
  id: string;
  user_id: string;
  property_id: string;
  service_type: string;
  priority: string;
  status: string;
  description: string;
  preferred_date: string | null;
  preferred_time: string | null;
  photo_urls: string[] | null;
  contact_name: string | null;
  contact_phone: string | null;
  timeline_history: ServiceRequestTimelineItem[] | null;
  ai_estimate_status: ServiceRequestEstimateStatus | null;
  ai_estimate_summary: string | null;
  created_at: string;
  properties?: {
    property_name: string | null;
    address: string | null;
  } | null;
}

const SERVICE_REQUEST_SELECT = [
  "id",
  "user_id",
  "property_id",
  "service_type",
  "priority",
  "status",
  "description",
  "preferred_date",
  "preferred_time",
  "photo_urls",
  "contact_name",
  "contact_phone",
  "timeline_history",
  "ai_estimate_status",
  "ai_estimate_summary",
  "created_at",
  "properties(property_name,address)",
].join(",");

export const emptyServiceRequestFormData: ServiceRequestFormData = {
  propertyId: "",
  serviceType: "electrical-repair",
  priority: "normal",
  description: "",
  preferredDate: "",
  preferredTime: "",
  photoUrls: [],
  contactName: "",
  contactPhone: "",
};

function normalizeServiceType(value: string): ServiceRequestCategory {
  const legacyMap: Record<string, ServiceRequestCategory> = {
    "service-upgrade": "panel-upgrade",
    "panel-replacement": "panel-upgrade",
    "generator-service": "generator",
    inspection: "troubleshooting",
    repair: "electrical-repair",
    installation: "other",
    maintenance: "other",
    emergency: "emergency-service",
  };

  const allowed: ServiceRequestCategory[] = [
    "electrical-repair",
    "panel-upgrade",
    "ev-charger",
    "generator",
    "lighting",
    "troubleshooting",
    "emergency-service",
    "other",
  ];

  if (allowed.includes(value as ServiceRequestCategory)) {
    return value as ServiceRequestCategory;
  }

  return legacyMap[value] ?? "other";
}

function normalizePriority(value: string): ServiceRequestPriority {
  if (value === "emergency") return "emergency";
  if (value === "priority" || value === "high") return "priority";
  return "normal";
}

function normalizeStatus(value: string): ServiceRequestStatus {
  if (value === "completed") return "completed";
  if (value === "scheduled") return "scheduled";
  if (value === "in-progress") return "in-progress";
  if (
    value === "under-review" ||
    value === "technician-assigned" ||
    value === "waiting-parts" ||
    value === "inspection-required" ||
    value === "cancelled"
  ) {
    return "under-review";
  }

  return "submitted";
}

function normalizeEstimateStatus(value: string | null): ServiceRequestEstimateStatus {
  if (value === "pending" || value === "ready" || value === "needs-review") {
    return value;
  }

  return "not-requested";
}

function normalizeTimeline(
  timeline: ServiceRequestTimelineItem[] | null,
  fallbackStatus: string,
  fallbackCreatedAt: string
): ServiceRequestTimelineItem[] {
  if (!timeline || timeline.length === 0) {
    return [
      {
        status: normalizeStatus(fallbackStatus),
        note: "Current request status.",
        createdAt: fallbackCreatedAt,
      },
    ];
  }

  return timeline.map((item) => ({
    ...item,
    status: normalizeStatus(item.status),
  }));
}

function mapServiceRequest(row: ServiceRequestRow): ServiceRequestRecord {
  return {
    id: row.id,
    userId: row.user_id,
    propertyId: row.property_id,
    serviceType: normalizeServiceType(row.service_type),
    priority: normalizePriority(row.priority),
    status: normalizeStatus(row.status),
    description: row.description,
    preferredDate: row.preferred_date ?? "",
    preferredTime: row.preferred_time ?? "",
    photoUrls: row.photo_urls ?? [],
    contactName: row.contact_name ?? "",
    contactPhone: row.contact_phone ?? "",
    aiEstimateStatus: normalizeEstimateStatus(row.ai_estimate_status),
    aiEstimateSummary: row.ai_estimate_summary ?? "",
    propertyName: row.properties?.property_name ?? "",
    propertyAddress: row.properties?.address ?? "",
    createdAt: row.created_at,
    timeline: normalizeTimeline(row.timeline_history, row.status, row.created_at),
  };
}

export async function listServiceRequests(
  userId: string
): Promise<ServiceRequestRecord[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select(SERVICE_REQUEST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as ServiceRequestRow[]).map(mapServiceRequest);
}

export async function createServiceRequest(
  userId: string,
  formData: ServiceRequestFormData
): Promise<ServiceRequestRecord> {
  const createdAt = new Date().toISOString();
  const timeline: ServiceRequestTimelineItem[] = [
    {
      status: "submitted",
      note: "Service request submitted by member.",
      createdAt,
    },
  ];

  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      user_id: userId,
      property_id: formData.propertyId,
      service_type: formData.serviceType,
      priority: formData.priority,
      status: "submitted",
      description: formData.description.trim(),
      preferred_date: formData.preferredDate || null,
      preferred_time: formData.preferredTime || null,
      photo_urls: formData.photoUrls,
      contact_name: formData.contactName.trim() || null,
      contact_phone: formData.contactPhone.trim() || null,
      timeline_history: timeline,
      ai_estimate_status: "not-requested",
      ai_estimate_summary: null,
      ai_estimate_metadata: {},
    })
    .select(SERVICE_REQUEST_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapServiceRequest(data as unknown as ServiceRequestRow);
}

export async function uploadServiceRequestPhoto(
  userId: string,
  file: File
): Promise<string> {
  const extension = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("service-request-photos")
    .upload(filePath, file, { upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("service-request-photos")
    .getPublicUrl(filePath);
  return data.publicUrl;
}
