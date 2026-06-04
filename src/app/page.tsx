"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { usePreferences } from "@/app/preferences/context";

const plans = [
  {
    id: "basic",
    price: "$29",
    featured: false,
    features: ["feature1", "feature2", "feature3", "feature4"],
  },
  {
    id: "gold",
    price: "$79",
    featured: true,
    features: ["feature1", "feature2", "feature3", "feature4", "feature5"],
  },
  {
    id: "platinum",
    price: "$199",
    featured: false,
    features: ["feature1", "feature2", "feature3", "feature4", "feature5"],
  },
] as const;

const benefits = [
  { id: "priority", icon: "!" },
  { id: "discounts", icon: "$" },
  { id: "warranty", icon: "#" },
  { id: "support", icon: "24" },
  { id: "diagnostics", icon: "+" },
  { id: "manager", icon: "*" },
] as const;

export default function Home() {
  const { seniorMode, t } = usePreferences();

  return (
    <div className={`min-h-screen ${seniorMode ? "text-lg" : ""}`}>
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-20 sm:px-6 lg:px-8">
        {!seniorMode && (
          <>
            <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl"></div>
            <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-yellow-600/10 blur-3xl"></div>
          </>
        )}

        <div className={`relative mx-auto max-w-6xl ${seniorMode ? "py-8" : ""}`}>
          <div className={`text-center ${seniorMode ? "space-y-6" : ""}`}>
            <div className="mb-8 flex justify-center">
              <Image
                src="/logo.png"
                alt="Gold Electric Services Logo"
                width={seniorMode ? 120 : 80}
                height={seniorMode ? 120 : 80}
                className="rounded-2xl shadow-2xl"
              />
            </div>

            <div
              className={`mb-6 inline-block rounded-full bg-yellow-500/20 px-4 py-2 font-semibold text-yellow-400 ${
                seniorMode ? "text-lg" : ""
              }`}
            >
              {t("landing.hero.badge")}
            </div>

            <h2
              className={`font-bold ${
                seniorMode
                  ? "text-5xl sm:text-6xl lg:text-7xl"
                  : "text-4xl sm:text-5xl lg:text-6xl"
              }`}
            >
              <span className="text-white">{t("landing.hero.titleLine1")}</span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                {t("landing.hero.titleLine2")}
              </span>
            </h2>

            <p
              className={`mx-auto max-w-2xl font-medium text-white ${
                seniorMode ? "text-2xl leading-relaxed" : "text-xl text-gray-300"
              }`}
            >
              {t("landing.hero.subtitle")}
            </p>

            <div
              className={`flex flex-col gap-4 sm:flex-row sm:justify-center ${
                seniorMode ? "gap-6 pt-4" : ""
              }`}
            >
              <Link
                href="/register"
                className={`rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-center font-bold text-white shadow-xl transition-all hover:scale-105 hover:from-yellow-600 hover:to-yellow-700 hover:shadow-2xl ${
                  seniorMode ? "px-10 py-5 text-xl" : "px-8 py-4 text-lg"
                }`}
              >
                {t("landing.hero.joinButton")}
              </Link>
              <a
                href="#plans"
                className={`rounded-lg border-2 border-yellow-400 text-center font-bold text-yellow-400 transition-colors hover:bg-yellow-400/10 ${
                  seniorMode ? "px-10 py-5 text-xl" : "px-8 py-4 text-lg"
                }`}
              >
                {t("landing.hero.learnButton")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className={`px-4 sm:px-6 lg:px-8 ${seniorMode ? "py-24" : "py-20"}`}>
        <div className="mx-auto max-w-6xl">
          <div className={`mb-16 text-center ${seniorMode ? "space-y-4" : ""}`}>
            <h3
              className={`font-bold text-gray-900 ${
                seniorMode ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"
              }`}
            >
              {t("landing.plans.titlePrefix")}{" "}
              <span className="text-yellow-600">{t("landing.plans.titleHighlight")}</span>
            </h3>
            <p className={`text-gray-600 ${seniorMode ? "text-2xl font-medium" : "text-xl"}`}>
              {t("landing.plans.subtitle")}
            </p>
          </div>

          <div className={`grid gap-8 md:grid-cols-3 ${seniorMode ? "gap-12" : ""}`}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`${
                  plan.featured
                    ? "relative border-yellow-500 bg-gradient-to-br from-yellow-50 to-white shadow-2xl md:scale-105"
                    : "border-gray-200 bg-white transition-all hover:border-yellow-400 hover:shadow-xl"
                } rounded-2xl border-2 p-8 ${seniorMode ? "p-10" : ""}`}
              >
                {plan.featured && (
                  <div
                    className={`absolute -top-4 left-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-1 font-bold text-white ${
                      seniorMode ? "-top-5 py-2 text-lg" : "text-sm"
                    }`}
                  >
                    {t("landing.plans.mostPopular")}
                  </div>
                )}

                <h4 className={`font-bold text-gray-900 ${seniorMode ? "text-3xl" : "text-2xl"}`}>
                  {t(`landing.plans.${plan.id}.name`)}
                </h4>
                <p className={`mt-2 text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
                  {t(`landing.plans.${plan.id}.description`)}
                </p>

                <div className={`mb-6 mt-6 ${seniorMode ? "mb-8" : ""}`}>
                  <span
                    className={`font-bold ${plan.featured ? "text-yellow-600" : "text-gray-900"} ${
                      seniorMode ? "text-6xl" : "text-5xl"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className={`text-gray-600 ${seniorMode ? "text-xl" : ""}`}>
                    {t("landing.plans.perMonth")}
                  </span>
                </div>

                <ul className={`space-y-4 ${seniorMode ? "space-y-5" : ""}`}>
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-center gap-3 text-gray-700 ${seniorMode ? "text-lg" : ""}`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          plan.featured
                            ? "bg-yellow-200 font-bold text-yellow-700"
                            : "bg-yellow-100"
                        }`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                      {t(`landing.plans.${plan.id}.${feature}`)}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.id === "platinum" ? "#contact" : "/register"}
                  className={`mt-8 block w-full rounded-lg text-center font-bold transition-all ${
                    plan.featured
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg hover:from-yellow-600 hover:to-yellow-700 hover:shadow-xl"
                      : "border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  } ${seniorMode ? "py-4 text-lg" : "py-3"}`}
                >
                  {t(`landing.plans.${plan.id}.button`)}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="benefits"
        className={`bg-gradient-to-r from-gray-50 to-yellow-50 px-4 sm:px-6 lg:px-8 ${
          seniorMode ? "py-24" : "py-20"
        }`}
      >
        <div className="mx-auto max-w-6xl">
          <div className={`mb-16 text-center ${seniorMode ? "space-y-4" : ""}`}>
            <h3
              className={`font-bold text-gray-900 ${
                seniorMode ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"
              }`}
            >
              {t("landing.benefits.titlePrefix")}{" "}
              <span className="text-yellow-600">{t("landing.benefits.titleHighlight")}</span>
            </h3>
            <p className={`text-gray-600 ${seniorMode ? "text-2xl font-medium" : "text-xl"}`}>
              {t("landing.benefits.subtitle")}
            </p>
          </div>

          <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-3 ${seniorMode ? "gap-12" : ""}`}>
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className={`rounded-2xl bg-white p-8 text-center shadow-lg transition-shadow hover:shadow-xl ${
                  seniorMode ? "p-10" : ""
                }`}
              >
                <div
                  className={`mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-100 font-bold text-yellow-700 ${
                    seniorMode ? "h-20 w-20 text-3xl" : "h-14 w-14 text-xl"
                  }`}
                  aria-hidden="true"
                >
                  {benefit.icon}
                </div>
                <h4 className={`font-bold text-gray-900 ${seniorMode ? "text-2xl" : "text-xl"}`}>
                  {t(`landing.benefits.${benefit.id}.title`)}
                </h4>
                <p className={`mt-2 text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
                  {t(`landing.benefits.${benefit.id}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className={`px-4 sm:px-6 lg:px-8 ${seniorMode ? "py-24" : "py-20"}`}>
        <div className="mx-auto max-w-2xl">
          <div className={`mb-12 text-center ${seniorMode ? "space-y-4" : ""}`}>
            <h3
              className={`font-bold text-gray-900 ${
                seniorMode ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"
              }`}
            >
              {t("landing.contact.titlePrefix")}{" "}
              <span className="text-yellow-600">{t("landing.contact.titleHighlight")}</span>
            </h3>
            <p className={`text-gray-600 ${seniorMode ? "text-2xl font-medium" : "text-xl"}`}>
              {t("landing.contact.subtitle")}
            </p>
          </div>

          <div className={`rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg ${seniorMode ? "p-12" : ""}`}>
            <form className={`space-y-6 ${seniorMode ? "space-y-8" : ""}`}>
              <div className={`grid gap-6 sm:grid-cols-2 ${seniorMode ? "gap-8" : ""}`}>
                <input
                  type="text"
                  placeholder={t("landing.contact.namePlaceholder")}
                  className={`rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors focus:border-yellow-500 focus:outline-none ${
                    seniorMode ? "px-6 py-4 text-lg" : ""
                  }`}
                />
                <input
                  type="email"
                  placeholder={t("landing.contact.emailPlaceholder")}
                  className={`rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors focus:border-yellow-500 focus:outline-none ${
                    seniorMode ? "px-6 py-4 text-lg" : ""
                  }`}
                />
              </div>

              <input
                type="tel"
                placeholder={t("landing.contact.phonePlaceholder")}
                className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors focus:border-yellow-500 focus:outline-none ${
                  seniorMode ? "px-6 py-4 text-lg" : ""
                }`}
              />

              <select
                className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors focus:border-yellow-500 focus:outline-none ${
                  seniorMode ? "px-6 py-4 text-lg" : ""
                }`}
              >
                <option>{t("landing.contact.selectPlan")}</option>
                <option>{t("landing.contact.basicOption")}</option>
                <option>{t("landing.contact.goldOption")}</option>
                <option>{t("landing.contact.platinumOption")}</option>
              </select>

              <textarea
                placeholder={t("landing.contact.messagePlaceholder")}
                rows={4}
                className={`w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors focus:border-yellow-500 focus:outline-none ${
                  seniorMode ? "px-6 py-4 text-lg rows-6" : ""
                }`}
              ></textarea>

              <button
                type="submit"
                className={`w-full rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-white shadow-lg transition-all hover:from-yellow-600 hover:to-yellow-700 hover:shadow-xl ${
                  seniorMode ? "py-5 text-xl" : "py-4"
                }`}
              >
                {t("landing.contact.submit")}
              </button>
            </form>
          </div>

          <div className={`mt-12 grid gap-8 sm:grid-cols-3 ${seniorMode ? "mt-16 gap-12" : ""}`}>
            <div className={`text-center ${seniorMode ? "space-y-3" : ""}`}>
              <p className={`font-semibold text-gray-900 ${seniorMode ? "text-xl" : ""}`}>
                {t("landing.contact.addressLabel")}
              </p>
              <p className={`text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
                {t("landing.contact.company")}
              </p>
              <p className={`text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
                {t("landing.contact.country")}
              </p>
            </div>
            <div className={`text-center ${seniorMode ? "space-y-3" : ""}`}>
              <p className={`font-semibold text-gray-900 ${seniorMode ? "text-xl" : ""}`}>
                {t("landing.contact.phoneLabel")}
              </p>
              <p className={`font-bold text-yellow-600 ${seniorMode ? "text-xl" : ""}`}>
                {t("landing.contact.phone")}
              </p>
              <p className={`text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
                {t("landing.contact.supportHours")}
              </p>
            </div>
            <div className={`text-center ${seniorMode ? "space-y-3" : ""}`}>
              <p className={`font-semibold text-gray-900 ${seniorMode ? "text-xl" : ""}`}>
                {t("landing.contact.emailLabel")}
              </p>
              <p className={`text-yellow-600 ${seniorMode ? "text-lg" : ""}`}>
                {t("landing.contact.email")}
              </p>
              <p className={`text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
                {t("landing.contact.replyTime")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4 sm:px-6 lg:px-8 ${
          seniorMode ? "py-24" : "py-20"
        }`}
      >
        <div className={`mx-auto max-w-4xl text-center ${seniorMode ? "space-y-8" : ""}`}>
          <h3
            className={`font-bold text-white ${
              seniorMode ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"
            }`}
          >
            {t("landing.finalCta.title")}
          </h3>
          <p className={`text-gray-300 ${seniorMode ? "text-2xl leading-relaxed" : "text-xl"}`}>
            {t("landing.finalCta.subtitle")}
          </p>

          <div
            className={`flex flex-col gap-4 sm:flex-row sm:justify-center ${
              seniorMode ? "gap-6 pt-4" : ""
            }`}
          >
            <Link
              href="/register"
              className={`rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-center font-bold text-white shadow-xl transition-all hover:scale-105 hover:from-yellow-600 hover:to-yellow-700 hover:shadow-2xl ${
                seniorMode ? "px-10 py-5 text-xl" : "px-8 py-4 text-lg"
              }`}
            >
              {t("landing.finalCta.joinButton")}
            </Link>
            <a
              href="#contact"
              className={`rounded-lg border-2 border-yellow-400 text-center font-bold text-yellow-400 transition-colors hover:bg-yellow-400/10 ${
                seniorMode ? "px-10 py-5 text-xl" : "px-8 py-4 text-lg"
              }`}
            >
              {t("landing.finalCta.scheduleButton")}
            </a>
          </div>
        </div>
      </section>

      <footer className={`border-t border-gray-200 bg-gray-50 px-4 sm:px-6 lg:px-8 ${seniorMode ? "py-16" : "py-12"}`}>
        <div className="mx-auto max-w-6xl">
          <div className={`grid gap-8 md:grid-cols-4 ${seniorMode ? "gap-12" : ""}`}>
            <div>
              <h4 className={`font-bold text-gray-900 ${seniorMode ? "text-xl" : ""}`}>
                {t("landing.footer.brand")}
              </h4>
              <p className={`mt-2 text-gray-600 ${seniorMode ? "text-lg" : "text-sm"}`}>
                {t("landing.footer.description")}
              </p>
            </div>
            <div>
              <h4 className={`font-bold text-gray-900 ${seniorMode ? "text-xl" : ""}`}>
                {t("landing.footer.quickLinks")}
              </h4>
              <ul className={`mt-4 space-y-2 text-gray-600 ${seniorMode ? "space-y-3 text-lg" : "text-sm"}`}>
                <li>
                  <a href="#plans" className="hover:text-yellow-600">
                    {t("landing.footer.plans")}
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="hover:text-yellow-600">
                    {t("landing.footer.benefits")}
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-yellow-600">
                    {t("landing.footer.contact")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className={`font-bold text-gray-900 ${seniorMode ? "text-xl" : ""}`}>
                {t("landing.footer.legal")}
              </h4>
              <ul className={`mt-4 space-y-2 text-gray-600 ${seniorMode ? "space-y-3 text-lg" : "text-sm"}`}>
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    {t("landing.footer.privacy")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    {t("landing.footer.terms")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className={`font-bold text-gray-900 ${seniorMode ? "text-xl" : ""}`}>
                {t("landing.footer.follow")}
              </h4>
              <ul className={`mt-4 space-y-2 text-gray-600 ${seniorMode ? "space-y-3 text-lg" : "text-sm"}`}>
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    {t("landing.footer.facebook")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    {t("landing.footer.instagram")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    {t("landing.footer.linkedin")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`mt-8 border-t border-gray-200 pt-8 text-center text-gray-600 ${
              seniorMode ? "mt-12 text-lg" : "text-sm"
            }`}
          >
            <p>{t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
