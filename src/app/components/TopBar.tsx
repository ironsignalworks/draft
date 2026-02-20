import React from 'react';
import { Search, PanelLeftClose, PanelLeftOpen, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export type FormatPresetId =
  | 'book-a4'
  | 'book-a5'
  | 'novel-pocket'
  | 'textbook-a4'
  | 'thesis-a4'
  | 'report-a4'
  | 'report-letter'
  | 'whitepaper-a4'
  | 'proposal-letter'
  | 'memo-a4'
  | 'manual-letter'
  | 'script-letter'
  | 'resume-letter'
  | 'cv-a4'
  | 'handout-a4'
  | 'worksheet-letter'
  | 'zine-a5'
  | 'booklet-a5'
  | 'flyer-a5'
  | 'catalogue-a4'
  | 'magazine-a4'
  | 'magazine-letter'
  | 'brochure-letter'
  | 'legal-brief';

export const FORMAT_PRESETS: Array<{ id: FormatPresetId; label: string }> = [
  { id: 'book-a4', label: 'Book - A4' },
  { id: 'book-a5', label: 'Book - A5' },
  { id: 'novel-pocket', label: 'Novel - Pocket' },
  { id: 'textbook-a4', label: 'Textbook - A4' },
  { id: 'thesis-a4', label: 'Thesis - A4' },
  { id: 'report-a4', label: 'Report - A4' },
  { id: 'report-letter', label: 'Report - Letter' },
  { id: 'whitepaper-a4', label: 'Whitepaper - A4' },
  { id: 'proposal-letter', label: 'Proposal - Letter' },
  { id: 'memo-a4', label: 'Memo - A4' },
  { id: 'manual-letter', label: 'Manual - Letter' },
  { id: 'script-letter', label: 'Script - Letter' },
  { id: 'resume-letter', label: 'Resume - Letter' },
  { id: 'cv-a4', label: 'CV - A4' },
  { id: 'handout-a4', label: 'Handout - A4' },
  { id: 'worksheet-letter', label: 'Worksheet - Letter' },
  { id: 'zine-a5', label: 'Zine - A5' },
  { id: 'booklet-a5', label: 'Booklet - A5' },
  { id: 'flyer-a5', label: 'Flyer - A5' },
  { id: 'catalogue-a4', label: 'Catalogue - A4' },
  { id: 'magazine-a4', label: 'Magazine - A4' },
  { id: 'magazine-letter', label: 'Magazine - Letter' },
  { id: 'brochure-letter', label: 'Brochure - Letter' },
  { id: 'legal-brief', label: 'Legal Brief - Legal' },
];

interface TopBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  documentName: string;
  onDocumentNameChange: (value: string) => void;
  onExportClick: () => void;
  formatPreset: FormatPresetId;
  onFormatPresetChange: (value: FormatPresetId) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export function TopBar({
  isSidebarOpen,
  onToggleSidebar,
  documentName,
  onDocumentNameChange,
  onExportClick,
  formatPreset,
  onFormatPresetChange,
  searchQuery,
  onSearchQueryChange,
}: TopBarProps) {
  return (
    <header className="bg-white border-b border-neutral-200 px-4 lg:px-6 py-3">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 min-w-0">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Hide menu' : 'Show menu'}
          aria-label={isSidebarOpen ? 'Hide menu' : 'Show menu'}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </Button>

        <div className="min-w-0 flex items-center gap-2">
          <div className="w-[260px] lg:w-[320px] min-w-0">
            <Input
              type="text"
              value={documentName}
              onChange={(e) => onDocumentNameChange(e.target.value)}
              placeholder="Untitled Document"
              title="Name your document."
              className="h-10 bg-white"
            />
          </div>

          <div className="hidden lg:block w-[220px] shrink-0">
            <Select
              value={formatPreset}
              onValueChange={(value) => onFormatPresetChange(value as TopBarProps['formatPreset'])}
            >
              <SelectTrigger
                title="Document format"
                className="h-10 rounded-full border-neutral-300 bg-neutral-50 px-4 font-medium text-neutral-700 shadow-sm"
              >
                <SelectValue placeholder="Format preset" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {FORMAT_PRESETS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden md:block relative min-w-[170px] flex-1 max-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input type="text" value={searchQuery} onChange={(e) => onSearchQueryChange(e.target.value)} placeholder="Search document..." className="h-10 bg-white pl-9" />
          </div>
        </div>

        <Button onClick={onExportClick} className="inline-flex h-10 shrink-0 gap-2 bg-neutral-900 hover:bg-neutral-800">
          <Upload className="w-4 h-4" />
          Export PDF
        </Button>
      </div>
    </header>
  );
}
