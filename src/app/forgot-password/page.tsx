"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";

export default function ForgotPasswordPage() {
  const { resetPassword, error: authError } = useAuth();
  const { seniorMode, t } = usePreferences();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(t("forgot.emailRequired"));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch {
      setError(authError || t("forgot.errorSending"));
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
              {t("forgot.title")}
            </h2>
            <p className={`mt-3 text-gray-600 ${
              seniorMode ? "text-lg" : ""
            }`}>
              {t("forgot.subtitle")}
            </p>
          </div>

          {success && (
            <div className={`mb-6 rounded-lg bg-green-50 border-2 border-green-200 p-4 text-green-800 ${
              seniorMode ? "p-6 text-lg" : ""
            }`}>
              <p className="font-semibold">{t("forgot.successTitle")}</p>
              <p>{t("forgot.successMessage")}</p>
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
                {t("login.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
                autoComplete="email"
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
              {loading ? t("forgot.sending") : t("forgot.submit")}
            </button>
          </form>

          <div className={`mt-6 text-center space-y-3 ${
            seniorMode ? "space-y-4" : ""
          }`}>
            <p className={`text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
              {t("forgot.rememberPassword")}{" "}
              <Link href="/login" className="font-bold text-yellow-600 hover:text-yellow-700">
                {t("forgot.backToLogin")}
              </Link>
            </p>
            <p className={`text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
              {t("forgot.needAccount")}{" "}
              <Link href="/register" className="font-bold text-yellow-600 hover:text-yellow-700">
                {t("login.signUpHere")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
