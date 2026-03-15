FROM python:3.11-slim

LABEL maintainer="CyberSensei"
LABEL description="CyberSensei Scanner — Microservice d'analyse de sécurité"

# Installer les outils de scan système
RUN apt-get update && apt-get install -y --no-install-recommends \
    nmap \
    dnsutils \
    git \
    curl \
    wget \
    bsdmainutils \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Installer testssl.sh
RUN git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl.sh \
    && ln -s /opt/testssl.sh/testssl.sh /usr/local/bin/testssl.sh

# Installer nuclei
RUN ARCH=$(dpkg --print-architecture) \
    && curl -sSL "https://github.com/projectdiscovery/nuclei/releases/latest/download/nuclei_$(curl -sSL https://api.github.com/repos/projectdiscovery/nuclei/releases/latest | grep tag_name | cut -d'"' -f4 | tr -d v)_linux_${ARCH}.zip" -o /tmp/nuclei.zip \
    && apt-get update && apt-get install -y --no-install-recommends unzip \
    && unzip /tmp/nuclei.zip -d /usr/local/bin/ \
    && rm /tmp/nuclei.zip \
    && nuclei -update-templates || true \
    && apt-get purge -y unzip && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Installer dnstwist
RUN pip install --no-cache-dir dnstwist

# Répertoire de travail
WORKDIR /app

# Copier et installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Utilisateur non-root pour la sécurité
RUN useradd --create-home --shell /bin/bash scanner
USER scanner

ENTRYPOINT ["python", "scanner.py"]
