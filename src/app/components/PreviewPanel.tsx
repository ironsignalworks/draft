import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Maximize2, Minimize2, Minus, Plus, RotateCcw } from 'lucide-react';

interface PreviewPanelProps {
  content: string;
}

export function PreviewPanel({ content }: PreviewPanelProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [showMargins, setShowMargins] = useState(true);
  const [spreadView, setSpreadView] = useState(false);
  const [syncScroll, setSyncScroll] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const clampZoom = (value: number) => Math.min(2.5, Math.max(0.35, value));

  const fitToViewport = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const pageWidth = 794;
    const pageHeight = 1123;
    const padding = 80;
    const fitScale = Math.min(
      (viewport.clientWidth - padding) / pageWidth,
      (viewport.clientHeight - padding) / pageHeight,
      1.5,
    );

    setZoom(clampZoom(fitScale));
    setOffset({ x: 0, y: 0 });
  }, []);

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
    if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
    e.preventDefault();

    const zoomDelta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => clampZoom(prev + zoomDelta));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.ox + dx,
      y: dragStartRef.current.oy + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const trimmedContent = content.trim();
  const hasContent = trimmedContent.length > 0;
  const hasLayoutSignals = /^#{1,6}\s|\n{2,}|^[-*]\s|^\d+\.\s/m.test(trimmedContent);

  return (
    <div className="h-full bg-neutral-100 flex flex-col items-center">
      {/* Preview Controls */}
      <div className="w-full px-6 py-3 bg-white border-b border-neutral-200 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Layout Preview</div>
            <p className="mt-1 text-xs text-neutral-500">This view matches the final export.</p>
          </div>
          <div className="inline-flex items-center gap-2 whitespace-nowrap">
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
                setOffset({ x: 0, y: 0 });
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
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
          <button
            onClick={() => setSpreadView((prev) => !prev)}
            className={`h-8 px-3 text-xs rounded-md border shadow-sm transition-colors ${
              spreadView
                ? 'text-neutral-900 border-neutral-500 bg-neutral-100'
                : 'text-neutral-600 border-neutral-300 hover:text-neutral-900 hover:border-neutral-400'
            }`}
          >
            Spread view
          </button>
          <button
            onClick={() => setSyncScroll((prev) => !prev)}
            className={`h-8 px-3 text-xs rounded-md border shadow-sm transition-colors ${
              syncScroll
                ? 'text-neutral-900 border-neutral-500 bg-neutral-100'
                : 'text-neutral-600 border-neutral-300 hover:text-neutral-900 hover:border-neutral-400'
            }`}
          >
            Sync scroll
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative flex-1 w-full overflow-hidden select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div className="h-full w-full p-8 flex items-center justify-center bg-neutral-100">
          {/* Page */}
          <div
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
            className="will-change-transform"
          >
            <div className="bg-white rounded-lg shadow-lg w-[794px] min-h-[1123px] p-16 relative">
              {/* Page content with margins visible */}
              <div className="prose prose-neutral max-w-none">
                {hasContent && hasLayoutSignals ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : hasContent ? (
                  <div className="text-neutral-500 text-center mt-32 space-y-2">
                    <h3 className="text-base font-semibold text-neutral-800">Layout needs content</h3>
                    <p className="text-sm">
                      Add headings or paragraphs to generate the first page.
                    </p>
                  </div>
                ) : (
                  <div className="text-neutral-500 text-center mt-32 space-y-2">
                    <h3 className="text-base font-semibold text-neutral-800">Preview will appear here</h3>
                    <p className="text-sm">
                      As you add content, DocKernel will format it into pages automatically.
                    </p>
                  </div>
                )}
              </div>

              {/* Margin indicators - subtle guides */}
              {showMargins && (
                <div className="absolute inset-0 pointer-events-none border-[60px] border-neutral-50 rounded-lg" />
              )}
              
              {/* Page number */}
              <div className="absolute bottom-8 right-16 text-xs text-neutral-400">
                1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
