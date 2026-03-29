"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useApp } from "./Providers";
import { t } from "@/lib/i18n";
import {
  DashboardIcon,
  StudentsIcon,
  TeachersIcon,
  AttendanceIcon,
  FeesIcon,
  ReportsIcon,
  TimetableIcon,
  LibraryIcon,
  NotificationIcon,
  SettingsIcon,
  LogoutIcon,
} from "./Icons";

// Icons for student-specific nav
function ScoreIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function MessageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );
}

function TestIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}

function TrophyIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721M16.27 9.728a5.958 5.958 0 0 0 2.48-.228m-14.5 0a5.958 5.958 0 0 1-2.48-.228" />
    </svg>
  );
}

const adminNavItems = [
  { key: "dashboard", href: "/dashboard", Icon: DashboardIcon },
  { key: "students", href: "/dashboard/students", Icon: StudentsIcon },
  { key: "teachers", href: "/dashboard/teachers", Icon: TeachersIcon },
  { key: "attendance", href: "/dashboard/attendance", Icon: AttendanceIcon },
  { key: "fees", href: "/dashboard/fees", Icon: FeesIcon },
  { key: "timetable", href: "/dashboard/timetable", Icon: TimetableIcon },
  { key: "library", href: "/dashboard/library", Icon: LibraryIcon },
  { key: "reports", href: "/dashboard/reports", Icon: ReportsIcon },
  { key: "notifications", href: "/dashboard/notifications", Icon: NotificationIcon },
  { key: "settings", href: "/dashboard/settings", Icon: SettingsIcon },
];

const studentNavItems = [
  { key: "dashboard", href: "/dashboard/student", Icon: DashboardIcon },
  { key: "scores", href: "/dashboard/student/scores", Icon: ScoreIcon },
  { key: "teachers", href: "/dashboard/student/teachers", Icon: TeachersIcon },
  { key: "messages", href: "/dashboard/student/messages", Icon: MessageIcon },
  { key: "practiceTests", href: "/dashboard/student/practice-tests", Icon: TestIcon },
  { key: "leaderboard", href: "/dashboard/student/leaderboard", Icon: TrophyIcon },
  { key: "library", href: "/dashboard/student/library", Icon: LibraryIcon },
  { key: "notifications", href: "/dashboard/notifications", Icon: NotificationIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { language, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const userRole = (session?.user as { role?: string })?.role || "user";

  const navItems = userRole === "student" ? studentNavItems : adminNavItems;

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: sidebarCollapsed ? "72px" : "260px",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        backgroundColor: "var(--sidebar-bg)",
        color: "var(--sidebar-text)",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      {/* Logo area with gradient */}
      <div
        style={{
          padding: sidebarCollapsed ? "20px 0" : "24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: sidebarCollapsed ? "center" : "flex-start",
          minHeight: "72px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          S
        </div>
        {!sidebarCollapsed && (
          <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {userRole === "student" ? "Student Portal" : "SMS"}
            </h1>
            <p
              style={{
                fontSize: "11px",
                opacity: 0.6,
                marginTop: "2px",
              }}
            >
              {t("schoolManagement", language)}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          paddingTop: "12px",
          paddingBottom: "12px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            padding: "0 8px",
          }}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && item.href !== "/dashboard/student" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.key}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: sidebarCollapsed ? "10px 0" : "10px 14px",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  fontSize: "13.5px",
                  fontWeight: isActive ? 600 : 400,
                  borderRadius: "8px",
                  borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                  backgroundColor: isActive ? "var(--sidebar-active)" : "transparent",
                  color: isActive ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "var(--sidebar-hover)";
                    e.currentTarget.style.borderLeftColor = "var(--primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderLeftColor = "transparent";
                  }
                }}
              >
                <item.Icon className="w-5 h-5" />
                {!sidebarCollapsed && <span>{t(item.key, language)}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User profile section */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: sidebarCollapsed ? "12px 0" : "16px",
        }}
      >
        {!sidebarCollapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
              padding: "0 4px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), rgba(255,255,255,0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {session?.user?.name || "User"}
              </p>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  marginTop: "2px",
                }}
              >
                {userRole}
              </span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: sidebarCollapsed ? "10px 0" : "8px 14px",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            fontSize: "13px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "var(--sidebar-text)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: 0.8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--sidebar-hover)";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.opacity = "0.8";
          }}
        >
          <LogoutIcon className="w-5 h-5" />
          {!sidebarCollapsed && <span>{t("logout", language)}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "8px 0",
            marginTop: "8px",
            fontSize: "13px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "var(--sidebar-text)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: 0.6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.backgroundColor = "var(--sidebar-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.6";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
