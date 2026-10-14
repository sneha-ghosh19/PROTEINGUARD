import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv("backend/.env")
key = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
res = httpx.get(url, timeout=15.0)
print("Status:", res.status_code)
if res.status_code == 200:
    models = res.json().get("models", [])
    print(f"Total models: {len(models)}")
    for m in models:
        name = m.get("name")
        methods = m.get("supportedGenerationMethods", [])
        if "generateContent" in methods:
            print(f"- {name} (inputLimit: {m.get('inputTokenLimit')}, outputLimit: {m.get('outputTokenLimit')})")
else:
    print("Error:", res.text)
