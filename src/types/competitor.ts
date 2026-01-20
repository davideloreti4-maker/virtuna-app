/**
 * Competitor Tracking Types
 */

export interface Competitor {
  id: string;
  user_id: string;
  username: string;
  platform: "tiktok" | "instagram" | "youtube";
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  video_count: number;
  avg_views: number;
  avg_likes: number;
  avg_engagement_rate: number;
  niche: string | null;
  notes: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompetitorStats {
  competitor_id: string;
  date: string;
  follower_count: number;
  video_count: number;
  avg_views: number;
  avg_likes: number;
  engagement_rate: number;
}

export interface CompetitorVideo {
  id: string;
  competitor_id: string;
  video_id: string;
  title: string;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  duration: number;
  posted_at: string;
  created_at: string;
}

export type CompetitorInsert = Omit<Competitor, "id" | "created_at" | "updated_at">;
export type CompetitorUpdate = Partial<CompetitorInsert>;
