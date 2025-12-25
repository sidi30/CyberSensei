"""
CyberSensei AI Service
FastAPI wrapper around llama.cpp server for Mistral 7B with RAG capabilities
"""

import os
import asyncio
import httpx
import json
import numpy as np
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from loguru import logger

# Optional: FAISS for vector similarity search
try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    logger.warning("FAISS not available - RAG will use simple keyword matching")


# Configuration
LLAMA_HOST = os.getenv("LLAMA_HOST", "127.0.0.1")
LLAMA_PORT = int(os.getenv("LLAMA_PORT", "8001"))
API_PORT = int(os.getenv("API_PORT", "8000"))
MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/mistral-7b-instruct.Q4_K_M.gguf")

# llama.cpp server URL
LLAMA_URL = f"http://{LLAMA_HOST}:{LLAMA_PORT}"


# Pydantic models
class ChatContext(BaseModel):
    """Context information for chat"""
    topic: Optional[str] = Field(None, description="Current topic (PHISHING, PASSWORDS, etc.)")
    difficulty: Optional[str] = Field(None, description="Difficulty level (EASY, MEDIUM, HARD)")
    lastResults: Optional[Dict[str, Any]] = Field(None, description="Recent exercise results")


class ChatRequest(BaseModel):
    """Request model for chat endpoint - CyberSensei specific"""
    userId: Optional[str] = Field(None, description="User ID for personalization")
    role: Optional[str] = Field("EMPLOYEE", description="User role (EMPLOYEE, MANAGER, ADMIN)")
    message: str = Field(..., min_length=1, max_length=4000, description="User message/question")
    context: Optional[ChatContext] = Field(None, description="Learning context")
    
    # Optional tuning parameters
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(512, ge=1, le=2048)


class ChatResponse(BaseModel):
    """Response model for chat endpoint - CyberSensei specific"""
    response: str = Field(..., description="AI generated response")
    suggestedNextExerciseTopic: Optional[str] = Field(None, description="Suggested next learning topic")
    riskHints: Optional[list[str]] = Field(None, description="Identified risk areas or hints")


class HealthResponse(BaseModel):
    """Response model for health endpoint"""
    status: str
    llama_server: str
    model_loaded: bool
    model_path: str


# Global HTTP client
http_client: Optional[httpx.AsyncClient] = None

# In-memory knowledge base for RAG
# In production, this would be loaded from a database or vector store
KNOWLEDGE_BASE = {
    "PHISHING": [
        "Le phishing est une technique d'escroquerie par email ou SMS visant à obtenir des informations personnelles.",
        "Vérifiez toujours l'expéditeur avant de cliquer sur un lien dans un email.",
        "Les emails de phishing contiennent souvent des fautes d'orthographe et un ton urgent.",
        "Ne jamais fournir de mot de passe ou informations bancaires par email.",
    ],
    "PASSWORDS": [
        "Un mot de passe fort contient au moins 12 caractères avec majuscules, minuscules, chiffres et symboles.",
        "Utilisez un mot de passe unique pour chaque compte.",
        "Activez l'authentification à deux facteurs (2FA) partout où c'est possible.",
        "Utilisez un gestionnaire de mots de passe pour stocker vos mots de passe en sécurité.",
    ],
    "MALWARE": [
        "Les malwares incluent les virus, trojans, ransomwares et spywares.",
        "Ne téléchargez jamais de fichiers depuis des sources non fiables.",
        "Maintenez votre antivirus à jour.",
        "Soyez prudent avec les clés USB trouvées ou reçues.",
    ],
    "SOCIAL_ENGINEERING": [
        "L'ingénierie sociale exploite la psychologie humaine plutôt que des failles techniques.",
        "Vérifiez toujours l'identité des personnes demandant des informations sensibles.",
        "Soyez sceptique face aux demandes urgentes ou inhabituelles.",
    ],
    "NETWORK_SECURITY": [
        "Utilisez un VPN sur les réseaux WiFi publics.",
        "Assurez-vous que votre routeur utilise WPA3 ou au minimum WPA2.",
        "Changez les mots de passe par défaut de vos équipements réseau.",
    ],
    "DATA_PROTECTION": [
        "Chiffrez les données sensibles au repos et en transit.",
        "Effectuez des sauvegardes régulières suivant la règle 3-2-1.",
        "Appliquez le principe du moindre privilège pour l'accès aux données.",
    ],
}

# Simple vector store (if FAISS not available)
vector_store: Optional[Any] = None


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


def retrieve_relevant_content(message: str, topic: Optional[str] = None, top_k: int = 3) -> str:
    """
    Retrieve relevant content from knowledge base (simple RAG)
    In production, this would use vector embeddings and FAISS
    """
    try:
        # If topic is provided, prioritize that topic
        if topic and topic in KNOWLEDGE_BASE:
            relevant_items = KNOWLEDGE_BASE[topic][:top_k]
            return "\n- " + "\n- ".join(relevant_items)
        
        # Otherwise, do simple keyword matching
        message_lower = message.lower()
        relevant_items = []
        
        for topic_name, items in KNOWLEDGE_BASE.items():
            # Check if topic name appears in message
            if topic_name.lower() in message_lower:
                relevant_items.extend(items[:2])
        
        # Also check content matching
        for topic_name, items in KNOWLEDGE_BASE.items():
            for item in items:
                if len(relevant_items) >= top_k:
                    break
                # Simple keyword matching
                keywords = ["mot de passe", "phishing", "email", "malware", "sécurité", "données"]
                if any(keyword in item.lower() and keyword in message_lower for keyword in keywords):
                    if item not in relevant_items:
                        relevant_items.append(item)
        
        if relevant_items:
            return "\n- " + "\n- ".join(relevant_items[:top_k])
        
        return "Aucun contenu spécifique trouvé dans la base de connaissances."
        
    except Exception as e:
        logger.error(f"Error retrieving content: {e}")
        return ""


def build_enriched_prompt(
    message: str,
    user_id: Optional[str] = None,
    role: Optional[str] = None,
    context: Optional[ChatContext] = None,
    retrieved_content: Optional[str] = None
) -> str:
    """Build an enriched prompt with RAG context and user info"""
    
    system_prompt = """Tu es CyberSensei, un assistant expert en cybersécurité. 
Tu fournis des réponses claires, précises et pédagogiques sur les sujets de sécurité informatique.
Tu réponds TOUJOURS en français de manière professionnelle et accessible."""

    # Add user context
    if role:
        system_prompt += f"\n\nL'utilisateur a le rôle: {role}"
    
    # Add learning context
    if context:
        if context.topic:
            system_prompt += f"\nSujet actuel: {context.topic}"
        if context.difficulty:
            system_prompt += f"\nNiveau: {context.difficulty}"
        if context.lastResults:
            score = context.lastResults.get('score', 'N/A')
            system_prompt += f"\nDerniers résultats: {score}"
    
    # Add RAG retrieved content
    if retrieved_content:
        system_prompt += f"\n\nContenu pertinent de la base de connaissances:\n{retrieved_content}"
    
    system_prompt += "\n\nRÉPONDS EN FORMAT JSON avec ces champs:"
    system_prompt += "\n- response: ta réponse détaillée"
    system_prompt += "\n- suggestedNextExerciseTopic: suggère un sujet pour le prochain exercice (ex: PHISHING, PASSWORDS, MALWARE, SOCIAL_ENGINEERING, NETWORK_SECURITY, DATA_PROTECTION)"
    system_prompt += "\n- riskHints: liste de 1-3 conseils de sécurité pertinents"
    
    # Mistral Instruct format
    formatted_prompt = f"""[INST] {system_prompt}

Question: {message} [/INST]

{{"""
    
    return formatted_prompt


def parse_json_response(response_text: str) -> Dict[str, Any]:
    """
    Parse JSON response from AI, handling various formats
    """
    try:
        # Try to extract JSON from response
        response_text = response_text.strip()
        
        # If response starts with {, try direct parsing
        if response_text.startswith('{'):
            return json.loads(response_text)
        
        # Try to find JSON in the text
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx+1]
            return json.loads(json_str)
        
        # Fallback: return text as response
        return {
            "response": response_text,
            "suggestedNextExerciseTopic": None,
            "riskHints": []
        }
        
    except json.JSONDecodeException as e:
        logger.warning(f"Failed to parse JSON response: {e}")
        return {
            "response": response_text,
            "suggestedNextExerciseTopic": None,
            "riskHints": []
        }


@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request) -> ChatResponse:
    """
    Chat endpoint - CyberSensei AI with RAG capabilities
    
    Args:
        request: Chat request with userId, role, message, and context
        req: FastAPI request object
    
    Returns:
        ChatResponse with AI response, suggested topic, and risk hints
    """
    try:
        logger.info(f"📨 Chat request from user {request.userId or 'anonymous'}: {request.message[:50]}...")
        
        # Step 1: Retrieve relevant content (RAG)
        topic = request.context.topic if request.context else None
        retrieved_content = retrieve_relevant_content(request.message, topic)
        logger.info(f"📚 Retrieved content for topic: {topic}")
        
        # Step 2: Build enriched prompt
        full_prompt = build_enriched_prompt(
            message=request.message,
            user_id=request.userId,
            role=request.role,
            context=request.context,
            retrieved_content=retrieved_content
        )
        
        # Step 3: Prepare llama.cpp request
        llama_request = {
            "prompt": full_prompt,
            "temperature": request.temperature,
            "n_predict": request.max_tokens,
            "top_p": 0.9,
            "top_k": 40,
            "stop": ["[INST]", "</s>", "\n\n\n"],
            "stream": False
        }
        
        # Step 4: Call llama.cpp server
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
        
        logger.info(f"✅ Raw AI response: {ai_response[:100]}...")
        
        # Step 5: Parse JSON response
        parsed_response = parse_json_response(ai_response)
        
        # Step 6: Extract structured fields
        response_text = parsed_response.get("response", ai_response)
        suggested_topic = parsed_response.get("suggestedNextExerciseTopic")
        risk_hints = parsed_response.get("riskHints", [])
        
        # Ensure risk_hints is a list
        if isinstance(risk_hints, str):
            risk_hints = [risk_hints]
        elif not isinstance(risk_hints, list):
            risk_hints = []
        
        logger.info(f"✅ Response generated with topic suggestion: {suggested_topic}")
        
        return ChatResponse(
            response=response_text,
            suggestedNextExerciseTopic=suggested_topic,
            riskHints=risk_hints
        )
        
    except httpx.TimeoutException:
        logger.error("⏱️ Request timeout")
        raise HTTPException(status_code=504, detail="AI model timeout")
    except httpx.RequestError as e:
        logger.error(f"❌ Request error: {e}")
        raise HTTPException(status_code=503, detail="AI model service unavailable")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        # Return a fallback response
        return ChatResponse(
            response="Je suis désolé, j'ai rencontré un problème en traitant votre demande. Pourriez-vous reformuler votre question ?",
            suggestedNextExerciseTopic="PHISHING" if not request.context or not request.context.topic else request.context.topic,
            riskHints=["Assurez-vous de toujours vérifier les sources avant de partager des informations sensibles."]
        )


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


