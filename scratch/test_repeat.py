import os
import json
import httpx
import time
from dotenv import load_dotenv

load_dotenv("backend/.env")
key = os.getenv("GEMINI_API_KEY")
model = "gemma-4-26b-a4b-it"

from app.services.ai.service import ai_service
from app.services.ai.prompt_builder import SYSTEM_INSTRUCTION, build_gemini_contents
import asyncio

async def test_repeat():
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
    
    for i in range(3):
        print(f"\n--- Attempt {i+1} ---")
        t0 = time.time()
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                print(f"Status: {res.status_code} in {time.time()-t0:.2f}s")
                if res.status_code == 200:
                    cand = res.json()["candidates"][0]
                    parts = cand["content"]["parts"]
                    text_parts = [p.get("text", "") for p in parts if not p.get("thought")]
                    print("Answer preview:", "".join(text_parts)[:150].replace("\n", " "))
                else:
                    print("Error:", res.text)
        except Exception as e:
            print("Exception:", e)

if __name__ == "__main__":
    asyncio.run(test_repeat())
