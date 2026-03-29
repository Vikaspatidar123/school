"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { PlusIcon } from "../../components/Icons";
import { t } from "@/lib/i18n";

interface FeeRecord {
  id: string;
  amount: number;
  type: string;
  status: string;
  dueDate: string;
  paidDate: string | null;
  student: {
    id: string;
    user: { name: string };
    class: { name: string; section: string } | null;
  };
}

interface StudentItem {
  id: string;
  user: { name: string };
}

export default function FeesPage() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentId: "", amount: "", type: "tuition", dueDate: "" });
  const { language } = useApp();

  const fetchFees = () => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    fetch(`/api/fees?${params}`)
      .then((r) => r.json())
      .then(setFees);
  };

  useEffect(() => { fetchFees(); }, [filterStatus]);
  useEffect(() => { fetch("/api/students").then((r) => r.json()).then(setStudents); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ studentId: "", amount: "", type: "tuition", dueDate: "" });
    fetchFees();
  };

  const markPaid = async (id: string) => {
    await fetch("/api/fees", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "paid" }),
    });
    fetchFees();
  };

  const totalPending = fees.filter((f) => f.status !== "paid").reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0);
  const totalAll = totalPaid + totalPending;
  const paidPercent = totalAll > 0 ? (totalPaid / totalAll) * 100 : 0;
  const paidCount = fees.filter((f) => f.status === "paid").length;
  const pendingCount = fees.filter((f) => f.status !== "paid").length;

  // Donut chart calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const paidArc = (paidPercent / 100) * circumference;
  const pendingArc = circumference - paidArc;

  return (
    <div>
      <Header title={t("feeManagement", language)} />
      <div className="p-6">
        {/* Stats Row with Donut */}
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Donut Chart Card */}
          <div
            className="rounded-2xl border p-6 flex items-center gap-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="12" style={{ stroke: "var(--danger-light)" }} />
                <circle
                  cx="64" cy="64" r={radius} fill="none" strokeWidth="12"
                  strokeDasharray={`${paidArc} ${pendingArc}`}
                  strokeLinecap="round"
                  style={{ stroke: "var(--success)", transition: "stroke-dasharray 0.6s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold" style={{ color: "var(--text)" }}>{paidPercent.toFixed(0)}%</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>collected</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--success)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{t("paid", language)} ({paidCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--danger)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{t("pending", language)} ({pendingCount})</span>
              </div>
            </div>
          </div>

          {/* Paid Card */}
          <div
            className="rounded-2xl border p-6 card-hover"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--success-light)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: "var(--success)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{t("paid", language)}</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--success)" }}>
              {"\u20B9"}{totalPaid.toLocaleString()}
            </p>
          </div>

          {/* Pending Card */}
          <div
            className="rounded-2xl border p-6 card-hover"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--danger-light)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: "var(--danger)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{t("pending", language)}</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--danger)" }}>
              {"\u20B9"}{totalPending.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="animate-fade-in flex flex-wrap gap-3 mb-6 items-center" style={{ animationDelay: "0.1s" }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)", boxShadow: "var(--shadow-sm)" }}
          >
            <option value="">{t("status", language)} - All</option>
            <option value="paid">{t("paid", language)}</option>
            <option value="pending">{t("pending", language)}</option>
            <option value="overdue">{t("overdue", language)}</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="gradient-bg ml-auto px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            {t("addFee", language)}
          </button>
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
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("studentName", language)}</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("class", language)}</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("type", language)}</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("amount", language)}</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("dueDate", language)}</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("status", language)}</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("actions", language)}</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75" />
                      </svg>
                      <span className="text-sm">{t("noData", language)}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                fees.map((f, i) => (
                  <tr
                    key={f.id}
                    className="border-t transition-colors card-hover"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: i % 2 === 0 ? "transparent" : "var(--bg-secondary)",
                    }}
                  >
                    <td className="py-3.5 px-5 font-medium" style={{ color: "var(--text)" }}>{f.student.user.name}</td>
                    <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                      {f.student.class ? `${f.student.class.name}-${f.student.class.section}` : "-"}
                    </td>
                    <td className="py-3.5 px-5 capitalize" style={{ color: "var(--text-secondary)" }}>{t(f.type, language)}</td>
                    <td className="py-3.5 px-5 font-semibold" style={{ color: "var(--text)" }}>{"\u20B9"}{f.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                      {new Date(f.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor:
                            f.status === "paid" ? "var(--success-light)"
                            : f.status === "overdue" ? "var(--danger-light)"
                            : "var(--warning-light)",
                          color:
                            f.status === "paid" ? "var(--success)"
                            : f.status === "overdue" ? "var(--danger)"
                            : "var(--warning)",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              f.status === "paid" ? "var(--success)"
                              : f.status === "overdue" ? "var(--danger)"
                              : "var(--warning)",
                          }}
                        />
                        {t(f.status, language)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {f.status !== "paid" && (
                        <button
                          onClick={() => markPaid(f.id)}
                          className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white transition-transform hover:scale-105 active:scale-95"
                          style={{ backgroundColor: "var(--success)" }}
                        >
                          {t("collectFee", language)}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Fee Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="animate-scale-in w-full max-w-md rounded-2xl p-6 border"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{t("addFee", language)}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                    {t("studentName", language)}
                  </label>
                  <select
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    required
                  >
                    <option value="">Select student...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                    {t("amount", language)}
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                    {t("type", language)}
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                  >
                    <option value="tuition">{t("tuition", language)}</option>
                    <option value="transport">{t("transport", language)}</option>
                    <option value="library">{t("library", language)}</option>
                    <option value="exam">{t("exam", language)}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                    {t("dueDate", language)}
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="gradient-bg flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t("save", language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg-secondary)" }}
                  >
                    {t("cancel", language)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
