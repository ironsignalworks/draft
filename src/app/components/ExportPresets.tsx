import React, { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { FileDown, Settings, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportPreset {
  id: string;
  name: string;
  description: string;
  settings: {
    dpi: number;
    compression: string;
    quality: string;
  };
}

const initialPresets: ExportPreset[] = [
  {
    id: '1',
    name: 'High Quality Print',
    description: 'Best for professional printing',
    settings: { dpi: 300, compression: 'Low', quality: 'Maximum' },
  },
  {
    id: '2',
    name: 'Screen PDF',
    description: 'Optimized for digital viewing',
    settings: { dpi: 150, compression: 'Medium', quality: 'Good' },
  },
  {
    id: '3',
    name: 'Press Ready',
    description: 'Commercial print specifications',
    settings: { dpi: 300, compression: 'None', quality: 'Maximum' },
  },
  {
    id: '4',
    name: 'Compressed',
    description: 'Smaller file size for sharing',
    settings: { dpi: 72, compression: 'High', quality: 'Standard' },
  },
];

export function ExportPresets() {
  const [presets, setPresets] = useState<ExportPreset[]>(initialPresets);

  const handleSaveCurrentPreset = () => {
    const nextIndex = presets.length + 1;
    const newPreset: ExportPreset = {
      id: crypto.randomUUID(),
      name: `Current Preset ${nextIndex}`,
      description: 'Saved from current export configuration',
      settings: { dpi: 150, compression: 'Medium', quality: 'High' },
    };
    setPresets((prev) => [newPreset, ...prev]);
    toast.success('Preset saved');
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Export Presets</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your saved export configurations
          </p>
        </div>
        <Button
          size="sm"
          className="bg-neutral-900 hover:bg-neutral-800"
          onClick={handleSaveCurrentPreset}
        >
          Save current preset
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {presets.map((preset) => (
            <Card
              key={preset.id}
              className="p-6 border-neutral-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {preset.name}
                  </h3>
                  <p className="text-sm text-neutral-500">{preset.description}</p>
                </div>

                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="w-4 h-4 text-neutral-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Copy className="w-4 h-4 text-neutral-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4 text-neutral-500" />
                  </Button>
                </div>
              </div>

              {/* Settings Summary */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    DPI
                  </div>
                  <div className="text-sm font-medium text-neutral-900">
                    {preset.settings.dpi}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    Compression
                  </div>
                  <div className="text-sm font-medium text-neutral-900">
                    {preset.settings.compression}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    Quality
                  </div>
                  <div className="text-sm font-medium text-neutral-900">
                    {preset.settings.quality}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <Button variant="outline" size="sm" className="w-full gap-2">
                <FileDown className="w-4 h-4" />
                Export Final PDF
              </Button>
            </Card>
          ))}

          {/* Custom Preset Card */}
          <Card
            className="p-8 border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition-colors cursor-pointer"
            onClick={handleSaveCurrentPreset}
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <FileDown className="w-6 h-6 text-neutral-500" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">
                Save current preset
              </h3>
              <p className="text-sm text-neutral-500">
                Capture the current settings for reuse
              </p>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
