"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { t } from "@/lib/i18n";
import { SearchIcon, PlusIcon, XIcon } from "../../components/Icons";

interface Student {
  id: string;
  rollNo: string | null;
  admissionNo: string | null;
  dob: string | null;
  gender: string | null;
  address: string | null;
  phone: string | null;
  status: string;
  user: { name: string; email: string };
  class: { id: string; name: string; section: string } | null;
  parent: { user: { name: string } } | null;
}

interface ClassItem { id: string; name: string; section: string; }

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: "", email: "", classId: "", rollNo: "", dob: "", address: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { language } = useApp();

  const fetchStudents = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterClass) params.set("classId", filterClass);
    fetch(`/api/students?${params}`)
      .then((r) => r.json())
      .then((data) => { setStudents(data); setLoading(false); });
  };

  useEffect(() => { fetchStudents(); }, [search, filterClass]);
  useEffect(() => { fetch("/api/classes").then((r) => r.json()).then(setClasses); }, []);

  const openAdd = () => {
    setEditingStudent(null);
    setForm({ name: "", email: "", classId: "", rollNo: "", dob: "", address: "", phone: "" });
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({
      name: s.user.name, email: s.user.email, classId: s.class?.id || "",
      rollNo: s.rollNo || "", dob: s.dob ? s.dob.split("T")[0] : "", address: s.address || "", phone: s.phone || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
    await fetch(url, {
      method: editingStudent ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    fetchStudents();
  };

  const activeCount = students.filter(s => s.status === "active").length;

  return (
    <div>
      <Header title={t("students", language)} />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: t("totalStudents", language), value: students.length, color: "var(--primary)" },
            { label: "Active", value: activeCount, color: "var(--success)" },
            { label: t("totalClasses", language), value: classes.length, color: "var(--info)" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5 border card-hover" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text" placeholder={t("search", language)} value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}
            />
          </div>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}
          >
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-transform active:scale-95" style={{ background: "var(--gradient)" }}>
            <PlusIcon className="w-4 h-4" /> {t("addStudent", language)}
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                  {[t("studentName", language), t("rollNo", language), t("class", language), t("phone", language), t("status", language), t("actions", language)].map((h) => (
                    <th key={h} className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={6} className="py-4 px-5"><div className="h-8 shimmer rounded-lg" /></td></tr>
                  ))
                ) : students.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12" style={{ color: "var(--text-muted)" }}>{t("noData", language)}</td></tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="border-t transition-colors cursor-pointer" style={{ borderColor: "var(--border)" }}
                      onClick={() => setSelectedStudent(s)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "var(--gradient)" }}>
                            {s.user.name[0]}
                          </div>
                          <div>
                            <span className="font-medium block" style={{ color: "var(--text)" }}>{s.user.name}</span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>{s.rollNo || "-"}</td>
                      <td className="py-3.5 px-5">
                        {s.class ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--primary-50)", color: "var(--primary)" }}>
                            {s.class.name}-{s.class.section}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>{s.phone || "-"}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: s.status === "active" ? "var(--success-light)" : "var(--warning-light)",
                            color: s.status === "active" ? "var(--success)" : "var(--warning)",
                          }}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ backgroundColor: "var(--primary-50)", color: "var(--primary)" }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ backgroundColor: "var(--danger-light)", color: "var(--danger)" }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail Panel */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/40 flex justify-end z-50" onClick={() => setSelectedStudent(null)}>
            <div className="w-full max-w-md h-full animate-slide-in-right overflow-y-auto" style={{ backgroundColor: "var(--bg-card)" }} onClick={(e) => e.stopPropagation()}>
              <div className="gradient-bg p-6 text-white relative">
                <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20"><XIcon className="w-5 h-5" /></button>
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-3">
                  {selectedStudent.user.name[0]}
                </div>
                <h2 className="text-xl font-bold">{selectedStudent.user.name}</h2>
                <p className="text-white/70 text-sm">{selectedStudent.user.email}</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: t("rollNo", language), value: selectedStudent.rollNo },
                  { label: "Admission No", value: selectedStudent.admissionNo },
                  { label: t("class", language), value: selectedStudent.class ? `${selectedStudent.class.name}-${selectedStudent.class.section}` : "-" },
                  { label: "Gender", value: selectedStudent.gender },
                  { label: t("dob", language), value: selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : "-" },
                  { label: t("phone", language), value: selectedStudent.phone },
                  { label: t("address", language), value: selectedStudent.address },
                  { label: t("parentName", language), value: selectedStudent.parent?.user.name },
                  { label: t("status", language), value: selectedStudent.status },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>{item.label}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.value || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <div className="w-full max-w-lg rounded-2xl border animate-scale-in overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                  {editingStudent ? t("editStudent", language) : t("addStudent", language)}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }}><XIcon /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "name", label: t("studentName", language), type: "text", required: true },
                    { key: "email", label: t("email", language), type: "email", required: true, disabled: !!editingStudent },
                    { key: "rollNo", label: t("rollNo", language), type: "text" },
                    { key: "phone", label: t("phone", language), type: "text" },
                    { key: "dob", label: t("dob", language), type: "date" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{field.label}</label>
                      <input
                        type={field.type}
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                        required={field.required}
                        disabled={field.disabled}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{t("class", language)}</label>
                    <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}>
                      <option value="">Select Class</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{t("address", language)}</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-transform active:scale-95" style={{ background: "var(--gradient)" }}>
                    {t("save", language)}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
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
