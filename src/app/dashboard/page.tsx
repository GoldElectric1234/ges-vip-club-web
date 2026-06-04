"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import {
  getDashboardData,
  formatDate,
  daysUntilRenewal,
  getStatusColor,
  getStatusBgColor,
  formatServiceRequestStatus,
} from "@/lib/dashboard";
import { UserProfile } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { seniorMode } = usePreferences();
  const [dashboardData, setDashboardData] = useState<UserProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user && !dashboardData) {
      getDashboardData(user.id).then((data) => {
        setDashboardData(data);
        if (data.properties.length > 0) {
          setSelectedProperty(data.properties[0].id);
        }
        setPageLoading(false);
      });
    }
  }, [user, loading, dashboardData, router]);

  if (loading || pageLoading) {
    return (
      <div
        className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}
      >
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className={`text-gray-600 ${seniorMode ? "text-xl" : ""}`}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  const renewalDays = daysUntilRenewal(dashboardData.membershipPlan.renewalDate);
  // Senior Mode: Show simplified dashboard with fewer sections
  if (seniorMode) {
    return (
      <div className={`min-h-screen text-lg bg-white flex flex-col`}>
        <Header />

        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Welcome Section */}
            <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 p-12">
              <h2 className="font-bold text-5xl text-gray-900 mb-2">
                Welcome, <span className="text-yellow-600">{dashboardData.fullName}!</span>
              </h2>
              <p className="text-xl text-gray-700">
                Membership Status:{" "}
                <span className="font-bold text-green-600">
                  {dashboardData.membershipPlan.name} - Active
                </span>
              </p>
              <p className="text-xl text-gray-600 mt-2">
                Renewal in {renewalDays} days ({formatDate(dashboardData.membershipPlan.renewalDate)})
              </p>
            </div>

            {/* Quick Action Buttons - Big buttons for Senior Mode */}
            <div className="grid gap-6 md:grid-cols-2">
              <button
                onClick={() => router.push("/service-requests/new")}
                className="rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold shadow-xl hover:shadow-2xl py-6 text-2xl"
              >
                ⚡ Request Service
              </button>
              <button className="rounded-2xl bg-blue-600 text-white font-bold shadow-xl hover:shadow-2xl py-6 text-2xl hover:bg-blue-700">
                📅 Schedule Visit
              </button>
              <button className="rounded-2xl bg-red-600 text-white font-bold shadow-xl hover:shadow-2xl py-6 text-2xl hover:bg-red-700">
                🚨 Emergency Service
              </button>
              <button className="rounded-2xl bg-green-600 text-white font-bold shadow-xl hover:shadow-2xl py-6 text-2xl hover:bg-green-700">
                📞 Call Now
              </button>
            </div>

            {/* Need Help Section */}
            <div className="rounded-2xl bg-gray-50 border-2 border-gray-200 p-8">
              <h3 className="font-bold text-3xl text-gray-900 mb-6">Need Help?</h3>
              <div className="space-y-4">
                <p className="text-2xl text-gray-700">
                  <span className="font-bold">Call Us:</span> 1-800-GES-CLUB
                </p>
                <p className="text-2xl text-gray-700">
                  <span className="font-bold">Hours:</span> 24/7 Available
                </p>
                <p className="text-xl text-gray-600">
                  Our support team is ready to help with any electrical service needs
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-2xl bg-white border-2 border-gray-200 p-8">
              <h3 className="font-bold text-3xl text-gray-900 mb-4">Your Info</h3>
              <div className="space-y-3">
                <p className="text-xl">
                  <span className="font-bold text-gray-600">Email:</span> {dashboardData.email}
                </p>
                <p className="text-xl">
                  <span className="font-bold text-gray-600">Phone:</span> {dashboardData.phone}
                </p>
              </div>
            </div>
          </div>
        </main>

      </div>
    );
  }

  // Regular Dashboard View
  return (
    <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div
            className={`mb-8 rounded-2xl bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 p-8 ${
              seniorMode ? "p-12 mb-12" : ""
            }`}
          >
            <h2
              className={`font-bold text-gray-900 ${
                seniorMode ? "text-5xl" : "text-4xl"
              }`}
            >
              Welcome, <span className="text-yellow-600">{dashboardData.fullName}!</span>
            </h2>
            <p
              className={`mt-3 text-gray-700 ${
                seniorMode ? "text-xl" : ""
              }`}
            >
              Your GES VIP CLUB account is active and ready to use. Access premium electrical
              services with priority scheduling and member discounts.
            </p>
          </div>

          <div className={`grid gap-8 lg:grid-cols-3 ${seniorMode ? "gap-12" : ""}`}>
            {/* Left Column - Main Sections */}
            <div className={`lg:col-span-2 space-y-8 ${seniorMode ? "space-y-12" : ""}`}>
              {/* Membership Status Card */}
              <div
                className={`rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-8 shadow-lg ${
                  seniorMode ? "p-10" : ""
                }`}
              >
                <h3
                  className={`font-bold text-gray-900 mb-6 ${
                    seniorMode ? "text-3xl" : "text-2xl"
                  }`}
                >
                  Current Membership
                </h3>
                <div
                  className={`space-y-4 ${seniorMode ? "space-y-6" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-gray-600 font-semibold ${
                        seniorMode ? "text-lg" : ""
                      }`}
                    >
                      Plan:
                    </span>
                    <span
                      className={`font-bold text-yellow-600 ${
                        seniorMode ? "text-2xl" : "text-xl"
                      }`}
                    >
                      {dashboardData.membershipPlan.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-gray-600 font-semibold ${
                        seniorMode ? "text-lg" : ""
                      }`}
                    >
                      Price:
                    </span>
                    <span
                      className={`font-bold text-gray-900 ${
                        seniorMode ? "text-2xl" : "text-xl"
                      }`}
                    >
                      ${dashboardData.membershipPlan.price}/month
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-gray-600 font-semibold ${
                        seniorMode ? "text-lg" : ""
                      }`}
                    >
                      Status:
                    </span>
                    <span
                      className={`font-bold ${getStatusColor(dashboardData.membershipPlan.status)} ${
                        seniorMode ? "text-xl" : ""
                      }`}
                    >
                      {dashboardData.membershipPlan.status === "active"
                        ? "✓ Active"
                        : dashboardData.membershipPlan.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-yellow-200 pt-4">
                    <span
                      className={`text-gray-600 font-semibold ${
                        seniorMode ? "text-lg" : ""
                      }`}
                    >
                      Renewal Date:
                    </span>
                    <span
                      className={`font-bold text-gray-900 ${
                        seniorMode ? "text-xl" : ""
                      }`}
                    >
                      {formatDate(dashboardData.membershipPlan.renewalDate)} ({renewalDays} days)
                    </span>
                  </div>
                </div>
              </div>

              {/* Properties Section */}
              <div
                className={`rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg ${
                  seniorMode ? "p-10" : ""
                }`}
              >
                <h3
                  className={`font-bold text-gray-900 mb-6 ${
                    seniorMode ? "text-3xl" : "text-2xl"
                  }`}
                >
                  📍 My Properties
                </h3>
                <div
                  className={`space-y-3 ${seniorMode ? "space-y-4" : ""}`}
                >
                  {dashboardData.properties.map((property) => (
                    <div
                      key={property.id}
                      onClick={() => setSelectedProperty(property.id)}
                      className={`rounded-lg border-2 cursor-pointer transition-all p-4 ${
                        selectedProperty === property.id
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-200 hover:border-yellow-300"
                      } ${seniorMode ? "p-6" : ""}`}
                    >
                      <p
                        className={`font-semibold text-gray-900 ${
                          seniorMode ? "text-lg" : ""
                        }`}
                      >
                        {property.address}
                      </p>
                      <p
                        className={`text-gray-600 text-sm ${
                          seniorMode ? "text-base" : ""
                        }`}
                      >
                        {property.propertyType === "residential"
                          ? "Residential"
                          : "Commercial"}{" "}
                        • Added {formatDate(property.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Service Requests */}
              <div
                className={`rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg ${
                  seniorMode ? "p-10" : ""
                }`}
              >
                <h3
                  className={`font-bold text-gray-900 mb-6 ${
                    seniorMode ? "text-3xl" : "text-2xl"
                  }`}
                >
                  📋 Recent Service Requests
                </h3>
                <div
                  className={`space-y-4 ${seniorMode ? "space-y-6" : ""}`}
                >
                  {dashboardData.recentServiceRequests.length > 0 ? (
                    dashboardData.recentServiceRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`rounded-lg ${getStatusBgColor(request.status)} border-2 border-gray-200 p-4 ${
                          seniorMode ? "p-6" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p
                              className={`font-bold text-gray-900 ${
                                seniorMode ? "text-lg" : ""
                              }`}
                            >
                              {request.serviceType}: {request.description}
                            </p>
                            <p
                              className={`text-gray-600 mt-1 ${
                                seniorMode ? "text-base" : "text-sm"
                              }`}
                            >
                              Requested: {formatDate(request.requestedDate)}
                            </p>
                            {request.scheduledDate && (
                              <p
                                className={`text-gray-600 ${
                                  seniorMode ? "text-base" : "text-sm"
                                }`}
                              >
                                Scheduled: {formatDate(request.scheduledDate)}
                              </p>
                            )}
                            {request.quickbooksRefId && (
                              <p
                                className={`text-gray-600 ${
                                  seniorMode ? "text-base" : "text-sm"
                                }`}
                              >
                                Ref: {request.quickbooksRefId}
                              </p>
                            )}
                          </div>
                          <span
                            className={`ml-4 whitespace-nowrap rounded-full px-3 py-1 font-bold ${getStatusBgColor(request.status)} ${getStatusColor(request.status)} ${
                              seniorMode ? "text-lg" : "text-xs"
                            }`}
                          >
                            {formatServiceRequestStatus(request.status)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-gray-600 ${seniorMode ? "text-lg" : ""}`}>
                      No service requests yet. Ready to schedule a service?
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className={`space-y-8 ${seniorMode ? "space-y-12" : ""}`}>
              {/* Quick Actions */}
              <div
                className={`rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg ${
                  seniorMode ? "p-10" : ""
                }`}
              >
                <h3
                  className={`font-bold text-gray-900 mb-6 ${
                    seniorMode ? "text-3xl" : "text-2xl"
                  }`}
                >
                  Quick Actions
                </h3>
                <div
                  className={`space-y-3 ${seniorMode ? "space-y-4" : ""}`}
                >
                  <button
                    onClick={() => router.push("/service-requests/new")}
                    className={`w-full rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-white shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-yellow-700 transition-all ${
                      seniorMode
                        ? "py-5 text-lg"
                        : "py-3"
                    }`}
                  >
                    ⚡ Request Service
                  </button>
                  <button
                    className={`w-full rounded-lg border-2 border-blue-500 font-bold text-blue-600 hover:bg-blue-50 transition-colors ${
                      seniorMode
                        ? "py-5 text-lg"
                        : "py-3"
                    }`}
                  >
                    📅 Schedule Visit
                  </button>
                  <button
                    className={`w-full rounded-lg border-2 border-red-500 font-bold text-red-600 hover:bg-red-50 transition-colors ${
                      seniorMode
                        ? "py-5 text-lg"
                        : "py-3"
                    }`}
                  >
                    🚨 Emergency Service
                  </button>
                  <a
                    href="tel:1-800-437-2582"
                    className={`block w-full rounded-lg bg-green-600 font-bold text-white shadow-lg hover:shadow-xl hover:bg-green-700 transition-all text-center ${
                      seniorMode
                        ? "py-5 text-lg"
                        : "py-3"
                    }`}
                  >
                    📞 Call: 1-800-GES-CLUB
                  </a>
                </div>
              </div>

              {/* QuickBooks Summary */}
              <div
                className={`rounded-2xl border-2 border-green-200 bg-green-50 p-8 shadow-lg ${
                  seniorMode ? "p-10" : ""
                }`}
              >
                <h3
                  className={`font-bold text-gray-900 mb-4 ${
                    seniorMode ? "text-3xl" : "text-2xl"
                  }`}
                >
                  💰 Financial Summary
                </h3>
                <p
                  className={`text-gray-600 mb-4 ${
                    seniorMode ? "text-base" : "text-sm"
                  }`}
                >
                  Managed in QuickBooks
                </p>
                <div
                  className={`space-y-3 ${seniorMode ? "space-y-4" : ""}`}
                >
                  <div>
                    <p
                      className={`text-gray-600 font-semibold ${
                        seniorMode ? "text-lg" : ""
                      }`}
                    >
                      Pending Invoices:
                    </p>
                    <p
                      className={`font-bold text-gray-900 ${
                        seniorMode ? "text-xl" : ""
                      }`}
                    >
                      {dashboardData.quickbooksRef?.pendingInvoices || 0}
                    </p>
                  </div>
                  <div className="border-t border-green-200 pt-3">
                    <p
                      className={`text-gray-600 font-semibold ${
                        seniorMode ? "text-lg" : ""
                      }`}
                    >
                      Total Outstanding:
                    </p>
                    <p
                      className={`font-bold text-red-600 ${
                        seniorMode ? "text-2xl" : "text-xl"
                      }`}
                    >
                      ${(dashboardData.quickbooksRef?.totalOutstanding || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <p
                  className={`mt-4 text-gray-600 text-xs ${
                    seniorMode ? "text-sm" : ""
                  }`}
                >
                  For detailed invoices and payments, visit QuickBooks or call us
                </p>
              </div>

              {/* Support Card */}
              <div
                className={`rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-8 shadow-lg ${
                  seniorMode ? "p-10" : ""
                }`}
              >
                <h3
                  className={`font-bold text-gray-900 mb-4 ${
                    seniorMode ? "text-3xl" : "text-2xl"
                  }`}
                >
                  Need Help?
                </h3>
                <div
                  className={`space-y-3 ${seniorMode ? "space-y-4" : ""}`}
                >
                  <div>
                    <p
                      className={`text-gray-600 font-semibold ${
                        seniorMode ? "text-lg" : ""
                      }`}
                    >
                      24/7 Support Line
                    </p>
                    <p
                      className={`font-bold text-yellow-600 ${
                        seniorMode ? "text-2xl" : "text-xl"
                      }`}
                    >
                      1-800-GES-CLUB
                    </p>
                  </div>
                  <p
                    className={`text-gray-700 ${
                      seniorMode ? "text-base" : "text-sm"
                    }`}
                  >
                    Our support team is ready to help with any electrical service
                    questions or requests
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
