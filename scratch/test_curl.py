import os
import subprocess
import json
from dotenv import load_dotenv

load_dotenv("backend/.env")
key = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key={key}"
payload = json.dumps({
    "contents": [
        {
            "parts": [
                {"text": "Explain what a missense mutation is in 2 sentences."}
            ]
        }
    ]
})

cmd = ["curl.exe", "-s", "-X", "POST", url, "-H", "Content-Type: application/json", "-d", payload]
res = subprocess.run(cmd, capture_output=True, text=True)
try:
    data = json.loads(res.stdout)
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    print("SUCCESSFUL GEMMA 4 RESPONSE:\n", text)
except Exception as e:
    print("Error parsing response:", e, "\nRaw stdout:", res.stdout)
