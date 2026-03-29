"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../components/Providers";
import { t } from "@/lib/i18n";

const demoAccounts = [
  { role: "Admin", email: "admin@school.com", password: "admin123", color: "#4f46e5" },
  { role: "Teacher", email: "rajesh@school.com", password: "teacher123", color: "#059669" },
  { role: "Student", email: "student1@school.com", password: "student123", color: "#f59e0b" },
  { role: "Parent", email: "suresh@school.com", password: "parent123", color: "#7c3aed" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { language } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      // Fetch session to check role for redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      if (role === "student") {
        router.push("/dashboard/student");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 rounded-full border-2 border-white animate-float" />
          <div className="absolute bottom-32 right-20 w-60 h-60 rounded-full border border-white animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-xl border border-white animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 text-white max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold mb-8">
            S
          </div>
          <h1 className="text-4xl font-extrabold mb-4">SmartSchool ERP</h1>
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            {t("schoolDescription", language)}. Enterprise-grade platform with role-based access, real-time analytics, and 15+ modules.
          </p>
          <div className="space-y-3">
            {["Multi-role RBAC System", "Real-time Analytics", "5 Themes & 5 Languages", "15+ Integrated Modules"].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <span className="text-sm text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8 lg:text-left">
            <div className="lg:hidden w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4" style={{ background: "var(--gradient)" }}>S</div>
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "var(--text)" }}>{t("welcome", language)}</h2>
            <p style={{ color: "var(--text-secondary)" }}>Sign in to your school management portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl text-sm font-medium animate-scale-in" style={{ backgroundColor: "var(--danger-light)", color: "var(--danger)" }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>{t("email", language)}</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border text-sm transition-all focus:outline-none"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                placeholder="admin@school.com" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>{t("password", language)}</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border text-sm transition-all focus:outline-none"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
                placeholder="••••••••" required
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: "var(--gradient)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : t("signIn", language)}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button key={acc.role} onClick={() => quickLogin(acc.email, acc.password)}
                  className="p-3 rounded-xl border text-left transition-all card-hover"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                    <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{acc.role}</span>
                  </div>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
