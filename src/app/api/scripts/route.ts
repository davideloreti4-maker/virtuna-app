import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateScript,
  type ScriptGenerationInput,
} from "@/lib/api/script-generation";

export async function POST(request: Request) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      niche,
      topic,
      style = "educational",
      duration = "medium",
      tone = "casual",
      targetAudience,
      includeHook = true,
      includeCTA = true,
      keywords = [],
    } = body as Partial<ScriptGenerationInput>;

    // Validate required fields
    if (!niche || !topic) {
      return NextResponse.json(
        { error: "Niche and topic are required" },
        { status: 400 }
      );
    }

    // Validate enums
    const validStyles = ["educational", "entertaining", "promotional", "storytelling", "tutorial"];
    const validDurations = ["short", "medium", "long"];
    const validTones = ["casual", "professional", "humorous", "inspirational"];

    if (!validStyles.includes(style)) {
      return NextResponse.json(
        { error: `Invalid style. Must be one of: ${validStyles.join(", ")}` },
        { status: 400 }
      );
    }

    if (!validDurations.includes(duration)) {
      return NextResponse.json(
        { error: `Invalid duration. Must be one of: ${validDurations.join(", ")}` },
        { status: 400 }
      );
    }

    if (!validTones.includes(tone)) {
      return NextResponse.json(
        { error: `Invalid tone. Must be one of: ${validTones.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate script
    const result = await generateScript({
      niche,
      topic,
      style: style as ScriptGenerationInput["style"],
      duration: duration as ScriptGenerationInput["duration"],
      tone: tone as ScriptGenerationInput["tone"],
      targetAudience,
      includeHook,
      includeCTA,
      keywords,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}
