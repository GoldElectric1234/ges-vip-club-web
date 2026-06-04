"use client";

import { useState } from "react";

interface RequestServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  seniorMode: boolean;
  propertyAddress: string;
}

export function RequestServiceModal({
  isOpen,
  onClose,
  seniorMode,
  propertyAddress,
}: RequestServiceModalProps) {
  const [formData, setFormData] = useState({
    serviceType: "maintenance",
    description: "",
    preferredDate: "",
    isEmergency: false,
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to Supabase
    console.log("Service request submitted:", { ...formData, propertyAddress });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setFormData({
        serviceType: "maintenance",
        description: "",
        preferredDate: "",
        isEmergency: false,
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`rounded-2xl bg-white shadow-2xl max-w-md w-full mx-4 ${
          seniorMode ? "p-8" : "p-6"
        }`}
      >
        <h3
          className={`font-bold text-gray-900 mb-4 ${
            seniorMode ? "text-3xl" : "text-2xl"
          }`}
        >
          Request Service
        </h3>

        {submitted ? (
          <div className="space-y-4 text-center py-8">
            <div className="text-5xl">✓</div>
            <p
              className={`text-green-600 font-semibold ${
                seniorMode ? "text-xl" : ""
              }`}
            >
              Request Submitted!
            </p>
            <p
              className={`text-gray-600 ${seniorMode ? "text-lg" : "text-sm"}`}
            >
              We&apos;ll contact you shortly to confirm
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`space-y-4 ${
            seniorMode ? "space-y-6" : ""
          }`}>
            <div>
              <label
                className={`block font-semibold text-gray-700 mb-2 ${
                  seniorMode ? "text-lg" : ""
                }`}
              >
                Service Type
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData({ ...formData, serviceType: e.target.value })
                }
                className={`w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-yellow-500 focus:outline-none ${
                  seniorMode ? "py-3 text-lg" : ""
                }`}
              >
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="installation">Installation</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>

            <div>
              <label
                className={`block font-semibold text-gray-700 mb-2 ${
                  seniorMode ? "text-lg" : ""
                }`}
              >
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what you need..."
                rows={3}
                className={`w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-yellow-500 focus:outline-none ${
                  seniorMode ? "py-3 text-lg rows-5" : ""
                }`}
              />
            </div>

            <div>
              <label
                className={`block font-semibold text-gray-700 mb-2 ${
                  seniorMode ? "text-lg" : ""
                }`}
              >
                Preferred Date
              </label>
              <input
                type="date"
                value={formData.preferredDate}
                onChange={(e) =>
                  setFormData({ ...formData, preferredDate: e.target.value })
                }
                className={`w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-yellow-500 focus:outline-none ${
                  seniorMode ? "py-3 text-lg" : ""
                }`}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="emergency"
                checked={formData.isEmergency}
                onChange={(e) =>
                  setFormData({ ...formData, isEmergency: e.target.checked })
                }
                className={`w-4 h-4 ${seniorMode ? "w-6 h-6" : ""}`}
              />
              <label
                htmlFor="emergency"
                className={`font-semibold text-gray-700 ${
                  seniorMode ? "text-lg" : ""
                }`}
              >
                This is an emergency
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 rounded-lg border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-50 ${
                  seniorMode ? "py-4 text-lg" : "py-2"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-white shadow-lg hover:shadow-xl ${
                  seniorMode ? "py-4 text-lg" : "py-2"
                }`}
              >
                Submit Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
