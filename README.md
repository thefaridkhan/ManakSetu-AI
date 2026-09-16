# Bureau of Indian Standards (BIS) AI-Powered Intelligent Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node: 20+](https://img.shields.io/badge/Node-20%2B-green.svg)](https://nodejs.org/)
[![React: 18](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![TypeScript: 5.8](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Prisma: 6](https://img.shields.io/badge/Prisma-6-darkblue.svg)](https://www.prisma.io/)

An enterprise-grade, production-quality, hackathon-ready full-stack intelligent assistant and knowledge retrieval platform for the **Bureau of Indian Standards (BIS)**, serving both **Indian Consumers/Citizens** and **Industries/Manufacturers**.

---

## 🏛️ Project Overview

The **BIS Intelligent Assistant** delivers authoritative, source-grounded answers for Indian Standards (IS), mandatory Quality Control Orders (QCOs), certification schemes (ISI Mark Scheme I, CRS Scheme II, FMCS, Gold Hallmarking, ECO Mark), and consumer grievance redressal via the BIS Care app.

### Key Capabilities

1. **Strict Anti-Hallucination RAG Pipeline**: Every response is grounded in official BIS standards and gazette notifications. The system never fabricates standard numbers, test limits, or regulatory mandates.
2. **Bilingual Support**: Fully understands and answers queries in **English**, **Devanagari Hindi**, and **Hinglish** (e.g. *"cement ke liye BIS standard kaise pata kare?"*).
3. **Automated Ingestion & Versioning**: SHA-256 content hashing detects new/revised standards and avoids re-embedding unchanged documents.
4. **Interactive Compliance Roadmap Generator**: Manufacturers can generate a 5-phase factory licensing checklist, test equipment matrix, and required SIT documents for any IS Standard.
5. **Consumer Protection & Fake ISI Reporting**: Step-by-step guidance for reporting fake ISI marks and verifying 6-digit HUID gold hallmarking on the BIS Care App.
6. **Admin Telemetry & Job Monitor**: Real-time vector store metrics, grounding confidence scores, and background ingestion job logs.

---

## 🏗️ Monorepo Structure

```
├── backend/                    # Express.js + TypeScript + Prisma Backend
│   ├── prisma/schema.prisma    # Relational Database Models (MySQL)
│   ├── src/
│   │   ├── ai/                 # Embeddings, Vector Store, Hybrid Retriever, Prompts, RAG
│   │   ├── ingestion/          # Crawler, Semantic Chunker, SHA-256 Version Sync, Scheduler
│   │   ├── services/           # Business logic (Auth, Chat, Standards, Schemes, Grievance, Admin)
│   │   ├── controllers/        # REST API Controllers
│   │   ├── routes/             # Modular Express Routers
│   │   ├── data/               # Authentic BIS Initial Seed Dataset (50+ Standards)
│   │   └── config/             # Zod Environment & Logger configuration
│   └── tests/                  # Vitest unit tests & RAG grounding benchmark
├── frontend/                   # React + Vite + TypeScript + Tailwind CSS Client
│   ├── src/
│   │   ├── pages/              # Landing, Chat, Standards, Products, Schemes, Grievance, Admin, Auth
│   │   ├── components/         # MessageBubble, CitationDrawer, SuggestedPrompts, Navbar, Footer
│   │   ├── services/           # Axios API Client
│   │   └── context/            # AuthContext & LanguageContext (Bilingual Toggle)
├── docs/                       # Architecture, RAG, Ingestion, API, Database, Deployment Docs
├── docker-compose.yml          # Multi-container Docker configuration
├── .env.example                # Template configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install

# Push database schema to MySQL
npx prisma db push

# Seed 50+ real Indian Standards, schemes, products & generate embeddings
npm run seed

# Start development API server (Port 5000)
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start development UI (Port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Evaluation

### Run Unit Tests
```bash
cd backend
npm run test
```

### Run RAG Grounding Benchmark (15+ BIS Queries)
```bash
cd backend
npm run test:eval
```

---

## 🔑 Default Demo Profiles

| Role | Email | Password |
|---|---|---|
| **BIS Admin Officer** | `admin@bis.gov.in` | `bisadmin123` |
| **Industrial Manufacturer** | `industry@example.com` | `user123` |
| **Consumer Citizen** | `consumer@example.com` | `user123` |

---

## 📜 Documentation Links
- [System Architecture](file:///docs/architecture.md)
- [RAG & Anti-Hallucination Pipeline](file:///docs/rag.md)
- [Ingestion & Version Sync Engine](file:///docs/ingestion.md)
- [REST API Reference](file:///docs/api.md)
- [Database Schema & Models](file:///docs/database.md)
- [Deployment Guide](file:///docs/deployment.md)
