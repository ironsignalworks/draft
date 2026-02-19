import React from 'react';
import { ScrollArea } from './ui/scroll-area';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
}

export function EditorPanel({ content, onChange }: EditorPanelProps) {
  return (
    <div className="h-full bg-neutral-50 flex flex-col">
      {/* Editor */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full min-h-[800px] bg-transparent border-none outline-none resize-none font-mono text-sm text-neutral-900 leading-relaxed"
            placeholder="Start writing in Markdown or plain text..."
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
