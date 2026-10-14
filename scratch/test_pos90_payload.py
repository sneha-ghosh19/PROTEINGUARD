import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv("backend/.env")
key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemma-4-26b-a4b-it")

from app.services.ai.service import ai_service
from app.services.ai.prompt_builder import SYSTEM_INSTRUCTION, build_gemini_contents
import asyncio

async def test_pos90():
    evidence = await ai_service.build_evidence_context("P04637", 90, "V")
    print("Evidence for pos 90:")
    print(json.dumps(evidence, indent=2))

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
    
    print("\nCalling Google AI Studio for pos 90 with model:", model)
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(url, json=payload, headers=headers)
        print("Status code:", res.status_code)
        print("Response text:", res.text[:500])

    # Also test model gemma-4-31b-it
    print("\nCalling Google AI Studio for pos 90 with model: gemma-4-31b-it")
    url_31b = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent"
    async with httpx.AsyncClient(timeout=60.0) as client:
        res_31b = await client.post(url_31b, json=payload, headers=headers)
        print("Status code for 31b:", res_31b.status_code)
        print("Response text for 31b:", res_31b.text[:500])

if __name__ == "__main__":
    asyncio.run(test_pos90())
