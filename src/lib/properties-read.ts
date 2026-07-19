import { supabase } from "@/lib/supabase";

export type MemberPropertySummary = {
  id: string;
  propertyName: string;
  propertyType: "residential" | "commercial";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  photoUrl: string | null;
  createdAt: string;
};

export type ListMemberPropertiesResult =
  | { status: "success"; properties: MemberPropertySummary[] }
  | { status: "empty"; properties: [] }
  | { status: "error" };

export type GetMemberPropertyByIdResult =
  | { status: "success"; property: MemberPropertySummary }
  | { status: "not_found" }
  | { status: "error" };

type PropertyRow = {
  id: string;
  property_name: string | null;
  property_type: "residential" | "commercial" | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  property_photo_url: string | null;
  created_at: string;
};

type PropertiesClient = {
  from(table: "properties"): {
    select(columns: string): {
      eq(column: string, value: string): {
        eq(column: string, value: string): {
          maybeSingle(): Promise<{ data: PropertyRow | null; error: unknown }>;
        };
        order(column: string, options: { ascending: boolean }): Promise<{
          data: PropertyRow[] | null;
          error: unknown;
        }>;
      };
    };
  };
};

const PROPERTY_READ_COLUMNS = [
  "id",
  "property_name",
  "property_type",
  "address",
  "city",
  "state",
  "zip_code",
  "property_photo_url",
  "created_at",
].join(",");

function normalizeText(value: string | null): string {
  return value?.trim() ?? "";
}

function mapPropertyRow(row: PropertyRow): MemberPropertySummary {
  return {
    id: row.id,
    propertyName: normalizeText(row.property_name),
    propertyType: row.property_type ?? "residential",
    address: normalizeText(row.address),
    city: normalizeText(row.city),
    state: normalizeText(row.state),
    zipCode: normalizeText(row.zip_code),
    photoUrl: row.property_photo_url ?? null,
    createdAt: row.created_at,
  };
}

export function isValidPropertyId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function listMemberPropertiesWithClient(
  client: PropertiesClient,
  userId: string,
): Promise<ListMemberPropertiesResult> {
  const { data, error } = await client
    .from("properties")
    .select(PROPERTY_READ_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { status: "error" };
  }

  const rows = (data ?? []) as PropertyRow[];
  if (rows.length === 0) {
    return { status: "empty", properties: [] };
  }

  return {
    status: "success",
    properties: rows.map(mapPropertyRow),
  };
}

export async function getMemberPropertyByIdWithClient(
  client: PropertiesClient,
  userId: string,
  propertyId: string,
): Promise<GetMemberPropertyByIdResult> {
  if (!isValidPropertyId(propertyId)) {
    return { status: "not_found" };
  }

  const { data, error } = await client
    .from("properties")
    .select(PROPERTY_READ_COLUMNS)
    .eq("user_id", userId)
    .eq("id", propertyId)
    .maybeSingle();

  if (error) {
    return { status: "error" };
  }

  if (!data) {
    return { status: "not_found" };
  }

  return {
    status: "success",
    property: mapPropertyRow(data as PropertyRow),
  };
}

export async function listMemberProperties(
  userId: string,
): Promise<ListMemberPropertiesResult> {
  return listMemberPropertiesWithClient(supabase as unknown as PropertiesClient, userId);
}

export async function getMemberPropertyById(
  userId: string,
  propertyId: string,
): Promise<GetMemberPropertyByIdResult> {
  return getMemberPropertyByIdWithClient(
    supabase as unknown as PropertiesClient,
    userId,
    propertyId,
  );
}
