"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import { useApp } from "../../../components/Providers";
import { t } from "@/lib/i18n";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  available: number;
  quantity: number;
  shelfLocation: string;
}

interface IssuedBook {
  id: string;
  bookTitle: string;
  author: string;
  issueDate: string;
  dueDate: string;
  status: "issued" | "returned" | "overdue";
}

export default function StudentLibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { language } = useApp();

  useEffect(() => {
    Promise.all([
      fetch("/api/library").then((r) => r.json()),
      fetch("/api/library/issue").then((r) => r.json()),
    ]).then(([booksData, issuedData]) => {
      setBooks(Array.isArray(booksData) ? booksData : []);
      setIssuedBooks(Array.isArray(issuedData) ? issuedData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(books.map((b) => b.category).filter(Boolean))];

  const filteredBooks = books.filter((b) => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || b.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const myIssued = issuedBooks.filter((b) => b.status === "issued").length;
  const overdueCount = issuedBooks.filter((b) => b.status === "overdue").length;

  const categoryColors: Record<string, { bg: string; color: string }> = {
    Fiction: { bg: "rgba(168,85,247,0.1)", color: "#a855f7" },
    Science: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
    Mathematics: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
    History: { bg: "rgba(234,179,8,0.1)", color: "#eab308" },
    Literature: { bg: "rgba(236,72,153,0.1)", color: "#ec4899" },
    Reference: { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
    Biography: { bg: "rgba(249,115,22,0.1)", color: "#f97316" },
    Technology: { bg: "rgba(20,184,166,0.1)", color: "#14b8a6" },
  };

  const getCatStyle = (cat: string) => categoryColors[cat] || { bg: "rgba(107,114,128,0.1)", color: "#6b7280" };

  const statusStyle = (status: string) => {
    if (status === "issued") return { bg: "rgba(59,130,246,0.1)", color: "var(--primary)" };
    if (status === "returned") return { bg: "rgba(34,197,94,0.1)", color: "var(--success)" };
    return { bg: "rgba(239,68,68,0.1)", color: "var(--danger)" };
  };

  if (loading) {
    return (
      <div>
        <Header title={t("library", language)} />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 shimmer rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 shimmer rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title={t("library", language)} />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Books Available", value: books.reduce((sum, b) => sum + b.available, 0), icon: "📚", color: "var(--primary)" },
            { label: "My Issued Books", value: myIssued, icon: "📖", color: "var(--success)" },
            { label: "Overdue", value: overdueCount, icon: "⚠️", color: "var(--danger)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 border card-hover"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Book Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
            Browse Books
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => {
              const catStyle = getCatStyle(book.category);
              return (
                <div
                  key={book.id}
                  className="rounded-2xl border p-5 card-hover"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
                    >
                      {book.category}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: book.available > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: book.available > 0 ? "var(--success)" : "var(--danger)",
                      }}
                    >
                      {book.available > 0 ? `${book.available} available` : "Unavailable"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
                    {book.title}
                  </h3>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    by {book.author}
                  </p>
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>Qty: {book.quantity}</span>
                    {book.shelfLocation && <span>Shelf: {book.shelfLocation}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {filteredBooks.length === 0 && (
            <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
              {t("noData", language)}
            </div>
          )}
        </div>

        {/* My Issued Books */}
        {issuedBooks.length > 0 && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                My Issued Books
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                    {["Book Title", "Author", "Issue Date", "Due Date", "Status"].map((h) => (
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
                  {issuedBooks.map((book) => {
                    const sty = statusStyle(book.status);
                    return (
                      <tr
                        key={book.id}
                        className="border-t transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td className="py-3.5 px-5 font-medium" style={{ color: "var(--text)" }}>
                          {book.bookTitle}
                        </td>
                        <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                          {book.author}
                        </td>
                        <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                          {new Date(book.issueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5" style={{ color: "var(--text-secondary)" }}>
                          {new Date(book.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                            style={{ backgroundColor: sty.bg, color: sty.color }}
                          >
                            {book.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
