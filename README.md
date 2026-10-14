# ProteinGuard 🧬

> **Explainable Amino-Acid Mutation Analysis Platform**

ProteinGuard is an open-source, explainable platform for exploring the biochemical and structural impact of amino-acid substitutions in proteins. It transforms raw sequence, structural, and evolutionary conservation data into clear, evidence-grounded scientific reasoning.

---

> ⚠️ **Scientific Disclaimer:** ProteinGuard provides computational research and educational insights. It does **NOT** diagnose disease, predict clinical outcomes, or replace experimental validation or professional medical advice.

---

## 🎯 Architecture & Pipeline

```text
Screen 2 (Mutation Lab)
   ↓
Mutation Object (e.g. P04637:A98V)
   ↓
FastAPI Backend
   ├── Physicochemical Engine (Side-chain volume, MW, charge, KD hydrophobicity)
   ├── Conservation Engine (UniProt ortholog retrieval + Shannon entropy MSA alignment)
   └── Structure Engine (RCSB PDB REST API + 6.0 Å spatial contact neighborhood + secondary structure)
          ↓
   Structured Evidence Object
          ↓
Screen 3 (Analysis Dashboard)
          ↓
Screen 4 (3D Viewer + Gemma 4 AI Assistant)
```

---

## 📌 Implementation Roadmap & Screen Status

| Module / Screen | Description | Status |
|---|---|---|
| **Screen 1 — Landing Page** | Hero, interactive molecular metaphor, workflow, open source philosophy, Gemma 4 architecture, backend foundation | ✅ **Completed** |
| **Screen 2 — Mutation Lab** | UniProt retrieval, sequence viewer, residue selector, mutation validation, property shifts, Mutation Playground (19 alternatives) | ✅ **Completed** |
| **Screen 3 — Analysis Dashboard** | Multi-dimensional evidence dashboard: Shannon entropy sequence conservation, RCSB PDB structural context, 2D 6Å residue environment, independent 4-pillar evidence overview, side-by-side mutation comparison, mandatory limitations | ✅ **Completed** |
| **Screen 4 — 3D Explorer + Gemma 4 AI Assistant** | 3D spatial micro-environment viewer & grounded Gemma 4 explanation layer | ⏳ **Next Step** |

---

## 🔬 Screen 3 — Analysis Dashboard Features

Screen 3 is the scientific evidence dashboard of ProteinGuard. It operates with strict separation between **DATA → COMPUTATION → EVIDENCE → INTERPRETATION**.

### Key Computational Modules
1. **Physicochemical Shifts Engine:** Evaluates molecular weight, KD hydrophobicity, net charge, volume, polarity, and side-chain class changes.
2. **Sequence Conservation Engine:** Fetches UniProt homologous sequence sets, performs alignment window mapping, and calculates normalized **Shannon Entropy** ($H = -\sum p_i \log_2 p_i$) and residue frequency distributions.
3. **Structural Context & Contacts Engine:** Integrates RCSB PDB REST API to retrieve experimental structures, map residue coordinates, identify secondary structure, solvent accessibility, and compute 6.0 Å 3D atomic contact neighborhoods.
4. **Independent 4-Pillar Evidence Summary:** Displays evidence across 4 isolated categories without composite or fake risk scores.
5. **Mutation Playground Comparison:** Allows comparing the active variant against any of the 19 alternative substitutions at the same position.
6. **Scientific Limitations & Boundaries:** Clearly details methodological parameters and disclaimers.

---

## ⚡ API Endpoints (Screen 3)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/analysis/{accession}/{position}/{mutant}` | Retrieves comprehensive structured analysis evidence |
| `POST` | `/api/v1/conservation/analyze` | Calculates Shannon entropy and MSA residue frequencies |
| `POST` | `/api/v1/structure/analyze` | Fetches PDB coordinates, secondary structure & 6.0 Å contacts |
| `POST` | `/api/v1/mutations/compare` | Compares two substitutions at the same sequence position |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript (Strict Mode)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 (Vanilla dark scientific design system)
- **Icons:** Lucide React & Custom SVG graphics
- **Routing:** React Router DOM v7

### Backend
- **Framework:** Python 3.11+ / FastAPI
- **Validation:** Pydantic v2
- **Server:** Uvicorn (ASGI)
- **Testing:** Pytest (17 unit & integration tests)

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10 or higher

---

### 2. Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
# Activate venv:
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Verify backend endpoints:
- Swagger Documentation: `http://127.0.0.1:8000/api/v1/docs`

---

### 3. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## 📜 License & Citation

ProteinGuard is released under the **Apache 2.0 / MIT License**.
