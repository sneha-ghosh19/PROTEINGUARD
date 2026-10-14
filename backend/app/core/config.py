import os
from typing import List, Dict, Optional
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current working dir, and in backend/.env if running from workspace root
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.is_file():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ProteinGuard")
    VERSION: str = os.getenv("VERSION", "0.1.0")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    GITHUB_URL: str = os.getenv("GITHUB_URL", "https://github.com/sneha-ghosh19/PROTEINGUARD")
    
    # Google AI Studio / Gemini API configuration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemma-4-26b-a4b-it")

    @property
    def cors_origins(self) -> List[str]:
        raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    # Feature flags for future screens
    FEATURE_FLAGS: Dict[str, bool] = {
        "mutation_analysis": False,
        "structure_visualization": False,
        "gemma_explanation": False
    }

settings = Settings()
