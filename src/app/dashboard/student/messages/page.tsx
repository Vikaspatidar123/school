"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import { useApp } from "../../../components/Providers";
import { t } from "@/lib/i18n";
import { XIcon } from "../../../components/Icons";

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  recipientName: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  type: "sent" | "received";
}

export default function StudentMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
  const [composeForm, setComposeForm] = useState({ to: "", subject: "", content: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const { language } = useApp();

  const fetchMessages = () => {
    fetch("/api/student/messages")
      .then((r) => r.json())
      .then((d) => { setMessages(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/student/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeForm),
      });
      setShowCompose(false);
      setComposeForm({ to: "", subject: "", content: "" });
      setToast("Message sent successfully!");
      setTimeout(() => setToast(""), 3000);
      fetchMessages();
    } catch {
      setToast("Failed to send message");
      setTimeout(() => setToast(""), 3000);
    }
    setSending(false);
  };

  const filtered = messages.filter((m) => filter === "all" || m.type === filter);
  const unreadCount = messages.filter((m) => !m.read && m.type === "received").length;

  if (loading) {
    return (
      <div>
        <Header title="My Messages" />
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="My Messages" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(["all", "received", "sent"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize"
                style={{
                  backgroundColor: filter === f ? "var(--primary)" : "var(--bg-card)",
                  color: filter === f ? "white" : "var(--text-secondary)",
                  borderWidth: 1,
                  borderColor: filter === f ? "var(--primary)" : "var(--border)",
                }}
              >
                {f}
                {f === "received" && unreadCount > 0 && (
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs text-white"
                    style={{ backgroundColor: "var(--danger)" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-transform active:scale-95"
            style={{ background: "var(--gradient)" }}
          >
            ✏️ Compose
          </button>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((msg) => (
              <div
                key={msg.id}
                className="rounded-2xl border transition-all cursor-pointer card-hover overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: !msg.read && msg.type === "received" ? "var(--primary)" : "var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  borderLeftWidth: !msg.read && msg.type === "received" ? 4 : 1,
                }}
                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{
                          background: msg.type === "sent"
                            ? "linear-gradient(135deg, #43e97b, #38f9d7)"
                            : "var(--gradient)",
                        }}
                      >
                        {(msg.type === "sent" ? msg.recipientName : msg.senderName)?.[0] || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="font-semibold text-sm truncate"
                            style={{ color: "var(--text)" }}
                          >
                            {msg.type === "sent" ? `To: ${msg.recipientName}` : msg.senderName}
                          </span>
                          {!msg.read && msg.type === "received" && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: "var(--primary)" }}
                            >
                              New
                            </span>
                          )}
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                            style={{
                              backgroundColor: msg.type === "sent" ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)",
                              color: msg.type === "sent" ? "var(--success)" : "var(--primary)",
                            }}
                          >
                            {msg.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                          {msg.subject}
                        </p>
                        {expandedId !== msg.id && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs whitespace-nowrap shrink-0" style={{ color: "var(--text-muted)" }}>
                      {new Date(msg.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {expandedId === msg.id && (
                    <div
                      className="mt-4 pt-4 border-t text-sm leading-relaxed"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
              <p className="text-4xl mb-3">📭</p>
              <p>No messages found</p>
            </div>
          )}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCompose(false)}>
            <div
              className="w-full max-w-lg rounded-2xl border animate-scale-in overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                  Compose Message
                </h3>
                <button onClick={() => setShowCompose(false)} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }}>
                  <XIcon />
                </button>
              </div>
              <form onSubmit={handleCompose} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>To</label>
                  <input
                    type="text"
                    value={composeForm.to}
                    onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                    placeholder="Teacher name or ID"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Subject</label>
                  <input
                    type="text"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                    placeholder="Message subject"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Message</label>
                  <textarea
                    value={composeForm.content}
                    onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                    placeholder="Type your message..."
                    rows={5}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-transform active:scale-95 disabled:opacity-50"
                    style={{ background: "var(--gradient)" }}
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCompose(false)}
                    className="px-6 py-2.5 rounded-xl border text-sm font-medium"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    {t("cancel", language)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg animate-fade-in z-50"
            style={{ background: toast.includes("success") ? "var(--success)" : "var(--danger)" }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
