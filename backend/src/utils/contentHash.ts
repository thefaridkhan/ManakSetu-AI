import crypto from 'crypto';

export function computeSha256(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

export function computeObjectHash(obj: any): string {
  const serialized = JSON.stringify(obj, Object.keys(obj).sort());
  return computeSha256(serialized);
}
