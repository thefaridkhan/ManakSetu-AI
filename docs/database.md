# Database Schema & Relational Models

Entity-Relationship architecture managed via **Prisma ORM** with **MySQL 8.0**.

---

## Core Entities & Models

### 1. `users`
Stores authenticated users with role-based access (`CONSUMER`, `INDUSTRY_USER`, `ADMIN`).

### 2. `standards`
Authoritative catalogue of Indian Standards.
- `isNumber`: Unique standard identifier (e.g. `IS 10500:2012`).
- `standardNo`: Base number (e.g. `10500`).
- `isMandatoryQCO`: Boolean flag indicating mandatory enforcement.
- `keyRequirements`: JSON array of critical test limits and tolerances.
- `schemeType`: Associated scheme (`SCHEME_I_ISI_MARK`, `SCHEME_II_CRS`, `HALLMARKING`, etc.).

### 3. `documents` & `document_versions`
Supports immutable version history and change detection.
- `contentHash`: SHA-256 hash of standard text.
- `status`: `ACTIVE`, `AMENDED`, `REVISED`, `WITHDRAWN`.

### 4. `document_chunks`
Hierarchical semantic chunks with clause tags (`clauseRef`) and vector embeddings stored as JSON float arrays.

### 5. `certification_schemes` & `products`
Structured metadata defining Scheme I (ISI), Scheme II (CRS), Scheme IV (FMCS), Hallmarking, and ECO Mark.

### 6. `ingestion_jobs` & `retrieval_logs`
Background telemetry tracking sync job status, chunk creation counts, query response times, and grounding confidence scores.
