🧬 ProteinGuard

Understand the impact of amino acid mutations on protein structure and function.

ProteinGuard is a computational biology platform designed to help researchers explore amino-acid substitutions and investigate their potential effects on protein properties, conservation, structure, and function.

By bringing together protein sequence analysis, structural visualization, physicochemical comparisons, and an AI-powered research assistant, ProteinGuard aims to make protein mutation analysis more accessible, interactive, and interpretable.

«From amino acid changes to biological insights.»

---

🚨 The Problem

A single amino-acid substitution can influence a protein's stability, molecular interactions, structure, or biological function. However, investigating these effects often requires researchers to navigate multiple bioinformatics tools, databases, structural viewers, and scientific resources.

For students and early-stage researchers, this fragmented workflow can make it difficult to connect a mutation with its possible molecular consequences.

💡 Our Solution

ProteinGuard brings important stages of protein mutation investigation into one platform.

Users can explore amino-acid substitutions, compare physicochemical properties, investigate sequence conservation, visualize available protein structures, and use an AI research assistant to interpret evidence and identify missing information.

Rather than treating every mutation as harmful or beneficial, ProteinGuard emphasizes evidence-based exploration, transparent limitations, and interpretable scientific reasoning.

---

✨ Key Features

1. 🧪 Mutation Lab

- Explore amino-acid substitutions in protein sequences.
- Validate mutation notation against the reference sequence.
- Compare wild-type and mutant amino-acid properties.
- Investigate possible implications for protein structure and function.

2. ⚗️ Physicochemical Property Analysis

Explore how amino-acid substitutions change molecular characteristics, including:

- Molecular weight
- Charge
- Hydrophobicity
- Polarity
- Other relevant amino-acid properties supported by the analysis engine

These comparisons help researchers understand the chemical differences introduced by a mutation.

3. 🧬 Sequence Conservation Analysis

Investigate conservation across related protein sequences using sequence alignment and conservation analysis.

Conservation can provide clues about the potential importance of a residue, although it does not independently establish a mutation's functional or clinical effect.

4. 🧊 3D Protein Explorer

Explore available protein structures through interactive visualization.

Depending on the available structure and analysis data, users can investigate:

- Protein structure and secondary structure
- Mutation-site localization
- Nearby residues and spatial contacts
- Local structural environments

Structure-dependent results require a suitable structure and validated residue mapping. When structural evidence is unavailable, the platform should communicate that limitation instead of inventing contacts or distances.

5. 🤖 AI-Powered Research Assistant

ProteinGuard includes an AI research assistant designed to support scientific investigation.

It is intended to help users explore questions such as:

- Why might a mutation matter structurally?
- Which physicochemical properties change?
- Is the residue conserved across homologs?
- Which nearby residues could be relevant?
- What evidence is still missing?

The assistant is designed to ground explanations in the available analysis and distinguish verified observations from hypotheses and predictions.

AI provider: The language-model integration is configurable during development. Google AI Studio/Gemma 4 integration should be considered complete only after the selected model has been successfully connected and tested.

6. 📄 Research Reports

Generate research-oriented reports that organize mutation-analysis findings and supporting information for further investigation.

Reports should distinguish available evidence, calculated properties, model-generated interpretations, and missing information.

---

🛠️ Technology Stack

Layer| Technologies
Frontend| React, TypeScript
Backend| Python, FastAPI
Scientific computing| Python-based sequence and physicochemical analysis
Sequence conservation| Multiple sequence alignment and conservation analysis
Protein structures| PDB/AlphaFold structure resources and 3D visualization
AI assistant| Configurable language-model API integration
Data exchange| REST APIs and structured analysis results

The final dependency list and supported external services should be confirmed against the current repository.

---

🏗️ System Architecture

User
 │
 ▼
ProteinGuard Frontend
 │
 ├── Mutation Lab
 ├── Property Comparison
 ├── Sequence Conservation
 ├── 3D Protein Explorer
 └── Research Reports
 │
 ▼
FastAPI Backend
 │
 ├── Mutation Analysis
 ├── Amino Acid Properties
 ├── Sequence Alignment
 ├── Structure Retrieval
 ├── Structural Analysis
 └── AI Research Assistant
       │
       ▼
   Configured AI Provider

The modules work together to support an evidence-oriented workflow, from identifying an amino-acid substitution to exploring its possible molecular implications.

---

🚀 Getting Started

Prerequisites

- Python 3.10 or a compatible version required by the project
- Node.js and npm
- Git
- API credentials if the selected external AI or data services require them

1. Clone the repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ProteinGuard

Replace the placeholder with the actual public repository URL.

2. Set up the backend

cd backend
python -m venv .venv

Activate the environment.

Windows PowerShell:

.\.venv\Scripts\Activate.ps1

Install the dependencies listed in the project:

pip install -r requirements.txt

Configure the required environment variables according to the backend configuration. Keep API keys in a local ".env" file and never commit secrets to Git.

Start the backend using the entry point and command documented in the repository.

For example, if the application exposes "app.main:app":

uvicorn app.main:app --reload

The API documentation is commonly available at:

http://127.0.0.1:8000/docs

3. Set up the frontend

Open a new terminal:

cd frontend
npm install
npm run dev

Open the local URL printed by the development server.

These commands assume the repository contains the corresponding scripts and entry points. Follow the actual project configuration if they differ.

---

🔬 Example Workflow

1. Select or provide a supported protein sequence.
2. Enter an amino-acid substitution.
3. Validate the reference residue and mutation notation.
4. Compare wild-type and mutant physicochemical properties.
5. Explore conservation evidence where homologous sequences are available.
6. Open a verified protein structure, if available, to investigate the mutation site.
7. Ask the AI research assistant questions about the available evidence.
8. Review missing information and export a research report.

The availability of individual results depends on the input data, supported identifiers, external resources, and enabled analysis modules.

---

🛡️ Scientific Integrity and Limitations

ProteinGuard is intended for computational research and educational exploration.

- A predicted effect is not an experimentally measured result.
- Sequence conservation alone does not prove functional importance.
- A structural hypothesis does not establish causation.
- Structural contacts require verified structure mapping.
- Experimental fitness measurements are assay-specific.
- DMS fitness scores must not be interpreted automatically as clinical pathogenicity.
- Missing data must be reported transparently rather than fabricated.

ProteinGuard is not a clinical diagnostic tool and should not be used as the sole basis for medical decisions.

---

🔭 Future Scope

Potential future improvements include:

- Support for additional proteins and reference databases.
- Improved mutation-effect analysis using validated, multi-protein datasets.
- More robust structure-aware residue mapping.
- Evidence-linked AI explanations and source citations.
- Better uncertainty reporting and scientific benchmarking.
- Expanded research-report exports.
- Additional automated tests and reproducible analysis pipelines.

These are development opportunities, not claims that every capability is already implemented.

---

👩‍🔬 Who Is It For?

ProteinGuard is designed for:

- Biotechnology and bioinformatics students
- Computational biology researchers
- Protein science enthusiasts
- Students exploring structural biology and mutation analysis
- Developers building tools at the intersection of biology and AI

---

🤝 Contributing

Contributions that improve scientific accuracy, usability, documentation, reproducibility, testing, or support for additional proteins are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change.
4. Add tests where appropriate.
5. Submit a pull request with a clear explanation of the change.

---

🎯 Hackathon Vision

ProteinGuard aims to bridge the gap between protein sequence variation and interpretable molecular analysis.

By combining bioinformatics workflows, structural exploration, and AI-assisted scientific reasoning, the project seeks to make mutation investigation more approachable while keeping scientific evidence and uncertainty at the center.

ProteinGuard — Explore the mutation. Understand the evidence. Investigate the impact.

---

📜 License

Add the project's chosen open-source license here after selecting and committing the corresponding "LICENSE" file.
