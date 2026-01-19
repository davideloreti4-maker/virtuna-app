"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="page-content">
      {/* Header */}
      <header className="flex items-center gap-4 pt-4 pb-6">
        <Link href="/" className="btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-[var(--text-tertiary)] text-sm">Manage your account</p>
        </div>
      </header>

      {/* Profile Section */}
      <section className="py-4">
        <GlassCard level={2} className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--virtuna)] to-[var(--accent)] flex items-center justify-center">
            <span className="text-2xl font-bold text-white">V</span>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-semibold">Virtuna User</h2>
            <p className="text-[var(--text-tertiary)] text-sm">user@example.com</p>
          </div>
          <button className="btn-icon">
            <ChevronRight className="w-5 h-5" />
          </button>
        </GlassCard>
      </section>

      {/* Subscription */}
      <section className="py-4">
        <GlassCard accent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--virtuna-glass)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[var(--virtuna)]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Free Plan</h3>
                <p className="text-[var(--text-tertiary)] text-xs">5 analyses remaining</p>
              </div>
            </div>
          </div>
          <Button variant="virtuna" size="md" className="w-full">
            Upgrade to Pro
          </Button>
        </GlassCard>
      </section>

      {/* Settings List */}
      <section className="py-4 space-y-2">
        <h2 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
          Account
        </h2>
        <SettingsItem icon={<User className="w-5 h-5" />} label="Profile" />
        <SettingsItem icon={<CreditCard className="w-5 h-5" />} label="Billing" />
        <SettingsItem icon={<Bell className="w-5 h-5" />} label="Notifications" />
      </section>

      <section className="py-4 space-y-2">
        <h2 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
          Support
        </h2>
        <SettingsItem icon={<Shield className="w-5 h-5" />} label="Privacy Policy" />
        <SettingsItem icon={<HelpCircle className="w-5 h-5" />} label="Help Center" />
      </section>

      {/* Sign Out */}
      <section className="py-6">
        <Button variant="ghost" size="lg" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </section>

      {/* Version */}
      <div className="text-center py-4">
        <p className="text-[var(--text-muted)] text-xs">Virtuna v1.0.0</p>
      </div>
    </div>
  );
}

function SettingsItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <GlassCard level={1} hover className="flex items-center justify-between p-4 cursor-pointer">
      <div className="flex items-center gap-3">
        <span className="text-[var(--text-secondary)]">{icon}</span>
        <span className="text-white">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
    </GlassCard>
  );
}
