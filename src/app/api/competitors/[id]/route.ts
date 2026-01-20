import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Competitor, CompetitorUpdate } from "@/types/competitor";

// Shared mock storage
const mockCompetitors: Map<string, Competitor[]> = new Map();

function getUserCompetitors(userId: string): Competitor[] {
  return mockCompetitors.get(userId) || [];
}

function setUserCompetitors(userId: string, competitors: Competitor[]): void {
  mockCompetitors.set(userId, competitors);
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
    const competitors = getUserCompetitors(user.id);
    const competitor = competitors.find((c) => c.id === id);

    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    return NextResponse.json({ competitor });
  } catch (error) {
    console.error("Competitor fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitor" },
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
    const body = (await request.json()) as CompetitorUpdate;

    const competitors = getUserCompetitors(user.id);
    const index = competitors.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    const updatedCompetitor: Competitor = {
      ...competitors[index],
      ...body,
      updated_at: new Date().toISOString(),
    };

    competitors[index] = updatedCompetitor;
    setUserCompetitors(user.id, competitors);

    return NextResponse.json({ competitor: updatedCompetitor });
  } catch (error) {
    console.error("Competitor update error:", error);
    return NextResponse.json(
      { error: "Failed to update competitor" },
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
    const competitors = getUserCompetitors(user.id);
    const index = competitors.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    competitors.splice(index, 1);
    setUserCompetitors(user.id, competitors);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Competitor delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete competitor" },
      { status: 500 }
    );
  }
}
