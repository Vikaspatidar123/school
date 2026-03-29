"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { SearchIcon, PlusIcon } from "../../components/Icons";
import { t } from "@/lib/i18n";

interface AttendanceRecord {
  id: string;
  status: string;
  student: {
    id: string;
    rollNo: string | null;
    user: { name: string };
    class: { name: string; section: string } | null;
  };
}

interface StudentItem {
  id: string;
  rollNo: string | null;
  user: { name: string };
  class: { name: string; section: string } | null;
}

interface ClassItem {
  id: string;
  name: string;
  section: string;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterClass, setFilterClass] = useState("");
  const [markMode, setMarkMode] = useState(false);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const { language } = useApp();

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ date });
    if (filterClass) params.set("classId", filterClass);
    fetch(`/api/attendance?${params}`)
      .then((r) => r.json())
      .then(setAttendance);
  }, [date, filterClass]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterClass) params.set("classId", filterClass);
    fetch(`/api/students?${params}`)
      .then((r) => r.json())
      .then(setStudents);
  }, [filterClass]);

  const startMarking = () => {
    const initial: Record<string, string> = {};
    students.forEach((s) => {
      const existing = attendance.find((a) => a.student.id === s.id);
      initial[s.id] = existing?.status || "present";
    });
    setRecords(initial);
    setMarkMode(true);
  };

  const saveAttendance = async () => {
    setSaving(true);
    const attendanceRecords = Object.entries(records).map(([studentId, status]) => ({
      studentId,
      date,
      status,
    }));

    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records: attendanceRecords }),
    });

    setSaving(false);
    setMarkMode(false);

    // Refresh
    const params = new URLSearchParams({ date });
    if (filterClass) params.set("classId", filterClass);
    const res = await fetch(`/api/attendance?${params}`);
    setAttendance(await res.json());
  };

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const totalCount = attendance.length;

  const filteredStudents = students.filter((s) =>
    s.user.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAttendance = attendance.filter((a) =>
    a.student.user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header title={t("attendance", language)} />
      <div className="p-6">
        {/* Gradient Stat Cards */}
        <div className="animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, var(--success), #16a34a)" }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ background: "white", transform: "translate(30%, -30%)" }} />
            <p className="text-sm font-medium opacity-90">{t("present", language)}</p>
            <p className="text-3xl font-bold mt-1">{presentCount}</p>
            <p className="text-xs mt-1 opacity-75">
              {totalCount > 0 ? `${((presentCount / totalCount) * 100).toFixed(0)}%` : "0%"} of total
            </p>
          </div>
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, var(--danger), #dc2626)" }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ background: "white", transform: "translate(30%, -30%)" }} />
            <p className="text-sm font-medium opacity-90">{t("absent", language)}</p>
            <p className="text-3xl font-bold mt-1">{absentCount}</p>
            <p className="text-xs mt-1 opacity-75">
              {totalCount > 0 ? `${((absentCount / totalCount) * 100).toFixed(0)}%` : "0%"} of total
            </p>
          </div>
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, var(--warning), #d97706)" }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ background: "white", transform: "translate(30%, -30%)" }} />
            <p className="text-sm font-medium opacity-90">{t("late", language)}</p>
            <p className="text-3xl font-bold mt-1">{lateCount}</p>
            <p className="text-xs mt-1 opacity-75">
              {totalCount > 0 ? `${((lateCount / totalCount) * 100).toFixed(0)}%` : "0%"} of total
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="animate-fade-in flex flex-wrap gap-3 mb-6 items-center" style={{ animationDelay: "0.1s" }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text)",
              boxShadow: "var(--shadow-sm)",
            }}
          />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <option value="">{t("class", language)} - All</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-card)",
                color: "var(--text)",
                boxShadow: "var(--shadow-sm)",
              }}
            />
          </div>
          <div className="ml-auto flex gap-2">
            {!markMode ? (
              <button
                onClick={startMarking}
                className="gradient-bg px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <PlusIcon className="w-4 h-4" />
                {t("markAttendance", language)}
              </button>
            ) : (
              <>
                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "var(--success)" }}
                >
                  {saving ? "Saving..." : t("save", language)}
                </button>
                <button
                  onClick={() => setMarkMode(false)}
                  className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg-card)" }}
                >
                  {t("cancel", language)}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          className="animate-fade-in rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-sm)",
            animationDelay: "0.2s",
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {t("rollNo", language)}
                </th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {t("studentName", language)}
                </th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {t("class", language)}
                </th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {t("status", language)}
                </th>
              </tr>
            </thead>
            <tbody>
              {markMode ? (
                filteredStudents.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-t transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: i % 2 === 0 ? "transparent" : "var(--bg-secondary)",
                    }}
                  >
                    <td className="py-3.5 px-5 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{s.rollNo || "-"}</td>
                    <td className="py-3.5 px-5 font-medium" style={{ color: "var(--text)" }}>{s.user.name}</td>
                    <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                      {s.class ? `${s.class.name}-${s.class.section}` : "-"}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="inline-flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                        {(["present", "absent", "late"] as const).map((status) => {
                          const isActive = records[s.id] === status;
                          const colors: Record<string, { bg: string; activeBg: string }> = {
                            present: { bg: "transparent", activeBg: "var(--success)" },
                            absent: { bg: "transparent", activeBg: "var(--danger)" },
                            late: { bg: "transparent", activeBg: "var(--warning)" },
                          };
                          return (
                            <button
                              key={status}
                              onClick={() => setRecords({ ...records, [s.id]: status })}
                              className="px-3.5 py-1.5 text-xs font-semibold transition-all"
                              style={{
                                backgroundColor: isActive ? colors[status].activeBg : colors[status].bg,
                                color: isActive ? "white" : "var(--text-muted)",
                                borderRight: status !== "late" ? `1px solid var(--border)` : "none",
                              }}
                            >
                              {t(status, language)}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m3 0h3m-1.5-3h-6m9-7.243V21.75a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-15A1.875 1.875 0 0 1 5.625 3.75h6.365" />
                      </svg>
                      <span className="text-sm">{t("noData", language)}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((a, i) => (
                  <tr
                    key={a.id}
                    className="border-t transition-colors card-hover"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: i % 2 === 0 ? "transparent" : "var(--bg-secondary)",
                    }}
                  >
                    <td className="py-3.5 px-5 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{a.student.rollNo || "-"}</td>
                    <td className="py-3.5 px-5 font-medium" style={{ color: "var(--text)" }}>{a.student.user.name}</td>
                    <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                      {a.student.class ? `${a.student.class.name}-${a.student.class.section}` : "-"}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor:
                            a.status === "present" ? "var(--success-light)"
                            : a.status === "absent" ? "var(--danger-light)"
                            : "var(--warning-light)",
                          color:
                            a.status === "present" ? "var(--success)"
                            : a.status === "absent" ? "var(--danger)"
                            : "var(--warning)",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              a.status === "present" ? "var(--success)"
                              : a.status === "absent" ? "var(--danger)"
                              : "var(--warning)",
                          }}
                        />
                        {t(a.status, language)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
