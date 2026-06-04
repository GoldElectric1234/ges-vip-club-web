"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, error: authError } = useAuth();
  const { seniorMode, t } = usePreferences();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.password) {
      setError(t("register.requiredField"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("register.passwordMismatch"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("register.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.fullName);
      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      const errorMsg =
        authError ||
        (err instanceof Error ? err.message : "Registration failed. Please try again.");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-8">
            <h2 className={`font-bold text-gray-900 ${
              seniorMode ? "text-4xl" : "text-3xl"
            }`}>
              {t("register.title")}
            </h2>
            <p className={`mt-3 text-gray-600 ${
              seniorMode ? "text-lg" : ""
            }`}>
              {t("register.subtitle")}
            </p>
          </div>

          {success && (
            <div className={`mb-6 rounded-lg bg-green-50 border-2 border-green-200 p-4 text-green-800 ${
              seniorMode ? "p-6 text-lg" : ""
            }`}>
              {t("register.successMessage")}
            </div>
          )}

          {error && (
            <div className={`mb-6 rounded-lg bg-red-50 border-2 border-red-200 p-4 text-red-800 ${
              seniorMode ? "p-6 text-lg" : ""
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-6 ${seniorMode ? "space-y-8" : ""}`}>
            <div>
              <label className={`block font-semibold text-gray-700 mb-2 ${
                seniorMode ? "text-lg" : ""
              }`}>
                {t("register.fullName")}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t("register.fullNamePlaceholder")}
                autoComplete="name"
                className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors ${
                  seniorMode ? "px-6 py-4 text-lg" : ""
                }`}
              />
            </div>

            <div>
              <label className={`block font-semibold text-gray-700 mb-2 ${
                seniorMode ? "text-lg" : ""
              }`}>
                {t("register.email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("register.emailPlaceholder")}
                autoComplete="email"
                className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors ${
                  seniorMode ? "px-6 py-4 text-lg" : ""
                }`}
              />
            </div>

            <div>
              <label className={`block font-semibold text-gray-700 mb-2 ${
                seniorMode ? "text-lg" : ""
              }`}>
                {t("register.password")}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("register.passwordPlaceholder")}
                autoComplete="new-password"
                className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors ${
                  seniorMode ? "px-6 py-4 text-lg" : ""
                }`}
              />
            </div>

            <div>
              <label className={`block font-semibold text-gray-700 mb-2 ${
                seniorMode ? "text-lg" : ""
              }`}>
                {t("register.confirmPassword")}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("register.confirmPasswordPlaceholder")}
                autoComplete="new-password"
                className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors ${
                  seniorMode ? "px-6 py-4 text-lg" : ""
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-white shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 ${
                seniorMode
                  ? "py-5 text-xl"
                  : "py-3"
              }`}
            >
              {loading ? t("settings.saving") : t("register.createAccount")}
            </button>
          </form>

          <p className={`mt-6 text-center text-gray-600 ${
            seniorMode ? "text-lg" : ""
          }`}>
            {t("register.alreadyHaveAccount")}{" "}
            <Link href="/login" className="font-bold text-yellow-600 hover:text-yellow-700">
              {t("register.loginHere")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
