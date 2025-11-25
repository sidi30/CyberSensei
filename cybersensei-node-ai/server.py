"""
CyberSensei AI Service
FastAPI wrapper around llama.cpp server for Mistral 7B
"""

import os
import asyncio
import httpx
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from loguru import logger


# Configuration
LLAMA_HOST = os.getenv("LLAMA_HOST", "127.0.0.1")
LLAMA_PORT = int(os.getenv("LLAMA_PORT", "8001"))
API_PORT = int(os.getenv("API_PORT", "8000"))
MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/mistral-7b-instruct.Q4_K_M.gguf")

# llama.cpp server URL
LLAMA_URL = f"http://{LLAMA_HOST}:{LLAMA_PORT}"


# Pydantic models
class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    prompt: str = Field(..., min_length=1, max_length=4000, description="User prompt")
    context: Optional[str] = Field(None, max_length=2000, description="Additional context")
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: Optional[int] = Field(512, ge=1, le=2048, description="Maximum tokens to generate")
    top_p: Optional[float] = Field(0.9, ge=0.0, le=1.0, description="Nucleus sampling")
    top_k: Optional[int] = Field(40, ge=1, le=100, description="Top-k sampling")


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str = Field(..., description="AI generated response")
    session_id: Optional[str] = Field(None, description="Session identifier")
    model: str = Field("mistral-7b-instruct", description="Model used")
    tokens_generated: Optional[int] = Field(None, description="Number of tokens generated")


class HealthResponse(BaseModel):
    """Response model for health endpoint"""
    status: str
    llama_server: str
    model_loaded: bool
    model_path: str


# Global HTTP client
http_client: Optional[httpx.AsyncClient] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global http_client
    
    # Startup
    logger.info("🚀 Starting CyberSensei AI Service")
    logger.info(f"📁 Model path: {MODEL_PATH}")
    logger.info(f"🔗 llama.cpp server: {LLAMA_URL}")
    
    # Initialize HTTP client
    http_client = httpx.AsyncClient(timeout=60.0)
    
    # Wait for llama.cpp server
    logger.info("⏳ Waiting for llama.cpp server...")
    await wait_for_llama_server()
    
    logger.info("✅ AI Service ready")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI Service")
    if http_client:
        await http_client.aclose()


# Create FastAPI app
app = FastAPI(
    title="CyberSensei AI Service",
    description="AI microservice for cybersecurity training with Mistral 7B",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def wait_for_llama_server(max_attempts: int = 30, delay: int = 2):
    """Wait for llama.cpp server to be ready"""
    for attempt in range(max_attempts):
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{LLAMA_URL}/health")
                if response.status_code == 200:
                    logger.info("✅ llama.cpp server is ready")
                    return
        except Exception as e:
            logger.debug(f"Attempt {attempt + 1}/{max_attempts}: {e}")
            await asyncio.sleep(delay)
    
    logger.error("❌ llama.cpp server not responding")
    raise RuntimeError("llama.cpp server failed to start")


def build_prompt(user_prompt: str, context: Optional[str] = None) -> str:
    """Build a formatted prompt for Mistral with cybersecurity context"""
    
    system_prompt = """Tu es CyberSensei, un assistant expert en cybersécurité. 
Tu fournis des réponses claires, précises et pédagogiques sur les sujets de sécurité informatique.
Tu réponds en français de manière professionnelle et accessible."""

    if context:
        system_prompt += f"\n\nContexte additionnel: {context}"
    
    # Mistral Instruct format
    formatted_prompt = f"""[INST] {system_prompt}

Question: {user_prompt} [/INST]"""
    
    return formatted_prompt


@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request) -> ChatResponse:
    """
    Chat endpoint - forwards request to llama.cpp server
    
    Args:
        request: Chat request with prompt and parameters
        req: FastAPI request object
    
    Returns:
        ChatResponse with AI generated text
    """
    try:
        # Build formatted prompt
        full_prompt = build_prompt(request.prompt, request.context)
        
        logger.info(f"📨 Chat request: {request.prompt[:50]}...")
        
        # Prepare llama.cpp request
        llama_request = {
            "prompt": full_prompt,
            "temperature": request.temperature,
            "n_predict": request.max_tokens,
            "top_p": request.top_p,
            "top_k": request.top_k,
            "stop": ["[INST]", "</s>"],
            "stream": False
        }
        
        # Call llama.cpp server
        if not http_client:
            raise HTTPException(status_code=503, detail="HTTP client not initialized")
        
        response = await http_client.post(
            f"{LLAMA_URL}/completion",
            json=llama_request,
            timeout=60.0
        )
        
        if response.status_code != 200:
            logger.error(f"❌ llama.cpp error: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=503,
                detail=f"AI model service error: {response.status_code}"
            )
        
        result = response.json()
        ai_response = result.get("content", "").strip()
        tokens_generated = result.get("tokens_predicted", 0)
        
        logger.info(f"✅ Response generated ({tokens_generated} tokens)")
        
        return ChatResponse(
            response=ai_response,
            session_id=None,  # Can be implemented for conversation history
            model="mistral-7b-instruct",
            tokens_generated=tokens_generated
        )
        
    except httpx.TimeoutException:
        logger.error("⏱️ Request timeout")
        raise HTTPException(status_code=504, detail="AI model timeout")
    except httpx.RequestError as e:
        logger.error(f"❌ Request error: {e}")
        raise HTTPException(status_code=503, detail="AI model service unavailable")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """
    Health check endpoint
    
    Returns:
        Health status of the service and llama.cpp server
    """
    llama_status = "unknown"
    model_loaded = False
    
    try:
        if http_client:
            response = await http_client.get(f"{LLAMA_URL}/health", timeout=5.0)
            if response.status_code == 200:
                llama_status = "healthy"
                model_loaded = True
            else:
                llama_status = "unhealthy"
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        llama_status = "unavailable"
    
    return HealthResponse(
        status="healthy" if llama_status == "healthy" else "degraded",
        llama_server=llama_status,
        model_loaded=model_loaded,
        model_path=MODEL_PATH
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CyberSensei AI",
        "version": "1.0.0",
        "model": "Mistral 7B Instruct",
        "status": "operational",
        "endpoints": {
            "chat": "POST /api/ai/chat",
            "health": "GET /health"
        }
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"🚀 Starting server on port {API_PORT}")
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=API_PORT,
        log_level="info",
        access_log=True
    )


