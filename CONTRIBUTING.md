# Contributing to ProteinGuard 🧬

Thank you for your interest in contributing to **ProteinGuard**! We welcome contributions from developers, bioinformaticians, researchers, computational biologists, and students.

---

## 🔬 Scientific Integrity Policy

ProteinGuard is an explainable scientific tool. To maintain research-grade credibility:

1. **Cite Data Sources:** Always document and cite database sources (UniProt, PDB, AlphaFold DB, ESM, etc.).
2. **Distinguish Predictions from Evidence:** Clearly differentiate computational predictions from experimentally validated findings.
3. **No Unsupported Medical Claims:** Do **NOT** include code, text, or features claiming clinical diagnosis, therapeutic efficacy, or disease causation.
4. **Document Computational Methods:** Ensure all scoring algorithms, substitution matrices, and spatial distance metrics are fully documented.
5. **No Hallucinated Evidence:** Never present AI-generated text as raw experimental data. Gemma 4 is used strictly as an explanation layer over structured, deterministic evidence graphs.

---

## 🚀 Getting Started

### 1. Fork and Clone
Fork the repository on GitHub and clone your fork locally:

```bash
git clone https://github.com/<your-username>/PROTEINGUARD.git
cd ProteinGuard
```

### 2. Create a Feature Branch
Create a descriptive branch for your work:

```bash
git checkout -b feature/biochemical-charge-calculator
# or
git checkout -b fix/cors-header-parsing
```

### 3. Run Locally
Refer to [README.md](README.md) for detailed instructions on starting both the FastAPI backend and Vite React frontend.

---

## 💻 Coding Standards

### Frontend (React + TypeScript)
- Use **TypeScript strict mode**. Do not use `any` unless strictly necessary.
- Keep components small, focused, and reusable.
- Use **Tailwind CSS v4** design tokens and classes. Avoid inline style tags.
- Run typechecking before committing:
  ```bash
  cd frontend
  npm run build
  ```

### Backend (Python + FastAPI)
- Target **Python 3.11+**.
- Write type hints for all function signatures and routes.
- Use **Pydantic v2** models for request/response validation.
- Do not commit mock or dummy scientific data. If an endpoint is unimplemented, return clear feature-flag metadata or explicit HTTP 501 / 404 responses.

---

## 📬 Submitting a Pull Request (PR)

1. Ensure all local tests and build checks pass (`npm run build` in `frontend`).
2. Keep PRs focused on a single feature or bugfix.
3. Include a clear title and description explaining:
   - What changed
   - Why the change was made
   - How to verify the change
4. Link relevant open issues.

---

## 💬 Community & Code of Conduct

Please treat all contributors with kindness, respect, and constructive collaboration. We are building a open scientific community for everyone.
