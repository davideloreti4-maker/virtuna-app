"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  FileText,
  Lightbulb,
  X,
  Clock,
  Tag,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  Loader2,
} from "lucide-react";
import type { CalendarEvent, ContentStatus, ContentType } from "@/types/calendar";

// Helper functions
function getDaysInMonth(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function getStartDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--text-muted)" },
  scheduled: { label: "Scheduled", color: "var(--accent-primary)" },
  published: { label: "Published", color: "var(--color-success)" },
  missed: { label: "Missed", color: "var(--color-danger)" },
};

const TYPE_CONFIG: Record<ContentType, { label: string; icon: typeof Video }> = {
  video: { label: "Video", icon: Video },
  script: { label: "Script", icon: FileText },
  idea: { label: "Idea", icon: Lightbulb },
};

async function fetchCalendarEvents(start: string, end: string): Promise<{ events: CalendarEvent[] }> {
  const res = await fetch(`/api/calendar?start=${start}&end=${end}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

async function createEvent(data: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
  const res = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`/api/calendar/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
}

async function updateEvent(id: string, data: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
  const res = await fetch(`/api/calendar/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

function EventCard({
  event,
  onDelete,
  onStatusChange,
}: {
  event: CalendarEvent;
  onDelete: () => void;
  onStatusChange: (status: ContentStatus) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const TypeIcon = TYPE_CONFIG[event.content_type].icon;
  const statusConfig = STATUS_CONFIG[event.status];

  return (
    <div
      className="group p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative"
      onClick={() => setShowMenu(!showMenu)}
    >
      <div className="flex items-center gap-2">
        <TypeIcon className="w-3 h-3 text-[var(--text-muted)]" />
        <span className="text-xs text-white truncate flex-1">{event.title}</span>
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusConfig.color }}
        />
      </div>
      {event.scheduled_time && (
        <div className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {event.scheduled_time}
        </div>
      )}

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          className="absolute top-full right-0 mt-1 z-50 glass-panel p-1 min-w-[120px] shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onStatusChange("published")}
            className="w-full px-3 py-2 text-xs text-left hover:bg-white/10 rounded flex items-center gap-2"
          >
            <Check className="w-3 h-3 text-[var(--color-success)]" />
            Mark Published
          </button>
          <button
            onClick={() => onStatusChange("scheduled")}
            className="w-full px-3 py-2 text-xs text-left hover:bg-white/10 rounded flex items-center gap-2"
          >
            <Clock className="w-3 h-3 text-[var(--accent-primary)]" />
            Schedule
          </button>
          <button
            onClick={onDelete}
            className="w-full px-3 py-2 text-xs text-left hover:bg-white/10 rounded flex items-center gap-2 text-[var(--color-danger)]"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function AddEventModal({
  date,
  onClose,
  onSubmit,
  isLoading,
}: {
  date: string;
  onClose: () => void;
  onSubmit: (data: Partial<CalendarEvent>) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<ContentType>("video");
  const [scheduledTime, setScheduledTime] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      content_type: contentType,
      scheduled_date: date,
      scheduled_time: scheduledTime || null,
      description: description || null,
      status: scheduledTime ? "scheduled" : "draft",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel-strong p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Add Content</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Title</label>
            <input
              type="text"
              className="input w-full"
              placeholder="What are you creating?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Type</label>
            <div className="flex gap-2">
              {(Object.entries(TYPE_CONFIG) as [ContentType, typeof TYPE_CONFIG.video][]).map(
                ([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setContentType(type)}
                      className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        contentType === type
                          ? "bg-[var(--accent-primary)] text-white"
                          : "bg-white/10 text-[var(--text-secondary)] hover:bg-white/20"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{config.label}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Scheduled Time (optional)
            </label>
            <input
              type="time"
              className="input w-full"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Notes (optional)
            </label>
            <textarea
              className="input w-full h-20 resize-none"
              placeholder="Add any notes or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate date range for current month view
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0);
    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }, [currentMonth, currentYear]);

  // Fetch events
  const { data, isLoading } = useQuery({
    queryKey: ["calendar-events", startDate, endDate],
    queryFn: () => fetchCalendarEvents(startDate, endDate),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      setShowAddModal(false);
      setSelectedDate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CalendarEvent> }) =>
      updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    data?.events.forEach((event) => {
      if (!map[event.scheduled_date]) {
        map[event.scheduled_date] = [];
      }
      map[event.scheduled_date].push(event);
    });
    return map;
  }, [data]);

  // Calendar grid data
  const days = getDaysInMonth(currentYear, currentMonth);
  const startDay = getStartDayOfMonth(currentYear, currentMonth);

  const navigateMonth = (delta: number) => {
    const newDate = new Date(currentYear, currentMonth + delta, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const handleAddContent = (date: string) => {
    setSelectedDate(date);
    setShowAddModal(true);
  };

  const handleCreateEvent = (data: Partial<CalendarEvent>) => {
    createMutation.mutate(data);
  };

  const todayStr = formatDate(today);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
              }}
            >
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Content Calendar
          </h1>
          <p className="text-[var(--text-tertiary)] text-sm mt-2">
            Plan and schedule your content
          </p>
        </div>
        <button
          onClick={() => handleAddContent(todayStr)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Content
        </button>
      </header>

      {/* Calendar Navigation */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="btn-icon"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-white">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="btn-icon"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-[var(--text-muted)] py-2 font-medium"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px]" />
          ))}

          {/* Day Cells */}
          {days.map((date) => {
            const dateStr = formatDate(date);
            const isToday = dateStr === todayStr;
            const events = eventsByDate[dateStr] || [];
            const isPast = date < new Date(todayStr);

            return (
              <div
                key={dateStr}
                onClick={() => handleAddContent(dateStr)}
                className={`group min-h-[100px] p-2 rounded-lg border transition-colors cursor-pointer ${
                  isToday
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                } ${isPast ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm ${
                      isToday
                        ? "text-[var(--accent-primary)] font-bold"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-[10px]">Add</span>
                  </div>
                </div>

                {/* Events */}
                <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                  {events.slice(0, 3).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={() => deleteMutation.mutate(event.id)}
                      onStatusChange={(status) =>
                        updateMutation.mutate({ id: event.id, data: { status } })
                      }
                    />
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-[var(--text-muted)] text-center">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {data?.events.filter((e) => e.status === "draft").length || 0}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Drafts</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-[var(--accent-primary)]">
            {data?.events.filter((e) => e.status === "scheduled").length || 0}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Scheduled</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-success)]">
            {data?.events.filter((e) => e.status === "published").length || 0}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Published</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-white">{data?.events.length || 0}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Total</div>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-panel p-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-[var(--text-muted)]">Status:</span>
          {(Object.entries(STATUS_CONFIG) as [ContentStatus, typeof STATUS_CONFIG.draft][]).map(
            ([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-[var(--text-tertiary)]">{config.label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && selectedDate && (
        <AddEventModal
          date={selectedDate}
          onClose={() => {
            setShowAddModal(false);
            setSelectedDate(null);
          }}
          onSubmit={handleCreateEvent}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}
