"use client";

import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* 404 Visual */}
        <div className="relative mb-8">
          <span className="text-[120px] font-bold text-[var(--glass-bg)] leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[var(--accent-primary-dim)] flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-[var(--accent-primary)]" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>

        <p className="text-[var(--text-secondary)] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn btn-primary px-6 py-2.5 inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary px-6 py-2.5 inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
