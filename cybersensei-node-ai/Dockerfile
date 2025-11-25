# Multi-stage Dockerfile for CyberSensei AI Service
# Stage 1: Build llama.cpp
FROM python:3.11-slim as builder

LABEL maintainer="CyberSensei Team"
LABEL version="1.0.0"
LABEL description="AI service with Mistral 7B and llama.cpp"

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Clone and build llama.cpp
WORKDIR /build
RUN git clone https://github.com/ggerganov/llama.cpp.git
WORKDIR /build/llama.cpp
RUN make -j$(nproc) server

# Stage 2: Runtime
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -m -u 1001 aiuser

# Set working directory
WORKDIR /app

# Copy llama.cpp server from builder
COPY --from=builder /build/llama.cpp/server /app/llama-server

# Copy application files
COPY requirements.txt .
COPY server.py .
COPY run.sh .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create models directory
RUN mkdir -p /app/models && \
    chown -R aiuser:aiuser /app

# Make scripts executable
RUN chmod +x run.sh llama-server

# Switch to non-root user
USER aiuser

# Expose ports
# 8000 - FastAPI server
# 8001 - llama.cpp server (internal)
EXPOSE 8000 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=/app/models/mistral-7b-instruct.Q4_K_M.gguf
ENV LLAMA_HOST=127.0.0.1
ENV LLAMA_PORT=8001
ENV API_PORT=8000

# Start the service
CMD ["./run.sh"]


