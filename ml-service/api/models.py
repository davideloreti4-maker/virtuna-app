"""
Pydantic models for API request/response schemas.
Must match the TypeScript client interface in virtuna-app.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class EngagementData(BaseModel):
    """Video engagement metrics"""
    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    views: int = Field(default=0, ge=0)


class VideoMetadata(BaseModel):
    """Video metadata for analysis"""
    description: str = Field(default="")
    hashtags: List[str] = Field(default_factory=list)
    duration: float = Field(default=0, ge=0, description="Duration in seconds")
    soundName: Optional[str] = Field(default=None)
    engagement: EngagementData = Field(default_factory=EngagementData)

    # Optional extended metadata
    authorFollowers: Optional[int] = Field(default=None)
    authorVerified: Optional[bool] = Field(default=None)
    createTime: Optional[str] = Field(default=None)
    musicOriginal: Optional[bool] = Field(default=None)


class MLAnalysisRequest(BaseModel):
    """Request body for /analyze endpoint"""
    videoId: str = Field(..., min_length=1)
    metadata: VideoMetadata


class Suggestion(BaseModel):
    """Improvement suggestion"""
    category: str
    priority: Literal["high", "medium", "low"]
    title: str
    description: str


class MLAnalysisResponse(BaseModel):
    """Response body matching TypeScript client expectations"""
    overallScore: int = Field(..., ge=0, le=100)
    hookScore: int = Field(..., ge=0, le=100)
    trendScore: int = Field(..., ge=0, le=100)
    audioScore: int = Field(..., ge=0, le=100)
    timingScore: int = Field(..., ge=0, le=100)
    hashtagScore: int = Field(..., ge=0, le=100)
    suggestions: List[Suggestion] = Field(default_factory=list)

    # Extended response fields (optional in TypeScript client)
    viralClass: Optional[str] = Field(default=None)
    confidence: Optional[float] = Field(default=None)
    predictionTimeMs: Optional[float] = Field(default=None)


class HealthResponse(BaseModel):
    """Response body for /health endpoint"""
    status: str
    modelLoaded: bool
    modelVersion: Optional[str] = None
    lastTrainedAt: Optional[str] = None
    totalPredictions: int = 0


class BatchAnalysisRequest(BaseModel):
    """Request body for batch predictions"""
    videos: List[MLAnalysisRequest] = Field(..., max_length=100)


class BatchAnalysisResponse(BaseModel):
    """Response body for batch predictions"""
    results: List[MLAnalysisResponse]
    processedCount: int
    failedCount: int


class TrainRequest(BaseModel):
    """Request body for manual training trigger"""
    minVideos: int = Field(default=1000, ge=100)
    maxVideos: Optional[int] = Field(default=None)
    daysBack: int = Field(default=90, ge=7)


class TrainResponse(BaseModel):
    """Response body for training trigger"""
    status: str
    message: str
    jobId: Optional[str] = None


class MetricsResponse(BaseModel):
    """Response body for /metrics endpoint"""
    totalPredictions: int
    avgPredictionTimeMs: float
    classDistribution: dict
    lastUpdated: str
