"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import { useApp } from "../../../components/Providers";
import { t } from "@/lib/i18n";

interface ScoreData {
  subjects: {
    name: string;
    averageScore: number;
    total: number;
    grade: string;
  }[];
  exams: {
    id: string;
    examName: string;
    type: string;
    subject: string;
    marks: number;
    total: number;
    percentage: number;
    grade: string;
    rank: number;
  }[];
}

export default function StudentScoresPage() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useApp();

  useEffect(() => {
    fetch("/api/student/scores")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const gradeColor = (grade: string) => {
    if (grade === "A+" || grade === "A") return "var(--success)";
    if (grade === "B+" || grade === "B") return "var(--warning)";
    if (grade === "C" || grade === "D") return "var(--orange, #f97316)";
    return "var(--danger)";
  };

  const gradeBg = (grade: string) => {
    if (grade === "A+" || grade === "A") return "rgba(34,197,94,0.1)";
    if (grade === "B+" || grade === "B") return "rgba(234,179,8,0.1)";
    if (grade === "C" || grade === "D") return "rgba(249,115,22,0.1)";
    return "rgba(239,68,68,0.1)";
  };

  const typeBadge = (type: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      unit: { bg: "rgba(59,130,246,0.1)", color: "var(--primary)" },
      midterm: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6" },
      final: { bg: "rgba(236,72,153,0.1)", color: "#ec4899" },
    };
    return map[type.toLowerCase()] || { bg: "rgba(107,114,128,0.1)", color: "var(--text-muted)" };
  };

  if (loading) {
    return (
      <div>
        <Header title="My Score Sheet" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 shimmer rounded-2xl" />
            ))}
          </div>
          <div className="h-64 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="My Score Sheet" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Subject Cards */}
        {data?.subjects && data.subjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.subjects.map((subject) => {
              const pct = Math.round((subject.averageScore / subject.total) * 100);
              return (
                <div
                  key={subject.name}
                  className="rounded-2xl p-5 border card-hover"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {subject.name}
                    </h3>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: gradeBg(subject.grade), color: gradeColor(subject.grade) }}
                    >
                      {subject.grade}
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: gradeColor(subject.grade) }}>
                    {pct}%
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Average: {subject.averageScore}/{subject.total}
                  </p>
                  <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: gradeColor(subject.grade),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Exam Table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              All Exam Results
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                  {["Exam Name", "Type", "Subject", "Marks/Total", "Percentage", "Grade", "Rank"].map((h) => (
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
                {data?.exams && data.exams.length > 0 ? (
                  data.exams.map((exam) => {
                    const pct = Math.round((exam.marks / exam.total) * 100);
                    const badge = typeBadge(exam.type);
                    return (
                      <tr
                        key={exam.id}
                        className="border-t transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td className="py-3.5 px-5 font-medium" style={{ color: "var(--text)" }}>
                          {exam.examName}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            {exam.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                          {exam.subject}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[120px]">
                              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%`, backgroundColor: gradeColor(exam.grade) }}
                                />
                              </div>
                            </div>
                            <span className="font-medium whitespace-nowrap" style={{ color: "var(--text)" }}>
                              {exam.marks}<span style={{ color: "var(--text-muted)" }}>/{exam.total}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-semibold" style={{ color: gradeColor(exam.grade) }}>
                          {pct}%
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: gradeBg(exam.grade), color: gradeColor(exam.grade) }}
                          >
                            {exam.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-semibold" style={{ color: "var(--primary)" }}>
                            #{exam.rank}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12" style={{ color: "var(--text-muted)" }}>
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
