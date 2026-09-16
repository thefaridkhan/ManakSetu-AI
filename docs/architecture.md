# System Architecture: BIS Intelligent Standards Assistant

An enterprise-grade, source-grounded intelligent assistant and knowledge platform developed for the **Bureau of Indian Standards (BIS)**.

---

## 1. High-Level Architecture

```
                                 ┌───────────────────────────┐
                                 │   React + Vite Frontend   │
                                 │  (Tailwind CSS, TS, i18n) │
                                 └─────────────┬─────────────┘
                                               │
                                       REST / JSON / JWT
                                               │
                                 ┌─────────────▼─────────────┐
                                 │    Express.js REST API    │
                                 │   (TypeScript, Helmet)    │
                                 └─────────────┬─────────────┘
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         │                     │                     │
                ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
                │  Query Router   │   │ Hybrid Retriever│   │ Version Sync &  │
                │  & Classifier   │   │  (Dense + BM25) │   │ Ingestion Cron  │
                └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
                         │                     │                     │
                         └─────────────────────┼─────────────────────┘
                                               │
                         ┌─────────────────────┴─────────────────────┐
                         │                                           │
                ┌────────▼────────┐                         ┌────────▼────────┐
                │    MySQL DB     │                         │  Vector Store / │
                │  (Prisma ORM)   │                         │ LLM API Service │
                └─────────────────┘                         └─────────────────┘
```

---

## 2. Core Architectural Layers

### A. Frontend Layer (`frontend/`)
- **Single Page Application (SPA)** built with React 18, TypeScript, and Vite.
- **Styling & UI**: Tailwind CSS styled with government enterprise palettes (Deep Ashoka Blue `#0F2C59`, Saffron `#EA580C`, Emerald `#0F766E`, and Glassmorphism panels).
- **Key Modules**:
  1. *Landing Hub*: Persona-based navigation (Citizen / Consumer vs Industry / Manufacturer).
  2. *Conversational RAG Studio*: Real-time chat with inline citation cards, confidence indicators, and interactive slide-over drawer.
  3. *Standards Directory*: Multi-faceted search by IS number, sector, mandatory QCO status, and ICS code.
  4. *Compliance Checklist Wizard*: Interactive 5-phase factory licensing roadmap generator.
  5. *Consumer Grievance Guide*: Step-by-step reporting instructions for fake ISI marks and gold hallmarking fraud.
  6. *Admin Ingestion Telemetry*: Live knowledge base monitors, document version logs, and sync triggers.

### B. REST API & Middleware Layer (`backend/src/`)
- **Framework**: Express.js with TypeScript and modular routing.
- **Security**: JWT authentication, Helmet security headers, CORS origin whitelist, prompt injection regex guards, and IP rate limiters.
- **Error Handling**: Centralized error interceptor providing uniform JSON envelopes (`{ success, message, errorCode, data }`).

### C. AI / RAG & Knowledge Retrieval Layer (`backend/src/ai/`)
- **Query Router**: Classifies incoming questions into `STANDARDS_SEARCH`, `PRODUCT_COMPLIANCE`, `CERTIFICATION_SCHEME`, `GRIEVANCE`, or `GENERAL_RAG`.
- **Hybrid Retriever**: Dense vector cosine similarity blended with exact IS Standard relational records and BM25 token matching.
- **Anti-Hallucination Prompt Engine**: System constraints enforcing source grounding, mandatory IS standard citations, and clear declaration of unknowns.
- **Bilingual Translation**: Detects and responds in English, Devanagari Hindi, or Hinglish while referencing official English BIS gazettes.

### D. Data Persistence & Ingestion Layer (`backend/src/ingestion/`)
- **Relational DB**: MySQL 8.0 via Prisma ORM for relational models (Users, Standards, Products, Schemes, Chunks, Versions, Jobs, Grievances, Feedback).
- **Document Versioning**: SHA-256 content hashing to detect modified standards and prevent re-embedding unchanged documents.
- **Automated Scheduler**: Background cron worker running sync tasks without blocking live HTTP traffic.
