"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { t } from "@/lib/i18n";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
  shelf: string;
}

interface Issue {
  id: string;
  book: {
    title: string;
  };
  student: {
    user: {
      name: string;
    };
  };
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  fine: number;
}

export default function LibraryPage() {
  const { language } = useApp();
  const [books, setBooks] = useState<Book[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"books" | "issued">("books");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    quantity: "",
    shelf: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, issuesRes] = await Promise.all([
        fetch("/api/library"),
        fetch("/api/library/issues"),
      ]);
      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(booksData);
      }
      if (issuesRes.ok) {
        const issuesData = await issuesRes.json();
        setIssues(issuesData);
      }
    } catch (error) {
      console.error("Failed to fetch library data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: "", author: "", isbn: "", category: "", quantity: "", shelf: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add book:", error);
    }
  };

  const handleReturn = async (issueId: string) => {
    try {
      const res = await fetch(`/api/library/issues/${issueId}/return`, { method: "PUT" });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to return book:", error);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.toLowerCase().includes(search.toLowerCase())
  );

  const filteredIssues = issues.filter(
    (issue) =>
      issue.book.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.student.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalBooks = books.reduce((sum, b) => sum + b.quantity, 0);
  const totalAvailable = books.reduce((sum, b) => sum + b.available, 0);
  const totalIssued = totalBooks - totalAvailable;
  const overdueCount = issues.filter((i) => i.status === "OVERDUE").length;

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Fiction: "#4f46e5",
      Science: "#059669",
      History: "#ea580c",
      Mathematics: "#7c3aed",
      Literature: "#d946ef",
      Technology: "#06b6d4",
    };
    return colors[category] || "var(--primary)";
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ISSUED":
        return { bg: "var(--warning-light)", color: "var(--warning)" };
      case "RETURNED":
        return { bg: "var(--success-light)", color: "var(--success)" };
      case "OVERDUE":
        return { bg: "var(--danger-light)", color: "var(--danger)" };
      default:
        return { bg: "var(--bg-secondary)", color: "var(--text-secondary)" };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      <Header title="Library Management" />
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Page Title */}
        <div className="animate-fade-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
            {t("Library Management", language)}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            {t("Manage books and track issued copies", language)}
          </p>
        </div>

        {/* Stats Cards */}
        <div
          className="animate-fade-in"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { label: t("Total Books", language), value: totalBooks, icon: "📚", color: "var(--primary)" },
            { label: t("Issued", language), value: totalIssued, icon: "📖", color: "var(--warning)" },
            { label: t("Available", language), value: totalAvailable, icon: "✅", color: "var(--success)" },
            { label: t("Overdue", language), value: overdueCount, icon: "⚠️", color: "var(--danger)" },
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

        {/* Tabs */}
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            marginBottom: "1.5rem",
            backgroundColor: "var(--bg-card)",
            borderRadius: "0.75rem",
            padding: "0.3rem",
            border: "1px solid var(--border)",
            width: "fit-content",
          }}
        >
          {[
            { key: "books" as const, label: t("Books", language) },
            { key: "issued" as const, label: t("Issued Books", language) },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(""); }}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.9rem",
                backgroundColor: activeTab === tab.key ? "var(--primary)" : "transparent",
                color: activeTab === tab.key ? "#fff" : "var(--text-secondary)",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
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
              placeholder={
                activeTab === "books"
                  ? t("Search by title, author, or ISBN...", language)
                  : t("Search by book title or student name...", language)
              }
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
          {activeTab === "books" && (
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
              {t("Add Book", language)}
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            {t("Loading...", language)}
          </div>
        ) : activeTab === "books" ? (
          /* Books Grid */
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="card-hover animate-fade-in"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    animationDelay: `${index * 0.05}s`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontWeight: 600, color: "var(--text)", fontSize: "1.05rem", marginBottom: "0.25rem", lineHeight: 1.3 }}>
                        {book.title}
                      </h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {book.author}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "0.2rem 0.65rem",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#fff",
                        backgroundColor: getCategoryColor(book.category),
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        marginLeft: "0.75rem",
                      }}
                    >
                      {book.category}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      padding: "0.75rem",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "0.5rem",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.15rem" }}>ISBN</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>{book.isbn}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.15rem" }}>{t("Shelf", language)}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>{book.shelf}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: book.available > 0 ? "var(--success)" : "var(--danger)" }}>
                        {book.available}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        / {book.quantity} {t("available", language)}
                      </span>
                    </div>
                    <div
                      style={{
                        width: "80px",
                        height: "6px",
                        borderRadius: "3px",
                        backgroundColor: "var(--bg-secondary)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${book.quantity > 0 ? (book.available / book.quantity) * 100 : 0}%`,
                          height: "100%",
                          borderRadius: "3px",
                          backgroundColor: book.available > 0 ? "var(--success)" : "var(--danger)",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredBooks.length === 0 && (
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
                  {search ? t("No books found matching your search.", language) : t("No books in the library yet.", language)}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Issued Books Table */
          <>
            <div
              className="animate-fade-in"
              style={{
                backgroundColor: "var(--bg-card)",
                borderRadius: "1rem",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
                overflow: "auto",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                <thead>
                  <tr>
                    {[
                      t("Student", language),
                      t("Book Title", language),
                      t("Issue Date", language),
                      t("Due Date", language),
                      t("Status", language),
                      t("Fine", language),
                      t("Action", language),
                    ].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: "0.875rem 1rem",
                          textAlign: "left",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "2px solid var(--border)",
                          backgroundColor: "var(--bg-secondary)",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => {
                    const statusStyle = getStatusStyle(issue.status);
                    return (
                      <tr key={issue.id}>
                        <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)", fontWeight: 500, color: "var(--text)", fontSize: "0.9rem" }}>
                          {issue.student.user.name}
                        </td>
                        <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          {issue.book.title}
                        </td>
                        <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                          {formatDate(issue.issueDate)}
                        </td>
                        <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                          {formatDate(issue.dueDate)}
                        </td>
                        <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.65rem",
                              borderRadius: "9999px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                            }}
                          >
                            {issue.status}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)", color: issue.fine > 0 ? "var(--danger)" : "var(--text-muted)", fontWeight: issue.fine > 0 ? 600 : 400, fontSize: "0.9rem" }}>
                          {issue.fine > 0 ? `$${issue.fine.toFixed(2)}` : "-"}
                        </td>
                        <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)" }}>
                          {issue.status !== "RETURNED" && (
                            <button
                              onClick={() => handleReturn(issue.id)}
                              style={{
                                padding: "0.35rem 0.75rem",
                                borderRadius: "0.375rem",
                                border: "1px solid var(--success)",
                                backgroundColor: "var(--success-light)",
                                color: "var(--success)",
                                fontWeight: 500,
                                fontSize: "0.8rem",
                                cursor: "pointer",
                              }}
                            >
                              {t("Return", language)}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredIssues.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem 2rem", color: "var(--text-muted)" }}>
                  {search ? t("No issued books found matching your search.", language) : t("No issued books.", language)}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add Book Modal */}
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
                {t("Add New Book", language)}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddBook} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { key: "title", label: t("Title", language), type: "text", placeholder: "Introduction to Physics" },
                { key: "author", label: t("Author", language), type: "text", placeholder: "John Smith" },
                { key: "isbn", label: "ISBN", type: "text", placeholder: "978-3-16-148410-0" },
                { key: "category", label: t("Category", language), type: "text", placeholder: "Science" },
                { key: "quantity", label: t("Quantity", language), type: "number", placeholder: "10" },
                { key: "shelf", label: t("Shelf Location", language), type: "text", placeholder: "A-12" },
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
                  {t("Add Book", language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
