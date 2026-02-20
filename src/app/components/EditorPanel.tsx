import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
  isDocumentLoaded: boolean;
  onNewDocument: () => void;
  onImportFile: (file: File) => void;
}

export function EditorPanel({
  content,
  onChange,
  isDocumentLoaded,
  onNewDocument,
  onImportFile,
}: EditorPanelProps) {
  const isEmpty = content.trim().length === 0;
  const [hasInteractedWithEditor, setHasInteractedWithEditor] = React.useState(false);

  return (
    <div className="h-full bg-neutral-50 flex flex-col">
      <div className="px-6 py-3 bg-white border-b border-neutral-200">
        <div className="text-xs text-neutral-600 uppercase tracking-wide">Content</div>
        <p className="mt-1 text-xs text-neutral-500">
          Write in Markdown or plain text. Layout updates automatically.
        </p>
      </div>

      {/* Editor */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {!isDocumentLoaded && (
            <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-5 space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900">No document open</h3>
              <p className="text-sm text-neutral-600">
                Start a new document or import a Markdown or TXT file to begin.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onNewDocument}>
                  New Document
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('editor-import-input')?.click()}
                >
                  Import File
                </Button>
                <input
                  id="editor-import-input"
                  type="file"
                  className="hidden"
                  accept=".md,.markdown,.txt,text/plain,text/markdown"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportFile(file);
                    e.currentTarget.value = '';
                  }}
                />
              </div>
            </div>
          )}

          {isDocumentLoaded && isEmpty && !hasInteractedWithEditor && (
            <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-5 space-y-2">
              <h3 className="text-sm font-semibold text-neutral-900">Start writing</h3>
              <p className="text-sm text-neutral-600">
                Type directly or paste Markdown to see the layout update instantly.
              </p>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setHasInteractedWithEditor(true)}
            onClick={() => setHasInteractedWithEditor(true)}
            className="w-full h-full min-h-[800px] bg-transparent border-none outline-none resize-none font-mono text-sm text-neutral-900 leading-relaxed"
            placeholder="Start typing or import a file to begin."
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
