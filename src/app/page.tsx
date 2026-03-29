"use client";

import Link from "next/link";
import { useApp } from "./components/Providers";
import { t, languages, Language } from "@/lib/i18n";
import { StudentsIcon, TeachersIcon, AttendanceIcon, FeesIcon, ReportsIcon, TimetableIcon, LibraryIcon, NotificationIcon, TransportIcon, SettingsIcon } from "./components/Icons";

const themes = [
  { key: "blue" as const, color: "#4f46e5" },
  { key: "green" as const, color: "#059669" },
  { key: "purple" as const, color: "#7c3aed" },
  { key: "orange" as const, color: "#ea580c" },
  { key: "dark" as const, color: "#1e293b" },
];

const features = [
  { icon: <StudentsIcon className="w-7 h-7" />, title: "Student Management", desc: "Complete student lifecycle — admission, profiles, documents, alumni tracking" },
  { icon: <TeachersIcon className="w-7 h-7" />, title: "Teacher & Staff", desc: "Teacher onboarding, payroll, leave management, performance KPIs" },
  { icon: <AttendanceIcon className="w-7 h-7" />, title: "Smart Attendance", desc: "Daily tracking with QR support, geo-location, auto SMS to parents" },
  { icon: <FeesIcon className="w-7 h-7" />, title: "Finance & Fees", desc: "Fee structure, online payments, fine calculation, financial reports" },
  { icon: <TimetableIcon className="w-7 h-7" />, title: "Timetable", desc: "Auto-generated timetables with conflict detection and room management" },
  { icon: <LibraryIcon className="w-7 h-7" />, title: "Library System", desc: "Book inventory, issue/return, fine tracking, digital catalog" },
  { icon: <ReportsIcon className="w-7 h-7" />, title: "Analytics & Reports", desc: "Real-time dashboards, performance insights, exportable reports" },
  { icon: <NotificationIcon className="w-7 h-7" />, title: "Communication", desc: "SMS, Email, WhatsApp alerts, announcements, parent-teacher chat" },
  { icon: <TransportIcon className="w-7 h-7" />, title: "Transport", desc: "Bus routes, GPS tracking, student pickup/drop logs" },
  { icon: <SettingsIcon className="w-7 h-7" />, title: "RBAC System", desc: "Dynamic role-based permissions — Admin, Principal, Teacher, Parent" },
];

const stats = [
  { value: "10K+", label: "Students Managed" },
  { value: "500+", label: "Schools Trust Us" },
  { value: "99.9%", label: "Uptime" },
  { value: "15+", label: "Modules" },
];

export default function Home() {
  const { theme, setTheme, language, setLanguage } = useApp();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: "var(--gradient)" }}>
              S
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--text)" }}>SmartSchool</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium transition-colors" style={{ color: "var(--text-secondary)" }}>{t("features", language)}</a>
            <a href="#stats" className="text-sm font-medium transition-colors" style={{ color: "var(--text-secondary)" }}>Stats</a>
            <a href="#about" className="text-sm font-medium transition-colors" style={{ color: "var(--text-secondary)" }}>{t("aboutUs", language)}</a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-1">
              {themes.map((th) => (
                <button key={th.key} onClick={() => setTheme(th.key)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${theme === th.key ? "scale-110 ring-2 ring-offset-1" : ""}`}
                  style={{ backgroundColor: th.color, borderColor: theme === th.key ? th.color : "transparent" }}
                />
              ))}
            </div>
            <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}
              className="text-xs px-2 py-1.5 rounded-lg border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}>
              {Object.entries(languages).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
            <Link href="/login" className="px-5 py-2 rounded-xl text-white text-sm font-medium transition-transform active:scale-95" style={{ background: "var(--gradient)" }}>
              {t("login", language)}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 80% 50%, var(--accent) 0%, transparent 50%)"
        }} />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 animate-fade-in"
            style={{ backgroundColor: "var(--primary-50)", color: "var(--primary)" }}>
            ✨ Next-Gen School ERP Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up" style={{ color: "var(--text)" }}>
            Smart School
            <span className="gradient-text block">Management System</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2" style={{ color: "var(--text-secondary)" }}>
            {t("heroSubtitle", language)}. Enterprise-grade ERP with RBAC, analytics, and multi-language support.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up stagger-3">
            <Link href="/login" className="px-8 py-4 rounded-2xl text-white text-lg font-semibold transition-all hover:shadow-lg active:scale-95" style={{ background: "var(--gradient)" }}>
              {t("getStarted", language)} →
            </Link>
            <a href="#features" className="px-8 py-4 rounded-2xl text-lg font-semibold border transition-colors" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
              {t("features", language)}
            </a>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="hidden lg:block absolute top-40 left-10 animate-float" style={{ animationDelay: "0s" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-lg)" }}>
            <StudentsIcon className="w-8 h-8" />
          </div>
        </div>
        <div className="hidden lg:block absolute top-60 right-16 animate-float" style={{ animationDelay: "1s" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-lg)" }}>
            <ReportsIcon className="w-7 h-7" />
          </div>
        </div>
        <div className="hidden lg:block absolute bottom-20 left-24 animate-float" style={{ animationDelay: "2s" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-lg)" }}>
            <AttendanceIcon className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="gradient-bg rounded-3xl p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold">{stat.value}</p>
                <p className="text-sm mt-2 text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: "var(--primary-50)", color: "var(--primary)" }}>
              {t("features", language)}
            </span>
            <h2 className="text-4xl font-extrabold mt-4 mb-4" style={{ color: "var(--text)" }}>
              Everything Your School Needs
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              15+ integrated modules designed for modern educational institutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border card-hover group"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: "var(--primary-50)", color: "var(--primary)" }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "var(--text)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-6" style={{ color: "var(--text)" }}>Built with Modern Tech</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["Next.js 16", "TypeScript", "Tailwind CSS", "Prisma ORM", "NextAuth.js", "SQLite/PostgreSQL"].map((tech) => (
              <span key={tech} className="px-5 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg-card)" }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About / CTA */}
      <section id="about" className="py-20 px-6" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-6" style={{ color: "var(--text)" }}>
            Ready to Transform Your School?
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Join 500+ schools already using SmartSchool ERP. Scalable architecture, enterprise-ready features, real-world usability.
          </p>
          <Link href="/login" className="inline-block px-10 py-4 rounded-2xl text-white text-lg font-bold transition-all hover:shadow-xl active:scale-95" style={{ background: "var(--gradient)" }}>
            {t("getStarted", language)} — It&apos;s Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "var(--gradient)" }}>S</div>
            <span className="font-bold" style={{ color: "var(--text)" }}>SmartSchool ERP</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © 2026 Smart School ERP. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>Privacy</span>
            <span className="text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>Terms</span>
            <span className="text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>{t("contactUs", language)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
