"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { useAuth } from "@/app/auth/context";
import { usePreferences } from "@/app/preferences/context";
import {
  listServiceRequests,
  ServiceRequestRecord,
  ServiceRequestStatus,
} from "@/lib/service-requests";

const statusOrder: ServiceRequestStatus[] = [
  "submitted",
  "under-review",
  "scheduled",
  "in-progress",
  "completed",
];

const statusClass: Record<ServiceRequestStatus, string> = {
  submitted: "bg-amber-100 text-amber-900",
  "under-review": "bg-cyan-100 text-cyan-900",
  scheduled: "bg-blue-100 text-blue-900",
  "in-progress": "bg-purple-100 text-purple-900",
  completed: "bg-green-100 text-green-900",
};

const statusDotClass: Record<ServiceRequestStatus, string> = {
  submitted: "bg-amber-500",
  "under-review": "bg-cyan-600",
  scheduled: "bg-blue-600",
  "in-progress": "bg-purple-600",
  completed: "bg-green-600",
};

export default function ServiceRequestsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { seniorMode, preferencesLoading, t } = usePreferences();
  const [requests, setRequests] = useState<ServiceRequestRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;

    const loadRequests = async () => {
      setPageLoading(true);
      setErrorMessage("");
      try {
        const loaded = await listServiceRequests(user.id);
        setRequests(loaded);
      } catch {
        setErrorMessage(t("serviceRequests.errorLoading"));
      } finally {
        setPageLoading(false);
      }
    };

    loadRequests();
  }, [t, user]);

  if (loading || preferencesLoading || pageLoading) {
    return (
      <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
        <Header />
        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className={`text-gray-600 ${seniorMode ? "text-xl" : ""}`}>
              {t("serviceRequests.loading")}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const formatPreferredWindow = (date: string, time: string) => {
    if (!date && !time) return t("properties.notProvided");
    const dateLabel = date ? new Date(`${date}T00:00:00`).toLocaleDateString() : "";
    return [dateLabel, time].filter(Boolean).join(" ");
  };

  const requestDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const renderStatusTracker = (status: ServiceRequestStatus) => {
    const currentStep = statusOrder.indexOf(status);

    return (
      <ol className="mt-5 grid gap-2 sm:grid-cols-5">
        {statusOrder.map((step, index) => {
          const active = index <= currentStep;
          return (
            <li
              key={step}
              className={`rounded-lg border-2 px-3 py-2 font-bold ${
                active
                  ? "border-yellow-500 bg-yellow-50 text-yellow-950"
                  : "border-gray-200 bg-gray-50 text-gray-600"
              } ${seniorMode ? "text-base" : "text-xs"}`}
            >
              {t(`serviceRequests.status.${step}`)}
            </li>
          );
        })}
      </ol>
    );
  };

  return (
    <div className={`min-h-screen ${seniorMode ? "text-lg" : ""} bg-white flex flex-col`}>
      <Header />
      <main className={`flex-1 px-4 sm:px-6 lg:px-8 ${seniorMode ? "py-16" : "py-12"}`}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className={`font-bold text-gray-900 ${seniorMode ? "text-5xl" : "text-4xl"}`}>
                {t("serviceRequests.title")}
              </h2>
              <p className={`mt-3 text-gray-600 ${seniorMode ? "text-xl" : "text-lg"}`}>
                {t("serviceRequests.subtitle")}
              </p>
            </div>
            <Link
              href="/service-requests/new"
              className={`rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-center font-bold text-white shadow-lg hover:from-yellow-600 hover:to-yellow-700 ${
                seniorMode ? "px-8 py-4 text-xl" : "px-6 py-3"
              }`}
            >
              {t("serviceRequests.requestService")}
            </Link>
          </div>

          {errorMessage && (
            <div className={`mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 font-semibold text-red-900 ${seniorMode ? "p-6 text-lg" : ""}`}>
              {errorMessage}
            </div>
          )}

          {requests.length === 0 && !errorMessage ? (
            <section className={`rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center ${seniorMode ? "p-12" : "p-8"}`}>
              <h3 className={`font-bold text-gray-900 ${seniorMode ? "text-3xl" : "text-2xl"}`}>
                {t("serviceRequests.emptyTitle")}
              </h3>
              <p className={`mx-auto mt-3 max-w-2xl text-gray-600 ${seniorMode ? "text-xl" : ""}`}>
                {t("serviceRequests.emptyDescription")}
              </p>
            </section>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className={`rounded-lg border-2 border-gray-200 bg-white shadow-sm ${seniorMode ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <span className={`inline-flex rounded-full px-3 py-1 font-bold ${statusClass[request.status]} ${seniorMode ? "text-base" : "text-xs"}`}>
                        {t(`serviceRequests.status.${request.status}`)}
                      </span>
                      <h3 className={`mt-3 font-bold text-gray-900 ${seniorMode ? "text-3xl" : "text-2xl"}`}>
                        {t(`serviceRequests.type.${request.serviceType}`)}
                      </h3>
                      <p className={`mt-1 break-words text-gray-800 ${seniorMode ? "text-lg" : ""}`}>
                        {request.propertyName || request.propertyAddress}
                      </p>
                    </div>
                    <div className={`font-semibold text-gray-600 ${seniorMode ? "text-lg" : "text-sm"}`}>
                      {requestDate(request.createdAt)}
                    </div>
                  </div>

                  {renderStatusTracker(request.status)}

                  <dl className={`mt-5 grid gap-3 text-gray-800 sm:grid-cols-2 lg:grid-cols-4 ${seniorMode ? "text-lg" : "text-sm"}`}>
                    <div>
                      <dt className="font-bold text-gray-950">{t("serviceRequests.field.priority")}</dt>
                      <dd>{t(`serviceRequests.priority.${request.priority}`)}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-950">{t("serviceRequests.field.preferredWindow")}</dt>
                      <dd>{formatPreferredWindow(request.preferredDate, request.preferredTime)}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-950">{t("serviceRequests.field.contactName")}</dt>
                      <dd>{request.contactName || t("properties.notProvided")}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-950">{t("serviceRequests.field.contactPhone")}</dt>
                      <dd>{request.contactPhone || t("properties.notProvided")}</dd>
                    </div>
                  </dl>

                  <p className={`mt-4 whitespace-pre-wrap text-gray-700 ${seniorMode ? "text-lg" : ""}`}>
                    {request.description}
                  </p>

                  {request.aiEstimateStatus !== "not-requested" && (
                    <div className={`mt-5 rounded-lg border-2 border-cyan-200 bg-cyan-50 p-4 text-cyan-950 ${seniorMode ? "text-lg" : "text-sm"}`}>
                      <p className="font-bold">{t("serviceRequests.aiEstimate")}</p>
                      <p className="mt-1">{request.aiEstimateSummary || t(`serviceRequests.aiStatus.${request.aiEstimateStatus}`)}</p>
                    </div>
                  )}

                  {request.photoUrls.length > 0 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {request.photoUrls.map((url) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          key={url}
                          src={url}
                          alt={t("serviceRequests.photo")}
                          className="h-32 w-full rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-6 border-t border-gray-200 pt-5">
                    <h4 className={`font-bold text-gray-900 ${seniorMode ? "text-xl" : ""}`}>
                      {t("serviceRequests.timeline")}
                    </h4>
                    <ol className="mt-3 space-y-3">
                      {request.timeline.map((item, index) => (
                        <li key={`${request.id}-${item.status}-${item.createdAt}-${index}`} className="flex gap-3">
                          <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${statusDotClass[item.status]}`} />
                          <div>
                            <p className={`font-bold text-gray-950 ${seniorMode ? "text-lg" : "text-sm"}`}>
                              {t(`serviceRequests.status.${item.status}`)}
                            </p>
                            <p className={`text-gray-700 ${seniorMode ? "text-base" : "text-sm"}`}>
                              {item.note}
                            </p>
                            <p className={`text-gray-600 ${seniorMode ? "text-base" : "text-xs"}`}>
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
