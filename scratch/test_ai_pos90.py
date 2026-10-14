import asyncio
import traceback
import time
from app.services.ai.service import ai_service

async def main():
    print("Testing ai_service.explain for P04637, pos 90, mutant V...")
    t0 = time.time()
    try:
        res = await ai_service.explain(
            accession="P04637",
            position=90,
            mutant="V",
            question="Why might this mutation matter structurally?"
        )
        print(f"SUCCESS in {time.time()-t0:.2f}s:")
        print("Answer preview:", res.get("answer")[:300])
        print("Category:", res.get("category"))
        print("Evidence items count:", len(res.get("evidence_items", [])))
    except Exception as e:
        print(f"FAILED in {time.time()-t0:.2f}s:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
