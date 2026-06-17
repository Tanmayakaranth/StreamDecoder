import os
import sys
import subprocess
import time
import webbrowser
import signal

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "my-app")

    print("\033[1;36m=== ChameleonPerks + StreamDecoder Runner ===\033[0m")
    
    # Check if npm is available
    try:
        subprocess.run(["npm", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True, shell=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("\033[1;31mError: npm is not installed or not in PATH.\033[0m")
        sys.exit(1)

    # Check if python is available
    try:
        subprocess.run(["python", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("\033[1;31mError: python is not installed or not in PATH.\033[0m")
        sys.exit(1)

    # 1. Install frontend node_modules if missing
    node_modules_dir = os.path.join(frontend_dir, "node_modules")
    if not os.path.exists(node_modules_dir):
        print("\033[1;33m[Frontend] node_modules not found. Installing dependencies (npm install)... This may take a moment.\033[0m")
        try:
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True, shell=True)
            print("\033[1;32m[Frontend] Dependencies installed successfully.\033[0m")
        except subprocess.CalledProcessError as e:
            print(f"\033[1;31m[Frontend] Failed to install dependencies: {e}\033[0m")
            sys.exit(1)

    # 2. Spin up FastAPI backend
    print("\033[1;34m[Backend] Starting FastAPI server on port 8000...\033[0m")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    # 3. Spin up React frontend
    print("\033[1;35m[Frontend] Starting Vite dev server...\033[0m")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=True
    )

    # Flag to monitor process shutdown
    running = True

    # Helper function to print output from a process
    def print_logs():
        import threading
        
        def read_stream(process, prefix, color_code):
            for line in iter(process.stdout.readline, ''):
                if not running:
                    break
                print(f"{color_code}{prefix}\033[0m {line.strip()}")
            process.stdout.close()

        t_back = threading.Thread(target=read_stream, args=(backend_process, "[Backend]", "\033[34m"), daemon=True)
        t_front = threading.Thread(target=read_stream, args=(frontend_process, "[Frontend]", "\033[35m"), daemon=True)
        
        t_back.start()
        t_front.start()

    print_logs()

    # Wait a bit, then open browser
    time.sleep(3)
    print("\033[1;32m[System] Launching browser to http://localhost:5173 ...\033[0m")
    webbrowser.open("http://localhost:5173")

    print("\033[1;32m[System] Both services running. Press Ctrl+C to stop.\033[0m")

    try:
        while True:
            # Check if either process terminated unexpectedly
            back_code = backend_process.poll()
            front_code = frontend_process.poll()

            if back_code is not None:
                print(f"\033[1;31m[Backend] Terminated unexpectedly with code {back_code}\033[0m")
                break
            if front_code is not None:
                print(f"\033[1;31m[Frontend] Terminated unexpectedly with code {front_code}\033[0m")
                break
                
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\033[1;33m[System] Shutting down services...\033[0m")
    finally:
        running = False
        # Terminate processes
        try:
            backend_process.terminate()
        except Exception:
            pass
        try:
            frontend_process.terminate()
        except Exception:
            pass

        # Wait a moment and force kill if needed
        time.sleep(1)
        try:
            backend_process.kill()
        except Exception:
            pass
        try:
            frontend_process.kill()
        except Exception:
            pass
        
        print("\033[1;32m[System] All services shut down successfully.\033[0m")

if __name__ == "__main__":
    main()
