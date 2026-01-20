import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CalendarEvent, CalendarEventUpdate } from "@/types/calendar";

// Shared mock storage
const mockEvents: Map<string, CalendarEvent[]> = new Map();

function getUserEvents(userId: string): CalendarEvent[] {
  return mockEvents.get(userId) || [];
}

function setUserEvents(userId: string, events: CalendarEvent[]): void {
  mockEvents.set(userId, events);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const events = getUserEvents(user.id);
    const event = events.find((e) => e.id === id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Calendar event fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as CalendarEventUpdate;

    const events = getUserEvents(user.id);
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updatedEvent: CalendarEvent = {
      ...events[eventIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };

    events[eventIndex] = updatedEvent;
    setUserEvents(user.id, events);

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error("Calendar event update error:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const events = getUserEvents(user.id);
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    events.splice(eventIndex, 1);
    setUserEvents(user.id, events);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Calendar event delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}
