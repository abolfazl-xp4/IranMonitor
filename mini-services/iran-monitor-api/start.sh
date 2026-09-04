#!/bin/bash
# Start the IranMonitor Python API server (auto-restart on crash)
cd "$(dirname "$0")"
while true; do
  echo "[$(date)] Starting Python API server on port 8000..."
  python3 -m uvicorn index:app --host 0.0.0.0 --port 8000 --limit-concurrency 10
  echo "[$(date)] Server stopped (exit code $?). Restarting in 3s..."
  sleep 3
done
