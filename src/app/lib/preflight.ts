export type IssueLevel = 'minor' | 'major';
export type PreflightSeverity = 'none' | 'minor' | 'major';

export interface PreflightIssue {
  id: 'parse' | 'overflow' | 'missing-font' | 'image-failure' | 'large-document';
  level: IssueLevel;
  title: string;
  text: string;
}

export interface PreflightResult {
  severity: PreflightSeverity;
  issues: PreflightIssue[];
  hasLargeDocument: boolean;
}

const SUPPORTED_FONTS = new Set([
  'inter',
  'ibm plex sans',
  'source sans pro',
  'georgia',
  'times new roman',
]);

export function analyzeDocument(content: string): PreflightResult {
  const issues: PreflightIssue[] = [];
  const source = content ?? '';
  const trimmed = source.trim();

  if (!trimmed) {
    return { severity: 'none', issues, hasLargeDocument: false };
  }

  const backticks = (source.match(/`/g) ?? []).length;
  const openBrackets = (source.match(/\[/g) ?? []).length;
  const closeBrackets = (source.match(/]/g) ?? []).length;
  const openParens = (source.match(/\(/g) ?? []).length;
  const closeParens = (source.match(/\)/g) ?? []).length;
  const hasParseIssue =
    backticks % 2 !== 0 || openBrackets !== closeBrackets || openParens !== closeParens;
  if (hasParseIssue) {
    issues.push({
      id: 'parse',
      level: 'minor',
      title: 'Some content couldn’t be formatted',
      text: 'Check for unmatched symbols or unsupported formatting in the highlighted section.',
    });
  }

  const longestLine = Math.max(...source.split('\n').map((line) => line.length), 0);
  if (longestLine > 360) {
    issues.push({
      id: 'overflow',
      level: 'major',
      title: 'Section exceeds page bounds',
      text: 'Try adjusting spacing, reducing font size, or allowing this section to break across pages.',
    });
  }

  const fontTagMatch = source.match(/\[font:\s*([^\]]+)\]/i);
  if (fontTagMatch) {
    const fontName = fontTagMatch[1].trim().toLowerCase();
    if (!SUPPORTED_FONTS.has(fontName)) {
      issues.push({
        id: 'missing-font',
        level: 'minor',
        title: 'Font unavailable',
        text: 'The selected font couldn’t be loaded. A fallback font is being used for preview and export.',
      });
    }
  }

  const imageMatches = [...source.matchAll(/!\[[^\]]*]\(([^)]*)\)/g)];
  const hasBrokenImageRef = imageMatches.some((match) => {
    const src = (match[1] ?? '').trim().toLowerCase();
    return src.length === 0 || src.includes('missing') || src.includes('404');
  });
  if (hasBrokenImageRef) {
    issues.push({
      id: 'image-failure',
      level: 'major',
      title: 'Image couldn’t be displayed',
      text: 'Check the file path or reinsert the image before exporting.',
    });
  }

  const lineCount = source.split('\n').length;
  const hasLargeDocument = source.length > 20000 || lineCount > 900;
  if (hasLargeDocument) {
    issues.push({
      id: 'large-document',
      level: 'minor',
      title: 'Large document detected',
      text: 'Rendering may take a moment. Consider enabling compression before export.',
    });
  }

  const severity: PreflightSeverity = issues.some((i) => i.level === 'major')
    ? 'major'
    : issues.length > 0
      ? 'minor'
      : 'none';

  return { severity, issues, hasLargeDocument };
}
