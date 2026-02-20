import React from 'react';
import { Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface TopBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  documentName: string;
  onDocumentNameChange: (value: string) => void;
}

export function TopBar({
  isSidebarOpen,
  onToggleSidebar,
  documentName,
  onDocumentNameChange,
}: TopBarProps) {
  return (
    <header className="bg-white border-b border-neutral-200 px-4 lg:px-6 py-3 overflow-x-hidden">
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 min-w-0">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Hide menu' : 'Show menu'}
          aria-label={isSidebarOpen ? 'Hide menu' : 'Show menu'}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </Button>

        <div className="w-[200px] md:w-[260px] lg:w-[320px] shrink-0">
          <Input
            type="text"
            value={documentName}
            onChange={(e) => onDocumentNameChange(e.target.value)}
            placeholder="Untitled Document"
            title="Name your document. This will be used for export."
            className="h-10 bg-white"
          />
        </div>

        <div className="w-[180px] md:w-[220px] shrink-0">
          <Select defaultValue="book">
            <SelectTrigger
              title="Templates control page structure, spacing, and numbering."
              className="h-10 bg-white"
            >
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="book">Book layout</SelectItem>
              <SelectItem value="zine">Zine layout</SelectItem>
              <SelectItem value="catalogue">Catalogue grid</SelectItem>
              <SelectItem value="report">Report format</SelectItem>
              <SelectItem value="custom">Custom layout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[120px] md:w-[130px] shrink-0">
          <Select defaultValue="a4">
            <SelectTrigger
              title="Changes document dimensions and reflows content automatically."
              className="h-10 bg-white"
            >
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="a5">A5</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full md:ml-auto md:flex-1 md:min-w-[180px] md:max-w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            type="text"
            placeholder="Search document..."
            className="h-10 bg-white pl-9"
          />
        </div>
      </div>
    </header>
  );
}
