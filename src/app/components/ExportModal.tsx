import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Download, CheckCircle } from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExportModal({ open, onClose }: ExportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Export Document</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 flex-1 overflow-hidden px-6 pb-6">
          {/* Preview */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 bg-neutral-100 rounded-lg p-6">
              <div className="space-y-4">
                {/* Page previews */}
                {[1, 2, 3, 4].map((page) => (
                  <div key={page} className="bg-white rounded shadow-sm p-8 aspect-[1/1.414]">
                    <div className="text-xs text-neutral-400 mb-4">Page {page}</div>
                    <div className="space-y-2">
                      <div className="h-3 bg-neutral-200 rounded w-3/4" />
                      <div className="h-3 bg-neutral-200 rounded w-full" />
                      <div className="h-3 bg-neutral-200 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Preview matches export exactly
            </div>
          </div>

          {/* Settings */}
          <div className="w-80 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-6 pr-2">
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-neutral-500">
                    Page Count
                  </Label>
                  <div className="text-2xl font-semibold text-neutral-900">24 pages</div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-neutral-500">
                    Export Preset
                  </Label>
                  <select className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white">
                    <option>High Quality Print</option>
                    <option>Screen PDF</option>
                    <option>Compressed</option>
                    <option>Press Ready</option>
                  </select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-neutral-500">
                    Compression
                  </Label>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-neutral-700">Quality</span>
                      <span className="text-sm text-neutral-500">High</span>
                    </div>
                    <Slider defaultValue={[85]} max={100} step={5} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-neutral-500">
                    DPI
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">72</Button>
                    <Button variant="outline" size="sm" className="bg-neutral-100">150</Button>
                    <Button variant="outline" size="sm">300</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-neutral-700">Watermark</Label>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-neutral-700">Include metadata</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-neutral-700">Embed fonts</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-neutral-500">
                    Estimated Size
                  </Label>
                  <div className="text-lg font-semibold text-neutral-900">2.4 MB</div>
                </div>
              </div>
            </ScrollArea>

            <div className="mt-6 space-y-2">
              <Button className="w-full gap-2 bg-neutral-900 hover:bg-neutral-800">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}