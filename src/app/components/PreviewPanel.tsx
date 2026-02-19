import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Minus, Plus, RotateCcw, Scan } from 'lucide-react';

interface PreviewPanelProps {
  content: string;
}

export function PreviewPanel({ content }: PreviewPanelProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
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

  return (
    <div className="h-full bg-neutral-100 flex flex-col items-center">
      {/* Preview Controls */}
      <div className="w-full px-6 py-3 bg-white border-b border-neutral-200 flex items-center justify-between">
        <div className="text-xs text-neutral-500 uppercase tracking-wide">Live Preview</div>
        <div className="flex items-center gap-2">
          <button className="text-xs text-neutral-600 hover:text-neutral-900 px-3 py-1 rounded-full border border-neutral-300 hover:border-neutral-400 transition-colors">
            Single Page View
          </button>
          <button className="text-xs text-neutral-600 hover:text-neutral-900 px-3 py-1 rounded-full border border-neutral-300 hover:border-neutral-400 transition-colors">
            Spread View
          </button>
          <div className="ml-2 h-5 w-px bg-neutral-200" />
          <button
            onClick={() => setZoom((prev) => clampZoom(prev - 0.1))}
            className="text-xs text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded border border-neutral-300 hover:border-neutral-400 transition-colors"
            title="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((prev) => clampZoom(prev + 0.1))}
            className="text-xs text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded border border-neutral-300 hover:border-neutral-400 transition-colors"
            title="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={fitToViewport}
            className="text-xs text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded border border-neutral-300 hover:border-neutral-400 transition-colors"
            title="Fit to viewport"
          >
            <Scan className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="text-xs text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded border border-neutral-300 hover:border-neutral-400 transition-colors"
            title="Reset view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="min-w-14 text-right text-xs text-neutral-500">
            {Math.round(zoom * 100)}%
          </div>
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
        className={`flex-1 w-full overflow-hidden select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <div className="text-neutral-400 text-center mt-32">
                    Your formatted document will appear here
                  </div>
                )}
              </div>

              {/* Margin indicators - subtle guides */}
              <div className="absolute inset-0 pointer-events-none border-[60px] border-neutral-50 rounded-lg" />
              
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
