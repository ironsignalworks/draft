// @vitest-environment jsdom
import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { TopBar } from './TopBar';
import { InspectorPanel, type InspectorSettings } from './InspectorPanel';

const baseInspectorSettings: InspectorSettings = {
  margins: { top: 25, bottom: 25, left: 20, right: 20 },
  columns: 1,
  sectionGap: 24,
  paragraphGap: 12,
  primaryFont: 'Inter',
  textColor: '#404040',
  bodyFontSize: 14,
  headingScale: 15,
  bodyRhythm: 16,
  typePreset: 'Editorial',
  headerContent: '',
  footerContent: '',
  addSignature: false,
  signatureLabel: 'Approved by',
  signatureFileName: '',
  numberingFormat: 'bottom-center',
  exportQuality: 80,
  compression: true,
  watermark: false,
  includeMetadata: true,
};

describe('accessibility baseline', () => {
  beforeAll(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    }
  });

  it('TopBar has no obvious axe violations', async () => {
    const { container } = render(
      <TopBar
        isSidebarOpen={true}
        onToggleSidebar={() => {}}
        documentName="Test document"
        onDocumentNameChange={() => {}}
        formatPreset="book-a4"
        onFormatPresetChange={() => {}}
        searchQuery=""
        onSearchQueryChange={() => {}}
      />,
    );

    const result = await axe(container);
    expect(result.violations).toHaveLength(0);
  });

  it('InspectorPanel has no obvious axe violations', async () => {
    const { container } = render(
      <InspectorPanel
        settings={baseInspectorSettings}
        onChange={() => {}}
        onReset={() => {}}
      />,
    );

    const result = await axe(container);
    expect(result.violations).toHaveLength(0);
  });
});
