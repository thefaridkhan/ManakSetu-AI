export interface ChunkOutput {
  chunkIndex: number;
  clauseRef?: string;
  content: string;
  tokenCount: number;
  metadata: any;
}

export class SemanticChunker {
  /**
   * Chunks standards text preserving Clause boundaries (e.g. "Clause 4.1", "Section 2", "Table 1")
   */
  chunkStandard(
    docIdentifier: string,
    title: string,
    rawText: string,
    metadata: any = {}
  ): ChunkOutput[] {
    const chunks: ChunkOutput[] = [];
    
    // Split by Clause headers or double newlines
    const clauseRegex = /(?=(?:Clause|Section|CL\.|Article)\s+\d+(?:\.\d+)*)/i;
    const rawSections = rawText.split(clauseRegex).filter(s => s.trim().length > 30);

    if (rawSections.length === 0) {
      // Fallback to paragraph chunking
      const paragraphs = rawText.split(/\n\n+/).filter(p => p.trim().length > 20);
      paragraphs.forEach((p, idx) => {
        const content = `${title} [${docIdentifier}]\n${p.trim()}`;
        chunks.push({
          chunkIndex: idx,
          content,
          tokenCount: Math.ceil(content.split(/\s+/).length * 1.3),
          metadata: { ...metadata, docIdentifier, title }
        });
      });
      return chunks;
    }

    rawSections.forEach((sec, idx) => {
      const match = sec.match(/(?:Clause|Section|CL\.)\s+([\d\.]+)/i);
      const clauseRef = match ? `Clause ${match[1]}` : undefined;
      const content = `${title} [${docIdentifier}] ${clauseRef ? `(${clauseRef})` : ''}\n${sec.trim()}`;

      chunks.push({
        chunkIndex: idx,
        clauseRef,
        content,
        tokenCount: Math.ceil(content.split(/\s+/).length * 1.3),
        metadata: { ...metadata, docIdentifier, title, clauseRef }
      });
    });

    return chunks;
  }
}

export const semanticChunker = new SemanticChunker();
