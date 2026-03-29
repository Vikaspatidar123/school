"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { t } from "@/lib/i18n";

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  type: "event" | "holiday" | "exam" | "meeting";
  createdAt: string;
}

const typeBadgeStyles: Record<EventItem["type"], { bg: string; text: string; label: string }> = {
  event: { bg: "var(--primary-50)", text: "var(--primary)", label: "Event" },
  holiday: { bg: "var(--danger-light)", text: "var(--danger)", label: "Holiday" },
  exam: { bg: "var(--warning-light)", text: "var(--warning)", label: "Exam" },
  meeting: { bg: "var(--info-light)", text: "var(--info)", label: "Meeting" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    type: "event" as EventItem["type"],
  });
  const { language } = useApp();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();

  const fetchEvents = () => {
    setLoading(true);
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ title: "", description: "", date: "", endDate: "", type: "event" });
    fetchEvents();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Map events to calendar days
  const eventsByDay: Record<number, EventItem[]> = {};
  events.forEach((ev) => {
    const evDate = new Date(ev.date);
    if (evDate.getFullYear() === currentYear && evDate.getMonth() === currentMonth) {
      const day = evDate.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(ev);
    }
  });

  // Build calendar grid
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const isToday = (day: number) =>
    today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;

  return (
    <div>
      <Header title={t("events", language) || "Events"} />
      <div className="p-6">
        {/* Calendar Header */}
        <div
          className="rounded-2xl border p-6 mb-6 animate-fade-in"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold py-2"
                style={{ color: "var(--text-muted)" }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, idx) => (
              <div
                key={idx}
                className="relative min-h-[60px] rounded-xl p-1.5 text-sm transition-colors"
                style={{
                  backgroundColor: day
                    ? isToday(day)
                      ? "var(--primary-50)"
                      : "transparent"
                    : "transparent",
                  border: day && isToday(day) ? "1px solid var(--primary)" : "1px solid transparent",
                }}
              >
                {day && (
                  <>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: isToday(day) ? "var(--primary)" : "var(--text-secondary)",
                      }}
                    >
                      {day}
                    </span>
                    {eventsByDay[day] && (
                      <div className="mt-0.5 space-y-0.5">
                        {eventsByDay[day].slice(0, 2).map((ev) => {
                          const badge = typeBadgeStyles[ev.type];
                          return (
                            <div
                              key={ev.id}
                              className="text-[10px] leading-tight px-1 py-0.5 rounded truncate"
                              style={{ backgroundColor: badge.bg, color: badge.text }}
                              title={ev.title}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                        {eventsByDay[day].length > 2 && (
                          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            +{eventsByDay[day].length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>All Events</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: "var(--primary)" }}
          >
            + Add Event
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>Loading...</div>
        ) : events.length === 0 ? (
          <div
            className="rounded-2xl border p-12 text-center"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>No events scheduled</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {events.map((event) => {
              const badge = typeBadgeStyles[event.type];
              const eventDate = new Date(event.date);
              return (
                <div
                  key={event.id}
                  className="rounded-2xl border p-5 card-hover flex items-start gap-4"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {/* Date Block */}
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                    style={{ background: "var(--gradient)" }}
                  >
                    <span className="text-xs font-semibold text-white/80 uppercase">
                      {eventDate.toLocaleString("default", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold text-white leading-none">
                      {eventDate.getDate()}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                        {event.title}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                      {eventDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-lg rounded-2xl p-6 border animate-fade-in"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
                Add Event
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Start Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as EventItem["type"] })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                  >
                    <option value="event">Event</option>
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                    <option value="meeting">Meeting</option>
                  </select>
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
                    onClick={() => setShowModal(false)}
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
