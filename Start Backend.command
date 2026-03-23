#!/bin/bash
# Double-click this file to start the paid media dashboard backend.
# A Terminal window will open and stay open while the backend is running.

# Load profile so node/npm are in PATH (needed when run by double-click)
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
[ -f "$HOME/.zprofile" ] && source "$HOME/.zprofile"
[ -f "$HOME/.bash_profile" ] && source "$HOME/.bash_profile"
[ -f "$HOME/.profile" ] && source "$HOME/.profile"

cd "$(dirname "$0")/backend" || exit 1

echo "=========================================="
echo "  Bob Evans Paid Media — Backend"
echo "=========================================="
echo ""

if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js was not found."
  echo "Install it from https://nodejs.org then try again."
  echo ""
  echo "This window will stay open for 5 minutes so you can read this."
  read -t 300 || true
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "First-time setup: installing dependencies..."
  npm install || { echo "Install failed. This window will stay open 5 minutes."; read -t 300 || true; exit 1; }
  echo ""
fi

echo "Starting backend. Leave this window OPEN while you use the dashboard."
echo ""
echo "Then open your browser and go to:  http://localhost:5001"
echo ""
echo "To stop: close this window or press Ctrl+C."
echo ""

LOGFILE="$HOME/paid-media-backend-output.txt"
node server.js 2>&1 | tee "$LOGFILE"
EXIT_CODE=${PIPESTATUS[0]}

echo ""
if [ $EXIT_CODE -ne 0 ]; then
  echo "============================================"
  echo "BACKEND EXITED WITH ERROR (code $EXIT_CODE)"
  echo "Everything Node printed is below:"
  echo "============================================"
  if [ -s "$LOGFILE" ]; then
    cat "$LOGFILE"
  else
    echo "(No output from Node - run from Terminal to see the error:)"
    echo "  cd ~/paid-media-dashboard/backend"
    echo "  node server.js"
  fi
  echo "============================================"
  echo "Copy the lines above and share them to get help fixing this."
else
  echo ">>> Backend stopped. >>>"
fi
echo ""
read -t 300 || true
