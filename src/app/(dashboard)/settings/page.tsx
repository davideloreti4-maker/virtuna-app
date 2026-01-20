"use client";

import { useState } from "react";
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
  Loader2,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useUser, useUpdateProfile } from "@/lib/hooks/use-user";
import { toastSuccess, toastError } from "@/components/ui/use-toast";
import type { PlanType } from "@/lib/stripe";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: userData, isLoading: userLoading } = useUser();
  const updateProfile = useUpdateProfile();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

  const profile = userData?.user;
  // Only use userLoading - authLoading can hang if profile doesn't exist in Supabase
  const isLoading = userLoading;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleUpgrade = async (plan: PlanType = "pro", billing: "monthly" | "yearly" = "monthly") => {
    if (isUpgrading) return;

    setIsUpgrading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toastError("Checkout failed", data.error || "Could not start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toastError("Checkout failed", "Could not connect to payment provider. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleEditProfile = () => {
    setEditName(profile?.full_name || "");
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;

    try {
      await updateProfile.mutateAsync({ fullName: editName.trim() });
      setShowEditProfile(false);
      toastSuccess("Profile updated", "Your name has been changed successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toastError("Update failed", "Could not update your profile. Please try again.");
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate usage percentage
  const usagePercentage = profile
    ? Math.round((profile.analyses_count / profile.analyses_limit) * 100)
    : 0;

  const remainingAnalyses = profile
    ? profile.analyses_limit - profile.analyses_count
    : 0;

  // Plan display names
  const planDisplayNames: Record<string, string> = {
    free: "Free Plan",
    pro: "Pro Plan",
    agency: "Agency Plan",
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in max-w-2xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-panel-strong p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="btn-icon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input w-full"
                  placeholder="Enter your name"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={!editName.trim() || updateProfile.isPending}
                  className="btn btn-primary flex-1"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <span className="text-2xl font-bold text-white">
                {profile?.full_name ? getInitials(profile.full_name) : "?"}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg">
                {profile?.full_name || "Loading..."}
              </h2>
              <p className="text-[var(--text-tertiary)] text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                {user?.email || profile?.email || "..."}
              </p>
            </div>
            <button onClick={handleEditProfile} className="btn-icon">
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
                  <h3 className="text-white font-semibold">
                    {profile?.plan ? planDisplayNames[profile.plan] : "Free Plan"}
                  </h3>
                  <span className="badge badge-accent text-xs">Current</span>
                </div>
                <p className="text-[var(--text-tertiary)] text-sm">
                  {remainingAnalyses} of {profile?.analyses_limit || 5} analyses remaining
                </p>
              </div>
            </div>
          </div>

          <div className="breakdown-bar mb-4">
            <div
              className="breakdown-bar-fill breakdown-bar-fill--accent"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>

          {profile?.plan === "free" && (
            <button
              onClick={() => handleUpgrade("pro")}
              disabled={isUpgrading}
              className="btn btn-primary w-full"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Pro
                </>
              )}
            </button>
          )}
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
            onClick={handleEditProfile}
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
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full p-4 rounded-lg text-left flex items-center gap-3 transition-all hover:bg-[var(--color-danger-dim)] disabled:opacity-50"
          style={{ color: "var(--color-danger)" }}
        >
          {isSigningOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span className="font-medium">
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </span>
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
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  isLast?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
