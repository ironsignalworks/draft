import { ExportOptionsSchema, ExportSharePayloadSchema } from './schemas';

export interface ExportOptions {
  title?: string;
  quality: number;
  compression: boolean;
  includeMetadata: boolean;
  watermark: boolean;
  fontSize?: number;
}

export interface ExportSharePayload {
  title: string;
  content: string;
  options: ExportOptions;
  createdAt: string;
}

function sanitizeFileName(input: string): string {
  const trimmed = input.trim();
  const fallback = 'draft-export';
  const value = trimmed.length > 0 ? trimmed : fallback;
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseMarkdownImageLine(line: string): { alt: string; src: string; title: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^!\[([^\]]*)\]\((.+)\)$/);
  if (!match) return null;

  const alt = match[1] ?? '';
  const rawBody = (match[2] ?? '').trim();
  if (!rawBody) return null;

  const withOptionalTitle = rawBody.match(/^(.*\S)\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*$/);
  const srcToken = (withOptionalTitle ? withOptionalTitle[1] : rawBody).trim();
  if (!srcToken) return null;

  const normalizedSrc =
    srcToken.startsWith('<') && srcToken.endsWith('>') && srcToken.length > 2
      ? srcToken.slice(1, -1).trim()
      : srcToken;
  if (!normalizedSrc) return null;

  const rawTitleToken = withOptionalTitle?.[2] ?? '';
  const title =
    rawTitleToken.length >= 2 &&
    ((rawTitleToken.startsWith('"') && rawTitleToken.endsWith('"')) ||
      (rawTitleToken.startsWith("'") && rawTitleToken.endsWith("'")))
      ? rawTitleToken.slice(1, -1)
      : '';

  return { alt, src: normalizedSrc, title };
}

function renderPrintableHtmlFromMarkdown(source: string): string {
  const lines = source.split(/\r?\n/);
  const blocks: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      blocks.push('<div class="spacer"></div>');
      continue;
    }

    const imageBlock = parseMarkdownImageLine(trimmed);
    if (imageBlock) {
      const alt = escapeHtml(imageBlock.alt || 'image');
      const src = escapeHtml(imageBlock.src || '');
      const title = escapeHtml(imageBlock.title || '');
      blocks.push(
        `<figure class="image-block"><img src="${src}" alt="${alt}" ${title ? `title="${title}"` : ''} /></figure>`,
      );
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const depth = Math.min(6, headingMatch[1].length);
      const text = escapeHtml(headingMatch[2]);
      blocks.push(`<h${depth}>${text}</h${depth}>`);
      continue;
    }

    blocks.push(`<p>${escapeHtml(trimmed)}</p>`);
  }

  return blocks.join('\n');
}

export function openPdfPrintPreview(content: string, options: ExportOptions): boolean {
  const docTitle = (options.title?.trim() || 'Draft Export').slice(0, 120);
  const renderedBody = renderPrintableHtmlFromMarkdown(content);
  const escapedTitle = escapeHtml(docTitle);
  const bodyFontSize = Math.max(1, Math.round(options.fontSize ?? 13));

  const popup = window.open('', '_blank');
  if (!popup) {
    return false;
  }

  popup.document.open();
  popup.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapedTitle}</title>
    <style>
      @page { size: A4; margin: 18mm; }
      body {
        font-family: Inter, Arial, sans-serif;
        color: #111827;
        background: #ffffff;
        margin: 0;
        padding: 0;
      }
      .page {
        position: relative;
        padding: 0;
        margin: 0 auto;
        max-width: 210mm;
      }
      h1 {
        font-size: 20px;
        margin: 0 0 6px;
      }
      .content {
        font-size: ${bodyFontSize}px;
        line-height: 1.55;
      }
      .content * {
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      .content p {
        margin: 0 0 10px;
      }
      .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
        margin: 0 0 10px;
        line-height: 1.3;
      }
      .content h1 { font-size: 24px; }
      .content h2 { font-size: 20px; }
      .content h3 { font-size: 18px; }
      .content .spacer {
        height: 10px;
      }
      .content .image-block {
        margin: 0 0 12px;
        break-inside: avoid;
      }
      .content .image-block img {
        max-width: 100%;
        max-height: 720px;
        object-fit: contain;
        border-radius: 4px;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="content">${renderedBody}</div>
    </div>
  </body>
</html>`);
  popup.document.close();

  const printWhenReady = () => {
    const doc = popup.document;
    const images = Array.from(doc.images);
    if (images.length === 0) {
      popup.focus();
      popup.print();
      return;
    }

    let pending = images.length;
    const finish = () => {
      pending -= 1;
      if (pending <= 0) {
        popup.focus();
        popup.print();
      }
    };

    images.forEach((image) => {
      if (image.complete) {
        finish();
      } else {
        image.addEventListener('load', finish, { once: true });
        image.addEventListener('error', finish, { once: true });
      }
    });

    window.setTimeout(() => {
      if (pending > 0) {
        popup.focus();
        popup.print();
      }
    }, 1800);
  };

  window.setTimeout(printWhenReady, 100);

  return true;
}

function hasImageMarkdown(content: string): boolean {
  return content.split(/\r?\n/).some((line) => parseMarkdownImageLine(line) !== null);
}

function hasMarkdownFormatting(content: string): boolean {
  const source = content ?? '';
  return /(^|\n)\s{0,3}(#{1,6}\s|\* |- |\d+\.\s|>|```)|(\*\*[^*]+\*\*)|(_[^_]+_)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/.test(
    source,
  );
}

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapTextByWidth(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];
  const words = line.split(/\s+/);
  const output: string[] = [];
  let current = '';
  for (const word of words) {
    if (!word) continue;
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) output.push(current);
    if (word.length > maxChars) {
      for (let i = 0; i < word.length; i += maxChars) {
        output.push(word.slice(i, i + maxChars));
      }
      current = '';
    } else {
      current = word;
    }
  }
  if (current) output.push(current);
  return output.length > 0 ? output : [''];
}

function buildSimplePdf(content: string, fontSize: number): Uint8Array {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginX = 52;
  const marginTop = 64;
  const safeFontSize = Math.max(1, Math.round(fontSize));
  const lineHeight = Math.max(12, Math.round(safeFontSize * 1.35));
  const maxCharsPerLine = Math.max(1, Math.floor((pageWidth - marginX * 2) / (safeFontSize * 0.55)));
  const maxLinesPerPage = Math.max(1, Math.floor((pageHeight - marginTop - 60) / lineHeight));
  const source = content ?? '';

  const wrappedLines = source
    .split(/\r?\n/)
    .flatMap((line) => (line.trim().length === 0 ? [''] : wrapTextByWidth(line, maxCharsPerLine)));
  const pages: string[][] = [];
  for (let i = 0; i < wrappedLines.length; i += maxLinesPerPage) {
    pages.push(wrappedLines.slice(i, i + maxLinesPerPage));
  }
  if (pages.length === 0) pages.push(['']);

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];
  let nextId = 4;
  for (let i = 0; i < pages.length; i += 1) {
    pageObjectIds.push(nextId++);
    contentObjectIds.push(nextId++);
  }

  const kids = pageObjectIds.map((id) => `${id} 0 R`).join(' ');
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [ ${kids} ] /Count ${pages.length} >>\nendobj\n`);
  objects.push('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  pages.forEach((lines, pageIndex) => {
    const pageId = pageObjectIds[pageIndex];
    const contentId = contentObjectIds[pageIndex];
    objects.push(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`,
    );

    const linesContent = lines.map((line) => `(${escapePdfText(line)}) Tj`).join('\nT*\n');
    const stream = `BT\n/F1 ${safeFontSize} Tf\n${lineHeight} TL\n${marginX} ${pageHeight - marginTop} Td\n${linesContent}\nET`;
    objects.push(`${contentId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  });

  const header = '%PDF-1.4\n';
  const body = objects.join('');
  const objectCount = objects.length;
  const offsets: number[] = [0];
  let cursor = header.length;
  for (const obj of objects) {
    offsets.push(cursor);
    cursor += obj.length;
  }
  const xrefOffset = cursor;
  let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objectCount; i += 1) {
    xref += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const pdf = `${header}${body}${xref}${trailer}`;
  return new TextEncoder().encode(pdf);
}

export function downloadPdfFile(content: string, options: ExportOptions): boolean {
  try {
    const title = (options.title?.trim() || 'Draft Export').slice(0, 120);
    const bytes = buildSimplePdf(content, options.fontSize ?? 11);
    const pdfBuffer = Uint8Array.from(bytes).buffer;
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `${sanitizeFileName(title)}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 2000);
    return true;
  } catch {
    return false;
  }
}

export function exportPdfDocument(content: string, options: ExportOptions): 'download' | 'print' | 'failed' {
  const normalizedOptions = ExportOptionsSchema.parse(options);
  if (hasImageMarkdown(content) || hasMarkdownFormatting(content)) {
    const opened = openPdfPrintPreview(content, normalizedOptions);
    if (opened) return 'print';
    const downloaded = downloadPdfFile(content, normalizedOptions);
    return downloaded ? 'download' : 'failed';
  }

  const downloaded = downloadPdfFile(content, normalizedOptions);
  if (downloaded) return 'download';
  const opened = openPdfPrintPreview(content, normalizedOptions);
  return opened ? 'print' : 'failed';
}

function encodeBase64Url(value: string): string {
  const utf8Bytes = new TextEncoder().encode(value);
  let binary = '';
  utf8Bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function buildExportShareUrl(payload: ExportSharePayload): string | null {
  try {
    const normalizedPayload = ExportSharePayloadSchema.parse(payload);
    // Always build the share URL from a fixed, trusted origin instead of the
    // current document location to avoid open-redirect style issues.
    const trustedOrigin = 'https://draft.iron.signal.works';
    const url = new URL(trustedOrigin);
    const encoded = encodeBase64Url(JSON.stringify(normalizedPayload));
    url.searchParams.set('view', 'pdf');
    url.searchParams.set('share', encoded);
    const output = url.toString();
    if (output.length > 7000) return null;
    return output;
  } catch {
    return null;
  }
}

export function readExportSharePayloadFromLocation(): ExportSharePayload | null {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') !== 'pdf') return null;
    const share = params.get('share');
    if (!share) return null;
    const parsed = JSON.parse(decodeBase64Url(share));
    const result = ExportSharePayloadSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}


