import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CalendarEvent, CalendarEventInsert } from "@/types/calendar";

// Mock storage for calendar events (in production, use Supabase)
const mockEvents: Map<string, CalendarEvent[]> = new Map();

function getUserEvents(userId: string): CalendarEvent[] {
  return mockEvents.get(userId) || [];
}

function setUserEvents(userId: string, events: CalendarEvent[]): void {
  mockEvents.set(userId, events);
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get("start");
    const endDate = url.searchParams.get("end");
    const status = url.searchParams.get("status");

    let events = getUserEvents(user.id);

    // Filter by date range
    if (startDate) {
      events = events.filter((e) => e.scheduled_date >= startDate);
    }
    if (endDate) {
      events = events.filter((e) => e.scheduled_date <= endDate);
    }

    // Filter by status
    if (status) {
      events = events.filter((e) => e.status === status);
    }

    // Sort by date
    events.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      content_type = "video",
      status = "draft",
      scheduled_date,
      scheduled_time,
      platform = "tiktok",
      tags = [],
      notes,
    } = body as Partial<CalendarEventInsert>;

    if (!title || !scheduled_date) {
      return NextResponse.json(
        { error: "Title and scheduled date are required" },
        { status: 400 }
      );
    }

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      title,
      description: description || null,
      content_type: content_type as CalendarEvent["content_type"],
      status: status as CalendarEvent["status"],
      scheduled_date,
      scheduled_time: scheduled_time || null,
      platform: platform as CalendarEvent["platform"],
      script_id: null,
      analysis_id: null,
      tags: tags || [],
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const events = getUserEvents(user.id);
    events.push(newEvent);
    setUserEvents(user.id, events);

    return NextResponse.json({ event: newEvent });
  } catch (error) {
    console.error("Calendar create error:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
