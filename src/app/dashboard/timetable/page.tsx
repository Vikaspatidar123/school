"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useApp } from "../../components/Providers";
import { t } from "@/lib/i18n";

interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  subject: {
    name: string;
  };
  teacher: {
    user: {
      name: string;
    };
  };
  class: {
    name: string;
    section: string;
  };
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  { start: "9:00", end: "9:45" },
  { start: "9:45", end: "10:30" },
  { start: "10:30", end: "11:15" },
  { start: "11:15", end: "12:00" },
  { start: "12:00", end: "12:45" },
  { start: "12:45", end: "1:30" },
  { start: "1:30", end: "2:15" },
  { start: "2:15", end: "3:00" },
];

const SUBJECT_COLORS = ["#4f46e5", "#059669", "#7c3aed", "#ea580c", "#06b6d4", "#d946ef"];

export default function TimetablePage() {
  const { language } = useApp();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async (classId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timetable?classId=${classId}`);
      if (res.ok) {
        const data = await res.json();
        setTimetable(data);
      }
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  const subjectColorMap: Record<string, string> = {};
  let colorIndex = 0;
  timetable.forEach((entry) => {
    if (!subjectColorMap[entry.subject.name]) {
      subjectColorMap[entry.subject.name] = SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length];
      colorIndex++;
    }
  });

  const getEntry = (day: string, startTime: string): TimetableEntry | undefined => {
    return timetable.find((entry) => entry.day === day && entry.startTime === startTime);
  };

  const selectedClassInfo = classes.find((c) => c.id === selectedClass);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      <Header title="Timetable" />
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Page Title */}
        <div className="animate-fade-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
            {t("Timetable", language)}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            {t("Weekly class schedule overview", language)}
          </p>
        </div>

        {/* Class Selector */}
        <div
          className="card-hover animate-fade-in"
          style={{
            backgroundColor: "var(--bg-card)",
            borderRadius: "1rem",
            padding: "1.25rem 1.5rem",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.95rem" }}>
            {t("Select Class", language)}:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text)",
              fontSize: "0.9rem",
              outline: "none",
              minWidth: "200px",
              cursor: "pointer",
            }}
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {t("Section", language)} {cls.section}
              </option>
            ))}
          </select>
          {selectedClassInfo && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {t("Showing schedule for", language)} {selectedClassInfo.name} ({selectedClassInfo.section})
            </span>
          )}
        </div>

        {/* Subject Legend */}
        {Object.keys(subjectColorMap).length > 0 && (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            {Object.entries(subjectColorMap).map(([subject, color]) => (
              <div
                key={subject}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "9999px",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: color,
                  }}
                />
                {subject}
              </div>
            ))}
          </div>
        )}

        {/* Timetable Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            {t("Loading...", language)}
          </div>
        ) : (
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
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "2px solid var(--border)",
                      backgroundColor: "var(--bg-secondary)",
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      width: "120px",
                    }}
                  >
                    {t("Time", language)}
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "2px solid var(--border)",
                        backgroundColor: "var(--bg-secondary)",
                      }}
                    >
                      {t(day, language)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, slotIndex) => (
                  <tr key={slot.start}>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontWeight: 500,
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: "var(--bg-card)",
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {slot.start} - {slot.end}
                    </td>
                    {DAYS.map((day) => {
                      const entry = getEntry(day, slot.start);
                      const bgColor = entry ? subjectColorMap[entry.subject.name] : undefined;
                      return (
                        <td
                          key={`${day}-${slot.start}`}
                          style={{
                            padding: "0.5rem",
                            borderBottom: "1px solid var(--border)",
                            borderLeft: "1px solid var(--border)",
                            verticalAlign: "top",
                            minWidth: "140px",
                          }}
                        >
                          {entry ? (
                            <div
                              className="card-hover"
                              style={{
                                backgroundColor: bgColor,
                                color: "#fff",
                                borderRadius: "0.5rem",
                                padding: "0.6rem 0.75rem",
                                minHeight: "60px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.2rem",
                                cursor: "default",
                                opacity: 0.9,
                              }}
                            >
                              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                {entry.subject.name}
                              </span>
                              <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                                {entry.teacher.user.name}
                              </span>
                              <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                                {t("Room", language)}: {entry.room}
                              </span>
                            </div>
                          ) : (
                            <div
                              style={{
                                minHeight: "60px",
                                borderRadius: "0.5rem",
                                backgroundColor: "var(--bg-secondary)",
                                opacity: 0.4,
                              }}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && timetable.length === 0 && selectedClass && (
          <div
            className="animate-fade-in"
            style={{
              textAlign: "center",
              padding: "3rem 2rem",
              backgroundColor: "var(--bg-card)",
              borderRadius: "1rem",
              border: "1px solid var(--border)",
              marginTop: "1.5rem",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
              {t("No timetable entries found for this class.", language)}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
