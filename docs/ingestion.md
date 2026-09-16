# Automated Ingestion & Document Versioning

Specifications for the BIS Knowledge Base synchronization, change detection, and semantic chunking engine.

---

## 1. Incremental Synchronization Lifecycle

```
[Cron Scheduler / Manual Trigger]
        │
        ▼
[Fetch Permitted BIS Document / Metadata]
        │
        ▼
[Calculate Content SHA-256 Hash]
        │
        ▼
[Check Existing Document in MySQL]
        ├── New Document? ────────► Create Document & Version
        │                          Chunk & Generate Embeddings
        │                          Insert Chunks into Vector Store
        │
        └── Exists?
             │
             ├── Hash Matches? ───► SKIP (Zero redundant embeddings)
             │
             └── Hash Differs? ──► Mark Old Version as REVISED
                                  Create New DocumentVersion
                                  Delete Old Chunks & Re-chunk
                                  Generate New Embeddings
```

---

## 2. Clause-Aware Semantic Chunking

Standard text is split along natural standard boundaries rather than arbitrary character counts:
- Preserves **Standard Identifiers** (e.g. `IS 10500:2012`).
- Detects **Clause Headers** (e.g. `Clause 4.1 Microbiological Limits`, `Clause 4.2 Heavy Metals`).
- Attaches structured metadata (`category`, `isMandatoryQCO`, `clauseRef`) to every chunk for fast filtered retrieval.
