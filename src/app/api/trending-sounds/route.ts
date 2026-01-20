import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchTrendingSounds,
  type FetchTrendingSoundsParams,
} from "@/lib/api/trending-sounds";

export async function GET(request: Request) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const url = new URL(request.url);
    const params: FetchTrendingSoundsParams = {
      category: url.searchParams.get("category") || undefined,
      trend: (url.searchParams.get("trend") as FetchTrendingSoundsParams["trend"]) || undefined,
      search: url.searchParams.get("search") || undefined,
      limit: parseInt(url.searchParams.get("limit") || "20"),
      offset: parseInt(url.searchParams.get("offset") || "0"),
    };

    // Fetch trending sounds
    const result = await fetchTrendingSounds(params);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Trending sounds fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending sounds" },
      { status: 500 }
    );
  }
}
