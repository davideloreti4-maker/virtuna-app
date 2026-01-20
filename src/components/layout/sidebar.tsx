"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radar,
  Library,
  Settings,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const mainNav = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/analyze", icon: Radar, label: "Analyze" },
  { href: "/library", icon: Library, label: "Library" },
];

const toolsNav = [
  { href: "/trends", icon: TrendingUp, label: "Trends" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: "240px",
          background: "rgba(18, 18, 22, 0.95)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.15)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
        }}
        className="max-lg:hidden"
      >
        {/* Logo */}
        <div style={{ padding: "8px 12px", marginBottom: "32px" }}>
          <Logo size="md" />
        </div>

        {/* Main Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {mainNav.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  color: isActive ? "#c8ff00" : "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  background: isActive ? "rgba(200, 255, 0, 0.15)" : "transparent",
                  transition: "all 150ms ease",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: isActive ? "#c8ff00" : "transparent",
                    boxShadow: isActive ? "0 0 8px #c8ff00" : "none",
                  }}
                />
                <Icon style={{ width: "20px", height: "20px", opacity: isActive ? 1 : 0.7 }} />
                <span>{label}</span>
              </Link>
            );
          })}

          {/* Tools Section */}
          <div style={{ marginTop: "24px", marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "rgba(255, 255, 255, 0.35)",
                padding: "0 12px",
              }}
            >
              Tools
            </span>
          </div>
          {toolsNav.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  color: isActive ? "#c8ff00" : "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  background: isActive ? "rgba(200, 255, 0, 0.15)" : "transparent",
                  transition: "all 150ms ease",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: isActive ? "#c8ff00" : "transparent",
                    boxShadow: isActive ? "0 0 8px #c8ff00" : "none",
                  }}
                />
                <Icon style={{ width: "20px", height: "20px", opacity: isActive ? 1 : 0.7 }} />
                <span>{label}</span>
              </Link>
            );
          })}

          {/* Settings at bottom */}
          <div style={{ marginTop: "auto" }}>
            <Link
              href="/settings"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "12px",
                color: pathname === "/settings" ? "#c8ff00" : "rgba(255, 255, 255, 0.7)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 500,
                background: pathname === "/settings" ? "rgba(200, 255, 0, 0.15)" : "transparent",
                transition: "all 150ms ease",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: pathname === "/settings" ? "#c8ff00" : "transparent",
                  boxShadow: pathname === "/settings" ? "0 0 8px #c8ff00" : "none",
                }}
              />
              <Settings style={{ width: "20px", height: "20px", opacity: pathname === "/settings" ? 1 : 0.7 }} />
              <span>Settings</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
