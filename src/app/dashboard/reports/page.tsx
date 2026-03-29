"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { t } from "@/lib/i18n";

interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingFees: number;
  paidFees: number;
  attendance: { present: number; absent: number; late: number; total: number };
}

interface FeeRecord {
  id: string;
  amount: number;
  type: string;
  status: string;
  student: { user: { name: string } };
}

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const { language } = useApp();

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
    fetch("/api/fees").then((r) => r.json()).then(setFees);
  }, []);

  if (!data) {
    return (
      <div>
        <Header title={t("reports", language)} />
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-32 rounded-2xl" style={{ backgroundColor: "var(--border)" }} />
            ))}
          </div>
          <div className="shimmer h-64 rounded-2xl" style={{ backgroundColor: "var(--border)" }} />
        </div>
      </div>
    );
  }

  const feeByType = fees.reduce<Record<string, { paid: number; pending: number }>>((acc, f) => {
    if (!acc[f.type]) acc[f.type] = { paid: 0, pending: 0 };
    if (f.status === "paid") acc[f.type].paid += f.amount;
    else acc[f.type].pending += f.amount;
    return acc;
  }, {});

  const attendanceRate = data.attendance.total > 0
    ? ((data.attendance.present / data.attendance.total) * 100).toFixed(1)
    : "0";
  const attendanceRateNum = parseFloat(attendanceRate);

  // Circular progress for attendance
  const progressRadius = 58;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset = progressCircumference - (attendanceRateNum / 100) * progressCircumference;

  const totalFees = data.paidFees + data.pendingFees;
  const collectionRate = totalFees > 0 ? ((data.paidFees / totalFees) * 100).toFixed(1) : "0";

  const overdueFees = fees.filter((f) => f.status === "overdue");

  return (
    <div>
      <Header title={t("reports", language)} />
      <div className="p-6 space-y-6">
        {/* Top Stats with Gradient Text */}
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            className="rounded-2xl border p-6 card-hover"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{t("attendanceOverview", language)}</p>
            <p className="text-4xl font-extrabold mt-2 gradient-text">{attendanceRate}%</p>
            <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--success)" }} />
              {data.attendance.present}/{data.attendance.total} {t("present", language)}
            </p>
          </div>
          <div
            className="rounded-2xl border p-6 card-hover"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{t("feeCollection", language)}</p>
            <p className="text-4xl font-extrabold mt-2" style={{ color: "var(--success)" }}>
              {"\u20B9"}{data.paidFees.toLocaleString()}
            </p>
            <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--success)" }} />
              {collectionRate}% {t("paid", language)}
            </p>
          </div>
          <div
            className="rounded-2xl border p-6 card-hover"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{t("pendingFees", language)}</p>
            <p className="text-4xl font-extrabold mt-2" style={{ color: "var(--danger)" }}>
              {"\u20B9"}{data.pendingFees.toLocaleString()}
            </p>
            <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--danger)" }} />
              {overdueFees.length} {t("overdue", language)}
            </p>
          </div>
        </div>

        {/* Attendance Bar Chart + Circular Progress */}
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-5" style={{ animationDelay: "0.1s" }}>
          {/* Bar Chart */}
          <div
            className="md:col-span-2 rounded-2xl border p-6"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>{t("attendanceReport", language)}</h3>
              <button
                className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}
              >
                Export Report
              </button>
            </div>
            <div className="flex items-end gap-6 h-52 justify-center px-4">
              {[
                { key: "present", value: data.attendance.present, color: "var(--success)", lightColor: "var(--success-light)" },
                { key: "absent", value: data.attendance.absent, color: "var(--danger)", lightColor: "var(--danger-light)" },
                { key: "late", value: data.attendance.late, color: "var(--warning)", lightColor: "var(--warning-light)" },
              ].map((item) => {
                const maxVal = Math.max(data.attendance.present, data.attendance.absent, data.attendance.late, 1);
                const height = (item.value / maxVal) * 100;
                return (
                  <div key={item.key} className="flex flex-col items-center gap-2 flex-1 max-w-[100px]">
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                    <div
                      className="w-full rounded-xl transition-all relative overflow-hidden"
                      style={{
                        height: `${Math.max(height, 8)}%`,
                        backgroundColor: item.color,
                        minHeight: "16px",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: `linear-gradient(to top, transparent, rgba(255,255,255,0.4))`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {t(item.key, language)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Circular Progress Card */}
          <div
            className="rounded-2xl border p-6 flex flex-col items-center justify-center"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-sm font-medium mb-4" style={{ color: "var(--text-muted)" }}>Attendance Rate</p>
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
                <circle
                  cx="64" cy="64" r={progressRadius}
                  fill="none" strokeWidth="10"
                  style={{ stroke: "var(--bg-secondary)" }}
                />
                <circle
                  cx="64" cy="64" r={progressRadius}
                  fill="none" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={progressCircumference}
                  strokeDashoffset={progressOffset}
                  style={{
                    stroke: attendanceRateNum >= 75 ? "var(--success)" : attendanceRateNum >= 50 ? "var(--warning)" : "var(--danger)",
                    transition: "stroke-dashoffset 0.8s ease",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold" style={{ color: "var(--text)" }}>{attendanceRate}%</span>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--success)" }} /> {t("present", language)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--danger)" }} /> {t("absent", language)}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Breakdown with Progress Bars */}
        <div
          className="animate-fade-in rounded-2xl border p-6"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)", animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>
              {t("feeCollection", language)} - {t("type", language)}
            </h3>
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "var(--primary-50)", color: "var(--primary)" }}>
              {Object.keys(feeByType).length} categories
            </span>
          </div>
          <div className="space-y-5">
            {Object.entries(feeByType).map(([type, amounts]) => {
              const total = amounts.paid + amounts.pending;
              const paidPercent = total > 0 ? (amounts.paid / total) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold capitalize" style={{ color: "var(--text)" }}>{t(type, language)}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      {"\u20B9"}{amounts.paid.toLocaleString()} / {"\u20B9"}{total.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${paidPercent}%`,
                        background: "var(--gradient)",
                        minWidth: paidPercent > 0 ? "8px" : "0",
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {paidPercent.toFixed(0)}% collected
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue Fees List */}
        <div
          className="animate-fade-in rounded-2xl border p-6"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)", animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>
              {t("overdue", language)} {t("fees", language)}
            </h3>
            {overdueFees.length > 0 && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: "var(--danger-light)", color: "var(--danger)" }}
              >
                {overdueFees.length} pending
              </span>
            )}
          </div>
          <div className="space-y-3">
            {overdueFees.length === 0 ? (
              <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="text-sm">{t("noData", language)}</p>
                <p className="text-xs mt-1">All fees are up to date</p>
              </div>
            ) : (
              overdueFees.map((f, i) => (
                <div
                  key={f.id}
                  className="animate-fade-in flex items-center justify-between p-4 rounded-xl border transition-colors card-hover"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                    animationDelay: `${0.3 + i * 0.05}s`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: "var(--danger-light)", color: "var(--danger)" }}
                    >
                      {f.student.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-sm block" style={{ color: "var(--text)" }}>{f.student.user.name}</span>
                      <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{t(f.type, language)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-base" style={{ color: "var(--danger)" }}>
                    {"\u20B9"}{f.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
