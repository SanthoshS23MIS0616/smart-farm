import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import uvicorn
from backend.app.main import app

if __name__ == "__main__":
    # Koyeb / Render / HF Spaces all inject PORT env variable
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting CropAI Platform on port {port}...")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port)
