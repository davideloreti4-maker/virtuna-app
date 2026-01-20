/**
 * Content Calendar Types
 */

export type ContentStatus = "draft" | "scheduled" | "published" | "missed";
export type ContentType = "video" | "script" | "idea";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  content_type: ContentType;
  status: ContentStatus;
  scheduled_date: string;
  scheduled_time: string | null;
  platform: "tiktok" | "instagram" | "youtube" | "all";
  script_id: string | null;
  analysis_id: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CalendarEventInsert = Omit<CalendarEvent, "id" | "created_at" | "updated_at">;
export type CalendarEventUpdate = Partial<CalendarEventInsert>;
