import { DocumentAttachment, ImageAttachment } from '../types';

export interface FileParseResult {
  documents: DocumentAttachment[];
  images: ImageAttachment[];
  error?: string;
}

export async function parseUploadedFiles(files: FileList | File[]): Promise<FileParseResult> {
  const documents: DocumentAttachment[] = [];
  const images: ImageAttachment[] = [];

  const fileArray = Array.from(files);

  for (const file of fileArray) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type || getMimeTypeFromExt(ext);

    // 1. Image Files
    if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
      try {
        const base64Data = await readFileAsDataURL(file);
        images.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          mimeType: mimeType || 'image/png',
          data: base64Data,
          previewUrl: base64Data,
        });
      } catch (err) {
        console.error(`Failed to load image ${file.name}:`, err);
      }
      continue;
    }

    // 2. Document & Code Files
    try {
      if (ext === 'pdf') {
        const base64Data = await readFileAsDataURL(file);
        // Attempt text extraction from PDF or pass base64
        let textContent = '';
        try {
          // Quick text fallback from binary stream or header info
          const rawText = await readFileAsText(file);
          // Filter plain text characters if readable
          const cleanText = rawText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
          if (cleanText.length > 50) {
            textContent = cleanText.substring(0, 15000); // cap text
          }
        } catch {
          // ignore error, base64 will be used by Gemini
        }

        const words = textContent ? textContent.split(/\s+/).filter(Boolean).length : 0;
        const lines = textContent ? textContent.split('\n').length : 0;

        documents.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          size: file.size,
          mimeType: 'application/pdf',
          extension: 'pdf',
          base64: base64Data,
          content: textContent || `[PDF Document: ${file.name}] Attached as binary inline PDF.`,
          previewText: textContent ? textContent.substring(0, 300) : `PDF Document (${formatFileSize(file.size)})`,
          lineCount: lines,
          wordCount: words,
        });
      } else {
        // Text / Markdown / Code / JSON / CSV / Word text files
        const textContent = await readFileAsText(file);
        const words = textContent.split(/\s+/).filter(Boolean).length;
        const lines = textContent.split('\n').length;

        documents.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          size: file.size,
          mimeType: mimeType || 'text/plain',
          extension: ext,
          content: textContent,
          previewText: textContent.substring(0, 300),
          lineCount: lines,
          wordCount: words,
        });
      }
    } catch (err) {
      console.error(`Failed to parse document ${file.name}:`, err);
    }
  }

  return { documents, images };
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getMimeTypeFromExt(ext: string): string {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown',
    markdown: 'text/markdown',
    json: 'application/json',
    csv: 'text/csv',
    xml: 'application/xml',
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    ts: 'text/typescript',
    tsx: 'text/typescript-jsx',
    jsx: 'text/javascript-jsx',
    py: 'text/x-python',
    java: 'text/x-java-source',
    cpp: 'text/x-c++',
    c: 'text/x-c',
    sql: 'application/sql',
    sh: 'application/x-sh',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return map[ext] || 'text/plain';
}
