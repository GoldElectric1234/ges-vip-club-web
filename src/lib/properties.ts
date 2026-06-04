import { supabase } from "@/lib/supabase";

export type PropertyType = "residential" | "commercial";

export interface PropertyFormData {
  propertyName: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  yearBuilt: string;
  mainServiceSize: string;
  mainPanelBrand: string;
  mainBreakerSize: string;
  utilityCompany: string;
  generatorInstalled: boolean;
  generatorBrand: string;
  solarInstalled: boolean;
  solarSystemSize: string;
  lastElectricalInspection: string;
  propertyPhotoUrl: string;
  panelPhotoUrl: string;
  meterPhotoUrl: string;
  notes: string;
}

export interface PropertyRecord extends PropertyFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyRow {
  id: string;
  property_name: string;
  property_type: PropertyType;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  year_built: number | null;
  main_service_size: string | null;
  main_panel_brand: string | null;
  main_breaker_size: string | null;
  utility_company: string | null;
  generator_installed: boolean | null;
  generator_brand: string | null;
  solar_installed: boolean | null;
  solar_system_size: string | null;
  last_electrical_inspection: string | null;
  property_photo_url: string | null;
  panel_photo_url: string | null;
  meter_photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const PROPERTY_SELECT = [
  "id",
  "property_name",
  "property_type",
  "address",
  "city",
  "state",
  "zip_code",
  "year_built",
  "main_service_size",
  "main_panel_brand",
  "main_breaker_size",
  "utility_company",
  "generator_installed",
  "generator_brand",
  "solar_installed",
  "solar_system_size",
  "last_electrical_inspection",
  "property_photo_url",
  "panel_photo_url",
  "meter_photo_url",
  "notes",
  "created_at",
  "updated_at",
].join(",");

export const emptyPropertyFormData: PropertyFormData = {
  propertyName: "",
  propertyType: "residential",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  yearBuilt: "",
  mainServiceSize: "",
  mainPanelBrand: "",
  mainBreakerSize: "",
  utilityCompany: "",
  generatorInstalled: false,
  generatorBrand: "",
  solarInstalled: false,
  solarSystemSize: "",
  lastElectricalInspection: "",
  propertyPhotoUrl: "",
  panelPhotoUrl: "",
  meterPhotoUrl: "",
  notes: "",
};

function mapProperty(row: PropertyRow): PropertyRecord {
  return {
    id: row.id,
    propertyName: row.property_name,
    propertyType: row.property_type,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    yearBuilt: row.year_built ? String(row.year_built) : "",
    mainServiceSize: row.main_service_size ?? "",
    mainPanelBrand: row.main_panel_brand ?? "",
    mainBreakerSize: row.main_breaker_size ?? "",
    utilityCompany: row.utility_company ?? "",
    generatorInstalled: row.generator_installed ?? false,
    generatorBrand: row.generator_brand ?? "",
    solarInstalled: row.solar_installed ?? false,
    solarSystemSize: row.solar_system_size ?? "",
    lastElectricalInspection: row.last_electrical_inspection ?? "",
    propertyPhotoUrl: row.property_photo_url ?? "",
    panelPhotoUrl: row.panel_photo_url ?? "",
    meterPhotoUrl: row.meter_photo_url ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPayload(userId: string, formData: PropertyFormData) {
  const yearBuilt = Number.parseInt(formData.yearBuilt, 10);

  return {
    user_id: userId,
    property_name: formData.propertyName.trim(),
    property_type: formData.propertyType,
    address: formData.address.trim(),
    city: formData.city.trim(),
    state: formData.state.trim(),
    zip_code: formData.zipCode.trim(),
    year_built: Number.isNaN(yearBuilt) ? null : yearBuilt,
    main_service_size: formData.mainServiceSize.trim() || null,
    main_panel_brand: formData.mainPanelBrand.trim() || null,
    main_breaker_size: formData.mainBreakerSize.trim() || null,
    utility_company: formData.utilityCompany.trim() || null,
    generator_installed: formData.generatorInstalled,
    generator_brand: formData.generatorBrand.trim() || null,
    solar_installed: formData.solarInstalled,
    solar_system_size: formData.solarSystemSize.trim() || null,
    last_electrical_inspection: formData.lastElectricalInspection || null,
    property_photo_url: formData.propertyPhotoUrl || null,
    panel_photo_url: formData.panelPhotoUrl || null,
    meter_photo_url: formData.meterPhotoUrl || null,
    notes: formData.notes.trim() || null,
  };
}

export async function uploadPropertyPhoto(
  userId: string,
  file: File,
  photoType: "property" | "panel" | "meter"
): Promise<string> {
  const extension = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/${photoType}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("property-photos")
    .upload(filePath, file, { upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("property-photos").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function listProperties(userId: string): Promise<PropertyRecord[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as PropertyRow[]).map(mapProperty);
}

export async function getProperty(
  userId: string,
  propertyId: string
): Promise<PropertyRecord | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("user_id", userId)
    .eq("id", propertyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProperty(data as unknown as PropertyRow) : null;
}

export async function createProperty(
  userId: string,
  formData: PropertyFormData
): Promise<PropertyRecord> {
  const { data, error } = await supabase
    .from("properties")
    .insert(toPayload(userId, formData))
    .select(PROPERTY_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapProperty(data as unknown as PropertyRow);
}

export async function updateProperty(
  userId: string,
  propertyId: string,
  formData: PropertyFormData
): Promise<PropertyRecord> {
  const { data, error } = await supabase
    .from("properties")
    .update(toPayload(userId, formData))
    .eq("user_id", userId)
    .eq("id", propertyId)
    .select(PROPERTY_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapProperty(data as unknown as PropertyRow);
}

export async function deleteProperty(
  userId: string,
  propertyId: string
): Promise<void> {
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("user_id", userId)
    .eq("id", propertyId);

  if (error) {
    throw error;
  }
}
