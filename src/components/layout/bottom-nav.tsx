"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radar, Library, Settings } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/analyze", icon: Radar, label: "Analyze" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            className={`nav-item ${isActive ? "nav-item--active" : ""}`}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
