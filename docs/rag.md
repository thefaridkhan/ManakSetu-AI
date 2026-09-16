# RAG Architecture & Anti-Hallucination Guard

Detailed specification of the Retrieval-Augmented Generation (RAG) pipeline for the Bureau of Indian Standards Assistant.

---

## 1. RAG Workflow Pipeline

```
User Query (EN / HI / Hinglish)
        │
        ▼
[Query Intent Router & Language Detector]
        │
        ├─ Extracted Standard Numbers (e.g. "IS 10500", "IS 1786")
        ├─ Sector / Category Classifier
        └─ Query Normalization
        │
        ▼
[Hybrid Retrieval Engine]
        ├─ 1. Exact IS Standard relational lookup (Weight: 1.0)
        ├─ 2. Dense Semantic Vector Search (Cosine Similarity, Weight: 0.8)
        └─ 3. BM25 / Clause token matching (Weight: 0.7)
        │
        ▼
[Deduplication & Reciprocal Rank Fusion (RRF)]
        │
        ▼
[Anti-Hallucination Prompt Assembly]
        ├─ System Grounding Constraints
        ├─ Retrieved BIS Gazette Context Blocks
        └─ Language Tone Directives (English / Hindi)
        │
        ▼
[LLM Inference (Gemini 1.5 Flash / OpenAI)]
        │
        ▼
[Response Formatter & Citation Extractor]
        ├─ Verified IS Citations (Identifier, Title, Clause, URL)
        ├─ Grounded Confidence Metric (e.g. 92%)
        └─ Follow-up Suggested Inquiries
```

---

## 2. Anti-Hallucination Directives

The AI assistant operates under strict guardrails:
1. **Never Invent Standard Numbers**: If a user asks for a standard not present in the verified dataset (e.g., asking for an imaginary standard for quantum toothbrushes), the assistant explicitly states that no such Indian Standard exists in official BIS records.
2. **Never Fabricate Regulatory Mandates**: Mandatory Quality Control Orders (QCOs) carry legal penal consequences under the BIS Act, 2016. The assistant only reports a standard as mandatory if backed by an official Gazette notification.
3. **Exact Clause Grounding**: Test limits (e.g. Total Dissolved Solids < 500 mg/l under IS 10500) must cite the corresponding standard number and section.

---

## 3. Bilingual English & Hindi Handling

- **Devanagari Hindi Queries**: Automatically detected via unicode regex (`[\u0900-\u097F]`). The response is translated and presented in formal Hindi while citing the exact standard number (e.g., **IS 10500:2012**).
- **Hinglish Inquiries**: Common transliterated Hindi words (e.g. *kaise, kya, chahiye, paani, sona, loha*) are recognized, normalized, and answered with clarity.
