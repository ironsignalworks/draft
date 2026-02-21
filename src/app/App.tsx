import React, { useEffect, useRef, useState } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { TopBar, type FormatPresetId } from './components/TopBar';
import { EditorPanel } from './components/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { InspectorPanel, type InspectorSettings } from './components/InspectorPanel';
import { ExportModal } from './components/ExportModal';
import { SavedDocuments, type SavedDocumentRecord } from './components/SavedDocuments';
import { SettingsPanel, type WorkspaceSettings } from './components/SettingsPanel';
import { ExportPresets } from './components/ExportPresets';
import { NewDocumentView } from './components/NewDocumentView';
import { AboutPage } from './components/AboutPage';
import { MobileWorkspace } from './components/MobileWorkspace';
import { TabletWorkspace } from './components/TabletWorkspace';
import { ExportShareView } from './components/ExportShareView';
import { Toaster } from './components/ui/sonner';
import { PAGE_BREAK_TOKEN, splitContentIntoPages } from './lib/paging';
import { readExportSharePayloadFromLocation } from './lib/export';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from './components/ui/resizable';
import { toast } from 'sonner';

const defaultMarkdown = '';

const STORAGE_KEYS = {
  savedDocs: 'draft_saved_documents',
  workspaceSettings: 'draft_workspace_settings',
  inspectorSettings: 'draft_inspector_settings',
} as const;

const defaultWorkspaceSettings: WorkspaceSettings = {
  autoSave: true,
  editorFontSize: 14,
  defaultTemplate: 'book',
  defaultPageSize: 'a4',
  theme: 'light',
  uiScale: 'medium',
};

const defaultInspectorSettings: InspectorSettings = {
  margins: { top: 25, bottom: 25, left: 20, right: 20 },
  columns: 1,
  sectionGap: 24,
  paragraphGap: 12,
  primaryFont: 'Inter',
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

export default function App() {
  const [viewport, setViewport] = useState({ width: 1280, height: 720 });
  const [activeNav, setActiveNav] = useState('new');
  const [content, setContent] = useState(defaultMarkdown);
  const [documentName, setDocumentName] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formatPreset, setFormatPreset] = useState<FormatPresetId>('book-a4');
  const [fullBookPreview] = useState(false);
  const [previewPageCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [importedImageUrls, setImportedImageUrls] = useState<string[]>([]);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocumentRecord[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>(defaultWorkspaceSettings);
  const [inspectorSettings, setInspectorSettings] = useState<InspectorSettings>(defaultInspectorSettings);
  const [lastProjectSavedAt, setLastProjectSavedAt] = useState<number | null>(null);
  const importedImageUrlsRef = useRef<string[]>([]);
  const sharePayload = readExportSharePayloadFromLocation();

  const presetMap: Record<
    FormatPresetId,
    {
      label: string;
      layoutFormat: 'book' | 'zine' | 'catalogue' | 'report' | 'custom';
      pageSize: 'a4' | 'a5' | 'letter' | 'legal';
    }
  > = {
    'book-a4': { label: 'Book - A4', layoutFormat: 'book', pageSize: 'a4' },
    'book-a5': { label: 'Book - A5', layoutFormat: 'book', pageSize: 'a5' },
    'novel-pocket': { label: 'Novel - Pocket', layoutFormat: 'book', pageSize: 'a5' },
    'textbook-a4': { label: 'Textbook - A4', layoutFormat: 'book', pageSize: 'a4' },
    'thesis-a4': { label: 'Thesis - A4', layoutFormat: 'book', pageSize: 'a4' },
    'report-a4': { label: 'Report - A4', layoutFormat: 'report', pageSize: 'a4' },
    'report-letter': { label: 'Report - Letter', layoutFormat: 'report', pageSize: 'letter' },
    'whitepaper-a4': { label: 'Whitepaper - A4', layoutFormat: 'report', pageSize: 'a4' },
    'proposal-letter': { label: 'Proposal - Letter', layoutFormat: 'report', pageSize: 'letter' },
    'memo-a4': { label: 'Memo - A4', layoutFormat: 'report', pageSize: 'a4' },
    'manual-letter': { label: 'Manual - Letter', layoutFormat: 'report', pageSize: 'letter' },
    'script-letter': { label: 'Script - Letter', layoutFormat: 'report', pageSize: 'letter' },
    'resume-letter': { label: 'Resume - Letter', layoutFormat: 'custom', pageSize: 'letter' },
    'cv-a4': { label: 'CV - A4', layoutFormat: 'custom', pageSize: 'a4' },
    'handout-a4': { label: 'Handout - A4', layoutFormat: 'custom', pageSize: 'a4' },
    'worksheet-letter': { label: 'Worksheet - Letter', layoutFormat: 'custom', pageSize: 'letter' },
    'zine-a5': { label: 'Zine - A5', layoutFormat: 'zine', pageSize: 'a5' },
    'booklet-a5': { label: 'Booklet - A5', layoutFormat: 'zine', pageSize: 'a5' },
    'flyer-a5': { label: 'Flyer - A5', layoutFormat: 'custom', pageSize: 'a5' },
    'catalogue-a4': { label: 'Catalogue - A4', layoutFormat: 'catalogue', pageSize: 'a4' },
    'magazine-a4': { label: 'Magazine - A4', layoutFormat: 'catalogue', pageSize: 'a4' },
    'magazine-letter': { label: 'Magazine - Letter', layoutFormat: 'catalogue', pageSize: 'letter' },
    'brochure-letter': { label: 'Brochure - Letter', layoutFormat: 'catalogue', pageSize: 'letter' },
    'legal-brief': { label: 'Legal Brief - Legal', layoutFormat: 'custom', pageSize: 'legal' },
  };
  const currentPreset = presetMap[formatPreset];

  const isPhone = viewport.width < 768;
  const isTabletPortrait = viewport.width >= 768 && viewport.width < 1024;
  const isTabletLandscape = viewport.width >= 1024 && viewport.width < 1280;
  const isDesktopLayout = viewport.width >= 1280;

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(isDesktopLayout);
  }, [isDesktopLayout]);

  useEffect(() => {
    try {
      const rawDocs = localStorage.getItem(STORAGE_KEYS.savedDocs);
      if (rawDocs) {
        const parsed = JSON.parse(rawDocs) as SavedDocumentRecord[];
        if (Array.isArray(parsed)) setSavedDocuments(parsed);
      }
      const rawWorkspace = localStorage.getItem(STORAGE_KEYS.workspaceSettings);
      if (rawWorkspace) {
        const parsed = JSON.parse(rawWorkspace) as WorkspaceSettings;
        setWorkspaceSettings({ ...defaultWorkspaceSettings, ...parsed });
      }
      const rawInspector = localStorage.getItem(STORAGE_KEYS.inspectorSettings);
      if (rawInspector) {
        const parsed = JSON.parse(rawInspector) as InspectorSettings;
        setInspectorSettings({ ...defaultInspectorSettings, ...parsed });
      }
    } catch {
      // local cache hydration is best effort
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.savedDocs, JSON.stringify(savedDocuments));
  }, [savedDocuments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.workspaceSettings, JSON.stringify(workspaceSettings));
  }, [workspaceSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.inspectorSettings, JSON.stringify(inspectorSettings));
  }, [inspectorSettings]);

  useEffect(() => {
    document.documentElement.dataset.theme = workspaceSettings.theme;
    document.documentElement.dataset.uiScale = workspaceSettings.uiScale;
  }, [workspaceSettings.theme, workspaceSettings.uiScale]);

  const isDocumentLoaded = showEditor || content.trim().length > 0 || documentName.trim().length > 0;

  const saveDocumentSnapshot = (id: string | null, nextTitle: string, nextContent: string) => {
    const title = nextTitle.trim() || 'Untitled Document';
    const pageCount = splitContentIntoPages(nextContent, 1800).length;
    const now = new Date().toISOString();
    if (id) {
      setSavedDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, title, content: nextContent, pageCount, updatedAt: now } : doc)));
      return id;
    }

    const createdId = crypto.randomUUID();
    setSavedDocuments((prev) => [{ id: createdId, title, content: nextContent, pageCount, updatedAt: now }, ...prev]);
    return createdId;
  };

  useEffect(() => {
    if (!workspaceSettings.autoSave) return;
    if (!showEditor && content.trim().length === 0 && documentName.trim().length === 0) return;

    const timer = window.setTimeout(() => {
      const savedId = saveDocumentSnapshot(activeDocumentId, documentName, content);
      if (!activeDocumentId) setActiveDocumentId(savedId);
      setLastProjectSavedAt(Date.now());
    }, 700);

    return () => window.clearTimeout(timer);
  }, [activeDocumentId, content, documentName, showEditor, workspaceSettings.autoSave]);

  const handleOpenSavedDocument = (id: string) => {
    const record = savedDocuments.find((doc) => doc.id === id);
    if (!record) return;
    setActiveDocumentId(record.id);
    setDocumentName(record.title);
    setContent(record.content);
    setShowEditor(true);
    setActiveNav('new');
    toast.success(`Opened "${record.title}"`);
  };

  const handleDuplicateSavedDocument = (id: string) => {
    const record = savedDocuments.find((doc) => doc.id === id);
    if (!record) return;
    const clone: SavedDocumentRecord = {
      ...record,
      id: crypto.randomUUID(),
      title: `${record.title} Copy`,
      updatedAt: new Date().toISOString(),
    };
    setSavedDocuments((prev) => [clone, ...prev]);
    toast.success('Document duplicated');
  };

  const handleDeleteSavedDocument = (id: string) => {
    setSavedDocuments((prev) => prev.filter((doc) => doc.id !== id));
    if (activeDocumentId === id) {
      setActiveDocumentId(null);
      setDocumentName('');
      setContent('');
      setShowEditor(false);
    }
    toast.success('Document removed');
  };

  const handleImportFile = async (file: File) => {
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('File too large. Limit is 2MB.');
      return;
    }

    const supportedTextExtensions = [
      '.md',
      '.markdown',
      '.txt',
      '.rtf',
      '.csv',
      '.json',
      '.xml',
      '.html',
      '.htm',
      '.yml',
      '.yaml',
    ];
    const supportedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
    const lowerName = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || supportedImageExtensions.some((ext) => lowerName.endsWith(ext));
    const isSupportedText = supportedTextExtensions.some((ext) => lowerName.endsWith(ext));
    const isSupported = isSupportedText || isImage;
    if (!isSupported) {
      toast.error('Unsupported format. Use text files or images (png, jpg, webp, gif, svg).');
      return;
    }

    try {
      if (isImage) {
        const imageUrl = URL.createObjectURL(file);
        setImportedImageUrls((prev) => [...prev, imageUrl]);
        setContent((prev) => {
          const trimmedPrev = prev.trim();
          const prefix = trimmedPrev.length > 0 ? `${trimmedPrev}\n\n${PAGE_BREAK_TOKEN}\n\n` : '';
          return `${prefix}![${file.name}](${imageUrl})\n\n${PAGE_BREAK_TOKEN}`;
        });
      } else {
        const importedText = await file.text();
        setContent(importedText);
      }
      setActiveDocumentId(null);
      setShowEditor(true);
      setActiveNav('new');
      toast.success(`Imported ${file.name}`);
    } catch {
      toast.error('Could not read that file.');
    }
  };

  useEffect(() => {
    importedImageUrlsRef.current = importedImageUrls;
  }, [importedImageUrls]);

  useEffect(() => {
    return () => {
      importedImageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const clearAndStartNewDocument = () => {
    setShowEditor(true);
    setDocumentName('');
    setContent('');
    setActiveDocumentId(null);
  };

  const handleFormatPresetChange = (nextPreset: FormatPresetId) => {
    setFormatPreset(nextPreset);
    if (activeNav === 'new' && !showEditor) {
      setShowEditor(true);
    }
  };

  const filteredContent =
    searchQuery.trim().length === 0
      ? content
      : content
          .split('\n')
          .filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
          .join('\n');

  const renderMainContent = () => {
    if (activeNav === 'new' && !showEditor) {
      return (
        <NewDocumentView
          onStartBlank={() => {
            clearAndStartNewDocument();
          }}
        />
      );
    }

    if (activeNav === 'saved') {
      return (
        <SavedDocuments
          documents={savedDocuments}
          onOpenDocument={handleOpenSavedDocument}
          onDuplicateDocument={handleDuplicateSavedDocument}
          onDeleteDocument={handleDeleteSavedDocument}
        />
      );
    }

    if (activeNav === 'settings') {
      return <SettingsPanel settings={workspaceSettings} onChange={setWorkspaceSettings} />;
    }

    if (activeNav === 'about') {
      return <AboutPage />;
    }

    if (activeNav === 'export') {
      return <ExportPresets content={content} />;
    }

    return (
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20}>
          <EditorPanel
            content={content}
            onChange={setContent}
            isDocumentLoaded={isDocumentLoaded}
            onNewDocument={clearAndStartNewDocument}
            onImportFile={handleImportFile}
            editorFontSize={workspaceSettings.editorFontSize}
          />
        </ResizablePanel>

        <ResizableHandle className="w-px bg-neutral-200" />

        <ResizablePanel defaultSize={50} minSize={30}>
          <PreviewPanel
            content={filteredContent}
            layoutFormat={currentPreset.layoutFormat}
            pageSize={currentPreset.pageSize}
            fullBookPreview={fullBookPreview}
            previewPageCount={previewPageCount}
            activePresetName={currentPreset.label}
            inspectorSettings={inspectorSettings}
          />
        </ResizablePanel>

        <ResizableHandle className="w-px bg-neutral-200" />

        <ResizablePanel defaultSize={25} minSize={20}>
          <InspectorPanel settings={inspectorSettings} onChange={setInspectorSettings} />
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  };

  if (sharePayload) {
    return (
      <>
        <ExportShareView payload={sharePayload} />
        <Toaster />
      </>
    );
  }

  if (isPhone) {
    return (
      <div className="h-screen w-full max-w-full overflow-hidden bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
        <MobileWorkspace
          content={content}
          onContentChange={setContent}
          documentName={documentName}
          onDocumentNameChange={setDocumentName}
          onImportFile={handleImportFile}
          onNewDocument={clearAndStartNewDocument}
          onOpenSavedDocs={() => setActiveNav('saved')}
          onOpenSettings={() => setActiveNav('settings')}
          onOpenExport={() => setExportModalOpen(true)}
          savedDocuments={savedDocuments}
          onOpenSavedDocument={handleOpenSavedDocument}
          onDuplicateSavedDocument={handleDuplicateSavedDocument}
          onDeleteSavedDocument={handleDeleteSavedDocument}
          workspaceSettings={workspaceSettings}
          onWorkspaceSettingsChange={setWorkspaceSettings}
        />

        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          content={content}
          documentName={documentName}
          inspectorSettings={inspectorSettings}
          projectSavedAt={lastProjectSavedAt}
          onReviewLayout={() => {
            setShowEditor(true);
            setActiveNav('new');
          }}
        />

        <Toaster />
      </div>
    );
  }

  if (isTabletPortrait || isTabletLandscape) {
    return (
      <div className="h-screen w-full max-w-full overflow-hidden bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
        <TabletWorkspace
          mode={isTabletLandscape ? 'landscape' : 'portrait'}
          content={content}
          onContentChange={setContent}
          documentName={documentName}
          onDocumentNameChange={setDocumentName}
          onImportFile={handleImportFile}
          onNewDocument={clearAndStartNewDocument}
          onOpenSavedDocs={() => setActiveNav('saved')}
          onOpenSettings={() => setActiveNav('settings')}
          onOpenExport={() => setExportModalOpen(true)}
          savedDocuments={savedDocuments}
          onOpenSavedDocument={handleOpenSavedDocument}
          onDuplicateSavedDocument={handleDuplicateSavedDocument}
          onDeleteSavedDocument={handleDeleteSavedDocument}
          workspaceSettings={workspaceSettings}
          onWorkspaceSettingsChange={setWorkspaceSettings}
        />

        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          content={content}
          documentName={documentName}
          inspectorSettings={inspectorSettings}
          projectSavedAt={lastProjectSavedAt}
          onReviewLayout={() => {
            setShowEditor(true);
            setActiveNav('new');
          }}
        />

        <Toaster />
      </div>
    );
  }

  return (
    <div className="relative h-screen flex bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className={`${!isDesktopLayout ? 'absolute inset-y-0 left-0 z-40' : 'relative'} transition-all duration-200 ease-out overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        {isSidebarOpen && (
          <LeftSidebar
            activeNav={activeNav}
            onNavChange={(nav) => {
              setActiveNav(nav);
              if (!isDesktopLayout) setIsSidebarOpen(false);
            }}
            onExportClick={() => setExportModalOpen(true)}
            onImportFile={handleImportFile}
          />
        )}
      </div>
      {!isDesktopLayout && isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="absolute inset-0 z-30 bg-black/25"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <TopBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          documentName={documentName}
          onDocumentNameChange={setDocumentName}
          onExportClick={() => setExportModalOpen(true)}
          formatPreset={formatPreset}
          onFormatPresetChange={handleFormatPresetChange}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        <div className="flex-1 min-h-0 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        content={content}
        documentName={documentName}
        inspectorSettings={inspectorSettings}
        projectSavedAt={lastProjectSavedAt}
        onReviewLayout={() => {
          setShowEditor(true);
          setActiveNav('new');
        }}
      />

      <Toaster />
    </div>
  );
}


