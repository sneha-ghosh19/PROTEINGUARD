import asyncio
import traceback
import time
from app.services.ai.service import ai_service

async def main():
    print("Calling ai_service.explain directly...")
    t0 = time.time()
    try:
        res = await ai_service.explain(
            accession="P04637",
            position=98,
            mutant="V",
            question="Why might this mutation matter structurally?"
        )
        print(f"SUCCESS in {time.time()-t0:.2f}s:")
        print("Answer:", res.get("answer")[:200] if res.get("answer") else "None")
    except Exception as e:
        print(f"FAILED in {time.time()-t0:.2f}s:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
