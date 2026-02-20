import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { analyzeDocument } from '../lib/preflight';

interface PaginatorPanelProps {
  content?: string;
}

export function PaginatorPanel({ content = '' }: PaginatorPanelProps) {
  const [resetSeed, setResetSeed] = useState(0);
  const hasDocumentStructure = content.trim().length > 0 && /^#{1,6}\s|\n{2,}|^[-*]\s|^\d+\.\s/m.test(content);
  const hasCatalogueItems = /!\[[^\]]*]\([^)]+\)|^[-*]\s|^\d+\.\s/m.test(content);
  const preflight = analyzeDocument(content);
  const preflightMeta =
    preflight.severity === 'major'
      ? {
          state: 'Major issues',
          title: 'Layout requires attention',
          subtext: 'Resolve overflow or missing assets before exporting.',
          tone: 'text-amber-700',
          icon: AlertCircle,
        }
      : preflight.severity === 'minor'
        ? {
            state: 'Minor issues',
            title: 'Export possible with warnings',
            subtext: 'Some sections may not flow cleanly across pages.',
            tone: 'text-amber-700',
            icon: AlertCircle,
          }
        : {
            state: 'All good',
            title: 'Layout ready for export',
            subtext: 'No issues detected in page flow or assets.',
            tone: 'text-green-700',
            icon: CheckCircle2,
          };
  const StatusIcon = preflightMeta.icon;

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Reflow Layout</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Reflow your document into multiple formats
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setResetSeed((prev) => prev + 1);
            toast.success('Flow rules applied');
          }}
        >
          Reset Layout
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div key={resetSeed} className="p-6 space-y-8">
          {!hasDocumentStructure && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="text-sm font-semibold text-neutral-900">Paginator ready</h3>
              <p className="mt-1 text-sm text-neutral-600">
                As your document grows, page flow rules will apply automatically.
              </p>
            </div>
          )}

          {!hasCatalogueItems && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="text-sm font-semibold text-neutral-900">No catalogue items detected</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Add sections with images or lists to enable catalogue layout options.
              </p>
            </div>
          )}

          {/* Format Section */}
          <div className="space-y-4">
            <Label className="text-xs uppercase tracking-wide text-neutral-500">Output Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-3 rounded-md border-2 border-blue-500 bg-blue-50 shadow-sm text-sm font-medium text-blue-900 transition-colors">
                Zine
              </button>
              <button className="px-4 py-3 rounded-md border border-neutral-300 bg-white shadow-sm text-sm font-medium text-neutral-700 hover:border-neutral-400 transition-colors">
                Book
              </button>
              <button className="px-4 py-3 rounded-md border border-neutral-300 bg-white shadow-sm text-sm font-medium text-neutral-700 hover:border-neutral-400 transition-colors">
                Catalogue
              </button>
              <button className="px-4 py-3 rounded-md border border-neutral-300 bg-white shadow-sm text-sm font-medium text-neutral-700 hover:border-neutral-400 transition-colors">
                Report
              </button>
              <button className="px-4 py-3 rounded-md border border-neutral-300 bg-white shadow-sm text-sm font-medium text-neutral-700 hover:border-neutral-400 transition-colors col-span-2">
                Custom
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <select className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white">
                <option>A5 (148 × 210mm)</option>
                <option>Half-Letter (5.5 × 8.5in)</option>
                <option>A6 (105 × 148mm)</option>
                <option>Custom</option>
              </select>

              <select className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white">
                <option>1 Column</option>
                <option>2 Columns</option>
                <option>3 Columns</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-sm text-neutral-700">Spread Preview</Label>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-neutral-700">Inside/Outside Margins</Label>
              <Switch />
            </div>
          </div>

          <Separator />

          {/* Flow Rules Section */}
          <div className="space-y-4">
            <Label className="text-xs uppercase tracking-wide text-neutral-500">Flow Rules</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-700">Keep headings with next paragraph</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-700">Avoid widows/orphans</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-700">Avoid breaks in tables/images/code</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-700">Start chapters on right page</Label>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-700">Insert blank pages automatically</Label>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          {/* Front Matter Section */}
          <div className="space-y-4">
            <Label className="text-xs uppercase tracking-wide text-neutral-500">Front Matter</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-700">Title page</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-700">Auto-generate table of contents</Label>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-neutral-700">Page numbering style</Label>
                <select className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white">
                  <option>1, 2, 3...</option>
                  <option>i, ii, iii...</option>
                  <option>a, b, c...</option>
                  <option>No numbers</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-neutral-700">Switch to Arabic at page</Label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Catalogue Mode (Conditional) */}
          <div className="space-y-4 opacity-50 pointer-events-none">
            <Label className="text-xs uppercase tracking-wide text-neutral-500">Catalogue Mode</Label>
            <p className="text-xs text-neutral-500">Available when Catalogue format is selected</p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm text-neutral-700">Grid layout</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">2 Col</Button>
                  <Button variant="outline" size="sm">3 Col</Button>
                  <Button variant="outline" size="sm">4 Col</Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-700">Lock image + caption together</Label>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-700">Auto index page</Label>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          {/* Preflight Panel */}
          <div className="space-y-4">
            <Label className="text-xs uppercase tracking-wide text-neutral-500">Check Preflight</Label>
            
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${preflightMeta.tone}`} />
                <span className="text-xs uppercase tracking-wide text-neutral-500">{preflightMeta.state}</span>
              </div>
              <div className={`text-sm font-medium ${preflightMeta.tone}`}>{preflightMeta.title}</div>
              <p className="text-sm text-neutral-600">{preflightMeta.subtext}</p>

              {preflight.issues.map((issue) => (
                <div key={issue.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-sm font-medium text-neutral-800">{issue.title}</div>
                  <p className="mt-1 text-xs text-neutral-600">{issue.text}</p>
                </div>
              ))}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-neutral-500">Page count</div>
                  <div className="font-semibold text-neutral-900">24 pages</div>
                </div>
                <div>
                  <div className="text-neutral-500">Export safe</div>
                  <div className="font-semibold text-green-600">Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
