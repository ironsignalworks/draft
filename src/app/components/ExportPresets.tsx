import React, { useEffect, useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Check, FileDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { InspectorSettings } from './InspectorPanel';

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

const EXPORT_PRESETS_STORAGE_KEY = 'draft_export_presets';

interface ExportPresetsProps {
  inspectorSettings: InspectorSettings;
  onApplyTemplate: (settings: Pick<InspectorSettings, 'exportQuality' | 'compression' | 'includeMetadata' | 'watermark'>) => void;
}

function qualityLabel(value: number): string {
  if (value >= 90) return 'Maximum';
  if (value >= 75) return 'High';
  if (value >= 60) return 'Good';
  return 'Standard';
}

function compressionLabel(enabled: boolean): string {
  return enabled ? 'Medium' : 'None';
}

function qualityValue(value: string): number {
  const normalized = value.toLowerCase();
  if (normalized === 'maximum') return 95;
  if (normalized === 'high') return 85;
  if (normalized === 'good') return 75;
  return 60;
}

function compressionEnabled(value: string): boolean {
  return value.toLowerCase() !== 'none';
}

export function ExportPresets({ inspectorSettings, onApplyTemplate }: ExportPresetsProps) {
  const [presets, setPresets] = useState<ExportPreset[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EXPORT_PRESETS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ExportPreset[];
      if (Array.isArray(parsed)) {
        setPresets(parsed);
      }
    } catch {
      // ignore corrupt local cache
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(EXPORT_PRESETS_STORAGE_KEY, JSON.stringify(presets));
  }, [presets]);

  const handleSaveCurrentPreset = () => {
    const nextIndex = presets.length + 1;
    const newPreset: ExportPreset = {
      id: crypto.randomUUID(),
      name: `Template ${nextIndex}`,
      description: 'Saved from current export configuration',
      settings: {
        dpi: 150,
        compression: compressionLabel(inspectorSettings.compression),
        quality: qualityLabel(inspectorSettings.exportQuality),
      },
    };
    setPresets((prev) => [newPreset, ...prev]);
    toast.success('Template saved');
  };

  const handleDeletePreset = (presetId: string) => {
    setPresets((prev) => prev.filter((preset) => preset.id !== presetId));
    toast.success('Template removed');
  };

  const handleApplyTemplate = (preset: ExportPreset) => {
    onApplyTemplate({
      exportQuality: qualityValue(preset.settings.quality),
      compression: compressionEnabled(preset.settings.compression),
      includeMetadata: true,
      watermark: false,
    });
    toast.success(`Applied "${preset.name}"`);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Export Templates</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Save templates and apply them when opening export.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-neutral-900 hover:bg-neutral-800"
          onClick={handleSaveCurrentPreset}
        >
          Save current template
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {presets.length === 0 && (
            <Card className="p-8 border-2 border-dashed border-neutral-300">
              <div className="text-center">
                <h3 className="font-semibold text-neutral-900 mb-1">No templates yet</h3>
                <p className="text-sm text-neutral-500">Save your current export settings to create the first template.</p>
              </div>
            </Card>
          )}

          {presets.map((preset) => (
            <Card
              key={preset.id}
              className="p-6 border-neutral-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-1">{preset.name}</h3>
                  <p className="text-sm text-neutral-500">{preset.description}</p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeletePreset(preset.id)}
                  title="Delete template"
                  aria-label={`Delete template ${preset.name}`}
                >
                  <Trash2 className="w-4 h-4 text-neutral-500" />
                </Button>
              </div>

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

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleApplyTemplate(preset)}
                >
                  <Check className="w-4 h-4" />
                  Apply template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleApplyTemplate(preset)}
                >
                  <FileDown className="w-4 h-4" />
                  Open export
                </Button>
              </div>
            </Card>
          ))}

          <Card className="p-8 border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition-colors cursor-pointer" onClick={handleSaveCurrentPreset}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <FileDown className="w-6 h-6 text-neutral-500" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">
                Save current template
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
