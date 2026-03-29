"use client";

import { useState } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { t, languages, Language } from "@/lib/i18n";

type Theme = "blue" | "green" | "purple" | "orange" | "dark";

const themeOptions: { key: Theme; label: string; color: string }[] = [
  { key: "blue", label: "Blue", color: "#4f46e5" },
  { key: "green", label: "Green", color: "#059669" },
  { key: "purple", label: "Purple", color: "#7c3aed" },
  { key: "orange", label: "Orange", color: "#ea580c" },
  { key: "dark", label: "Dark", color: "#1e293b" },
];

const modules = ["students", "attendance", "fees", "exams", "timetable", "library", "reports"];
const roles = ["admin", "teacher", "student", "parent"];
const permissions = ["create", "read", "update", "delete"];

const defaultPermissions: Record<string, Record<string, Record<string, boolean>>> = {
  students: {
    admin: { create: true, read: true, update: true, delete: true },
    teacher: { create: false, read: true, update: true, delete: false },
    student: { create: false, read: true, update: false, delete: false },
    parent: { create: false, read: true, update: false, delete: false },
  },
  attendance: {
    admin: { create: true, read: true, update: true, delete: true },
    teacher: { create: true, read: true, update: true, delete: false },
    student: { create: false, read: true, update: false, delete: false },
    parent: { create: false, read: true, update: false, delete: false },
  },
  fees: {
    admin: { create: true, read: true, update: true, delete: true },
    teacher: { create: false, read: true, update: false, delete: false },
    student: { create: false, read: true, update: false, delete: false },
    parent: { create: false, read: true, update: false, delete: false },
  },
  exams: {
    admin: { create: true, read: true, update: true, delete: true },
    teacher: { create: true, read: true, update: true, delete: false },
    student: { create: false, read: true, update: false, delete: false },
    parent: { create: false, read: true, update: false, delete: false },
  },
  timetable: {
    admin: { create: true, read: true, update: true, delete: true },
    teacher: { create: false, read: true, update: false, delete: false },
    student: { create: false, read: true, update: false, delete: false },
    parent: { create: false, read: true, update: false, delete: false },
  },
  library: {
    admin: { create: true, read: true, update: true, delete: true },
    teacher: { create: true, read: true, update: true, delete: false },
    student: { create: false, read: true, update: false, delete: false },
    parent: { create: false, read: true, update: false, delete: false },
  },
  reports: {
    admin: { create: true, read: true, update: true, delete: true },
    teacher: { create: false, read: true, update: false, delete: false },
    student: { create: false, read: true, update: false, delete: false },
    parent: { create: false, read: true, update: false, delete: false },
  },
};

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage } = useApp();
  const [activeTab, setActiveTab] = useState<"general" | "permissions" | "school">("general");
  const [schoolName, setSchoolName] = useState("My School");
  const [schoolYear, setSchoolYear] = useState("2025-2026");
  const [schoolInfo, setSchoolInfo] = useState({
    name: "My School",
    address: "123 Education Lane, Knowledge City",
    phone: "+1 (555) 123-4567",
    email: "info@myschool.edu",
    principal: "Dr. Jane Smith",
  });

  const tabs = [
    { key: "general" as const, label: "General" },
    { key: "permissions" as const, label: "Roles & Permissions" },
    { key: "school" as const, label: "School Info" },
  ];

  return (
    <div>
      <Header title={t("settings", language)} />
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ backgroundColor: "var(--bg-secondary)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? "var(--bg-card)" : "transparent",
                color: activeTab === tab.key ? "var(--primary)" : "var(--text-secondary)",
                boxShadow: activeTab === tab.key ? "var(--shadow-sm)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6 animate-fade-in">
            {/* Theme Selector */}
            <div
              className="rounded-2xl border p-6 card-hover"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>Theme</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Choose a color theme for the dashboard</p>
              <div className="flex gap-6">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setTheme(opt.key)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center"
                      style={{
                        backgroundColor: opt.color,
                        borderColor: theme === opt.key ? opt.color : "var(--border)",
                        transform: theme === opt.key ? "scale(1.15)" : "scale(1)",
                        boxShadow: theme === opt.key ? `0 0 0 3px var(--bg-card), 0 0 0 5px ${opt.color}` : "none",
                      }}
                    >
                      {theme === opt.key && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: theme === opt.key ? "var(--primary)" : "var(--text-secondary)" }}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div
              className="rounded-2xl border p-6 card-hover"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>Language</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Select your preferred language</p>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-4 py-2 rounded-lg border text-sm min-w-[200px]"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
              >
                {Object.entries(languages).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* School Name & Year */}
            <div
              className="rounded-2xl border p-6 card-hover"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>School Details</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Basic school configuration</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>School Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>School Year</label>
                  <input
                    type="text"
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roles & Permissions Tab */}
        {activeTab === "permissions" && (
          <div className="animate-fade-in">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>Permission Matrix</h3>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Overview of role-based access control for each module (display only)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                      <th
                        className="text-left py-3 px-4 font-semibold border-b"
                        style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
                      >
                        Module
                      </th>
                      {roles.map((role) => (
                        <th
                          key={role}
                          className="text-center py-3 px-4 font-semibold border-b capitalize"
                          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
                          colSpan={4}
                        >
                          {role}
                        </th>
                      ))}
                    </tr>
                    <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                      <th className="border-b" style={{ borderColor: "var(--border)" }} />
                      {roles.map((role) =>
                        permissions.map((perm) => (
                          <th
                            key={`${role}-${perm}`}
                            className="text-center py-2 px-2 text-xs font-medium border-b uppercase"
                            style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
                          >
                            {perm.charAt(0)}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((mod, idx) => (
                      <tr
                        key={mod}
                        className="border-b"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: idx % 2 === 0 ? "transparent" : "var(--bg-secondary)",
                        }}
                      >
                        <td className="py-3 px-4 font-medium capitalize" style={{ color: "var(--text)" }}>
                          {mod}
                        </td>
                        {roles.map((role) =>
                          permissions.map((perm) => {
                            const checked = defaultPermissions[mod]?.[role]?.[perm] ?? false;
                            return (
                              <td key={`${mod}-${role}-${perm}`} className="text-center py-3 px-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  readOnly
                                  className="w-4 h-4 rounded cursor-default"
                                  style={{ accentColor: "var(--primary)" }}
                                />
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  C = Create, R = Read, U = Update, D = Delete
                </p>
              </div>
            </div>
          </div>
        )}

        {/* School Info Tab */}
        {activeTab === "school" && (
          <div className="animate-fade-in">
            <div
              className="rounded-2xl border p-6 max-w-2xl"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>School Information</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                View and manage your school details (cosmetic display only)
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>School Name</label>
                  <input
                    type="text"
                    value={schoolInfo.name}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Address</label>
                  <input
                    type="text"
                    value={schoolInfo.address}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phone</label>
                    <input
                      type="text"
                      value={schoolInfo.phone}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
                    <input
                      type="email"
                      value={schoolInfo.email}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Principal Name</label>
                  <input
                    type="text"
                    value={schoolInfo.principal}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, principal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
