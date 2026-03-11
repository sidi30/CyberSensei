"""Point d'entree du service CyberSensei AI Security."""

import uvicorn
from app.config import API_PORT

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=API_PORT,
        log_level="info",
    )
