"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Upload,
  Video,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Eye,
  Sparkles,
  TrendingUp,
  Music,
  Timer,
  AlertCircle,
  FileVideo,
  X,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { UploadedAnalysis } from "@/types/database";
import type { VideoFeedback } from "@/lib/api/video-analysis";

type UploadedAnalysisWithFeedback = Omit<UploadedAnalysis, 'ai_feedback' | 'suggestions'> & {
  ai_feedback: VideoFeedback | null;
  suggestions: { title: string; description: string; priority: string }[] | null;
};

function uploadVideoWithProgress(
  file: File,
  onProgress: (progress: number) => void
): Promise<{ analysis: UploadedAnalysisWithFeedback }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          reject(new Error("Invalid response"));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.error || "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.open("POST", "/api/video-upload");
    xhr.send(formData);
  });
}

async function fetchUploadedAnalyses(): Promise<{ analyses: UploadedAnalysisWithFeedback[] }> {
  const res = await fetch("/api/video-upload?limit=10");
  if (!res.ok) throw new Error("Failed to fetch analyses");
  return res.json();
}

async function deleteAnalysis(id: string) {
  const res = await fetch(`/api/video-upload/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export default function VideoUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<UploadedAnalysisWithFeedback | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["uploaded-analyses"],
    queryFn: fetchUploadedAnalyses,
    staleTime: 30 * 1000,
  });

  const handleUploadWithProgress = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      await uploadVideoWithProgress(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      queryClient.invalidateQueries({ queryKey: ["uploaded-analyses"] });
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploaded-analyses"] });
      if (selectedAnalysis) setSelectedAnalysis(null);
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      handleUploadWithProgress();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 text-green-400 text-xs">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case "processing":
        return (
          <span className="flex items-center gap-1 text-yellow-400 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" /> Processing
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-red-400 text-xs">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-gray-400 text-xs">
            <Upload className="w-3 h-3" /> Uploading
          </span>
        );
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "rgba(255,255,255,0.4)";
    if (score >= 80) return "#22C55E";
    if (score >= 60) return "#7C3AED";
    if (score >= 40) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div className="flex items-center gap-4">
          <Link
            href="/analyze"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Video className="w-6 h-6" style={{ color: "#fff" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Upload Video</h1>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>
                AI-powered analysis with Gemini Vision
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Upload Section */}
        <div className="col-span-12 lg:col-span-7">
          <GlassPanel variant="strong" style={{ padding: "24px" }}>
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? "2px dashed #7C3AED" : "2px dashed rgba(255,255,255,0.15)",
                borderRadius: "16px",
                padding: "48px 24px",
                textAlign: "center",
                background: dragActive ? "rgba(124, 58, 237, 0.1)" : "rgba(255,255,255,0.02)",
                transition: "all 200ms ease",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              {selectedFile ? (
                <div>
                  <FileVideo className="w-16 h-16 mx-auto mb-4" style={{ color: "#7C3AED" }} />
                  <p style={{ color: "#fff", fontWeight: 500, fontSize: "16px", marginBottom: "4px" }}>
                    {selectedFile.name}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "16px" }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Change File
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpload();
                      }}
                      disabled={isUploading}
                      style={{
                        padding: "10px 24px",
                        borderRadius: "10px",
                        background: isUploading
                          ? "rgba(124, 58, 237, 0.5)"
                          : "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
                        border: "none",
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: "14px",
                        cursor: isUploading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {uploadProgress < 100 ? `Uploading ${uploadProgress}%` : "Analyzing..."}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analyze Video
                        </>
                      )}
                    </button>
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>
                          {uploadProgress < 100 ? "Uploading..." : "Processing with AI..."}
                        </span>
                        <span style={{ color: "#7C3AED", fontSize: "12px", fontWeight: 500 }}>
                          {uploadProgress}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          borderRadius: "3px",
                          background: "rgba(255,255,255,0.1)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${uploadProgress}%`,
                            borderRadius: "3px",
                            background: "linear-gradient(90deg, #7C3AED 0%, #9333EA 100%)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      {uploadProgress === 100 && (
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", marginTop: "8px", textAlign: "center" }}>
                          Gemini Vision is analyzing your video...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                  <p style={{ color: "#fff", fontWeight: 500, fontSize: "16px", marginBottom: "4px" }}>
                    Drag & drop your video here
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "16px" }}>
                    or click to browse
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>
                    Supports MP4, MOV, WebM (max 100MB)
                  </p>
                </div>
              )}
            </div>

            {uploadError && (
              <div
                className="flex items-center gap-2 mt-4 p-3 rounded-lg"
                style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
              >
                <AlertCircle className="w-4 h-4" style={{ color: "#EF4444" }} />
                <span style={{ color: "#EF4444", fontSize: "13px" }}>{uploadError}</span>
              </div>
            )}

            {/* What We Analyze */}
            <div style={{ marginTop: "24px" }}>
              <h3
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "16px",
                }}
              >
                What We Analyze
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Sparkles, label: "Hook Strength", desc: "First 2-3 seconds impact" },
                  { icon: Eye, label: "Visual Quality", desc: "Lighting, framing, effects" },
                  { icon: Music, label: "Audio Analysis", desc: "Sound quality & choice" },
                  { icon: Timer, label: "Pacing", desc: "Length & engagement" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(124, 58, 237, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "#7C3AED" }} />
                    </div>
                    <div>
                      <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>{label}</p>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Recent Uploads */}
        <div className="col-span-12 lg:col-span-5">
          <GlassPanel style={{ padding: "20px", height: "100%" }}>
            <h3
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "16px",
              }}
            >
              Recent Uploads
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
            ) : data?.analyses.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>No uploads yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                    style={{
                      background:
                        selectedAnalysis?.id === analysis.id ? "rgba(124, 58, 237, 0.15)" : "rgba(255,255,255,0.03)",
                      border:
                        selectedAnalysis?.id === analysis.id
                          ? "1px solid rgba(124, 58, 237, 0.3)"
                          : "1px solid transparent",
                    }}
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {analysis.file_url ? (
                        <video
                          src={analysis.file_url}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Video className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {analysis.file_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {getStatusBadge(analysis.status)}
                        {analysis.overall_score && (
                          <span style={{ color: getScoreColor(analysis.overall_score), fontSize: "12px", fontWeight: 600 }}>
                            {analysis.overall_score}/100
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(analysis.id);
                      }}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>

      {/* Analysis Detail Modal */}
      {selectedAnalysis && selectedAnalysis.status === "completed" && (
        <AnalysisDetailModal analysis={selectedAnalysis} onClose={() => setSelectedAnalysis(null)} />
      )}
    </div>
  );
}

function AnalysisDetailModal({
  analysis,
  onClose,
}: {
  analysis: UploadedAnalysisWithFeedback;
  onClose: () => void;
}) {
  const feedback = analysis.ai_feedback;

  const getScoreColor = (score: number | null) => {
    if (!score) return "rgba(255,255,255,0.4)";
    if (score >= 80) return "#22C55E";
    if (score >= 60) return "#7C3AED";
    if (score >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return "N/A";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
          background: "rgba(20, 20, 25, 0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "rgba(20, 20, 25, 0.98)",
            zIndex: 1,
          }}
        >
          <div>
            <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "18px" }}>Analysis Results</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{analysis.file_name}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X className="w-5 h-5" style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* Overall Score */}
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "16px",
              marginBottom: "24px",
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
              Overall Score
            </p>
            <div
              style={{
                fontSize: "64px",
                fontWeight: 700,
                color: getScoreColor(analysis.overall_score),
                lineHeight: 1,
                marginBottom: "8px",
              }}
            >
              {analysis.overall_score || 0}
            </div>
            <p style={{ color: getScoreColor(analysis.overall_score), fontSize: "16px", fontWeight: 500 }}>
              {getScoreLabel(analysis.overall_score)}
            </p>
            {feedback?.overall?.summary && (
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginTop: "16px", maxWidth: "500px", margin: "16px auto 0" }}>
                {feedback.overall.summary}
              </p>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Hook", score: analysis.hook_score, icon: Sparkles },
              { label: "Visual", score: analysis.visual_score, icon: Eye },
              { label: "Audio", score: analysis.audio_score, icon: Music },
              { label: "Pacing", score: analysis.pacing_score, icon: Timer },
            ].map(({ label, score, icon: Icon }) => (
              <div
                key={label}
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: getScoreColor(score) }} />
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", marginBottom: "4px" }}>{label}</p>
                <p style={{ color: getScoreColor(score), fontSize: "24px", fontWeight: 600 }}>{score || 0}</p>
              </div>
            ))}
          </div>

          {/* Detailed Feedback */}
          {feedback && (
            <div className="space-y-4">
              {(["hook", "visual", "audio", "pacing"] as const).map((key) => {
                const section = feedback[key];
                if (!section) return null;
                const icons = { hook: Sparkles, visual: Eye, audio: Music, pacing: Timer };
                const Icon = icons[key];

                return (
                  <div
                    key={key}
                    style={{
                      padding: "16px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "12px",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-5 h-5" style={{ color: getScoreColor(section.score) }} />
                      <h4 style={{ color: "#fff", fontWeight: 500, textTransform: "capitalize" }}>{key}</h4>
                      <span
                        style={{
                          marginLeft: "auto",
                          color: getScoreColor(section.score),
                          fontWeight: 600,
                        }}
                      >
                        {section.score}/100
                      </span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "12px" }}>
                      {section.feedback}
                    </p>
                    {section.improvements.length > 0 && (
                      <div>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginBottom: "8px" }}>
                          Improvements:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: "16px" }}>
                          {section.improvements.map((imp, i) => (
                            <li key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "4px" }}>
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h4 style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", marginBottom: "12px" }}>
                AI Suggestions
              </h4>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 16px",
                      background:
                        suggestion.priority === "high"
                          ? "rgba(239, 68, 68, 0.1)"
                          : suggestion.priority === "medium"
                          ? "rgba(245, 158, 11, 0.1)"
                          : "rgba(34, 197, 94, 0.1)",
                      border: `1px solid ${
                        suggestion.priority === "high"
                          ? "rgba(239, 68, 68, 0.2)"
                          : suggestion.priority === "medium"
                          ? "rgba(245, 158, 11, 0.2)"
                          : "rgba(34, 197, 94, 0.2)"
                      }`,
                      borderRadius: "10px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp
                        className="w-4 h-4"
                        style={{
                          color:
                            suggestion.priority === "high"
                              ? "#EF4444"
                              : suggestion.priority === "medium"
                              ? "#F59E0B"
                              : "#22C55E",
                        }}
                      />
                      <span style={{ color: "#fff", fontWeight: 500, fontSize: "14px" }}>{suggestion.title}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "10px",
                          textTransform: "uppercase",
                          color:
                            suggestion.priority === "high"
                              ? "#EF4444"
                              : suggestion.priority === "medium"
                              ? "#F59E0B"
                              : "#22C55E",
                        }}
                      >
                        {suggestion.priority}
                      </span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>{suggestion.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
