import { describe, it, expect } from 'vitest';
import { queryRouter } from '../src/ai/agents/queryRouter.js';
import { detectLanguage, extractStandardNumbers } from '../src/utils/textNormalizer.js';
import { computeSha256 } from '../src/utils/contentHash.js';
import { semanticChunker } from '../src/ingestion/chunker/semanticChunker.js';

describe('Text Normalizer & Language Detector', () => {
  it('should detect English queries', () => {
    expect(detectLanguage('What is the standard for drinking water?')).toBe('en');
  });

  it('should detect Devanagari Hindi queries', () => {
    expect(detectLanguage('पेयजल के लिए कौन सा मानक है?')).toBe('hi');
  });

  it('should detect Hinglish queries', () => {
    expect(detectLanguage('cement ke liye BIS standard kaise pata kare?')).toBe('hinglish');
  });

  it('should extract IS standard numbers accurately', () => {
    const text = 'Check IS 10500:2012 and also is 14543 for bottled water.';
    const stds = extractStandardNumbers(text);
    expect(stds).toContain('IS 10500:2012');
    expect(stds).toContain('IS 14543');
  });
});

describe('Query Router & Intent Classification', () => {
  it('should route standard search queries', () => {
    const res = queryRouter.classify('Show me the specifications of IS 1786 steel rebars');
    expect(res.intent).toBe('STANDARDS_SEARCH');
  });

  it('should route grievance and complaint queries', () => {
    const res = queryRouter.classify('How do I report a fake ISI mark toy shop using BIS Care app?');
    expect(res.intent).toBe('GRIEVANCE');
  });

  it('should route manufacturer compliance questions', () => {
    const res = queryRouter.classify('I want to manufacture PVC cables. What factory testing equipment do I need?');
    expect(res.intent).toBe('PRODUCT_COMPLIANCE');
  });
});

describe('Content Hash & Versioning Integrity', () => {
  it('should produce consistent SHA-256 hashes', () => {
    const content = 'IS 10500:2012 Drinking Water Specification';
    const hash1 = computeSha256(content);
    const hash2 = computeSha256(content);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });
});

describe('Semantic Chunker', () => {
  it('should chunk standards preserving clause references', () => {
    const raw = `Clause 1.1 Scope
This standard covers drinking water.

Clause 4.1 Microbiological Limits
E. Coli shall be absent.

Clause 4.2 Heavy Metals
Lead max 0.01 mg/l.`;

    const chunks = semanticChunker.chunkStandard('IS 10500', 'Drinking Water', raw);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.some(c => c.clauseRef?.includes('Clause'))).toBe(true);
  });
});
