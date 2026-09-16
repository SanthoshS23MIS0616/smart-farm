from __future__ import annotations

import os
import socket
import sys
from pathlib import Path

# Fix Windows console encoding if needed
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Load .env file
_env_file = ROOT / ".env"
if _env_file.exists():
    for line in _env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())

def is_port_free(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("0.0.0.0", port))
            return True
        except OSError:
            return False

def find_available_port(preferred: int = 8000) -> int:
    env_port = os.environ.get("PORT")
    if env_port:
        return int(env_port)
    for p in [preferred, 8001, 8050, 8081, 8082, 3000]:
        if is_port_free(p):
            return p
    return preferred

if __name__ == "__main__":
    import uvicorn
    port = find_available_port(8000)
    print(f"\n==================================================")
    print(f"  CropAI PWA Server Starting")
    print(f"  URL: http://localhost:{port}")
    print(f"  Manifest: http://localhost:{port}/manifest.json")
    print(f"  Service Worker: http://localhost:{port}/service-worker.js")
    print(f"==================================================\n")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
