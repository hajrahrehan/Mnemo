import { PDFParse } from "pdf-parse";

export interface PdfPage {
  page: number;
  text: string;
}

/** Extract text per page from a PDF buffer. */
export async function extractPagesFromPdf(
  file: Buffer | Uint8Array,
): Promise<PdfPage[]> {
  const data = file instanceof Uint8Array ? file : new Uint8Array(file);
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return result.pages.map((p) => ({ page: p.num, text: p.text.trim() }));
  } finally {
    await parser.destroy();
  }
}

/** Chunk pages into passages of ~{targetChars} characters for the LLM. */
export function chunkPages(
  pages: PdfPage[],
  targetChars = 2500,
): Array<{ startPage: number; endPage: number; text: string }> {
  const chunks: Array<{ startPage: number; endPage: number; text: string }> = [];
  let buffer = "";
  let startPage = pages[0]?.page ?? 1;
  let lastPage = startPage;

  for (const { page, text } of pages) {
    if (!text) continue;
    if (buffer.length + text.length > targetChars && buffer) {
      chunks.push({ startPage, endPage: lastPage, text: buffer.trim() });
      buffer = "";
      startPage = page;
    }
    buffer += (buffer ? "\n\n" : "") + text;
    lastPage = page;
  }
  if (buffer.trim()) {
    chunks.push({ startPage, endPage: lastPage, text: buffer.trim() });
  }
  return chunks;
}
