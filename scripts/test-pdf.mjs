// Throwaway script to reproduce the PDF parsing error outside Next.js.
// Usage: node scripts/test-pdf.mjs <path-to-pdf>
import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

const path = process.argv[2];
if (!path) {
  console.error("usage: node scripts/test-pdf.mjs <file.pdf>");
  process.exit(1);
}

const buf = await readFile(path);
const data = new Uint8Array(buf);
console.log("loaded pdf bytes:", data.byteLength);

const parser = new PDFParse({ data });
try {
  const result = await parser.getText();
  console.log("pages:", result.pages.length);
  console.log("first page preview:", result.pages[0]?.text.slice(0, 300));
} catch (e) {
  console.error("PARSE FAILED:");
  console.error(e);
} finally {
  await parser.destroy();
}
