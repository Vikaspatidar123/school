"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { t } from "@/lib/i18n";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "urgent";
  read: boolean;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: string;
  priority: "low" | "normal" | "high" | "critical";
  createdAt: string;
}

const typeBadgeStyles: Record<Notification["type"], { bg: string; text: string }> = {
  info: { bg: "var(--info-light)", text: "var(--info)" },
  warning: { bg: "var(--warning-light)", text: "var(--warning)" },
  success: { bg: "var(--success-light)", text: "var(--success)" },
  urgent: { bg: "var(--danger-light)", text: "var(--danger)" },
};

const priorityBadgeStyles: Record<Announcement["priority"], { bg: string; text: string }> = {
  low: { bg: "var(--success-light)", text: "var(--success)" },
  normal: { bg: "var(--info-light)", text: "var(--info)" },
  high: { bg: "var(--warning-light)", text: "var(--warning)" },
  critical: { bg: "var(--danger-light)", text: "var(--danger)" },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"notifications" | "announcements">("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    targetRole: "all",
    priority: "normal" as Announcement["priority"],
  });
  const { language } = useApp();

  const fetchNotifications = () => {
    setLoading(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchAnnouncements = () => {
    setLoading(true);
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => {
        setAnnouncements(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    fetchAnnouncements();
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(announcementForm),
    });
    setShowAnnouncementModal(false);
    setAnnouncementForm({ title: "", content: "", targetRole: "all", priority: "normal" });
    fetchAnnouncements();
  };

  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.type === "urgent").length;

  const tabs = [
    { key: "notifications" as const, label: "Notifications" },
    { key: "announcements" as const, label: "Announcements" },
  ];

  return (
    <div>
      <Header title={t("notifications", language) || "Notifications"} />
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-2xl p-5 border animate-fade-in card-hover"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Total</p>
            <p className="text-3xl font-bold mt-1" style={{ color: "var(--text)" }}>{totalNotifications}</p>
          </div>
          <div
            className="rounded-2xl p-5 border animate-fade-in card-hover"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Unread</p>
            <p className="text-3xl font-bold mt-1" style={{ color: "var(--primary)" }}>{unreadCount}</p>
          </div>
          <div
            className="rounded-2xl p-5 border animate-fade-in card-hover"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Urgent</p>
            <p className="text-3xl font-bold mt-1" style={{ color: "var(--danger)" }}>{urgentCount}</p>
          </div>
        </div>

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

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-3 animate-fade-in">
            {loading ? (
              <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div
                className="rounded-2xl border p-12 text-center"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <p className="text-lg" style={{ color: "var(--text-muted)" }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const badge = typeBadgeStyles[notification.type];
                return (
                  <div
                    key={notification.id}
                    className="rounded-2xl border p-5 card-hover transition-all"
                    style={{
                      backgroundColor: notification.read ? "var(--bg-card)" : "var(--primary-50)",
                      borderColor: "var(--border)",
                      boxShadow: "var(--shadow-sm)",
                      borderLeftWidth: "4px",
                      borderLeftColor: badge.text,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                            {notification.title}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                            style={{ backgroundColor: badge.bg, color: badge.text }}
                          >
                            {notification.type}
                          </span>
                          {!notification.read && (
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: "var(--primary)" }}
                            />
                          )}
                        </div>
                        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                          {notification.message}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-colors"
                          style={{ backgroundColor: "var(--primary-50)", color: "var(--primary)" }}
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="animate-fade-in">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: "var(--primary)" }}
              >
                + Create Announcement
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>Loading...</div>
            ) : announcements.length === 0 ? (
              <div
                className="rounded-2xl border p-12 text-center"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <p className="text-lg" style={{ color: "var(--text-muted)" }}>No announcements yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {announcements.map((announcement) => {
                  const badge = priorityBadgeStyles[announcement.priority];
                  return (
                    <div
                      key={announcement.id}
                      className="rounded-2xl border p-5 card-hover"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--border)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                        >
                          {announcement.priority}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                        >
                          {announcement.targetRole}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: "var(--text)" }}>
                        {announcement.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {announcement.content}
                      </p>
                      <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                        {timeAgo(announcement.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create Announcement Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-lg rounded-2xl p-6 border animate-fade-in"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
                Create Announcement
              </h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Content
                  </label>
                  <textarea
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Target Role
                    </label>
                    <select
                      value={announcementForm.targetRole}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, targetRole: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    >
                      <option value="all">All</option>
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Priority
                    </label>
                    <select
                      value={announcementForm.priority}
                      onChange={(e) =>
                        setAnnouncementForm({
                          ...announcementForm,
                          priority: e.target.value as Announcement["priority"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {t("save", language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementModal(false)}
                    className="px-6 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
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
