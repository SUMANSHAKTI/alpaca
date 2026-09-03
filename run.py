import subprocess
import sys
import time
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import socket

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        return s.connect_ex(("127.0.0.1", port)) == 0

def run_servers():
    print("=" * 60)
    print(" STARTING ALPHA HUNTER -- Autonomous AI Trading Scientist")
    print("=" * 60)
    
    backend_proc = None
    frontend_proc = None

    # 1. Start FastAPI Backend (if not already running)
    if is_port_in_use(8000):
        print("[1/2] FastAPI Backend is already running on http://127.0.0.1:8000")
    else:
        print("[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
        backend_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
        backend_proc = subprocess.Popen(backend_cmd, cwd=os.path.join(os.getcwd(), "backend"))
        time.sleep(2)
    
    # 2. Start Vite Frontend (if not already running)
    if is_port_in_use(3000):
        print("[2/2] React Frontend is already running on http://localhost:3000")
    else:
        print("[2/2] Starting React Frontend on http://localhost:3000 ...")
        frontend_cmd = ["npm.cmd" if os.name == "nt" else "npm", "run", "dev"]
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=os.path.join(os.getcwd(), "frontend"))
    
    print("\n✅ ALPHA HUNTER is live!")
    print("  ► Frontend: http://localhost:3000")
    print("  ► API Docs: http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to stop servers.")
    
    try:
        if backend_proc:
            backend_proc.wait()
        if frontend_proc:
            frontend_proc.wait()
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping servers...")
        if backend_proc:
            backend_proc.terminate()
        if frontend_proc:
            frontend_proc.terminate()

if __name__ == "__main__":
    run_servers()
