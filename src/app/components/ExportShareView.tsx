import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from './ui/button';
import { splitContentIntoPages } from '../lib/paging';
import { markdownUrlTransform } from '../lib/markdown';
import { exportPdfDocument, type ExportSharePayload } from '../lib/export';
import { ArrowLeft, Link2, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface ExportShareViewProps {
  payload: ExportSharePayload;
}

export function ExportShareView({ payload }: ExportShareViewProps) {
  const pages = splitContentIntoPages(payload.content, 1800);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="sticky top-0 z-10 border-b border-[#e5e7eb] bg-[rgba(255,255,255,0.95)] px-3 py-3 backdrop-blur sm:px-4">
        <div className="mx-auto w-full max-w-5xl space-y-2 sm:space-y-0">
          <div className="min-w-0 text-center">
            <h1 className="truncate text-sm font-semibold text-[#171717]">{payload.title || 'Shared Export'}</h1>
            <p className="text-xs text-[#6b7280]">Online PDF preview</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('view');
                url.searchParams.delete('share');
                window.location.href = url.toString();
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to editor
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied');
                } catch {
                  toast.error('Could not copy link');
                }
              }}
            >
              <Link2 className="w-4 h-4" />
              Copy link
            </Button>
            <Button
              size="sm"
              className="whitespace-nowrap bg-neutral-900 hover:bg-neutral-800"
              onClick={() => {
                const result = exportPdfDocument(payload.content, {
                  ...payload.options,
                  title: payload.title,
                });
                if (result === 'failed') {
                  toast.error('Could not open print document.');
                  return;
                }
                if (result === 'print') {
                  toast.success('Print document opened.');
                  return;
                }
                toast.success('Document file downloaded');
              }}
            >
              <Printer className="w-4 h-4" />
              Print document
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-4 p-4 sm:space-y-6 sm:p-6">
        {pages.map((page, index) => (
          <section key={`shared-page-${index + 1}`} className="mx-auto aspect-[1/1.414] w-full max-w-[794px] overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#ffffff] p-5 shadow-sm sm:p-10">
            <div className="mb-3 text-xs text-[#9ca3af]">Page {index + 1}</div>
            <div className="prose prose-neutral max-w-none break-words text-sm text-[#404040] [overflow-wrap:anywhere] [word-break:break-word]">
              <ReactMarkdown urlTransform={markdownUrlTransform}>{page}</ReactMarkdown>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
