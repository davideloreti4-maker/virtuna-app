"""
Data Loader - Fetch training data from Supabase videos_raw table.
"""

import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Generator
import json

from supabase import create_client, Client
import pandas as pd

logger = logging.getLogger(__name__)


class DataLoader:
    """Load video data from Supabase for model training"""

    TABLE_NAME = "videos_raw"
    BATCH_SIZE = 1000

    def __init__(self, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None):
        """Initialize Supabase client"""
        self.url = supabase_url or os.environ.get("SUPABASE_URL")
        self.key = supabase_key or os.environ.get("SUPABASE_SERVICE_KEY")

        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY required")

        self.client: Client = create_client(self.url, self.key)
        logger.info(f"DataLoader initialized for {self.url}")

    def get_video_count(self, days_back: int = 90) -> int:
        """Get total count of videos in date range"""
        cutoff = (datetime.utcnow() - timedelta(days=days_back)).isoformat()

        try:
            result = (
                self.client.table(self.TABLE_NAME)
                .select("id", count="exact")
                .gte("created_at", cutoff)
                .execute()
            )
            return result.count or 0
        except Exception as e:
            logger.error(f"Failed to get video count: {e}")
            return 0

    def fetch_videos(
        self,
        min_videos: int = 1000,
        max_videos: Optional[int] = None,
        days_back: int = 90,
    ) -> pd.DataFrame:
        """
        Fetch videos from Supabase for training.

        Args:
            min_videos: Minimum videos required (raises if not met)
            max_videos: Maximum videos to fetch (None = all)
            days_back: How many days back to query

        Returns:
            DataFrame with video data
        """
        cutoff = (datetime.utcnow() - timedelta(days=days_back)).isoformat()

        # Check availability first
        total_count = self.get_video_count(days_back)
        if total_count < min_videos:
            raise ValueError(
                f"Insufficient data: {total_count} videos available, "
                f"{min_videos} required"
            )

        logger.info(f"Fetching videos (available: {total_count}, max: {max_videos})")

        all_data = []
        offset = 0
        limit = max_videos or total_count

        while len(all_data) < limit:
            batch_size = min(self.BATCH_SIZE, limit - len(all_data))

            try:
                result = (
                    self.client.table(self.TABLE_NAME)
                    .select("*")
                    .gte("created_at", cutoff)
                    .order("created_at", desc=True)
                    .range(offset, offset + batch_size - 1)
                    .execute()
                )

                if not result.data:
                    break

                all_data.extend(result.data)
                offset += batch_size
                logger.info(f"Fetched {len(all_data)}/{limit} videos")

            except Exception as e:
                logger.error(f"Fetch error at offset {offset}: {e}")
                break

        if len(all_data) < min_videos:
            raise ValueError(
                f"Failed to fetch minimum videos: got {len(all_data)}, "
                f"need {min_videos}"
            )

        df = pd.DataFrame(all_data)
        df = self._preprocess(df)

        logger.info(f"Loaded {len(df)} videos for training")
        return df

    def fetch_videos_streaming(
        self,
        days_back: int = 90,
        batch_size: int = 1000,
    ) -> Generator[pd.DataFrame, None, None]:
        """
        Stream videos in batches for memory efficiency.

        Yields:
            DataFrames of batch_size videos
        """
        cutoff = (datetime.utcnow() - timedelta(days=days_back)).isoformat()
        offset = 0

        while True:
            try:
                result = (
                    self.client.table(self.TABLE_NAME)
                    .select("*")
                    .gte("created_at", cutoff)
                    .order("created_at", desc=True)
                    .range(offset, offset + batch_size - 1)
                    .execute()
                )

                if not result.data:
                    break

                df = pd.DataFrame(result.data)
                df = self._preprocess(df)

                yield df

                offset += batch_size

            except Exception as e:
                logger.error(f"Streaming error at offset {offset}: {e}")
                break

    def _preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocess raw data for training"""
        if df.empty:
            return df

        # Parse JSON fields if stored as strings
        json_columns = ["hashtags", "engagement", "author_info", "music_info"]
        for col in json_columns:
            if col in df.columns:
                df[col] = df[col].apply(self._parse_json)

        # Extract engagement metrics
        if "engagement" in df.columns:
            df["views"] = df["engagement"].apply(lambda x: x.get("views", 0) if x else 0)
            df["likes"] = df["engagement"].apply(lambda x: x.get("likes", 0) if x else 0)
            df["comments"] = df["engagement"].apply(lambda x: x.get("comments", 0) if x else 0)
            df["shares"] = df["engagement"].apply(lambda x: x.get("shares", 0) if x else 0)

        # Extract author info
        if "author_info" in df.columns:
            df["author_followers"] = df["author_info"].apply(
                lambda x: x.get("followers", 0) if x else 0
            )
            df["author_verified"] = df["author_info"].apply(
                lambda x: x.get("verified", False) if x else False
            )

        # Extract music info
        if "music_info" in df.columns:
            df["sound_name"] = df["music_info"].apply(
                lambda x: x.get("name", "") if x else ""
            )
            df["music_original"] = df["music_info"].apply(
                lambda x: x.get("original", False) if x else False
            )

        # Handle hashtags
        if "hashtags" in df.columns:
            df["hashtags"] = df["hashtags"].apply(
                lambda x: x if isinstance(x, list) else []
            )

        # Fill missing values
        numeric_cols = ["views", "likes", "comments", "shares", "duration", "author_followers"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # Remove duplicates
        if "video_id" in df.columns:
            df = df.drop_duplicates(subset=["video_id"])

        # Remove invalid entries (no views data)
        if "views" in df.columns:
            df = df[df["views"] > 0]

        return df

    def _parse_json(self, value):
        """Parse JSON string to dict/list"""
        if value is None:
            return None
        if isinstance(value, (dict, list)):
            return value
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return None

    def get_sample_data(self, n: int = 100) -> pd.DataFrame:
        """Get a small sample for testing"""
        try:
            result = (
                self.client.table(self.TABLE_NAME)
                .select("*")
                .order("created_at", desc=True)
                .limit(n)
                .execute()
            )

            df = pd.DataFrame(result.data)
            return self._preprocess(df)
        except Exception as e:
            logger.error(f"Failed to get sample data: {e}")
            return pd.DataFrame()
