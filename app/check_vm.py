import json
import urllib.request
import asyncio
import sys

# Connect to VM Service HTTP/WS to trigger reload
try:
    import websockets
except ImportError:
    pass

import urllib.request

req = urllib.request.Request(
    'http://127.0.0.1:64094/_gURXJlxII4=/getVM',
    headers={'Content-Type': 'application/json'}
)
try:
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("VM Response:", data.get('type'), data.get('name'))
        isolates = data.get('isolates', [])
        for iso in isolates:
            iso_id = iso.get('id')
            print(f"Found isolate: {iso_id}")
            # Try reloading via HTTP JSON-RPC or sse if supported
except Exception as e:
    print("HTTP check error:", e)
