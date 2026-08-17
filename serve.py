#!/usr/bin/env python3
"""Depth Video Studio - local static server.

Pure-browser app; this server only enables browser model caching and
avoids file:// quirks. Any static server works (npx serve, python, caddy...).
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    url = f"http://localhost:{PORT}/index.html"
    print(f"Depth Video Studio -> {url}  (Ctrl+C to stop)")
    webbrowser.open(url)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")
