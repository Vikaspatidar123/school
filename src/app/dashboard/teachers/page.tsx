"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { t } from "@/lib/i18n";

interface Teacher {
  id: string;
  employeeId: string;
  subject: string;
  qualification: string;
  phone: string;
  salary: number;
  status: string;
  user: {
    name: string;
    email: string;
  };
}

export default function TeachersPage() {
  const { language } = useApp();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    qualification: "",
    salary: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers");
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salary: parseFloat(formData.salary),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", email: "", subject: "", phone: "", qualification: "", salary: "" });
        fetchTeachers();
      }
    } catch (error) {
      console.error("Failed to add teacher:", error);
    }
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.user.name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(search.toLowerCase()) ||
      teacher.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === "ACTIVE").length;
  const onLeaveTeachers = teachers.filter((t) => t.status === "ON_LEAVE").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "var(--success-light)", text: "var(--success)" };
      case "ON_LEAVE":
        return { bg: "var(--warning-light)", text: "var(--warning)" };
      case "INACTIVE":
        return { bg: "var(--danger-light)", text: "var(--danger)" };
      default:
        return { bg: "var(--bg-secondary)", text: "var(--text-secondary)" };
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      <Header title="Teachers" />
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Page Title */}
        <div className="animate-fade-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
            {t("Teachers Management", language)}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            {t("Manage your school's teaching staff", language)}
          </p>
        </div>

        {/* Stats Cards */}
        <div
          className="animate-fade-in"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { label: t("Total Teachers", language), value: totalTeachers, icon: "👥", color: "var(--primary)" },
            { label: t("Active", language), value: activeTeachers, icon: "✅", color: "var(--success)" },
            { label: t("On Leave", language), value: onLeaveTeachers, icon: "🏖️", color: "var(--warning)" },
          ].map((stat, i) => (
            <div
              key={i}
              className="card-hover"
              style={{
                backgroundColor: "var(--bg-card)",
                borderRadius: "1rem",
                padding: "1.5rem",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "var(--primary-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                }}
              >
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: "1.75rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Add */}
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1", maxWidth: "400px" }}>
            <svg
              style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={t("Search teachers by name, subject, or ID...", language)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 0.75rem 0.75rem 2.75rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-card)",
                color: "var(--text)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              background: "var(--gradient)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t("Add Teacher", language)}
          </button>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            {t("Loading...", language)}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredTeachers.map((teacher, index) => {
              const statusColor = getStatusColor(teacher.status);
              return (
                <div
                  key={teacher.id}
                  className="card-hover animate-fade-in"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: "3.25rem",
                        height: "3.25rem",
                        borderRadius: "0.75rem",
                        background: "var(--gradient)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        flexShrink: 0,
                      }}
                    >
                      {teacher.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontWeight: 600, color: "var(--text)", fontSize: "1.05rem", marginBottom: "0.15rem" }}>
                        {teacher.user.name}
                      </h3>
                      <p style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: 500 }}>
                        {teacher.subject}
                      </p>
                    </div>
                    {/* Status Badge */}
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {teacher.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {[
                      { label: t("Employee ID", language), value: teacher.employeeId },
                      { label: t("Phone", language), value: teacher.phone },
                      { label: t("Qualification", language), value: teacher.qualification },
                    ].map((detail, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{detail.label}</span>
                        <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredTeachers.length === 0 && (
          <div
            className="animate-fade-in"
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              backgroundColor: "var(--bg-card)",
              borderRadius: "1rem",
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
              {search ? t("No teachers found matching your search.", language) : t("No teachers added yet.", language)}
            </p>
          </div>
        )}
      </main>

      {/* Add Teacher Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "1rem",
              padding: "2rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "var(--shadow-sm)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>
                {t("Add New Teacher", language)}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { key: "name", label: t("Full Name", language), type: "text", placeholder: "John Doe" },
                { key: "email", label: t("Email", language), type: "email", placeholder: "john@school.com" },
                { key: "subject", label: t("Subject", language), type: "text", placeholder: "Mathematics" },
                { key: "phone", label: t("Phone", language), type: "tel", placeholder: "+1 234 567 890" },
                { key: "qualification", label: t("Qualification", language), type: "text", placeholder: "M.Ed" },
                { key: "salary", label: t("Salary", language), type: "number", placeholder: "50000" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.875rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
              ))}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {t("Cancel", language)}
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: "var(--gradient)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("Add Teacher", language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
