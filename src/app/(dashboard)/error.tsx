"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="animate-fade-in min-h-[60vh] flex items-center justify-center p-6">
      <div className="glass-panel-strong p-8 max-w-lg text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-danger-dim)] flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-[var(--color-danger)]" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Oops! Something went wrong
        </h1>

        <p className="text-[var(--text-secondary)] mb-6">
          We encountered an unexpected error. Our team has been notified and is
          working on a fix.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] mb-2">
              <Bug className="w-3 h-3" />
              <span>Development Error Details</span>
            </div>
            <pre className="text-left text-xs bg-[var(--glass-bg)] p-4 rounded-lg overflow-auto max-h-40 text-[var(--color-danger)]">
              {error.message}
              {error.digest && (
                <>
                  {"\n\n"}Digest: {error.digest}
                </>
              )}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="btn btn-primary px-6 py-2.5"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary px-6 py-2.5">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <p className="text-xs text-[var(--text-muted)] mt-6">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
