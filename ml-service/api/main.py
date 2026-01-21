"""
FastAPI application - ML Service for viral prediction.
Endpoints: /analyze, /health, /predict/batch, /metrics, /train
"""

import os
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .models import (
    MLAnalysisRequest,
    MLAnalysisResponse,
    HealthResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse,
    TrainRequest,
    TrainResponse,
    MetricsResponse,
)
from .predict import Predictor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global predictor instance
predictor: Optional[Predictor] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan manager for startup/shutdown"""
    global predictor
    logger.info("Starting ML Service...")
    predictor = Predictor()

    if predictor.is_model_loaded():
        logger.info(f"Model loaded: v{predictor.get_model_version()}")
    else:
        logger.warning("No trained model found, using formula-based fallback")

    yield

    logger.info("Shutting down ML Service...")


# Create FastAPI app
app = FastAPI(
    title="Virtuna ML Service",
    description="Machine learning service for TikTok viral prediction",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    Returns service status and model information.
    """
    return HealthResponse(
        status="healthy",
        modelLoaded=predictor.is_model_loaded() if predictor else False,
        modelVersion=predictor.get_model_version() if predictor else None,
        lastTrainedAt=predictor.get_last_trained_at() if predictor else None,
        totalPredictions=predictor.total_predictions if predictor else 0,
    )


@app.post("/analyze", response_model=MLAnalysisResponse)
async def analyze_video(request: MLAnalysisRequest):
    """
    Analyze a video for viral potential.

    This is the main endpoint called by the TypeScript client.
    Returns scores and suggestions for improving viral potential.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Service not initialized")

    try:
        logger.info(f"Analyzing video: {request.videoId}")
        response = predictor.predict(request)
        logger.info(
            f"Prediction complete: {request.videoId} -> "
            f"{response.viralClass} ({response.overallScore})"
        )
        return response
    except Exception as e:
        logger.error(f"Prediction failed for {request.videoId}: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict", response_model=MLAnalysisResponse)
async def predict_video(request: MLAnalysisRequest):
    """
    Alias for /analyze endpoint.
    Kept for backwards compatibility.
    """
    return await analyze_video(request)


@app.post("/predict/batch", response_model=BatchAnalysisResponse)
async def predict_batch(request: BatchAnalysisRequest):
    """
    Batch prediction for multiple videos.
    Maximum 100 videos per request.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Service not initialized")

    results = []
    failed = 0

    for video_request in request.videos:
        try:
            result = predictor.predict(video_request)
            results.append(result)
        except Exception as e:
            logger.error(f"Batch prediction failed for {video_request.videoId}: {e}")
            failed += 1

    return BatchAnalysisResponse(
        results=results,
        processedCount=len(results),
        failedCount=failed,
    )


@app.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """
    Get prediction metrics and statistics.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Service not initialized")

    metrics = predictor.get_metrics()
    return MetricsResponse(**metrics)


@app.post("/train", response_model=TrainResponse)
async def trigger_training(request: TrainRequest, background_tasks: BackgroundTasks):
    """
    Trigger manual model retraining.
    Training runs in background.
    """
    # Import here to avoid circular imports
    try:
        from training.train import train_model

        job_id = f"train_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"

        background_tasks.add_task(
            train_model,
            min_videos=request.minVideos,
            max_videos=request.maxVideos,
            days_back=request.daysBack,
        )

        return TrainResponse(
            status="started",
            message=f"Training job {job_id} started in background",
            jobId=job_id,
        )
    except ImportError:
        raise HTTPException(
            status_code=501,
            detail="Training module not available in production deployment"
        )
    except Exception as e:
        logger.error(f"Failed to start training: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start training: {str(e)}")


@app.post("/reload")
async def reload_model():
    """
    Reload model from disk.
    Call after model retraining completes.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Service not initialized")

    success = predictor.reload_model()

    if success:
        return {
            "status": "success",
            "message": "Model reloaded",
            "version": predictor.get_model_version(),
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to reload model")


# Run with uvicorn when executed directly
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=port,
        reload=os.environ.get("ENV", "development") == "development",
    )
