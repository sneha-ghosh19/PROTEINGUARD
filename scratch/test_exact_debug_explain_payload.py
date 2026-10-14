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

async def test_full_payload():
    evidence = await ai_service.build_evidence_context("P04637", 98, "V")
    print("Evidence keys:", list(evidence.keys()))
    print("Structure keys:", list(evidence.get("structure", {}).keys()))
    nearby = evidence.get("structure", {}).get("nearby_residues", [])
    print(f"Nearby residues count: {len(nearby)}")
    print("First 2 nearby residues:", nearby[:2])

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
    
    payload_json = json.dumps(payload, indent=2)
    print("Payload size in bytes:", len(payload_json))
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": key.strip()
    }
    
    print("\nSending exact payload to Google AI Studio...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(url, json=payload, headers=headers)
        print("Status code:", res.status_code)
        if res.status_code != 200:
            print("Error body:", res.text)
        else:
            print("Success! Candidate count:", len(res.json().get("candidates", [])))
            cand = res.json()["candidates"][0]
            print("Finish reason:", cand.get("finishReason"))
            parts = cand.get("content", {}).get("parts", [])
            for i, p in enumerate(parts):
                print(f"Part {i} keys: {list(p.keys())}, thought: {p.get('thought')}")
                print(f"Part {i} text preview: {p.get('text', '')[:150]}")

if __name__ == "__main__":
    asyncio.run(test_full_payload())
