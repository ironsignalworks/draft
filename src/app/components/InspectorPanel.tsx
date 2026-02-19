import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

export function InspectorPanel() {
  return (
    <div className="h-full bg-white border-l border-neutral-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <h2 className="text-sm font-semibold text-neutral-900">Inspector</h2>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="layout" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-neutral-200 bg-transparent p-0">
          <TabsTrigger
            value="layout"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent"
          >
            Layout
          </TabsTrigger>
          <TabsTrigger
            value="typography"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent"
          >
            Typography
          </TabsTrigger>
          <TabsTrigger
            value="header"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent"
          >
            Header/Footer
          </TabsTrigger>
          <TabsTrigger
            value="export"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent"
          >
            Export
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Layout Tab */}
          <TabsContent value="layout" className="p-6 space-y-6 mt-0">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Page Size</Label>
              <select className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white">
                <option>A4 (210 × 297mm)</option>
                <option>Letter (8.5 × 11in)</option>
                <option>A5 (148 × 210mm)</option>
                <option>Custom</option>
              </select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Margins</Label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-700">Top</span>
                    <span className="text-sm text-neutral-500">25mm</span>
                  </div>
                  <Slider defaultValue={[25]} max={50} step={1} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-700">Bottom</span>
                    <span className="text-sm text-neutral-500">25mm</span>
                  </div>
                  <Slider defaultValue={[25]} max={50} step={1} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-700">Left</span>
                    <span className="text-sm text-neutral-500">20mm</span>
                  </div>
                  <Slider defaultValue={[20]} max={50} step={1} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-700">Right</span>
                    <span className="text-sm text-neutral-500">20mm</span>
                  </div>
                  <Slider defaultValue={[20]} max={50} step={1} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Columns</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">1 Column</Button>
                <Button variant="outline" size="sm" className="flex-1">2 Columns</Button>
              </div>
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="p-6 space-y-6 mt-0">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Font Family</Label>
              <select className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white">
                <option>Inter</option>
                <option>IBM Plex Sans</option>
                <option>Source Sans Pro</option>
                <option>Georgia</option>
                <option>Times New Roman</option>
              </select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Heading Scale</Label>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-700">Scale Factor</span>
                  <span className="text-sm text-neutral-500">1.5</span>
                </div>
                <Slider defaultValue={[15]} min={10} max={25} step={1} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Paragraph Spacing</Label>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-700">Line Height</span>
                  <span className="text-sm text-neutral-500">1.6</span>
                </div>
                <Slider defaultValue={[16]} min={10} max={25} step={1} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Editorial</Button>
                <Button variant="outline" size="sm">Technical</Button>
                <Button variant="outline" size="sm">Compact</Button>
                <Button variant="outline" size="sm">Resume</Button>
              </div>
            </div>
          </TabsContent>

          {/* Header/Footer Tab */}
          <TabsContent value="header" className="p-6 space-y-6 mt-0">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Running Header</Label>
              <input
                type="text"
                placeholder="Document title"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Page Numbers</Label>
              <select className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white">
                <option>Bottom Center</option>
                <option>Bottom Right</option>
                <option>Top Right</option>
                <option>None</option>
              </select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm text-neutral-700">Footer Metadata</Label>
              <Switch />
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="p-6 space-y-6 mt-0">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-neutral-500">Quality</Label>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-700">Print Quality</span>
                  <span className="text-sm text-neutral-500">High</span>
                </div>
                <Slider defaultValue={[80]} max={100} step={10} />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm text-neutral-700">Compression</Label>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-neutral-700">Watermark</Label>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-neutral-700">Include Metadata</Label>
              <Switch defaultChecked />
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
