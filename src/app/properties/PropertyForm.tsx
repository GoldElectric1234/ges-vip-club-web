"use client";

import { PropertyFormData, PropertyType } from "@/lib/properties";

interface PropertyFormProps {
  data: PropertyFormData;
  errorMessage: string;
  seniorMode: boolean;
  submitLabel: string;
  saving: boolean;
  t: (key: string) => string;
  onChange: (data: PropertyFormData) => void;
  onSubmit: (event: React.FormEvent) => void;
  onPhotoUpload: (
    photoType: "property" | "panel" | "meter",
    file: File
  ) => Promise<void>;
}

export function PropertyForm({
  data,
  errorMessage,
  seniorMode,
  submitLabel,
  saving,
  t,
  onChange,
  onSubmit,
  onPhotoUpload,
}: PropertyFormProps) {
  const updateField = <K extends keyof PropertyFormData>(
    field: K,
    value: PropertyFormData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const inputClass = `w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none ${
    seniorMode ? "px-6 py-4 text-lg" : ""
  }`;
  const labelClass = `mb-2 block font-semibold text-gray-700 ${seniorMode ? "text-lg" : ""}`;

  const renderPhotoUpload = (
    labelKey: string,
    photoType: "property" | "panel" | "meter",
    url: string
  ) => (
    <div className="rounded-lg border-2 border-gray-200 p-4">
      <label className={labelClass}>{t(labelKey)}</label>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={t(labelKey)}
          className="mb-3 h-36 w-full rounded-lg object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onPhotoUpload(photoType, file);
          }
        }}
        className={`w-full text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-100 file:px-4 file:py-2 file:font-bold file:text-yellow-800 hover:file:bg-yellow-200 ${
          seniorMode ? "text-lg file:px-6 file:py-3" : ""
        }`}
      />
    </div>
  );

  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${seniorMode ? "space-y-8" : ""}`}>
      {errorMessage && (
        <div
          className={`rounded-lg border-2 border-red-200 bg-red-50 p-4 font-semibold text-red-800 ${
            seniorMode ? "p-6 text-lg" : ""
          }`}
        >
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>{t("properties.field.propertyName")}</label>
          <input
            type="text"
            value={data.propertyName}
            onChange={(event) => updateField("propertyName", event.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>{t("properties.field.propertyType")}</label>
          <select
            value={data.propertyType}
            onChange={(event) => updateField("propertyType", event.target.value as PropertyType)}
            className={inputClass}
            required
          >
            <option value="residential">{t("properties.type.residential")}</option>
            <option value="commercial">{t("properties.type.commercial")}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t("properties.field.address")}</label>
        <input
          type="text"
          value={data.address}
          onChange={(event) => updateField("address", event.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className={labelClass}>{t("properties.field.city")}</label>
          <input
            type="text"
            value={data.city}
            onChange={(event) => updateField("city", event.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>{t("properties.field.state")}</label>
          <input
            type="text"
            value={data.state}
            onChange={(event) => updateField("state", event.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>{t("properties.field.zipCode")}</label>
          <input
            type="text"
            value={data.zipCode}
            onChange={(event) => updateField("zipCode", event.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className={labelClass}>{t("properties.field.yearBuilt")}</label>
          <input
            type="number"
            inputMode="numeric"
            min="1800"
            max="2100"
            value={data.yearBuilt}
            onChange={(event) => updateField("yearBuilt", event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("properties.field.mainServiceSize")}</label>
          <input
            type="text"
            value={data.mainServiceSize}
            onChange={(event) => updateField("mainServiceSize", event.target.value)}
            className={inputClass}
            placeholder={t("properties.placeholder.mainServiceSize")}
          />
        </div>
        <div>
          <label className={labelClass}>{t("properties.field.mainPanelBrand")}</label>
          <input
            type="text"
            value={data.mainPanelBrand}
            onChange={(event) => updateField("mainPanelBrand", event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className={labelClass}>{t("properties.field.mainBreakerSize")}</label>
          <input
            type="text"
            value={data.mainBreakerSize}
            onChange={(event) => updateField("mainBreakerSize", event.target.value)}
            className={inputClass}
            placeholder={t("properties.placeholder.mainBreakerSize")}
          />
        </div>
        <div>
          <label className={labelClass}>{t("properties.field.utilityCompany")}</label>
          <input
            type="text"
            value={data.utilityCompany}
            onChange={(event) => updateField("utilityCompany", event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("properties.field.lastElectricalInspection")}</label>
          <input
            type="date"
            value={data.lastElectricalInspection}
            onChange={(event) => updateField("lastElectricalInspection", event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label
          className={`flex items-start gap-3 rounded-lg border-2 border-gray-200 p-4 ${
            seniorMode ? "p-6" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={data.generatorInstalled}
            onChange={(event) => updateField("generatorInstalled", event.target.checked)}
            className={`mt-1 ${seniorMode ? "h-6 w-6" : "h-5 w-5"}`}
          />
          <span className={`font-semibold text-gray-800 ${seniorMode ? "text-lg" : ""}`}>
            {t("properties.field.generatorInstalled")}
          </span>
        </label>

        <label
          className={`flex items-start gap-3 rounded-lg border-2 border-gray-200 p-4 ${
            seniorMode ? "p-6" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={data.solarInstalled}
            onChange={(event) => updateField("solarInstalled", event.target.checked)}
            className={`mt-1 ${seniorMode ? "h-6 w-6" : "h-5 w-5"}`}
          />
          <span className={`font-semibold text-gray-800 ${seniorMode ? "text-lg" : ""}`}>
            {t("properties.field.solarInstalled")}
          </span>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>{t("properties.field.generatorBrand")}</label>
          <input
            type="text"
            value={data.generatorBrand}
            onChange={(event) => updateField("generatorBrand", event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("properties.field.solarSystemSize")}</label>
          <input
            type="text"
            value={data.solarSystemSize}
            onChange={(event) => updateField("solarSystemSize", event.target.value)}
            className={inputClass}
            placeholder={t("properties.placeholder.solarSystemSize")}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {renderPhotoUpload("properties.field.propertyPhoto", "property", data.propertyPhotoUrl)}
        {renderPhotoUpload("properties.field.panelPhoto", "panel", data.panelPhotoUrl)}
        {renderPhotoUpload("properties.field.meterPhoto", "meter", data.meterPhotoUrl)}
      </div>

      <div>
        <label className={labelClass}>{t("properties.field.notes")}</label>
        <textarea
          value={data.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className={inputClass}
          rows={seniorMode ? 6 : 4}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className={`rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-white shadow-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 ${
          seniorMode ? "w-full px-8 py-5 text-xl md:w-auto" : "w-full px-6 py-3 md:w-auto"
        }`}
      >
        {saving ? t("properties.saving") : submitLabel}
      </button>
    </form>
  );
}
