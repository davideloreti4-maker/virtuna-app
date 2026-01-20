"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Clock,
  Target,
  Hash,
  Music,
  Lightbulb,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  ChevronDown,
  History,
  Save,
  Trash2,
  BookOpen,
} from "lucide-react";
import type {
  ScriptGenerationInput,
  GeneratedScript,
  ScriptGenerationResult,
} from "@/lib/api/script-generation";
import type { SavedScript } from "@/types/database";

async function generateScript(
  input: ScriptGenerationInput
): Promise<ScriptGenerationResult> {
  const res = await fetch("/api/scripts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to generate script");
  }

  return res.json();
}

async function fetchSavedScripts(): Promise<{ scripts: SavedScript[] }> {
  const res = await fetch("/api/scripts/saved");
  if (!res.ok) {
    throw new Error("Failed to fetch saved scripts");
  }
  return res.json();
}

async function saveScript(script: {
  title: string;
  niche: string;
  topic: string;
  style: string;
  duration: string;
  tone: string;
  hook: string;
  body: string[];
  callToAction: string;
  estimatedDuration: number;
  suggestedHashtags: string[];
  suggestedSounds: string[];
  tipsForDelivery: string[];
}): Promise<{ script: SavedScript }> {
  const res = await fetch("/api/scripts/saved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(script),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to save script");
  }

  return res.json();
}

async function deleteScript(id: string): Promise<void> {
  const res = await fetch(`/api/scripts/saved?id=${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete script");
  }
}

const STYLE_OPTIONS = [
  { value: "educational", label: "Educational", description: "Teach something valuable" },
  { value: "entertaining", label: "Entertaining", description: "Fun and engaging content" },
  { value: "promotional", label: "Promotional", description: "Highlight benefits" },
  { value: "storytelling", label: "Storytelling", description: "Narrative-driven" },
  { value: "tutorial", label: "Tutorial", description: "Step-by-step guide" },
];

const DURATION_OPTIONS = [
  { value: "short", label: "Short (15s)", seconds: 15 },
  { value: "medium", label: "Medium (30s)", seconds: 30 },
  { value: "long", label: "Long (60s)", seconds: 60 },
];

const TONE_OPTIONS = [
  { value: "casual", label: "Casual", emoji: "😊" },
  { value: "professional", label: "Professional", emoji: "💼" },
  { value: "humorous", label: "Humorous", emoji: "😄" },
  { value: "inspirational", label: "Inspirational", emoji: "✨" },
];

const NICHE_SUGGESTIONS = [
  "Fitness",
  "Cooking",
  "Tech",
  "Fashion",
  "Finance",
  "Travel",
  "Beauty",
  "Gaming",
  "Education",
  "Lifestyle",
];

interface ScriptDisplayProps {
  script: GeneratedScript;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

function ScriptDisplay({ script, onSave, isSaving, isSaved }: ScriptDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyFullScript = () => {
    const fullScript = [
      script.hook,
      ...script.body,
      script.callToAction,
    ].join("\n\n");
    copyToClipboard(fullScript, "full");
  };

  return (
    <div className="space-y-6">
      {/* Hook */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--accent-primary)] font-medium uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Hook (First 3 seconds)
          </span>
          <button
            onClick={() => copyToClipboard(script.hook, "hook")}
            className="text-[var(--text-muted)] hover:text-white transition-colors"
          >
            {copiedSection === "hook" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-white text-lg font-medium">&ldquo;{script.hook}&rdquo;</p>
      </div>

      {/* Body */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Body
          </span>
          <button
            onClick={() => copyToClipboard(script.body.join("\n\n"), "body")}
            className="text-[var(--text-muted)] hover:text-white transition-colors"
          >
            {copiedSection === "body" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="space-y-3">
          {script.body.map((line, index) => (
            <div key={index} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-[var(--text-muted)] flex-shrink-0">
                {index + 1}
              </span>
              <p className="text-[var(--text-secondary)]">&ldquo;{line}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--accent-secondary)] font-medium uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4" />
            Call to Action
          </span>
          <button
            onClick={() => copyToClipboard(script.callToAction, "cta")}
            className="text-[var(--text-muted)] hover:text-white transition-colors"
          >
            {copiedSection === "cta" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-white font-medium">&ldquo;{script.callToAction}&rdquo;</p>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hashtags */}
        {script.suggestedHashtags.length > 0 && (
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-sm font-medium text-white">Suggested Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {script.suggestedHashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full text-xs bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sounds */}
        {script.suggestedSounds.length > 0 && (
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-[var(--accent-secondary)]" />
              <span className="text-sm font-medium text-white">Suggested Sounds</span>
            </div>
            <div className="space-y-2">
              {script.suggestedSounds.map((sound, i) => (
                <p key={i} className="text-sm text-[var(--text-tertiary)]">
                  • {sound}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delivery Tips */}
      {script.tipsForDelivery.length > 0 && (
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-[var(--color-warning)]" />
            <span className="text-sm font-medium text-white">Tips for Delivery</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {script.tipsForDelivery.map((tip, i) => (
              <p key={i} className="text-sm text-[var(--text-tertiary)] flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                {tip}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={copyFullScript}
          className="btn btn-primary flex-1"
        >
          {copiedSection === "full" ? (
            <>
              <Check className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Script
            </>
          )}
        </button>
        {onSave && !isSaved && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="btn flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Script
              </>
            )}
          </button>
        )}
        {isSaved && (
          <div className="btn flex-1 bg-[var(--color-success)]/20 text-[var(--color-success)] cursor-default">
            <Check className="w-5 h-5" />
            Saved!
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="text-center text-sm text-[var(--text-muted)]">
        <Clock className="w-4 h-4 inline mr-1" />
        Estimated duration: ~{script.estimatedDuration} seconds
      </div>
    </div>
  );
}

// Saved Script Card for history view
function SavedScriptCard({
  script,
  onView,
  onDelete,
  isDeleting,
}: {
  script: SavedScript;
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const formattedDate = new Date(script.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="glass-panel p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{script.title}</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {script.niche} • {script.topic}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-tertiary)]">
            <span className="px-2 py-0.5 rounded-full bg-white/10">{script.style}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10">{script.duration}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="btn-icon hover:bg-[var(--accent-primary)]/20 hover:text-[var(--accent-primary)]"
            title="View script"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="btn-icon hover:bg-[var(--color-danger)]/20 hover:text-[var(--color-danger)]"
            title="Delete script"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mt-3 line-clamp-2">
        &ldquo;{script.hook}&rdquo;
      </p>
    </div>
  );
}

export default function ScriptsPage() {
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [niche, setNiche] = useState("");
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<ScriptGenerationInput["style"]>("educational");
  const [duration, setDuration] = useState<ScriptGenerationInput["duration"]>("medium");
  const [tone, setTone] = useState<ScriptGenerationInput["tone"]>("casual");
  const [keywords, setKeywords] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<GeneratedScript | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [viewingScript, setViewingScript] = useState<SavedScript | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch saved scripts
  const { data: savedScriptsData, isLoading: isLoadingScripts } = useQuery({
    queryKey: ["savedScripts"],
    queryFn: fetchSavedScripts,
  });

  const savedScripts = savedScriptsData?.scripts || [];

  const mutation = useMutation({
    mutationFn: generateScript,
    onSuccess: (data) => {
      setResult(data.script);
      setIsSaved(false);
    },
  });

  const saveMutation = useMutation({
    mutationFn: saveScript,
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries({ queryKey: ["savedScripts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScript,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedScripts"] });
      setDeletingId(null);
      if (viewingScript) {
        setViewingScript(null);
      }
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleGenerate = () => {
    mutation.mutate({
      niche,
      topic,
      style,
      duration,
      tone,
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      includeHook: true,
      includeCTA: true,
    });
  };

  const handleSave = () => {
    if (!result) return;
    saveMutation.mutate({
      title: `${topic} - ${style}`,
      niche,
      topic,
      style,
      duration,
      tone,
      hook: result.hook,
      body: result.body,
      callToAction: result.callToAction,
      estimatedDuration: result.estimatedDuration,
      suggestedHashtags: result.suggestedHashtags,
      suggestedSounds: result.suggestedSounds,
      tipsForDelivery: result.tipsForDelivery,
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleReset = () => {
    setResult(null);
    setIsSaved(false);
    mutation.reset();
  };

  const handleViewSavedScript = (script: SavedScript) => {
    setViewingScript(script);
  };

  const handleCloseViewingScript = () => {
    setViewingScript(null);
  };

  // Convert SavedScript to GeneratedScript format for display
  const savedScriptToGenerated = (saved: SavedScript): GeneratedScript => ({
    id: saved.id,
    hook: saved.hook,
    body: saved.body as string[],
    callToAction: saved.call_to_action,
    estimatedDuration: saved.estimated_duration,
    suggestedHashtags: saved.suggested_hashtags as string[],
    suggestedSounds: saved.suggested_sounds as string[],
    tipsForDelivery: saved.tips_for_delivery as string[],
    createdAt: saved.created_at,
  });

  const isValid = niche.trim() && topic.trim();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/" className="btn-icon">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
                }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              Script Generator
            </h1>
            <p className="text-[var(--text-tertiary)] text-sm mt-1">
              AI-powered video script creation
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab("create");
            setViewingScript(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "create"
              ? "bg-[var(--accent-primary)] text-white"
              : "bg-white/10 text-[var(--text-secondary)] hover:bg-white/20"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Create New
        </button>
        <button
          onClick={() => {
            setActiveTab("history");
            setResult(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-[var(--accent-primary)] text-white"
              : "bg-white/10 text-[var(--text-secondary)] hover:bg-white/20"
          }`}
        >
          <History className="w-4 h-4" />
          My Scripts
          {savedScripts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
              {savedScripts.length}
            </span>
          )}
        </button>
      </div>

      {/* History Tab - Viewing a script */}
      {activeTab === "history" && viewingScript && (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleCloseViewingScript}
            className="btn mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Scripts
          </button>
          <div className="glass-panel-strong p-4 mb-6">
            <h2 className="text-white font-semibold">{viewingScript.title}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {viewingScript.niche} • {viewingScript.topic} • {viewingScript.style}
            </p>
          </div>
          <ScriptDisplay script={savedScriptToGenerated(viewingScript)} />
        </div>
      )}

      {/* History Tab - List view */}
      {activeTab === "history" && !viewingScript && (
        <div className="max-w-2xl mx-auto">
          {isLoadingScripts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
            </div>
          ) : savedScripts.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <History className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
              <h3 className="text-white font-medium mb-2">No saved scripts yet</h3>
              <p className="text-sm text-[var(--text-tertiary)] mb-4">
                Generate a script and save it to build your library
              </p>
              <button
                onClick={() => setActiveTab("create")}
                className="btn btn-primary"
              >
                <Sparkles className="w-4 h-4" />
                Create Your First Script
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedScripts.map((script) => (
                <SavedScriptCard
                  key={script.id}
                  script={script}
                  onView={() => handleViewSavedScript(script)}
                  onDelete={() => handleDelete(script.id)}
                  isDeleting={deletingId === script.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === "create" && (
        <div className="max-w-2xl mx-auto">
          {!result ? (
          <div className="space-y-6">
            {/* Main Inputs */}
            <div className="glass-panel-strong p-6">
              <h2 className="text-white font-semibold mb-4">What&apos;s your video about?</h2>

              {/* Niche */}
              <div className="mb-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Niche / Category
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Fitness, Cooking, Tech..."
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {NICHE_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setNiche(suggestion)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        niche === suggestion
                          ? "bg-[var(--accent-primary)] text-white"
                          : "bg-white/10 text-[var(--text-tertiary)] hover:bg-white/20"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div className="mb-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Morning workout routine, Quick pasta recipe..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Style */}
              <div className="mb-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Content Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {STYLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStyle(option.value as ScriptGenerationInput["style"])}
                      className={`p-3 rounded-xl text-left transition-all ${
                        style === option.value
                          ? "bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] border"
                          : "bg-white/5 border border-transparent hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm font-medium text-white">{option.label}</span>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Video Duration
                </label>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDuration(option.value as ScriptGenerationInput["duration"])}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        duration === option.value
                          ? "bg-[var(--accent-primary)] text-white"
                          : "bg-white/10 text-[var(--text-secondary)] hover:bg-white/20"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-white transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                Advanced Options
              </button>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                  {/* Tone */}
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">
                      Tone
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {TONE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTone(option.value as ScriptGenerationInput["tone"])}
                          className={`py-2 px-4 rounded-full text-sm transition-all ${
                            tone === option.value
                              ? "bg-[var(--accent-primary)] text-white"
                              : "bg-white/10 text-[var(--text-secondary)] hover:bg-white/20"
                          }`}
                        >
                          {option.emoji} {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="e.g., beginner-friendly, quick, easy"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!isValid || mutation.isPending}
              className="btn btn-primary w-full"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Script...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Script
                </>
              )}
            </button>

            {/* Error */}
            {mutation.error && (
              <div className="glass-panel p-4 border border-[var(--color-danger)]/50">
                <p className="text-[var(--color-danger)] text-sm">
                  {mutation.error.message}
                </p>
              </div>
            )}
          </div>
          ) : (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="btn flex-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  New Script
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={mutation.isPending}
                  className="btn flex-1"
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Regenerate
                </button>
              </div>

              {/* Script Display */}
              <ScriptDisplay
                script={result}
                onSave={handleSave}
                isSaving={saveMutation.isPending}
                isSaved={isSaved}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
