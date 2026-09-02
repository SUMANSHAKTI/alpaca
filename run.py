import subprocess
import sys
import time
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def run_servers():
    print("=" * 60)
    print(" STARTING ALPHA HUNTER -- Autonomous AI Trading Scientist")
    print("=" * 60)
    
    # 1. Start FastAPI Backend
    print("[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=os.path.join(os.getcwd(), "backend"))
    
    time.sleep(2)
    
    # 2. Start Vite Frontend
    print("[2/2] Starting React Frontend on http://localhost:3000 ...")
    frontend_cmd = ["npm.cmd" if os.name == "nt" else "npm", "run", "dev"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=os.path.join(os.getcwd(), "frontend"))
    
    print("\n✅ ALPHA HUNTER is live!")
    print("  ► Frontend: http://localhost:3000")
    print("  ► API Docs: http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to stop both servers.")
    
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    run_servers()
