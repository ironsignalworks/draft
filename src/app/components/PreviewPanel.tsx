import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Maximize2, Minimize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { splitContentIntoPages } from '../lib/paging';
import { markdownUrlTransform } from '../lib/markdown';
import type { InspectorSettings } from './InspectorPanel';

interface PreviewPanelProps {
  content: string;
  layoutFormat?: 'book' | 'zine' | 'catalogue' | 'report' | 'custom';
  fullBookPreview?: boolean;
  previewPageCount?: number;
  activePresetName?: string;
  pageSize?: 'a4' | 'a5' | 'letter' | 'legal';
  inspectorSettings?: InspectorSettings;
}

interface DraggableImageProps {
  imageKey: string;
  src: string;
  alt: string;
  scale: number;
  position: { x: number; y: number };
  onChange: (imageKey: string, next: { x: number; y: number }) => void;
  onActivate: (imageKey: string) => void;
  className?: string;
  centerAnchor?: boolean;
}

function DraggableImage({
  imageKey,
  src,
  alt,
  scale,
  position,
  onChange,
  onActivate,
  className = 'max-w-full h-auto',
  centerAnchor = false,
}: DraggableImageProps) {
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: position.x,
      startY: position.y,
    };
    onActivate(imageKey);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!dragStartRef.current) return;
    event.preventDefault();
    const dx = (event.clientX - dragStartRef.current.pointerX) / Math.max(scale, 0.35);
    const dy = (event.clientY - dragStartRef.current.pointerY) / Math.max(scale, 0.35);
    onChange(imageKey, {
      x: dragStartRef.current.startX + dx,
      y: dragStartRef.current.startY + dy,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLImageElement>) => {
    if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    }
    dragStartRef.current = null;
  };

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`${className} cursor-move select-none touch-none`}
      style={{
        transform: centerAnchor
          ? `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`
          : `translate(${position.x}px, ${position.y}px)`,
      }}
    />
  );
}

export function PreviewPanel({
  content,
  layoutFormat = 'zine',
  fullBookPreview = false,
  previewPageCount = 12,
  activePresetName = 'Default',
  pageSize = 'a4',
  inspectorSettings,
}: PreviewPanelProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [showMargins, setShowMargins] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imagePositions, setImagePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [activeImageKey, setActiveImageKey] = useState<string | null>(null);

  const snapStepPx = 10;
  const centerLockThresholdPx = 14;

  const clampZoom = (value: number) => Math.min(2.5, Math.max(0.35, value));

  const fitToViewport = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const sizeMap: Record<'book' | 'zine' | 'catalogue' | 'report' | 'custom', { width: number; height: number }> = {
      book: { width: 794, height: 1123 },
      zine: { width: 680, height: 960 },
      catalogue: { width: 860, height: 1123 },
      report: { width: 794, height: 1123 },
      custom: { width: 794, height: 1123 },
    };
    const pageSizeMap: Record<'a4' | 'a5' | 'letter' | 'legal', { width: number; height: number }> = {
      a4: { width: 794, height: 1123 },
      a5: { width: 560, height: 794 },
      letter: { width: 816, height: 1056 },
      legal: { width: 816, height: 1344 },
    };
    const size = layoutFormat === 'custom' ? pageSizeMap[pageSize] : sizeMap[layoutFormat];
    const pageWidth = size.width;
    const pageHeight = size.height;
    const padding = 80;
    const fitScale = Math.min(
      (viewport.clientWidth - padding) / pageWidth,
      (viewport.clientHeight - padding) / pageHeight,
      1.5,
    );
    setZoom(clampZoom(fitScale));
  }, [layoutFormat, pageSize]);

  useEffect(() => {
    fitToViewport();
    const onResize = () => fitToViewport();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fitToViewport]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewportRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (document.fullscreenElement === viewport) {
      await document.exitFullscreen();
      return;
    }

    await viewport.requestFullscreen();
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Best-practice behavior: scrolling should pan by default.
    // Zoom only when users intentionally use a zoom modifier (Ctrl/Cmd + wheel).
    const shouldZoom = e.ctrlKey || e.metaKey;
    if (!shouldZoom) return;

    e.preventDefault();
    const step = Math.abs(e.deltaY) > 30 ? 0.08 : 0.04;
    const zoomDelta = e.deltaY > 0 ? -step : step;
    setZoom((prev) => clampZoom(prev + zoomDelta));
  };

  const trimmedContent = content.trim();
  const hasContent = trimmedContent.length > 0;
  const wordCount = trimmedContent.length > 0 ? trimmedContent.split(/\s+/).filter(Boolean).length : 0;
  const characterCount = content.length;
  const mmToPx = (mm: number) => Math.round(mm * 3.78);
  const appliedMargins = {
    top: mmToPx(inspectorSettings?.margins.top ?? 25),
    bottom: mmToPx(inspectorSettings?.margins.bottom ?? 25),
    left: mmToPx(inspectorSettings?.margins.left ?? 20),
    right: mmToPx(inspectorSettings?.margins.right ?? 20),
  };
  const headingScale = (inspectorSettings?.headingScale ?? 15) / 10;
  const bodyRhythm = (inspectorSettings?.bodyRhythm ?? 16) / 10;
  const bodyFontSize = inspectorSettings?.bodyFontSize ?? 14;
  const paragraphGap = inspectorSettings?.paragraphGap ?? 12;
  const textColor = inspectorSettings?.textColor ?? '#404040';
  const typePreset = inspectorSettings?.typePreset ?? 'Editorial';
  const pageDimensionsByFormat: Record<typeof layoutFormat, { width: number; height: number }> = {
    book: { width: 794, height: 1123 },
    zine: { width: 680, height: 960 },
    catalogue: { width: 860, height: 1123 },
    report: { width: 794, height: 1123 },
    custom: pageSize === 'a5' ? { width: 560, height: 794 } : pageSize === 'letter' ? { width: 816, height: 1056 } : pageSize === 'legal' ? { width: 816, height: 1344 } : { width: 794, height: 1123 },
  };
  const presetTypographyClass =
    typePreset === 'Technical'
      ? 'tracking-[0.01em]'
      : typePreset === 'Compact'
        ? 'leading-tight'
        : typePreset === 'Resume'
          ? 'tracking-[0.005em]'
          : 'leading-relaxed';
  const contentClassByFormat: Record<typeof layoutFormat, string> = {
    book: `prose prose-neutral max-w-none break-words ${presetTypographyClass}`,
    zine: `prose prose-neutral max-w-none text-[15px] break-words ${presetTypographyClass}`,
    catalogue: `prose prose-neutral max-w-none break-words ${presetTypographyClass}`,
    report: `prose prose-neutral max-w-none break-words ${presetTypographyClass}`,
    custom: `prose prose-neutral max-w-none break-words ${presetTypographyClass}`,
  };
  const formatLabel = layoutFormat.charAt(0).toUpperCase() + layoutFormat.slice(1);
  const minimumPages = fullBookPreview ? Math.max(previewPageCount, 1) : 1;
  const activeSize = pageDimensionsByFormat[layoutFormat];
  const headerFooterReservePx =
    (inspectorSettings?.headerContent?.trim() ? 20 : 0) + (inspectorSettings?.footerContent?.trim() ? 20 : 0);
  const availableHeightPx = Math.max(120, activeSize.height - appliedMargins.top - appliedMargins.bottom - headerFooterReservePx);
  const availableWidthPx = Math.max(120, activeSize.width - appliedMargins.left - appliedMargins.right);
  const columns = inspectorSettings?.columns === 2 ? 2 : 1;
  const columnGapPx = columns === 2 ? inspectorSettings?.sectionGap ?? 24 : 0;
  const columnWidthPx = Math.max(60, (availableWidthPx - columnGapPx) / columns);
  const lineHeightPx = Math.max(8, bodyFontSize * bodyRhythm);
  const linesPerColumn = Math.max(1, Math.floor(availableHeightPx / lineHeightPx));
  const avgCharWidthPx = Math.max(3, bodyFontSize * 0.56);
  const charsPerLine = Math.max(6, Math.floor(columnWidthPx / avgCharWidthPx));
  const baseDensityFactor = 0.92;
  // Keep pagination responsive to spacing controls so layout changes apply across all pages.
  const paragraphDensityFactor = Math.max(0.55, Math.min(1.15, 1 - (paragraphGap - 12) / 80));
  const headingDensityFactor = Math.max(0.7, Math.min(1.1, 1 - (headingScale - 1.5) * 0.08));
  const approxCharsPerPage = Math.max(
    20,
    Math.floor(linesPerColumn * charsPerLine * columns * baseDensityFactor * paragraphDensityFactor * headingDensityFactor),
  );
  const baseChunks = splitContentIntoPages(content, approxCharsPerPage, charsPerLine);
  const pageChunks =
    baseChunks.length >= minimumPages
      ? baseChunks
      : [...baseChunks, ...Array.from({ length: minimumPages - baseChunks.length }, () => '')];
  const maxPageIndex = Math.max(0, pageChunks.length - 1);
  const pageGapPx = 24;
  const rawFrameWidth = activeSize.width;
  const rawStackHeight = activeSize.height * pageChunks.length + pageGapPx * Math.max(0, pageChunks.length - 1);
  const zoomedFrameWidth = Math.round(rawFrameWidth * zoom);
  const zoomedStackHeight = Math.round(rawStackHeight * zoom);

  const pageNumberClass =
    inspectorSettings?.numberingFormat === 'top-right'
      ? 'absolute top-3 right-4 text-xs text-[#9ca3af] flex items-center gap-2'
      : inspectorSettings?.numberingFormat === 'bottom-center'
        ? 'absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[#9ca3af] flex items-center gap-2'
        : 'absolute bottom-3 right-4 text-xs text-[#9ca3af] flex items-center gap-2';

  const applySnap = useCallback((value: number) => Math.round(value / snapStepPx) * snapStepPx, []);

  const updateImagePosition = useCallback(
    (imageKey: string, next: { x: number; y: number }) => {
      const centerLockedX = Math.abs(next.x) <= centerLockThresholdPx ? 0 : next.x;
      const centerLockedY = Math.abs(next.y) <= centerLockThresholdPx ? 0 : next.y;
      setImagePositions((prev) => ({
        ...prev,
        [imageKey]: {
          x: applySnap(centerLockedX),
          y: applySnap(centerLockedY),
        },
      }));
    },
    [applySnap],
  );

  const parseSingleImageMarkdown = (pageMarkdown: string): string | null => {
    const trimmed = pageMarkdown.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^!\[[^\]]*]\((.+)\)$/);
    if (!match) return null;

    const rawBody = match[1].trim();
    if (!rawBody) return null;

    const withOptionalTitle = rawBody.match(/^(.*\S)\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*$/);
    const src = (withOptionalTitle ? withOptionalTitle[1] : rawBody).trim();
    if (!src) return null;

    if (src.startsWith('<') && src.endsWith('>') && src.length > 2) {
      return src.slice(1, -1).trim();
    }
    return src;
  };

  return (
    <div className="h-full bg-neutral-100 flex flex-col items-center">
      {/* Preview Controls */}
      <div className="w-full px-6 py-3 bg-white border-b border-neutral-200 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Layout Preview</div>
            <p className="mt-1 text-xs text-neutral-500 break-words">
              This view matches the final export. Preset: {activePresetName}.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-500 shrink-0">
            <span className="text-right tabular-nums">{pageChunks.length} pages</span>
            <span className="text-right tabular-nums">{wordCount} words</span>
            <span className="text-right tabular-nums col-span-2">{characterCount} chars</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setZoom((prev) => clampZoom(prev - 0.1))}
              className="h-8 w-8 inline-flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-900 rounded-md border border-neutral-300 shadow-sm hover:border-neutral-400 transition-colors"
              title="Zoom out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((prev) => clampZoom(prev + 0.1))}
              className="h-8 w-8 inline-flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-900 rounded-md border border-neutral-300 shadow-sm hover:border-neutral-400 transition-colors"
              title="Zoom in"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
              }}
              className="h-8 w-8 inline-flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-900 rounded-md border border-neutral-300 shadow-sm hover:border-neutral-400 transition-colors"
              title="Reset view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="h-8 w-8 inline-flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-900 rounded-md border border-neutral-300 shadow-sm hover:border-neutral-400 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <div className="pl-1 min-w-[3.75rem] shrink-0 text-xs text-neutral-500 tabular-nums">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => setShowMargins((prev) => !prev)}
              className={`h-8 px-3 text-xs rounded-md border shadow-sm transition-colors ${
                showMargins
                  ? 'text-neutral-900 border-neutral-500 bg-neutral-100'
                  : 'text-neutral-600 border-neutral-300 hover:text-neutral-900 hover:border-neutral-400'
              }`}
            >
              Show margins
            </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div
        ref={viewportRef}
        onWheel={handleWheel}
        className="relative flex-1 w-full overflow-auto select-none"
      >
        <div className="min-h-full w-full p-8 flex items-start justify-center bg-neutral-100">
          {/* Page */}
          <div
            style={{
              width: `${zoomedFrameWidth}px`,
              height: `${zoomedStackHeight}px`,
            }}
            className="relative will-change-transform"
          >
            <div
              style={{
                width: `${rawFrameWidth}px`,
                minHeight: `${rawStackHeight}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
              className="grid grid-cols-1 gap-6"
            >
              {pageChunks.map((_, pageIndex) => {
                const pageMarkdown = pageChunks[pageIndex] || '';
                const singleImageUrl = parseSingleImageMarkdown(pageMarkdown);
                const pageImagePrefix = `page-${pageIndex}`;
                const singleImageKey = `${pageImagePrefix}:single:${singleImageUrl ?? ''}`;
                const singleImagePosition = imagePositions[singleImageKey] ?? { x: 0, y: 0 };
                const markdownComponents = {
                  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
                    const src = props.src ?? '';
                    const alt = props.alt ?? 'Imported image';
                    const imageKey = `${pageImagePrefix}:markdown:${src}`;
                    const position = imagePositions[imageKey] ?? { x: 0, y: 0 };
                    return (
                      <DraggableImage
                        imageKey={imageKey}
                        src={src}
                        alt={alt}
                        scale={zoom}
                        position={position}
                        onChange={updateImagePosition}
                        onActivate={setActiveImageKey}
                        className="max-w-full h-auto rounded"
                      />
                    );
                  },
                  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
                    <p
                      {...props}
                      style={{
                        marginBottom: `${inspectorSettings?.paragraphGap ?? 12}px`,
                        lineHeight: bodyRhythm,
                        overflowWrap: 'anywhere',
                        wordBreak: 'normal',
                      }}
                    />
                  ),
                  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
                    <h1
                      {...props}
                      style={{
                        fontSize: `${2.2 * headingScale}rem`,
                        lineHeight: 1.1,
                        overflowWrap: 'anywhere',
                        wordBreak: 'normal',
                      }}
                    />
                  ),
                  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
                    <h2
                      {...props}
                      style={{
                        fontSize: `${1.8 * headingScale}rem`,
                        lineHeight: 1.15,
                        overflowWrap: 'anywhere',
                        wordBreak: 'normal',
                      }}
                    />
                  ),
                  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
                    <h3
                      {...props}
                      style={{
                        fontSize: `${1.45 * headingScale}rem`,
                        lineHeight: 1.2,
                        overflowWrap: 'anywhere',
                        wordBreak: 'normal',
                      }}
                    />
                  ),
                };

                return (
                <div
                  key={`preview-page-${pageIndex}`}
                  className={`bg-[#ffffff] rounded-lg shadow-lg relative overflow-hidden ${singleImageUrl ? 'p-4' : ''}`}
                  style={
                    singleImageUrl
                      ? undefined
                      : {
                          width: `${activeSize.width}px`,
                          height: `${activeSize.height}px`,
                          paddingTop: `${appliedMargins.top}px`,
                          paddingBottom: `${appliedMargins.bottom}px`,
                          paddingLeft: `${appliedMargins.left}px`,
                          paddingRight: `${appliedMargins.right}px`,
                        }
                  }
                >
                  {!!inspectorSettings?.headerContent && !singleImageUrl && (
                    <div className="pointer-events-none absolute top-3 left-4 right-4 z-30 text-[10px] uppercase tracking-wide text-[#6b7280]">
                      {inspectorSettings.headerContent}
                    </div>
                  )}
                  {/* Page content with margins visible */}
                  <div
                      className={singleImageUrl ? 'relative z-10 h-full w-full overflow-hidden' : `relative z-10 ${contentClassByFormat[layoutFormat]} h-full overflow-hidden`}
                    style={
                      singleImageUrl
                        ? undefined
                        : {
                            fontFamily: inspectorSettings?.primaryFont ?? undefined,
                            fontSize: `${bodyFontSize}px`,
                            columnCount: inspectorSettings?.columns === 2 ? 2 : undefined,
                            columnGap: inspectorSettings?.columns === 2 ? `${inspectorSettings.sectionGap}px` : undefined,
                            lineHeight: bodyRhythm,
                            overflowWrap: 'anywhere',
                            wordBreak: 'normal',
                            color: textColor,
                          }
                    }
                  >
                    {hasContent ? (
                      singleImageUrl ? (
                        <div className="relative h-full w-full overflow-hidden">
                          <DraggableImage
                            imageKey={singleImageKey}
                            src={singleImageUrl}
                            alt={`Imported page ${pageIndex + 1}`}
                            scale={zoom}
                            position={singleImagePosition}
                            onChange={updateImagePosition}
                            onActivate={setActiveImageKey}
                            className={`absolute left-1/2 top-1/2 max-h-[94%] max-w-[94%] rounded object-contain ${activeImageKey === singleImageKey ? 'ring-2 ring-neutral-900' : ''}`}
                            centerAnchor
                          />
                        </div>
                      ) : (
                        <ReactMarkdown urlTransform={markdownUrlTransform} components={markdownComponents}>
                          {pageMarkdown}
                        </ReactMarkdown>
                      )
                    ) : (
                      <div className="text-[#6b7280] text-center mt-32 space-y-2">
                        <h3 className="text-base font-semibold text-[#262626]">Preview will appear here</h3>
                        <p className="text-sm">
                          As you add content, Draft will format it into pages automatically.
                        </p>
                      </div>
                    )}
                  </div>

                  {!!inspectorSettings?.footerContent && !singleImageUrl && (
                    <div className="pointer-events-none absolute bottom-3 left-4 right-4 z-30 text-[10px] uppercase tracking-wide text-[#6b7280]">
                      {inspectorSettings.footerContent}
                    </div>
                  )}

                  {inspectorSettings?.addSignature && pageIndex === maxPageIndex && !singleImageUrl && (
                    <div className="absolute left-4 right-4 bottom-10 z-20 text-xs text-[#6b7280]">
                      <div className="mb-1">{inspectorSettings.signatureLabel || 'Approved by'}</div>
                      <div className="h-px w-[220px] bg-[#9ca3af]" />
                      {inspectorSettings.signatureFileName ? (
                        <div className="mt-1 text-[10px] text-[#9ca3af]">{inspectorSettings.signatureFileName}</div>
                      ) : null}
                    </div>
                  )}

                  {/* Margin indicators - subtle guides */}
                  {showMargins && (
                    <div
                      className="absolute inset-0 z-0 pointer-events-none rounded-lg"
                      style={{
                        borderStyle: 'solid',
                        borderTopWidth: `${appliedMargins.top}px`,
                        borderBottomWidth: `${appliedMargins.bottom}px`,
                        borderLeftWidth: `${appliedMargins.left}px`,
                        borderRightWidth: `${appliedMargins.right}px`,
                        borderColor: '#fafafa',
                      }}
                    />
                  )}
                  {/* Page number */}
                  {inspectorSettings?.numberingFormat !== 'none' && (
                    <div className={`${pageNumberClass} z-30`}>
                      <span className="rounded border border-[#d1d5db] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[#6b7280]">
                        {formatLabel}
                      </span>
                      <span>{pageIndex + 1}</span>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


