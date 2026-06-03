"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
              <h1 className="text-2xl font-bold">
                <span className="text-gray-900">GES</span>
                <span className="text-yellow-600"> VIP CLUB™</span>
              </h1>
            </div>

            <nav className="hidden items-center gap-8 md:flex">
              <a
                href="#plans"
                className="text-gray-700 hover:text-yellow-600 transition-colors font-medium"
              >
                Plans
              </a>
              <a
                href="#benefits"
                className="text-gray-700 hover:text-yellow-600 transition-colors font-medium"
              >
                Benefits
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-yellow-600 transition-colors font-medium"
              >
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-3 sm:gap-4">
              <button className="rounded-lg border-2 border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:border-yellow-600 hover:text-yellow-600 transition-colors">
                Login
              </button>
              <button className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 font-bold text-white shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-yellow-700 transition-all">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-20 sm:px-6 lg:px-8">
        {/* Decorative gold accent */}
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl"></div>
        <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-yellow-600/10 blur-3xl"></div>

        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <div className="mb-6 inline-block rounded-full bg-yellow-500/20 px-4 py-2 text-yellow-400 font-semibold">
              ✨ Premium Electrical Services
            </div>

            <h2 className="mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
              <span className="text-white">Your Electrician</span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                For Life
              </span>
            </h2>

            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
              Join the GES VIP CLUB and experience premium electrical services with priority support, exclusive benefits, and member-only pricing from Gold Electric Services LLC.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-4 text-lg font-bold text-white shadow-xl hover:shadow-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105">
                Join Now
              </button>
              <button className="rounded-lg border-2 border-yellow-400 px-8 py-4 text-lg font-bold text-yellow-400 hover:bg-yellow-400/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section id="plans" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h3 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Membership <span className="text-yellow-600">Plans</span>
            </h3>
            <p className="mt-4 text-xl text-gray-600">
              Choose the perfect plan for your electrical service needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Basic Plan */}
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-yellow-400 hover:shadow-xl">
              <h4 className="text-2xl font-bold text-gray-900">Basic</h4>
              <p className="mt-2 text-gray-600">Perfect for homeowners</p>

              <div className="mt-6 mb-6">
                <span className="text-5xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    ✓
                  </span>
                  Priority scheduling
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    ✓
                  </span>
                  10% discount on services
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    ✓
                  </span>
                  Free diagnostics
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    ✓
                  </span>
                  24/7 support hotline
                </li>
              </ul>

              <button className="mt-8 w-full rounded-lg border-2 border-yellow-500 py-3 font-bold text-yellow-600 hover:bg-yellow-50 transition-colors">
                Get Started
              </button>
            </div>

            {/* Gold Plan - Featured */}
            <div className="relative rounded-2xl border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-white p-8 shadow-2xl md:scale-105">
              <div className="absolute -top-4 left-8 bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-1 rounded-full text-sm font-bold text-white">
                Most Popular
              </div>

              <h4 className="text-2xl font-bold text-gray-900">Gold</h4>
              <p className="mt-2 text-gray-600">Our most popular choice</p>

              <div className="mt-6 mb-6">
                <span className="text-5xl font-bold text-yellow-600">$79</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-200 font-bold text-yellow-700">
                    ✓
                  </span>
                  Everything in Basic +
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-200 font-bold text-yellow-700">
                    ✓
                  </span>
                  20% discount on services
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-200 font-bold text-yellow-700">
                    ✓
                  </span>
                  2 free service calls/year
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-200 font-bold text-yellow-700">
                    ✓
                  </span>
                  Premium emergency service
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-200 font-bold text-yellow-700">
                    ✓
                  </span>
                  Dedicated account manager
                </li>
              </ul>

              <button className="mt-8 w-full rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 py-3 font-bold text-white shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-yellow-700 transition-all">
                Join Gold Now
              </button>
            </div>

            {/* Platinum Plan */}
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-yellow-400 hover:shadow-xl">
              <h4 className="text-2xl font-bold text-gray-900">Platinum</h4>
              <p className="mt-2 text-gray-600">For commercial properties</p>

              <div className="mt-6 mb-6">
                <span className="text-5xl font-bold text-gray-900">$199</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    ✓
                  </span>
                  Everything in Gold +
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    ✓
                  </span>
                  30% discount on services
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    ✓
                  </span>
                  Unlimited service calls
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    ✓
                  </span>
                  Annual facility review
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                    ✓
                  </span>
                  Custom maintenance plans
                </li>
              </ul>

              <button className="mt-8 w-full rounded-lg border-2 border-yellow-500 py-3 font-bold text-yellow-600 hover:bg-yellow-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-gradient-to-r from-gray-50 to-yellow-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h3 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Why Join <span className="text-yellow-600">GES VIP CLUB?</span>
            </h3>
            <p className="mt-4 text-xl text-gray-600">
              Experience premium benefits designed for our valued members
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "⚡",
                title: "Priority Service",
                desc: "Skip the queue and get scheduled within 24 hours",
              },
              {
                icon: "💰",
                title: "Member Discounts",
                desc: "Save up to 30% on all electrical services",
              },
              {
                icon: "🛡️",
                title: "Extended Warranty",
                desc: "All work backed by lifetime warranty",
              },
              {
                icon: "📞",
                title: "24/7 Support",
                desc: "Round-the-clock emergency electrical support",
              },
              {
                icon: "✅",
                title: "Free Diagnostics",
                desc: "Complimentary electrical system evaluations",
              },
              {
                icon: "👥",
                title: "Dedicated Account Manager",
                desc: "Personal support from Gold tier and above",
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white p-8 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h4 className="text-xl font-bold text-gray-900">
                  {benefit.title}
                </h4>
                <p className="mt-2 text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <h3 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Get in <span className="text-yellow-600">Touch</span>
            </h3>
            <p className="mt-4 text-xl text-gray-600">
              Have questions? We're here to help you find the perfect plan
            </p>
          </div>

          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg">
            <form className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors"
                />
              </div>

              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors"
              />

              <select className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors">
                <option>Select a Plan</option>
                <option>Basic - $29/month</option>
                <option>Gold - $79/month</option>
                <option>Platinum - $199/month</option>
              </select>

              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors"
              ></textarea>

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 py-4 font-bold text-white shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-yellow-700 transition-all"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl mb-2">📍</div>
              <p className="font-semibold text-gray-900">Address</p>
              <p className="text-gray-600">Gold Electric Services LLC</p>
              <p className="text-gray-600">United States</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📞</div>
              <p className="font-semibold text-gray-900">Phone</p>
              <p className="text-yellow-600 font-bold">1-800-GES-CLUB</p>
              <p className="text-gray-600">24/7 Support</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✉️</div>
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-yellow-600">vip@ges-electric.com</p>
              <p className="text-gray-600">We reply in 1 hour</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-bold text-white sm:text-5xl">
            Ready to Join?
          </h3>
          <p className="mt-6 text-xl text-gray-300">
            Don't miss out on premium electrical services and exclusive member benefits. Join the GES VIP CLUB today!
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-4 text-lg font-bold text-white shadow-xl hover:shadow-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105">
              Join Now
            </button>
            <button className="rounded-lg border-2 border-yellow-400 px-8 py-4 text-lg font-bold text-yellow-400 hover:bg-yellow-400/10 transition-colors">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="font-bold text-gray-900">GES VIP CLUB</h4>
              <p className="mt-2 text-sm text-gray-600">
                Premium electrical services from Gold Electric Services LLC
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Quick Links</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#plans" className="hover:text-yellow-600">
                    Plans
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="hover:text-yellow-600">
                    Benefits
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-yellow-600">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Follow Us</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-600">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>
              © 2024 Gold Electric Services LLC. All rights reserved. GES VIP
              CLUB™ is a trademark of Gold Electric Services LLC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}