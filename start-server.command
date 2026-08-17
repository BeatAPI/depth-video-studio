#!/bin/bash
# Depth Video Studio - optional local server (enables model caching)
cd "$(dirname "$0")"
PORT=8765
echo "Depth Video Studio -> http://localhost:${PORT}  (Ctrl+C to stop)"
( sleep 1; open "http://localhost:${PORT}/index.html" ) &
python3 -m http.server ${PORT}
