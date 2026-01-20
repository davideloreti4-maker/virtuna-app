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
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useUser, useUpdateProfile } from "@/lib/hooks/use-user";
import { toastSuccess, toastError } from "@/components/ui/use-toast";
import { UpgradeModal } from "@/components/upgrade/upgrade-modal";
import { PlanComparison } from "@/components/upgrade/plan-comparison";
import type { PlanType } from "@/lib/stripe";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: userData, isLoading: userLoading } = useUser();
  const updateProfile = useUpdateProfile();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPlanComparison, setShowPlanComparison] = useState(false);

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

  const handleUpgradeFromModal = async (plan: PlanType, billing: "monthly" | "yearly") => {
    await handleUpgrade(plan, billing);
  };

  // Check if user is approaching or at limit
  const isAtLimit = remainingAnalyses === 0;
  const isLowOnAnalyses = remainingAnalyses <= 2 && remainingAnalyses > 0;

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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={(profile?.plan || "free") as PlanType}
        usedAnalyses={profile?.analyses_count || 0}
        limitAnalyses={profile?.analyses_limit || 5}
        onUpgrade={handleUpgradeFromModal}
      />

      {/* Subscription */}
      <section className="mb-6">
        <div
          className="glass-panel p-5"
          style={{
            borderColor: isAtLimit
              ? "var(--color-danger)"
              : isLowOnAnalyses
              ? "var(--color-warning)"
              : "var(--accent-primary)",
            borderWidth: "1px",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: isAtLimit
                    ? "rgba(var(--color-danger-rgb), 0.15)"
                    : isLowOnAnalyses
                    ? "rgba(var(--color-warning-rgb), 0.15)"
                    : "var(--accent-primary-dim)",
                }}
              >
                {isAtLimit ? (
                  <AlertTriangle className="w-6 h-6 text-[var(--color-danger)]" />
                ) : isLowOnAnalyses ? (
                  <AlertTriangle className="w-6 h-6 text-[var(--color-warning)]" />
                ) : (
                  <Crown className="w-6 h-6 text-[var(--accent-primary)]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold">
                    {profile?.plan ? planDisplayNames[profile.plan] : "Free Plan"}
                  </h3>
                  <span className="badge badge-accent text-xs">Current</span>
                </div>
                <p
                  className={`text-sm ${
                    isAtLimit
                      ? "text-[var(--color-danger)]"
                      : isLowOnAnalyses
                      ? "text-[var(--color-warning)]"
                      : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {isAtLimit
                    ? "No analyses remaining this month"
                    : isLowOnAnalyses
                    ? `Only ${remainingAnalyses} ${remainingAnalyses === 1 ? "analysis" : "analyses"} left!`
                    : `${remainingAnalyses} of ${profile?.analyses_limit || 5} analyses remaining`}
                </p>
              </div>
            </div>
          </div>

          <div className="breakdown-bar mb-4">
            <div
              className={`breakdown-bar-fill ${
                isAtLimit
                  ? "bg-[var(--color-danger)]"
                  : isLowOnAnalyses
                  ? "bg-[var(--color-warning)]"
                  : "breakdown-bar-fill--accent"
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>

          {/* Inline upgrade prompt when low or at limit */}
          {profile?.plan === "free" && (isAtLimit || isLowOnAnalyses) && (
            <div
              className={`p-3 rounded-lg mb-4 ${
                isAtLimit
                  ? "bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30"
                  : "bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp
                  className={`w-5 h-5 flex-shrink-0 ${
                    isAtLimit ? "text-[var(--color-danger)]" : "text-[var(--color-warning)]"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {isAtLimit
                      ? "Upgrade to continue analyzing videos"
                      : "Running low on analyses"}
                  </p>
                  <p className="text-[var(--text-muted)] text-xs">
                    Pro plan includes 100 analyses/month + AI suggestions
                  </p>
                </div>
              </div>
            </div>
          )}

          {profile?.plan === "free" && (
            <div className="space-y-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
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
                    {isAtLimit ? "Upgrade Now" : "Upgrade to Pro"}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPlanComparison(!showPlanComparison)}
                className="w-full text-sm text-[var(--text-muted)] hover:text-white transition-colors"
              >
                {showPlanComparison ? "Hide" : "Compare"} all plans
              </button>
            </div>
          )}
        </div>

        {/* Plan Comparison (expandable) */}
        {showPlanComparison && profile?.plan === "free" && (
          <div className="mt-4 animate-fade-in">
            <PlanComparison
              currentPlan={(profile?.plan || "free") as PlanType}
              onUpgrade={handleUpgradeFromModal}
              isLoading={isUpgrading}
            />
          </div>
        )}
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
