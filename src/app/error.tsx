"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#0a0a0c] text-white min-h-screen flex items-center justify-center p-6">
        <div className="glass-panel-strong p-8 max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertOctagon className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h1>

          <p className="text-gray-400 mb-6">
            A critical error occurred. Please refresh the page or try again later.
          </p>

          {process.env.NODE_ENV === "development" && (
            <pre className="text-left text-xs bg-white/5 p-4 rounded-lg overflow-auto max-h-40 mb-6 text-red-400">
              {error.message}
              {error.digest && (
                <>
                  {"\n\n"}Digest: {error.digest}
                </>
              )}
            </pre>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl transition-colors text-gray-400"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
