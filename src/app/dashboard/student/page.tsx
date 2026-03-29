"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { t } from "@/lib/i18n";
import { useSession } from "next-auth/react";

interface DashboardData {
  student: {
    name: string;
    className: string;
    section: string;
    rollNo: string;
  };
  stats: {
    attendanceRate: number;
    averageScore: number;
    pendingFees: number;
    booksIssued: number;
  };
  subjectScores: { subject: string; score: number; total: number }[];
  recentResults: {
    id: string;
    subject: string;
    examName: string;
    marks: number;
    total: number;
    grade: string;
    rank: number;
  }[];
}

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  description: string;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useApp();
  const { data: session } = useSession();

  useEffect(() => {
    Promise.all([
      fetch("/api/student/dashboard").then((r) => r.json()),
      fetch("/api/events").then((r) => r.json()),
    ]).then(([dashData, eventsData]) => {
      setData(dashData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const gradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "var(--success)";
    if (grade.startsWith("B")) return "var(--warning)";
    if (grade.startsWith("C") || grade.startsWith("D")) return "var(--orange, #f97316)";
    return "var(--danger)";
  };

  if (loading) {
    return (
      <div>
        <Header title={t("dashboard", language)} />
        <div className="p-6 space-y-6">
          <div className="h-32 shimmer rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 shimmer rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 shimmer rounded-2xl" />
            <div className="h-64 shimmer rounded-2xl" />
          </div>
          <div className="h-48 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  const studentName = data?.student?.name || session?.user?.name || "Student";
  const className = data?.student?.className || "";
  const section = data?.student?.section || "";
  const rollNo = data?.student?.rollNo || "";

  const stats = [
    { label: t("attendance", language) + " Rate", value: `${data?.stats?.attendanceRate ?? 0}%`, icon: "📊", color: "var(--primary)", bg: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))" },
    { label: "Average Score", value: `${data?.stats?.averageScore ?? 0}%`, icon: "🎯", color: "var(--success)", bg: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))" },
    { label: t("pendingFees", language), value: `₹${(data?.stats?.pendingFees ?? 0).toLocaleString()}`, icon: "💰", color: "var(--warning)", bg: "linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.05))" },
    { label: "Books Issued", value: data?.stats?.booksIssued ?? 0, icon: "📚", color: "var(--info, #6366f1)", bg: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.05))" },
  ];

  const maxScore = Math.max(...(data?.subjectScores?.map((s) => s.total) || [100]));

  return (
    <div>
      <Header title={t("dashboard", language)} />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Welcome Banner */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "var(--gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%))",
            boxShadow: "0 10px 40px rgba(102,126,234,0.3)",
          }}
        >
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white mb-1">
              {t("welcome", language)}, {studentName}! 👋
            </h1>
            <p className="text-white/80 text-sm">
              {className && section ? `${className} - ${section}` : ""}
              {rollNo ? ` | Roll No: ${rollNo}` : ""}
            </p>
            <p className="text-white/60 text-xs mt-2">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", transform: "translate(30%, -30%)" }}
          />
          <div
            className="absolute bottom-0 right-20 w-32 h-32 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", transform: "translate(0, 30%)" }}
          />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 border card-hover"
              style={{
                background: stat.bg,
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-card)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--text)" }}>
              Subject Performance
            </h2>
            {data?.subjectScores && data.subjectScores.length > 0 ? (
              <div className="space-y-4">
                {data.subjectScores.map((subject, idx) => {
                  const pct = Math.round((subject.score / subject.total) * 100);
                  const barColors = [
                    "var(--primary)",
                    "var(--success)",
                    "var(--warning)",
                    "var(--info, #6366f1)",
                    "var(--danger)",
                    "#8b5cf6",
                    "#ec4899",
                    "#14b8a6",
                  ];
                  const barColor = barColors[idx % barColors.length];
                  return (
                    <div key={subject.subject}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                          {subject.subject}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: barColor }}>
                          {subject.score}/{subject.total} ({pct}%)
                        </span>
                      </div>
                      <div
                        className="h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--bg-secondary)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                No performance data available
              </p>
            )}
          </div>

          {/* Upcoming Events */}
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
              Upcoming Events
            </h2>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl border transition-colors"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "var(--gradient)" }}
                      >
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                          {event.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        {event.type && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: "var(--primary-50, rgba(59,130,246,0.1))", color: "var(--primary)" }}
                          >
                            {event.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
                No upcoming events
              </p>
            )}
          </div>
        </div>

        {/* Recent Results Table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              Recent Results
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                  {["Exam", "Subject", "Marks", "Percentage", "Grade", "Rank"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.recentResults && data.recentResults.length > 0 ? (
                  data.recentResults.slice(0, 5).map((result) => (
                    <tr
                      key={result.id}
                      className="border-t transition-colors"
                      style={{ borderColor: "var(--border)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="py-3.5 px-5 font-medium" style={{ color: "var(--text)" }}>
                        {result.examName}
                      </td>
                      <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                        {result.subject}
                      </td>
                      <td className="py-3.5 px-5" style={{ color: "var(--text)" }}>
                        <span className="font-semibold">{result.marks}</span>
                        <span style={{ color: "var(--text-muted)" }}>/{result.total}</span>
                      </td>
                      <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                        {Math.round((result.marks / result.total) * 100)}%
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `${gradeColor(result.grade)}15`,
                            color: gradeColor(result.grade),
                          }}
                        >
                          {result.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold" style={{ color: "var(--primary)" }}>
                          #{result.rank}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                      {t("noData", language)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
