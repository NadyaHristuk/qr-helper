import { NextRequest, NextResponse } from 'next/server';

// Bound bytes before JSON parsing and Zod validation, including chunked bodies.
export async function readJson(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing JSON');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 65536) {
      await reader.cancel();
      throw new Error('Request body exceeds 64 KiB');
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function invalidJson() {
  return NextResponse.json({ error: 'Invalid JSON or request exceeds 64 KiB' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
}
