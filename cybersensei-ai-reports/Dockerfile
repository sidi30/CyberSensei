FROM python:3.11-slim

LABEL maintainer="CyberSensei"
LABEL description="CyberSensei AI Reports — Générateur de rapports de sécurité via Claude"

# Dépendances système pour ReportLab (fonts)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfreetype6 \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Utilisateur non-root
RUN useradd --create-home --shell /bin/bash reporter
USER reporter

ENTRYPOINT ["python", "report_generator.py"]
