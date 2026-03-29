"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import { useApp } from "../../../components/Providers";
import { t } from "@/lib/i18n";
import { useSession } from "next-auth/react";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  className: string;
  section: string;
  averageScore: number;
  totalExams: number;
  studentId: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useApp();
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/student/leaderboard")
      .then((r) => r.json())
      .then((d) => { setEntries(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const currentUserId = (session?.user as { id?: string })?.id;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);

  const medalColors = [
    { bg: "linear-gradient(135deg, #FFD700, #FFA500)", shadow: "rgba(255,215,0,0.4)", label: "1st" },
    { bg: "linear-gradient(135deg, #C0C0C0, #A0A0A0)", shadow: "rgba(192,192,192,0.4)", label: "2nd" },
    { bg: "linear-gradient(135deg, #CD7F32, #A0522D)", shadow: "rgba(205,127,50,0.4)", label: "3rd" },
  ];

  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div>
        <Header title="Leaderboard" />
        <div className="p-6 space-y-6">
          <div className="flex justify-center gap-6 items-end">
            <div className="h-48 w-36 shimmer rounded-2xl" />
            <div className="h-56 w-40 shimmer rounded-2xl" />
            <div className="h-44 w-36 shimmer rounded-2xl" />
          </div>
          <div className="h-64 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Leaderboard" />
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex justify-center items-end gap-4 pt-8">
            {/* Reorder: 2nd, 1st, 3rd */}
            {[top3[1], top3[0], top3[2]].map((entry, displayIdx) => {
              if (!entry) return <div key={displayIdx} className="w-36" />;
              const actualRank = entry.rank - 1;
              const medal = medalColors[actualRank] || medalColors[2];
              const isFirst = entry.rank === 1;
              const isCurrentUser = entry.studentId === currentUserId;

              return (
                <div
                  key={entry.id}
                  className="flex flex-col items-center"
                  style={{ marginBottom: isFirst ? 0 : undefined }}
                >
                  {/* Avatar */}
                  <div className="relative mb-3">
                    <div
                      className="rounded-full flex items-center justify-center font-bold text-white"
                      style={{
                        width: isFirst ? 80 : 64,
                        height: isFirst ? 80 : 64,
                        fontSize: isFirst ? 24 : 18,
                        background: medal.bg,
                        boxShadow: `0 8px 24px ${medal.shadow}`,
                        border: isCurrentUser ? "3px solid var(--primary)" : "3px solid white",
                      }}
                    >
                      {getInitials(entry.name)}
                    </div>
                    <div
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: medal.bg, boxShadow: `0 2px 8px ${medal.shadow}` }}
                    >
                      {entry.rank}
                    </div>
                  </div>

                  {/* Podium Block */}
                  <div
                    className="rounded-2xl p-4 text-center border"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: isCurrentUser ? "var(--primary)" : "var(--border)",
                      boxShadow: isFirst ? "0 8px 32px rgba(0,0,0,0.1)" : "var(--shadow-sm)",
                      width: isFirst ? 160 : 144,
                      minHeight: isFirst ? 160 : 130,
                    }}
                  >
                    <h3
                      className="font-bold text-sm truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {entry.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {entry.className}-{entry.section}
                    </p>
                    <div
                      className="mt-3 py-2 px-3 rounded-xl"
                      style={{ background: medal.bg }}
                    >
                      <p className="text-white text-lg font-bold">
                        {entry.averageScore}%
                      </p>
                    </div>
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                      {entry.totalExams} exams
                    </p>
                    {isCurrentUser && (
                      <span
                        className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: "var(--primary-50, rgba(59,130,246,0.1))", color: "var(--primary)" }}
                      >
                        You
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table for positions 4-10 */}
        {rest.length > 0 && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                    {["Rank", "Student", "Class", "Avg Score", "Total Exams"].map((h) => (
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
                  {rest.map((entry) => {
                    const isCurrentUser = entry.studentId === currentUserId;
                    return (
                      <tr
                        key={entry.id}
                        className="border-t transition-colors"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: isCurrentUser ? "var(--primary-50, rgba(59,130,246,0.06))" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrentUser) e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrentUser) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-base" style={{ color: "var(--text)" }}>
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                              style={{ background: "var(--gradient)" }}
                            >
                              {getInitials(entry.name)}
                            </div>
                            <div>
                              <span className="font-medium block" style={{ color: "var(--text)" }}>
                                {entry.name}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                                  (You)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ backgroundColor: "var(--primary-50, rgba(59,130,246,0.1))", color: "var(--primary)" }}
                          >
                            {entry.className}-{entry.section}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[80px] h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${entry.averageScore}%`,
                                  backgroundColor:
                                    entry.averageScore >= 80 ? "var(--success)" :
                                    entry.averageScore >= 60 ? "var(--warning)" : "var(--danger)",
                                }}
                              />
                            </div>
                            <span className="font-bold text-sm" style={{ color: "var(--text)" }}>
                              {entry.averageScore}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                          {entry.totalExams}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <p className="text-4xl mb-3">🏆</p>
            <p>No leaderboard data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
