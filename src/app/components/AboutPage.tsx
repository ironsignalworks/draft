import React from 'react';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

export function AboutPage() {
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


