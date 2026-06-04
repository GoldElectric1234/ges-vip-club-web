"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import { Language } from "@/lib/translations";

interface HeaderProps {
  seniorMode?: boolean;
  setSeniorMode?: (value: boolean) => void;
}

export function Header({ seniorMode: seniorModeProp, setSeniorMode }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    language,
    seniorMode: savedSeniorMode,
    setLanguage,
    setSeniorMode: saveSeniorMode,
    t,
  } = usePreferences();
  const seniorMode = seniorModeProp ?? savedSeniorMode;

  const handleSeniorModeToggle = () => {
    const nextValue = !seniorMode;
    setSeniorMode?.(nextValue);
    saveSeniorMode(nextValue);
  };

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
  };

  const navLinkClass = `rounded-lg px-4 py-3 font-bold transition-colors hover:bg-yellow-50 hover:text-yellow-700 ${
    seniorMode ? "text-lg text-gray-900" : "text-gray-700"
  }`;

  const languageSwitcher = (
    <div className="flex rounded-lg border border-gray-200 bg-white p-1">
      {(["en", "es"] as Language[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleLanguageChange(option)}
          className={`min-h-11 touch-manipulation rounded-md px-3 py-2 text-sm font-bold transition-colors ${
            language === option
              ? "bg-gray-900 text-white"
              : "text-gray-700 hover:bg-gray-100"
          } ${seniorMode ? "text-base" : ""}`}
          aria-pressed={language === option}
          aria-label={option === "en" ? "Use English" : "Usar espanol"}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const seniorButton = (
    <button
      type="button"
      onClick={handleSeniorModeToggle}
      className={`min-h-11 shrink-0 touch-manipulation whitespace-nowrap rounded-lg font-bold transition-all ${
        seniorMode
          ? "bg-purple-600 px-4 py-3 text-base text-white shadow-lg hover:bg-purple-700"
          : "bg-purple-100 px-3 py-2 text-sm text-purple-700 hover:bg-purple-200"
      }`}
      title={t("senior.toggle")}
      aria-pressed={seniorMode}
    >
      {seniorMode ? (
        <>
          <span className="sm:hidden">Senior ON</span>
          <span className="hidden sm:inline">{t("senior.on")}</span>
        </>
      ) : (
        t("senior.short")
      )}
    </button>
  );

  const callButton = (
    <a
      href="tel:15617134642"
      className={`flex min-h-11 shrink-0 touch-manipulation items-center justify-center whitespace-nowrap rounded-lg bg-green-600 px-4 py-3 text-center font-bold text-white shadow-lg transition-colors hover:bg-green-700 ${
        seniorMode ? "text-base" : "text-sm"
      }`}
    >
      {t("nav.callNow")}
    </a>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className={`mx-auto max-w-6xl px-4 ${seniorMode ? "py-4 sm:py-6" : "py-4"} sm:px-6 lg:px-8`}>
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="Gold Electric Services Logo"
              width={seniorMode ? 56 : 40}
              height={seniorMode ? 56 : 40}
              className={`${seniorMode ? "h-12 w-12 sm:h-14 sm:w-14" : "h-10 w-10"} rounded-lg`}
            />
            <h1 className={`whitespace-nowrap font-bold ${seniorMode ? "text-2xl sm:text-3xl" : "text-2xl"}`}>
              <span className="text-gray-900">GES</span>
              <span className="text-yellow-600"> VIP CLUB</span>
            </h1>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/"
              className={`transition-colors font-medium hover:text-yellow-600 ${
                seniorMode ? "text-lg text-gray-800 font-bold" : "text-gray-700"
              }`}
            >
              {t("nav.home")}
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={`transition-colors font-medium hover:text-yellow-600 ${
                    seniorMode ? "text-lg text-gray-800 font-bold" : "text-gray-700"
                  }`}
                >
                  {t("nav.dashboard")}
                </Link>
                <Link
                  href="/properties"
                  className={`transition-colors font-medium hover:text-yellow-600 ${
                    seniorMode ? "text-lg text-gray-800 font-bold" : "text-gray-700"
                  }`}
                >
                  {t("nav.properties")}
                </Link>
                <Link
                  href="/service-requests"
                  className={`transition-colors font-medium hover:text-yellow-600 ${
                    seniorMode ? "text-lg text-gray-800 font-bold" : "text-gray-700"
                  }`}
                >
                  {t("nav.serviceRequests")}
                </Link>
                <Link
                  href="/settings"
                  className={`transition-colors font-medium hover:text-yellow-600 ${
                    seniorMode ? "text-lg text-gray-800 font-bold" : "text-gray-700"
                  }`}
                >
                  {t("nav.settings")}
                </Link>
              </>
            )}
          </nav>

          <div className={`hidden items-center gap-2 sm:flex sm:gap-3 ${seniorMode ? "sm:gap-4" : ""}`}>
            {languageSwitcher}
            {seniorButton}
            {callButton}

            {user ? (
              <button
                onClick={handleSignOut}
                className={`min-h-11 shrink-0 touch-manipulation rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-white shadow-lg transition-all hover:from-yellow-600 hover:to-yellow-700 hover:shadow-xl ${
                  seniorMode ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"
                }`}
              >
                {t("nav.logout")}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`flex min-h-11 shrink-0 touch-manipulation items-center rounded-lg border-2 border-gray-300 font-semibold text-gray-700 transition-colors hover:border-yellow-600 hover:text-yellow-600 ${
                    seniorMode ? "px-5 py-3 text-base" : "px-4 py-2 text-sm"
                  }`}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className={`flex min-h-11 shrink-0 touch-manipulation items-center rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-white shadow-lg transition-all hover:from-yellow-600 hover:to-yellow-700 hover:shadow-xl ${
                    seniorMode ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"
                  }`}
                >
                  {t("nav.joinNow")}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`flex min-h-11 shrink-0 touch-manipulation items-center rounded-lg border-2 border-gray-300 px-4 py-2 font-bold text-gray-800 lg:hidden ${
              seniorMode ? "text-base" : "text-sm"
            }`}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? t("nav.close") : t("nav.menu")}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-[auto_auto_1fr] items-center gap-2 sm:hidden">
          {languageSwitcher}
          {seniorButton}
          {callButton}
        </div>

        {menuOpen && (
          <div
            id="mobile-menu"
            className={`mt-4 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-lg lg:hidden ${
              seniorMode ? "text-lg" : ""
            }`}
          >
            <nav className="grid gap-2">
              <Link href="/" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                {t("nav.home")}
              </Link>
              {user && (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                    {t("nav.dashboard")}
                  </Link>
                  <Link href="/properties" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                    {t("nav.properties")}
                  </Link>
                  <Link href="/service-requests" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                    {t("nav.serviceRequests")}
                  </Link>
                  <Link href="/settings" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                    {t("nav.settings")}
                  </Link>
                </>
              )}
              <a href="tel:15617134642" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                {t("nav.callNow")}: (561) 713-4642
              </a>
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={`${navLinkClass} text-left`}
                >
                  {t("nav.logout")}
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                    {t("nav.joinNow")}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
