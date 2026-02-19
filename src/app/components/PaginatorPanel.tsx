import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function PaginatorPanel() {
  const [resetSeed, setResetSeed] = useState(0);

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
          onClick={() => setResetSeed((prev) => prev + 1)}
        >
          Reset Layout
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div key={resetSeed} className="p-6 space-y-8">
          {/* Format Section */}
          <div className="space-y-4">
            <Label className="text-xs uppercase tracking-wide text-neutral-500">Output Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-50 text-sm font-medium text-blue-900 transition-colors">
                Zine
              </button>
              <button className="px-4 py-3 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-400 transition-colors">
                Book
              </button>
              <button className="px-4 py-3 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-400 transition-colors">
                Catalogue
              </button>
              <button className="px-4 py-3 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-400 transition-colors">
                Report
              </button>
              <button className="px-4 py-3 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-400 transition-colors col-span-2">
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
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-neutral-700">No overflow warnings</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-neutral-700">All fonts available</span>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-neutral-700">2 images missing</span>
              </div>

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
