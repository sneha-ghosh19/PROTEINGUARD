import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv("backend/.env")
key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemma-4-26b-a4b-it")

url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

from app.services.ai.prompt_builder import SYSTEM_INSTRUCTION

# Test 1: Payload WITH systemInstruction
payload_with_sys = {
    "systemInstruction": {
        "parts": [{"text": SYSTEM_INSTRUCTION}]
    },
    "contents": [
        {"role": "user", "parts": [{"text": "Hello, are you ready?"}]}
    ]
}

# Test 2: Payload WITHOUT systemInstruction (system instruction prepended to user prompt)
payload_without_sys = {
    "contents": [
        {"role": "user", "parts": [{"text": f"{SYSTEM_INSTRUCTION}\n\nUser Question: Hello, are you ready?"}]}
    ]
}

def test(name, payload, use_header=False):
    print(f"\n--- Testing {name} (use_header={use_header}) ---")
    headers = {"Content-Type": "application/json"}
    target_url = url
    if use_header:
        target_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        headers["x-goog-api-key"] = key
    
    try:
        res = httpx.post(target_url, json=payload, headers=headers, timeout=30.0)
        print("Status code:", res.status_code)
        if res.status_code == 200:
            data = res.json()
            cand = data.get("candidates", [{}])[0]
            parts = cand.get("content", {}).get("parts", [{}])
            print("Response text excerpt:", str(parts)[:200])
        else:
            print("Error response:", res.text[:300])
    except Exception as e:
        print("Exception:", e)

test("With systemInstruction and header", payload_with_sys, use_header=True)
test("With systemInstruction and query key", payload_with_sys, use_header=False)
test("Without systemInstruction (prepended)", payload_without_sys, use_header=True)
