import os
import json
import httpx
import time
import asyncio
from dotenv import load_dotenv

load_dotenv("backend/.env")
key = os.getenv("GEMINI_API_KEY")
model = "gemma-4-26b-a4b-it"

from app.services.ai.service import ai_service
from app.services.ai.prompt_builder import SYSTEM_INSTRUCTION, build_gemini_contents

async def test_with_retry():
    evidence = await ai_service.build_evidence_context("P04637", 90, "V")
    contents = build_gemini_contents(
        question="Why might this mutation matter structurally?",
        evidence_context=evidence
    )
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048
        }
    }
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": key.strip()
    }
    
    max_retries = 3
    for attempt in range(max_retries):
        t0 = time.time()
        print(f"Calling API (attempt {attempt+1}/{max_retries})...")
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(url, json=payload, headers=headers)
            print(f"Attempt {attempt+1}: status {res.status_code} in {time.time()-t0:.2f}s")
            if res.status_code == 200:
                print("SUCCESSFUL RESPONSE on attempt", attempt+1)
                return True
            elif res.status_code in [500, 503, 504]:
                print(f"Transient error {res.status_code}, waiting 1.5s before retry...")
                await asyncio.sleep(1.5)
            else:
                print("Non-retriable error:", res.status_code, res.text)
                return False
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            print(f"Network error on attempt {attempt+1}: {exc}, retrying...")
            await asyncio.sleep(1.5)
    return False

if __name__ == "__main__":
    asyncio.run(test_with_retry())
