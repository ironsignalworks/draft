import React from 'react';
import { Search, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
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
  { id: 'book-a4', label: 'Book - A4 (794x1123)' },
  { id: 'book-a5', label: 'Book - A5 (560x794)' },
  { id: 'novel-pocket', label: 'Novel - Pocket (560x794)' },
  { id: 'textbook-a4', label: 'Textbook - A4 (794x1123)' },
  { id: 'thesis-a4', label: 'Thesis - A4 (794x1123)' },
  { id: 'report-a4', label: 'Report - A4 (794x1123)' },
  { id: 'report-letter', label: 'Report - Letter (816x1056)' },
  { id: 'whitepaper-a4', label: 'Whitepaper - A4 (794x1123)' },
  { id: 'proposal-letter', label: 'Proposal - Letter (816x1056)' },
  { id: 'memo-a4', label: 'Memo - A4 (794x1123)' },
  { id: 'manual-letter', label: 'Manual - Letter (816x1056)' },
  { id: 'script-letter', label: 'Script - Letter (816x1056)' },
  { id: 'resume-letter', label: 'Resume - Letter (816x1056)' },
  { id: 'cv-a4', label: 'CV - A4 (794x1123)' },
  { id: 'handout-a4', label: 'Handout - A4 (794x1123)' },
  { id: 'worksheet-letter', label: 'Worksheet - Letter (816x1056)' },
  { id: 'zine-a5', label: 'Zine - A5 (560x794)' },
  { id: 'booklet-a5', label: 'Booklet - A5 (560x794)' },
  { id: 'flyer-a5', label: 'Flyer - A5 (560x794)' },
  { id: 'catalogue-a4', label: 'Catalogue - A4 (794x1123)' },
  { id: 'magazine-a4', label: 'Magazine - A4 (794x1123)' },
  { id: 'magazine-letter', label: 'Magazine - Letter (816x1056)' },
  { id: 'brochure-letter', label: 'Brochure - Letter (816x1056)' },
  { id: 'legal-brief', label: 'Legal Brief - Legal (816x1344)' },
];

interface TopBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isInspectorCollapsed?: boolean;
  onToggleInspectorCollapse?: () => void;
  documentName: string;
  onDocumentNameChange: (value: string) => void;
  formatPreset: FormatPresetId;
  onFormatPresetChange: (value: FormatPresetId) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export function TopBar({
  isSidebarOpen,
  onToggleSidebar,
  isInspectorCollapsed = false,
  onToggleInspectorCollapse,
  documentName,
  onDocumentNameChange,
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
              aria-label="Document name"
              className="h-10 bg-white"
            />
          </div>

          <div className="hidden md:block relative min-w-[170px] flex-1 max-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input type="text" value={searchQuery} onChange={(e) => onSearchQueryChange(e.target.value)} placeholder="Search document..." aria-label="Search document" className="h-10 bg-white pl-9" />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0 justify-self-end">
          <div className="w-[220px]">
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
          {onToggleInspectorCollapse ? (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleInspectorCollapse}
              title={isInspectorCollapsed ? 'Expand inspector' : 'Collapse inspector'}
              aria-label={isInspectorCollapsed ? 'Expand inspector' : 'Collapse inspector'}
            >
              {isInspectorCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}


