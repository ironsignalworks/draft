import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Download, Link2 } from 'lucide-react';
import { analyzeDocument } from '../lib/preflight';
import { buildExportShareUrl, exportPdfDocument } from '../lib/export';
import { splitContentIntoPages } from '../lib/paging';
import ReactMarkdown from 'react-markdown';
import { markdownUrlTransform } from '../lib/markdown';
import { toast } from 'sonner';
import type { InspectorSettings } from './InspectorPanel';
import '../../styles/export-modal.css';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  documentName?: string;
  onReviewLayout: () => void;
  inspectorSettings?: InspectorSettings;
  projectSavedAt?: number | null;
}

export function ExportModal({ open, onClose, content, documentName, onReviewLayout, inspectorSettings, projectSavedAt }: ExportModalProps) {
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [quality, setQuality] = useState(inspectorSettings?.exportQuality ?? 85);
  const [compression, setCompression] = useState(inspectorSettings?.compression ?? true);
  const [includeMetadata, setIncludeMetadata] = useState(inspectorSettings?.includeMetadata ?? true);
  const [watermark, setWatermark] = useState(inspectorSettings?.watermark ?? false);
  const [donationTrigger, setDonationTrigger] = useState<'export' | null>(null);
  const preflight = analyzeDocument(content);
  const hasMajorIssues = preflight.severity === 'major';
  const mmToPx = (mm: number) => Math.round(mm * 3.78);
  const margins = {
    top: mmToPx(inspectorSettings?.margins.top ?? 25),
    bottom: mmToPx(inspectorSettings?.margins.bottom ?? 25),
    left: mmToPx(inspectorSettings?.margins.left ?? 20),
    right: mmToPx(inspectorSettings?.margins.right ?? 20),
  };
  const bodyFontSize = inspectorSettings?.bodyFontSize ?? 14;
  const bodyRhythm = (inspectorSettings?.bodyRhythm ?? 16) / 10;
  const headingScale = (inspectorSettings?.headingScale ?? 15) / 10;
  const paragraphGap = inspectorSettings?.paragraphGap ?? 12;
  const textColor = inspectorSettings?.textColor ?? '#404040';
  const columns = inspectorSettings?.columns === 2 ? 2 : 1;
  const sectionGap = inspectorSettings?.sectionGap ?? 24;
  const pageWidth = 794;
  const pageHeight = 1123;
  const headerFooterReservePx =
    (inspectorSettings?.headerContent?.trim() ? 20 : 0) + (inspectorSettings?.footerContent?.trim() ? 20 : 0);
  const availableHeightPx = Math.max(120, pageHeight - margins.top - margins.bottom - headerFooterReservePx);
  const availableWidthPx = Math.max(120, pageWidth - margins.left - margins.right);
  const columnGapPx = columns === 2 ? sectionGap : 0;
  const columnWidthPx = Math.max(60, (availableWidthPx - columnGapPx) / columns);
  const lineHeightPx = Math.max(8, bodyFontSize * bodyRhythm);
  const linesPerColumn = Math.max(1, Math.floor(availableHeightPx / lineHeightPx));
  const avgCharWidthPx = Math.max(3, bodyFontSize * 0.56);
  const charsPerLine = Math.max(6, Math.floor(columnWidthPx / avgCharWidthPx));
  const baseDensityFactor = 0.92;
  const paragraphDensityFactor = Math.max(0.55, Math.min(1.15, 1 - (paragraphGap - 12) / 80));
  const headingDensityFactor = Math.max(0.7, Math.min(1.1, 1 - (headingScale - 1.5) * 0.08));
  const approxCharsPerPage = Math.max(
    20,
    Math.floor(linesPerColumn * charsPerLine * columns * baseDensityFactor * paragraphDensityFactor * headingDensityFactor),
  );
  const estimatedPages = Math.max(1, splitContentIntoPages(content, approxCharsPerPage, charsPerLine).length);
  const previewPages = splitContentIntoPages(content, approxCharsPerPage, charsPerLine).slice(0, 4);
  const modalPreviewScale = 0.28;
  const modalPreviewWidth = Math.round(pageWidth * modalPreviewScale);
  const modalPreviewHeight = Math.round(pageHeight * modalPreviewScale);

  useEffect(() => {
    if (!open) return;
    setDonationTrigger(null);
    setQuality(inspectorSettings?.exportQuality ?? 85);
    setCompression(inspectorSettings?.compression ?? true);
    setIncludeMetadata(inspectorSettings?.includeMetadata ?? true);
    setWatermark(inspectorSettings?.watermark ?? false);
    setIsPreparingPreview(true);
    const timer = window.setTimeout(() => {
      setIsPreparingPreview(false);
      toast.success('Final layout generated');
    }, 900);
    return () => window.clearTimeout(timer);
  }, [open, inspectorSettings]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="h-[92vh] w-[98vw] max-w-none sm:h-[90vh] sm:w-[min(98vw,1280px)] sm:max-w-[min(98vw,1280px)] gap-0 p-0">
        <DialogHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <DialogTitle className="text-xl">Export document</DialogTitle>
          <p className="text-sm text-neutral-500">Preview and finalize output.</p>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6 lg:flex-row lg:gap-6">
          {/* Preview */}
          <div className="flex min-h-0 min-w-0 shrink-0 flex-col lg:w-[360px]">
            <div className="mb-2 sm:mb-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Final preview</Label>
            </div>
            <ScrollArea className="h-[220px] rounded-lg bg-[#f5f5f5] p-3 sm:h-[260px] sm:p-4 lg:h-full lg:flex-1 lg:p-5">
              {isPreparingPreview ? (
                <div className="h-full min-h-[320px] flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-base font-semibold text-[#262626]">Preparing preview</h3>
                    <p className="mt-2 text-sm text-[#525252]">
                      Draft is generating a final layout for export.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {previewPages.map((page, index) => (
                    <div
                      key={`export-preview-${index + 1}`}
                      className={`export-page-preview relative mx-auto overflow-hidden rounded bg-[#ffffff] shadow-sm ${
                        index > 0 ? 'hidden lg:block' : ''
                      }`}
                    >
                      <div className="export-page-preview-inner relative">
                        {!!inspectorSettings?.headerContent && (
                          <div className="pointer-events-none absolute top-3 left-4 right-4 z-20 text-[10px] uppercase tracking-wide text-[#6b7280]">
                            {inspectorSettings.headerContent}
                          </div>
                        )}
                        <div
                          className={`export-page-content max-w-none h-full overflow-hidden break-words [overflow-wrap:anywhere]${
                            columns === 2 ? ' export-page-content--two-columns' : ''
                          }`}
                        >
                          <ReactMarkdown
                            urlTransform={markdownUrlTransform}
                            components={{
                              p: (props) => <p {...props} className="export-page-paragraph" />,
                              h1: (props) => <h1 {...props} className="export-page-heading export-page-heading--h1" />,
                              h2: (props) => <h2 {...props} className="export-page-heading export-page-heading--h2" />,
                              h3: (props) => <h3 {...props} className="export-page-heading export-page-heading--h3" />,
                            }}
                          >
                            {page}
                          </ReactMarkdown>
                        </div>
                        {!!inspectorSettings?.footerContent && (
                          <div className="pointer-events-none absolute bottom-3 left-4 right-4 z-20 text-[10px] uppercase tracking-wide text-[#6b7280]">
                            {inspectorSettings.footerContent}
                          </div>
                        )}
                      </div>
                      <div className="pointer-events-none absolute bottom-3 right-4 text-[10px] text-[#9ca3af]">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Settings */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-6 pr-1 sm:pr-2">
                {hasMajorIssues && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-amber-900">Export paused</h3>
                    <p className="text-sm text-amber-800">
                      Resolve layout warnings shown in Preflight to ensure a clean output.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onClose();
                        onReviewLayout();
                      }}
                    >
                      Review layout
                    </Button>
                  </div>
                )}

                {preflight.hasLargeDocument && (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <h3 className="text-sm font-semibold text-neutral-900">Large document detected</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Rendering may take a moment. Consider enabling compression before export.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-neutral-500">Page Count</Label>
                  <div className="text-2xl font-semibold text-neutral-900">{estimatedPages} pages</div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-neutral-500">
                    Quality
                  </Label>
                  <p className="text-xs text-neutral-500">Higher quality increases file size.</p>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-neutral-700">Output quality</span>
                      <span className="text-sm text-neutral-500">{quality >= 85 ? 'High' : quality >= 60 ? 'Balanced' : 'Draft'}</span>
                    </div>
                    <Slider value={[quality]} onValueChange={(value) => setQuality(value[0] ?? 85)} max={100} step={5} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm text-neutral-700">Compression</Label>
                      <p className="mt-1 text-xs text-neutral-500">Reduce file size for sharing.</p>
                    </div>
                    <Switch checked={compression} onCheckedChange={setCompression} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm text-neutral-700">Include metadata</Label>
                      <p className="mt-1 text-xs text-neutral-500">Adds title and author info to PDF.</p>
                    </div>
                    <Switch checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm text-neutral-700">Watermark</Label>
                      <p className="mt-1 text-xs text-neutral-500">Add a faint mark to each page.</p>
                    </div>
                    <Switch checked={watermark} onCheckedChange={setWatermark} />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="mt-6 space-y-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={async () => {
                  const shareUrl = buildExportShareUrl({
                    title: (documentName?.trim() || 'Draft Export').slice(0, 120),
                    content,
                    options: {
                      title: (documentName?.trim() || 'Draft Export').slice(0, 120),
                      quality,
                      compression,
                      includeMetadata,
                      watermark,
                      fontSize: inspectorSettings?.bodyFontSize ?? 14,
                    },
                    createdAt: new Date().toISOString(),
                  });
                  if (!shareUrl) {
                    toast.error('Document is too large for URL export. Use Download PDF.');
                    return;
                  }
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('Export link copied');
                  } catch {
                    toast.error('Could not copy export link');
                  }
                }}
              >
                <Link2 className="w-4 h-4" />
                Copy export link
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  const shareUrl = buildExportShareUrl({
                    title: (documentName?.trim() || 'Draft Export').slice(0, 120),
                    content,
                    options: {
                      title: (documentName?.trim() || 'Draft Export').slice(0, 120),
                      quality,
                      compression,
                      includeMetadata,
                      watermark,
                      fontSize: inspectorSettings?.bodyFontSize ?? 14,
                    },
                    createdAt: new Date().toISOString(),
                  });
                  if (!shareUrl) {
                    toast.error('Document is too large for URL export. Use Download PDF.');
                    return;
                  }
                  try {
                    const trustedOrigin = 'https://draft.iron.signal.works';
                    const url = new URL(shareUrl);
                    if (url.origin !== trustedOrigin) {
                      toast.error('Invalid export URL. Use Download PDF instead.');
                      return;
                    }
                    window.open(url.toString(), '_blank', 'noopener,noreferrer');
                  } catch {
                    toast.error('Invalid export URL. Use Download PDF instead.');
                    return;
                  }
                }}
              >
                <Link2 className="w-4 h-4" />
                Open online preview
              </Button>
              <Button
                className="w-full gap-2 bg-neutral-900 hover:bg-neutral-800"
                disabled={hasMajorIssues}
                onClick={() => {
                  const result = exportPdfDocument(content, {
                    title: (documentName?.trim() || 'Draft Export').slice(0, 120),
                    quality,
                    compression,
                    includeMetadata,
                    watermark,
                    fontSize: inspectorSettings?.bodyFontSize ?? 14,
                  });
                  if (result === 'failed') {
                    toast.error('Could not generate PDF file.');
                    return;
                  }
                  if (result === 'print') {
                    toast.success('Print dialog opened with images. Choose Save as PDF.');
                    setDonationTrigger('export');
                    return;
                  }
                  toast.success('PDF downloaded');
                  setDonationTrigger('export');
                }}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Back to document
              </Button>
              {donationTrigger === 'export' && (
                <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
                  <h3 className="text-sm font-semibold text-emerald-900">Support Iron Signal Works</h3>
                  <p className="mt-1 text-sm text-emerald-900/90">
                    Thanks for exporting with Draft. Support keeps the tool free and ad-free.
                  </p>
                  <a
                    href="https://donate.stripe.com/4gMdR25le5GXenHbrT5Ne00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
                  >
                    Donate via Stripe
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


