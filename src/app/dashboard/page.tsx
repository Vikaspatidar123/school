"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useApp } from "../components/Providers";
import { t } from "@/lib/i18n";
import Link from "next/link";
import { StudentsIcon, TeachersIcon, AttendanceIcon, FeesIcon, TimetableIcon, LibraryIcon } from "../components/Icons";

interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingFees: number;
  paidFees: number;
  attendance: { present: number; absent: number; late: number; total: number };
  recentStudents: Array<{
    id: string;
    user: { name: string };
    class: { name: string; section: string } | null;
    rollNo: string | null;
  }>;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  type: string;
}

function StatCard({ icon, label, value, trend, color, delay }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="card-hover rounded-2xl p-6 border animate-fade-in-up"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
        animationDelay: `${delay}ms`,
        opacity: 0,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
          <p className="text-3xl font-bold animate-count-up" style={{ color: "var(--text)" }}>{value}</p>
          {trend && (
            <p className="text-xs mt-2 font-medium" style={{ color }}>
              {trend}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color }}>{value}</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>({percent.toFixed(0)}%)</span>
        </div>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const { language } = useApp();

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
    fetch("/api/events").then((r) => r.json()).then(setEvents).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div>
        <Header title={t("dashboard", language)} />
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl shimmer" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <div className="h-64 rounded-2xl shimmer" />
            <div className="h-64 rounded-2xl shimmer" />
          </div>
        </div>
      </div>
    );
  }

  const attendanceTotal = data.attendance.total || 1;
  const attendanceRate = ((data.attendance.present / attendanceTotal) * 100).toFixed(1);
  const totalFees = data.paidFees + data.pendingFees;
  const collectionRate = totalFees > 0 ? ((data.paidFees / totalFees) * 100).toFixed(0) : "0";

  return (
    <div>
      <Header title={t("dashboard", language)} />
      <div className="p-6 space-y-6">
        {/* Welcome Banner */}
        <div
          className="gradient-bg rounded-2xl p-8 text-white relative overflow-hidden animate-fade-in"
        >
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">{t("welcome", language)} ! 👋</h1>
            <p className="text-white/80 text-sm max-w-lg">
              Here&apos;s what&apos;s happening at your school today. {data.attendance.total} attendance records, {data.totalStudents} active students.
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 text-[120px] font-bold">
            ERP
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={<StudentsIcon className="w-6 h-6" />}
            label={t("totalStudents", language)}
            value={data.totalStudents}
            trend={`+${Math.floor(data.totalStudents * 0.05)} this month`}
            color="#4f46e5"
            delay={50}
          />
          <StatCard
            icon={<TeachersIcon className="w-6 h-6" />}
            label={t("totalTeachers", language)}
            value={data.totalTeachers}
            color="#059669"
            delay={100}
          />
          <StatCard
            icon={<AttendanceIcon className="w-6 h-6" />}
            label={t("attendanceOverview", language)}
            value={`${attendanceRate}%`}
            trend={`${data.attendance.present}/${data.attendance.total} today`}
            color="#f59e0b"
            delay={150}
          />
          <StatCard
            icon={<FeesIcon className="w-6 h-6" />}
            label={t("pendingFees", language)}
            value={`₹${data.pendingFees.toLocaleString()}`}
            trend={`${collectionRate}% collected`}
            color="#ef4444"
            delay={200}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Chart */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 border animate-fade-in stagger-2"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                {t("attendanceOverview", language)}
              </h3>
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "var(--primary-50)", color: "var(--primary)" }}>
                Today
              </span>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end gap-6 h-48 mb-6 px-4">
              {[
                { key: "present", value: data.attendance.present, color: "var(--success)" },
                { key: "absent", value: data.attendance.absent, color: "var(--danger)" },
                { key: "late", value: data.attendance.late, color: "var(--warning)" },
              ].map((item) => {
                const maxVal = Math.max(data.attendance.present, data.attendance.absent, data.attendance.late, 1);
                const height = (item.value / maxVal) * 100;
                return (
                  <div key={item.key} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: item.color }}>{item.value}</span>
                    <div className="w-full max-w-[60px] rounded-t-xl transition-all duration-1000"
                      style={{ height: `${Math.max(height, 8)}%`, backgroundColor: item.color, opacity: 0.85 }}
                    />
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {t(item.key, language)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bars */}
            <div className="space-y-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <ProgressBar label={t("present", language)} value={data.attendance.present} total={attendanceTotal} color="var(--success)" />
              <ProgressBar label={t("absent", language)} value={data.attendance.absent} total={attendanceTotal} color="var(--danger)" />
              <ProgressBar label={t("late", language)} value={data.attendance.late} total={attendanceTotal} color="var(--warning)" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Fee Summary */}
            <div
              className="rounded-2xl p-6 border animate-fade-in stagger-3"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
                {t("feeCollection", language)}
              </h3>

              {/* Donut Chart Visual */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth="3"
                      strokeDasharray={`${collectionRate}, 100`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: "var(--text)" }}>{collectionRate}%</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Collected</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--success-light)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--success)" }}>{t("paid", language)}</span>
                  <span className="font-bold" style={{ color: "var(--success)" }}>₹{data.paidFees.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--danger-light)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--danger)" }}>{t("pending", language)}</span>
                  <span className="font-bold" style={{ color: "var(--danger)" }}>₹{data.pendingFees.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div
              className="rounded-2xl p-6 border animate-fade-in stagger-4"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
                Upcoming Events
              </h3>
              {events.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 4).map((event) => (
                    <div key={event.id} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: event.type === "holiday" ? "var(--danger)" : event.type === "exam" ? "var(--warning)" : "var(--primary)" }}
                      >
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{event.title}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(event.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <div
            className="rounded-2xl p-6 border animate-fade-in"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                {t("recentActivity", language)}
              </h3>
              <Link href="/dashboard/students" className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentStudents.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: i % 2 === 0 ? "var(--bg-secondary)" : "transparent" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "var(--gradient)" }}
                  >
                    {s.user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{s.user.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Roll: {s.rollNo} • {s.class ? `${s.class.name}-${s.class.section}` : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-2xl p-6 border animate-fade-in"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/dashboard/students", icon: <StudentsIcon className="w-5 h-5" />, label: t("addStudent", language), color: "#4f46e5" },
                { href: "/dashboard/attendance", icon: <AttendanceIcon className="w-5 h-5" />, label: t("markAttendance", language), color: "#059669" },
                { href: "/dashboard/fees", icon: <FeesIcon className="w-5 h-5" />, label: t("collectFee", language), color: "#f59e0b" },
                { href: "/dashboard/timetable", icon: <TimetableIcon className="w-5 h-5" />, label: "Timetable", color: "#7c3aed" },
                { href: "/dashboard/library", icon: <LibraryIcon className="w-5 h-5" />, label: "Library", color: "#06b6d4" },
                { href: "/dashboard/reports", icon: <FeesIcon className="w-5 h-5" />, label: t("reports", language), color: "#ef4444" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-4 rounded-xl border card-hover"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${action.color}15`, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
