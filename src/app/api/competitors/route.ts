import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Competitor, CompetitorInsert } from "@/types/competitor";

// Mock storage for competitors
const mockCompetitors: Map<string, Competitor[]> = new Map();

function getUserCompetitors(userId: string): Competitor[] {
  return mockCompetitors.get(userId) || [];
}

function setUserCompetitors(userId: string, competitors: Competitor[]): void {
  mockCompetitors.set(userId, competitors);
}

// Mock data generator for competitor stats
function generateMockStats(username: string): Partial<Competitor> {
  const baseFollowers = Math.floor(Math.random() * 900000) + 100000;
  const baseViews = Math.floor(Math.random() * 450000) + 50000;
  const baseLikes = Math.floor(baseViews * (Math.random() * 0.15 + 0.05));

  return {
    follower_count: baseFollowers,
    following_count: Math.floor(Math.random() * 1000) + 100,
    video_count: Math.floor(Math.random() * 200) + 50,
    avg_views: baseViews,
    avg_likes: baseLikes,
    avg_engagement_rate: Number(((baseLikes / baseViews) * 100).toFixed(2)),
  };
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
    const platform = url.searchParams.get("platform");

    let competitors = getUserCompetitors(user.id);

    // Filter by platform
    if (platform) {
      competitors = competitors.filter((c) => c.platform === platform);
    }

    // Sort by follower count
    competitors.sort((a, b) => b.follower_count - a.follower_count);

    return NextResponse.json({ competitors });
  } catch (error) {
    console.error("Competitors fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitors" },
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
      username,
      platform = "tiktok",
      niche,
      notes,
    } = body as Partial<CompetitorInsert>;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check if competitor already exists
    const existingCompetitors = getUserCompetitors(user.id);
    if (existingCompetitors.some((c) => c.username.toLowerCase() === username.toLowerCase() && c.platform === platform)) {
      return NextResponse.json(
        { error: "Competitor already tracked" },
        { status: 400 }
      );
    }

    // Limit to 10 competitors for free users
    if (existingCompetitors.length >= 10) {
      return NextResponse.json(
        { error: "Maximum competitors reached (10). Upgrade for more." },
        { status: 403 }
      );
    }

    // Generate mock stats (in production, this would fetch from TikTok API)
    const mockStats = generateMockStats(username);

    const newCompetitor: Competitor = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      username: username.replace("@", ""),
      platform: platform as Competitor["platform"],
      display_name: username.replace("@", ""),
      avatar_url: null,
      follower_count: mockStats.follower_count || 0,
      following_count: mockStats.following_count || 0,
      video_count: mockStats.video_count || 0,
      avg_views: mockStats.avg_views || 0,
      avg_likes: mockStats.avg_likes || 0,
      avg_engagement_rate: mockStats.avg_engagement_rate || 0,
      niche: niche || null,
      notes: notes || null,
      last_synced_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    existingCompetitors.push(newCompetitor);
    setUserCompetitors(user.id, existingCompetitors);

    return NextResponse.json({ competitor: newCompetitor });
  } catch (error) {
    console.error("Competitor create error:", error);
    return NextResponse.json(
      { error: "Failed to add competitor" },
      { status: 500 }
    );
  }
}
