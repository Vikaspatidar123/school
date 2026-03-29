"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import { useApp } from "../../../components/Providers";
import { t } from "@/lib/i18n";
import { XIcon } from "../../../components/Icons";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
}

export default function StudentTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [msgForm, setMsgForm] = useState({ subject: "", content: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const { language } = useApp();

  useEffect(() => {
    fetch("/api/student/teachers")
      .then((r) => r.json())
      .then((d) => { setTeachers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openMessageModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setMsgForm({ subject: "", content: "" });
    setShowMessage(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setSending(true);
    try {
      await fetch("/api/student/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacher.id,
          subject: msgForm.subject,
          content: msgForm.content,
        }),
      });
      setShowMessage(false);
      setToast("Message sent successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("Failed to send message");
      setTimeout(() => setToast(""), 3000);
    }
    setSending(false);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const avatarGradients = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  ];

  if (loading) {
    return (
      <div>
        <Header title="My Teachers" />
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 shimmer rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="My Teachers" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Teacher Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((teacher, idx) => (
            <div
              key={teacher.id}
              className="rounded-2xl border p-6 card-hover"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                  style={{ background: avatarGradients[idx % avatarGradients.length] }}
                >
                  {getInitials(teacher.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate" style={{ color: "var(--text)" }}>
                    {teacher.name}
                  </h3>
                  <span
                    className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: "var(--primary-50, rgba(59,130,246,0.1))", color: "var(--primary)" }}
                  >
                    {teacher.subject}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 mb-4">
                {teacher.qualification && (
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: "var(--text-muted)" }}>🎓</span>
                    <span style={{ color: "var(--text-secondary)" }}>{teacher.qualification}</span>
                  </div>
                )}
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: "var(--text-muted)" }}>📞</span>
                    <span style={{ color: "var(--text-secondary)" }}>{teacher.phone}</span>
                  </div>
                )}
                {teacher.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: "var(--text-muted)" }}>✉️</span>
                    <span className="truncate" style={{ color: "var(--text-secondary)" }}>{teacher.email}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => openMessageModal(teacher)}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-transform active:scale-95"
                style={{ background: "var(--gradient)" }}
              >
                Send Message
              </button>
            </div>
          ))}
        </div>

        {teachers.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            {t("noData", language)}
          </div>
        )}

        {/* Message Modal */}
        {showMessage && selectedTeacher && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowMessage(false)}>
            <div
              className="w-full max-w-lg rounded-2xl border animate-scale-in overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                  Send Message
                </h3>
                <button onClick={() => setShowMessage(false)} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }}>
                  <XIcon />
                </button>
              </div>
              <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>To</label>
                  <input
                    type="text"
                    value={selectedTeacher.name}
                    readOnly
                    className="w-full px-3 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Subject</label>
                  <input
                    type="text"
                    value={msgForm.subject}
                    onChange={(e) => setMsgForm({ ...msgForm, subject: e.target.value })}
                    placeholder="Enter message subject"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Message</label>
                  <textarea
                    value={msgForm.content}
                    onChange={(e) => setMsgForm({ ...msgForm, content: e.target.value })}
                    placeholder="Type your message..."
                    rows={5}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors resize-none"
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
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMessage(false)}
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
