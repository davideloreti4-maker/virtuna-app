import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/scripts/saved - List user's saved scripts
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: scripts, error } = await supabase
      .from("saved_scripts" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching scripts:", error);
      return NextResponse.json(
        { error: "Failed to fetch scripts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ scripts });
  } catch (error) {
    console.error("Scripts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scripts" },
      { status: 500 }
    );
  }
}

// POST /api/scripts/saved - Save a new script
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
      niche,
      topic,
      style,
      duration,
      tone,
      hook,
      body: scriptBody,
      callToAction,
      estimatedDuration,
      suggestedHashtags = [],
      suggestedSounds = [],
      tipsForDelivery = [],
    } = body;

    // Validate required fields
    if (!title || !niche || !topic || !hook || !callToAction) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: script, error } = await supabase
      .from("saved_scripts" as any)
      .insert({
        user_id: user.id,
        title,
        niche,
        topic,
        style: style || "educational",
        duration: duration || "medium",
        tone: tone || "casual",
        hook,
        body: scriptBody || [],
        call_to_action: callToAction,
        estimated_duration: estimatedDuration || 30,
        suggested_hashtags: suggestedHashtags,
        suggested_sounds: suggestedSounds,
        tips_for_delivery: tipsForDelivery,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Error saving script:", error);
      return NextResponse.json(
        { error: "Failed to save script" },
        { status: 500 }
      );
    }

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Script save error:", error);
    return NextResponse.json(
      { error: "Failed to save script" },
      { status: 500 }
    );
  }
}

// DELETE /api/scripts/saved - Delete a script
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scriptId = searchParams.get("id");

    if (!scriptId) {
      return NextResponse.json(
        { error: "Script ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("saved_scripts" as any)
      .delete()
      .eq("id", scriptId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting script:", error);
      return NextResponse.json(
        { error: "Failed to delete script" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Script delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete script" },
      { status: 500 }
    );
  }
}
