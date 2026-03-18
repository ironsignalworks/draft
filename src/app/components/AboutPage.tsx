import React from 'react';
import { ErrorButton } from './ErrorButton';
import { useUser } from '../hooks/useUser';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

type ProbeMode = 'ok' | 'slow' | 'error' | 'invalid' | 'timeout' | 'empty';

export function AboutPage() {
  const [probeEnabled, setProbeEnabled] = React.useState(false);
  const [probeMode, setProbeMode] = React.useState<ProbeMode>('ok');
  const probe = useUser({ mode: probeMode, enabled: probeEnabled });

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">About Draft</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Browser-native document editor for Markdown, plain text, and image pages.
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <Card className="max-w-3xl p-6 border-neutral-200 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">What it does</h3>
              <p className="text-sm text-neutral-600 mt-2">
                Draft lets you write or import content, preview fixed pages, and export share-ready PDF output directly in the browser.
              </p>
            </div>

            <Separator className="bg-neutral-200" />

            <div>
              <h3 className="text-base font-semibold text-neutral-900">Core features</h3>
              <ul className="text-sm text-neutral-600 mt-2 list-disc pl-5 space-y-1">
                <li>Continuous document editing with Markdown support</li>
                <li>Fixed-page live preview with zoom, rulers, and image placement</li>
                <li>Format presets, Library documents, and workspace preferences</li>
                <li>PDF export with downloadable files and share links</li>
              </ul>
            </div>

            <Separator className="bg-neutral-200" />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-neutral-900">Runtime health check</h3>
                {import.meta.env.DEV && (
                  <select
                    value={probeMode}
                    onChange={(event) => setProbeMode(event.target.value as ProbeMode)}
                    className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-xs text-neutral-700"
                    aria-label="Probe mode"
                  >
                    <option value="ok">OK</option>
                    <option value="slow">Slow</option>
                    <option value="error">500 error</option>
                    <option value="invalid">Invalid payload</option>
                    <option value="timeout">Timeout</option>
                    <option value="empty">Empty payload</option>
                  </select>
                )}
              </div>
              <p className="text-sm text-neutral-600">
                This check demonstrates loading, empty, error, and success behaviors with a safe retry.
              </p>
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                {probe.state === 'loading' && (
                  <p className="text-sm text-neutral-600">Loading status...</p>
                )}
                {probe.state === 'empty' && (
                  <p className="text-sm text-neutral-600">No status loaded yet. Run the check to verify API behavior.</p>
                )}
                {probe.state === 'error' && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-700">Data temporarily unavailable</p>
                    <p className="text-xs text-neutral-600">{probe.error ?? 'Try again later.'}</p>
                  </div>
                )}
                {probe.state === 'success' && probe.data && (
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-800">Connected as {probe.data.name}</p>
                    <p className="text-xs text-neutral-600">{probe.data.email}</p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProbeEnabled(true);
                      probe.refetch();
                    }}
                    className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
                  >
                    {probeEnabled ? 'Retry check' : 'Run check'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProbeEnabled(false);
                    }}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    Reset
                  </button>
                  {import.meta.env.DEV && <ErrorButton />}
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            <div>
              <h3 className="text-base font-semibold text-neutral-900">Support</h3>
              <p className="text-sm text-neutral-600 mt-2">
                Iron Signal Works tools stay free, independent, and ad-free because some users choose to support them.
              </p>
              <a
                href="https://donate.stripe.com/4gMdR25le5GXenHbrT5Ne00"
                target="_blank"
                rel="noreferrer"
                className="inline-flex mt-3 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
              >
                Donate via Stripe
              </a>
            </div>

            <Separator className="bg-neutral-200" />

            <p className="text-xs text-neutral-500">
              All content shown in this prototype runs locally in your browser.
            </p>
            <p className="text-xs text-neutral-500">
              Built by ironsignalworks.
            </p>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
