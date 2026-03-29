"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import { useApp } from "../../../components/Providers";
import { t } from "@/lib/i18n";
import Link from "next/link";

interface PracticeTest {
  id: string;
  title: string;
  subject: string;
  questionCount: number;
  duration: number;
  totalMarks: number;
  attempted: boolean;
  score: number | null;
  totalScore: number | null;
}

export default function PracticeTestsPage() {
  const [tests, setTests] = useState<PracticeTest[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useApp();

  useEffect(() => {
    fetch("/api/student/practice-tests")
      .then((r) => r.json())
      .then((d) => { setTests(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const subjectColors: Record<string, { bg: string; color: string }> = {
    Mathematics: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
    Science: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
    English: { bg: "rgba(168,85,247,0.1)", color: "#a855f7" },
    Hindi: { bg: "rgba(249,115,22,0.1)", color: "#f97316" },
    History: { bg: "rgba(236,72,153,0.1)", color: "#ec4899" },
    Geography: { bg: "rgba(20,184,166,0.1)", color: "#14b8a6" },
    Physics: { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
    Chemistry: { bg: "rgba(234,179,8,0.1)", color: "#eab308" },
    Biology: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  };

  const getSubjectStyle = (subject: string) => {
    return subjectColors[subject] || { bg: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  if (loading) {
    return (
      <div>
        <Header title="Practice Tests" />
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 shimmer rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Practice Tests" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Tests", value: tests.length, color: "var(--primary)" },
            { label: "Completed", value: tests.filter((t) => t.attempted).length, color: "var(--success)" },
            { label: "Pending", value: tests.filter((t) => !t.attempted).length, color: "var(--warning)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 border card-hover"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((test) => {
            const style = getSubjectStyle(test.subject);
            return (
              <div
                key={test.id}
                className="rounded-2xl border overflow-hidden card-hover"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="p-5">
                  {/* Subject Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-3 py-1 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: style.bg, color: style.color }}
                    >
                      {test.subject}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: test.attempted ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)",
                        color: test.attempted ? "var(--success)" : "var(--warning)",
                      }}
                    >
                      {test.attempted ? "Completed" : "Not Attempted"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>
                    {test.title}
                  </h3>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Questions</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text)" }}>{test.questionCount}</p>
                    </div>
                    <div className="text-center p-2 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Duration</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text)" }}>{test.duration}m</p>
                    </div>
                    <div className="text-center p-2 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Marks</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text)" }}>{test.totalMarks}</p>
                    </div>
                  </div>

                  {/* Score (if attempted) */}
                  {test.attempted && test.score !== null && test.totalScore !== null && (
                    <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Your Score</span>
                        <span className="text-lg font-bold" style={{ color: "var(--success)" }}>
                          {test.score}/{test.totalScore}
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round((test.score / test.totalScore) * 100)}%`,
                            backgroundColor: "var(--success)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href={`/dashboard/student/practice-tests/${test.id}`}>
                    <button
                      className="w-full py-2.5 rounded-xl text-sm font-medium transition-transform active:scale-95"
                      style={
                        test.attempted
                          ? { backgroundColor: "var(--bg-secondary)", color: "var(--text)", border: "1px solid var(--border)" }
                          : { background: "var(--gradient)", color: "white" }
                      }
                    >
                      {test.attempted ? "View Score" : "Start Test"}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {tests.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <p className="text-4xl mb-3">📝</p>
            <p>No practice tests available</p>
          </div>
        )}
      </div>
    </div>
  );
}
