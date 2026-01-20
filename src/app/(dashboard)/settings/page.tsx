"use client";

import Link from "next/link";
import {
  ArrowLeft,
  User,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Crown,
  Mail,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="animate-fade-in max-w-2xl">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/" className="btn-icon">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="text-[var(--text-tertiary)] text-sm mt-1">
              Manage your account
            </p>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      <section className="mb-6">
        <div className="glass-panel-strong p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
              }}
            >
              <span className="text-2xl font-bold text-white">D</span>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg">Davide Loreti</h2>
              <p className="text-[var(--text-tertiary)] text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                davide@example.com
              </p>
            </div>
            <button className="btn-icon">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="mb-6">
        <div
          className="glass-panel p-5"
          style={{
            borderColor: "var(--accent-primary)",
            borderWidth: "1px",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-primary-dim)" }}
              >
                <Crown className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold">Free Plan</h3>
                  <span className="badge badge-accent text-xs">Current</span>
                </div>
                <p className="text-[var(--text-tertiary)] text-sm">
                  5 analyses remaining this month
                </p>
              </div>
            </div>
          </div>

          <div className="breakdown-bar mb-4">
            <div
              className="breakdown-bar-fill breakdown-bar-fill--accent"
              style={{ width: "50%" }}
            />
          </div>

          <button className="btn btn-primary w-full">
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro
          </button>
        </div>
      </section>

      {/* Account Settings */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">
          Account
        </h2>
        <div className="glass-panel overflow-hidden">
          <SettingsItem
            icon={<User className="w-5 h-5" />}
            label="Profile"
            description="Edit your personal information"
          />
          <SettingsItem
            icon={<CreditCard className="w-5 h-5" />}
            label="Billing"
            description="Manage payment methods"
          />
          <SettingsItem
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
            description="Control alert preferences"
            isLast
          />
        </div>
      </section>

      {/* Support */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">
          Support
        </h2>
        <div className="glass-panel overflow-hidden">
          <SettingsItem
            icon={<Shield className="w-5 h-5" />}
            label="Privacy Policy"
            description="Read our privacy policy"
          />
          <SettingsItem
            icon={<HelpCircle className="w-5 h-5" />}
            label="Help Center"
            description="Get help and support"
            isLast
          />
        </div>
      </section>

      {/* Sign Out */}
      <section className="mb-6">
        <button
          className="w-full p-4 rounded-lg text-left flex items-center gap-3 transition-all hover:bg-[var(--color-danger-dim)]"
          style={{ color: "var(--color-danger)" }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </section>

      {/* Version */}
      <div className="text-center pb-8">
        <p className="text-[var(--text-muted)] text-xs">Virtuna v1.0.0</p>
        <p className="text-[var(--text-muted)] text-xs mt-1">
          Built with <Zap className="w-3 h-3 inline text-[var(--accent-primary)]" />{" "}
          by Claude
        </p>
      </div>
    </div>
  );
}

function SettingsItem({
  icon,
  label,
  description,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <button
      className={`w-full p-4 flex items-center justify-between transition-all hover:bg-[var(--glass-bg-hover)] ${
        !isLast ? "border-b border-[var(--glass-border)]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: "var(--accent-cyan)" }}>{icon}</span>
        <div className="text-left">
          <span className="text-white font-medium block">{label}</span>
          <span className="text-[var(--text-tertiary)] text-xs">
            {description}
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
    </button>
  );
}
