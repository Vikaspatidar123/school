"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useApp } from "./Providers";
import { t, languages, Language } from "@/lib/i18n";
import { NotificationIcon, SearchIcon, ChevronDownIcon } from "./Icons";

type Theme = "blue" | "green" | "purple" | "orange" | "dark";

const themeColors: Record<Theme, string> = {
  blue: "#4f46e5",
  green: "#059669",
  purple: "#7c3aed",
  orange: "#ea580c",
  dark: "#1e293b",
};

interface HeaderProps {
  title: string;
  breadcrumb?: string[];
}

export default function Header({ title, breadcrumb }: HeaderProps) {
  const { theme, setTheme, language, setLanguage } = useApp();
  const { data: session } = useSession();
  const [langOpen, setLangOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--bg-card)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left side: Title + Breadcrumb */}
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "2px",
            }}
          >
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && <span style={{ opacity: 0.4 }}>/</span>}
                <span>{crumb}</span>
              </span>
            ))}
          </div>
        )}
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>
      </div>

      {/* Right side: controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Search bar (cosmetic) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "7px 14px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-card)",
            color: "var(--text-secondary)",
            fontSize: "13px",
            minWidth: "180px",
            cursor: "text",
            transition: "border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <SearchIcon className="w-4 h-4" />
          <span style={{ opacity: 0.6 }}>{t("search", language) || "Search..."}</span>
        </div>

        {/* Notification bell */}
        <button
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--border)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <NotificationIcon className="w-5 h-5" />
          {/* Red badge dot */}
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              border: "2px solid var(--bg-card)",
            }}
          />
        </button>

        {/* Theme circles */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {(Object.keys(themeColors) as Theme[]).map((key) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                border: theme === key ? "2px solid var(--text)" : "2px solid transparent",
                backgroundColor: themeColors[key],
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: theme === key ? "scale(1.15)" : "scale(1)",
                boxShadow:
                  theme === key ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${themeColors[key]}` : "none",
                outline: "none",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                if (theme !== key) {
                  e.currentTarget.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (theme !== key) {
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            />
          ))}
        </div>

        {/* Language dropdown */}
        <div ref={langRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setLangOpen(!langOpen);
              setAvatarOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text)",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <span>{languages[language]}</span>
            <ChevronDownIcon className="w-3.5 h-3.5" />
          </button>
          {langOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                minWidth: "140px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => {
                    setLanguage(code);
                    setLangOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "9px 14px",
                    textAlign: "left",
                    fontSize: "13px",
                    border: "none",
                    backgroundColor: language === code ? "var(--primary)" : "transparent",
                    color: language === code ? "#fff" : "var(--text)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (language !== code) {
                      e.currentTarget.style.backgroundColor = "var(--border)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (language !== code) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <div ref={avatarRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setAvatarOpen(!avatarOpen);
              setLangOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px 4px 4px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: `linear-gradient(135deg, var(--primary), ${themeColors[theme]})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <ChevronDownIcon className="w-3.5 h-3.5" />
          </button>
          {avatarOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                minWidth: "180px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {session?.user?.name || "User"}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginTop: "2px",
                  }}
                >
                  {session?.user?.email || ""}
                </p>
              </div>
              <div style={{ padding: "4px 0" }}>
                {["profile", "settings"].map((item) => (
                  <button
                    key={item}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "9px 14px",
                      textAlign: "left",
                      fontSize: "13px",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "var(--text)",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--border)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {t(item, language) || item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
