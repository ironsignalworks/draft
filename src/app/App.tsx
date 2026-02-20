import React, { useEffect, useState } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { TopBar } from './components/TopBar';
import { EditorPanel } from './components/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { PaginatorPanel } from './components/PaginatorPanel';
import { ExportModal } from './components/ExportModal';
import { TemplateGrid } from './components/TemplateGrid';
import { SavedDocuments } from './components/SavedDocuments';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportPresets } from './components/ExportPresets';
import { NewDocumentView } from './components/NewDocumentView';
import { AboutPage } from './components/AboutPage';
import { MobileWorkspace } from './components/MobileWorkspace';
import { TabletWorkspace } from './components/TabletWorkspace';
import { Toaster } from './components/ui/sonner';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from './components/ui/resizable';
import { toast } from 'sonner';

const defaultMarkdown = '';

export default function App() {
  const [viewport, setViewport] = useState({ width: 1280, height: 720 });
  const [activeNav, setActiveNav] = useState('new');
  const [content, setContent] = useState(defaultMarkdown);
  const [documentName, setDocumentName] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStackedLayout, setIsStackedLayout] = useState(false);
  const [stackedWorkspaceTab, setStackedWorkspaceTab] = useState<'editor' | 'preview' | 'inspector'>('preview');
  const [stackedPaginatorTab, setStackedPaginatorTab] = useState<'saved' | 'paginator'>('saved');

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
  const isDocumentLoaded = showEditor || content.trim().length > 0 || documentName.trim().length > 0;

  const handleImportFile = async (file: File) => {
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('File too large. Limit is 2MB.');
      return;
    }

    const supportedExtensions = [
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
    const lowerName = file.name.toLowerCase();
    const isSupported = supportedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isSupported) {
      toast.error('Unsupported format. Use: md, txt, rtf, csv, json, xml, html, yml.');
      return;
    }

    try {
      const importedText = await file.text();
      setContent(importedText);
      setShowEditor(true);
      setActiveNav('paginator');
      setStackedPaginatorTab('paginator');
      toast.success(`Imported ${file.name}`);
    } catch {
      toast.error('Could not read that file.');
    }
  };

  const renderMainContent = () => {
    const useStackedPanels = isStackedLayout;

    // Show new document welcome view
    if (activeNav === 'new' && !showEditor) {
      return (
        <NewDocumentView
          onStartBlank={() => {
            setShowEditor(true);
            setStackedWorkspaceTab('editor');
          }}
          onOpenTemplates={() => setActiveNav('templates')}
        />
      );
    }

    // Show template grid
    if (activeNav === 'templates') {
      return <TemplateGrid />;
    }

    // Show saved documents
    if (activeNav === 'saved') {
      return <SavedDocuments />;
    }

    // Show settings
    if (activeNav === 'settings') {
      return <SettingsPanel />;
    }

    // Show about
    if (activeNav === 'about') {
      return <AboutPage />;
    }

    // Show export presets
    if (activeNav === 'export') {
      return <ExportPresets />;
    }

    // Show paginator panel
    if (activeNav === 'paginator') {
      if (useStackedPanels) {
        return (
          <div className="h-full flex flex-col min-h-0">
            <div className="border-b border-neutral-200 bg-white p-2 flex gap-2">
              <button
                type="button"
                className={`h-8 px-3 text-xs rounded-md border shadow-sm ${
                  stackedPaginatorTab === 'saved' ? 'border-neutral-900 bg-neutral-100 text-neutral-900' : 'border-neutral-300 text-neutral-600'
                }`}
                onClick={() => setStackedPaginatorTab('saved')}
              >
                Saved docs
              </button>
              <button
                type="button"
                className={`h-8 px-3 text-xs rounded-md border shadow-sm ${
                  stackedPaginatorTab === 'paginator' ? 'border-neutral-900 bg-neutral-100 text-neutral-900' : 'border-neutral-300 text-neutral-600'
                }`}
                onClick={() => setStackedPaginatorTab('paginator')}
              >
                Paginator
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {stackedPaginatorTab === 'saved' ? <SavedDocuments /> : <PaginatorPanel />}
            </div>
          </div>
        );
      }

      return (
        <div className="flex h-full min-w-0">
          <div className="flex-1 min-w-0">
            <SavedDocuments />
          </div>

          {/* Paginator Panel on Right */}
          <div className="w-96 shrink-0 border-l border-neutral-200 overflow-hidden">
            <PaginatorPanel />
          </div>
        </div>
      );
    }

    // Default 3-panel workspace
    if (useStackedPanels) {
      return (
        <div className="h-full flex flex-col min-h-0">
          <div className="border-b border-neutral-200 bg-white p-2 flex gap-2">
            <button
              type="button"
              className={`h-8 px-3 text-xs rounded-md border shadow-sm ${
                stackedWorkspaceTab === 'editor' ? 'border-neutral-900 bg-neutral-100 text-neutral-900' : 'border-neutral-300 text-neutral-600'
              }`}
              onClick={() => setStackedWorkspaceTab('editor')}
            >
              Editor
            </button>
            <button
              type="button"
              className={`h-8 px-3 text-xs rounded-md border shadow-sm ${
                stackedWorkspaceTab === 'preview' ? 'border-neutral-900 bg-neutral-100 text-neutral-900' : 'border-neutral-300 text-neutral-600'
              }`}
              onClick={() => setStackedWorkspaceTab('preview')}
            >
              Preview
            </button>
            <button
              type="button"
              className={`h-8 px-3 text-xs rounded-md border shadow-sm ${
                stackedWorkspaceTab === 'inspector' ? 'border-neutral-900 bg-neutral-100 text-neutral-900' : 'border-neutral-300 text-neutral-600'
              }`}
              onClick={() => setStackedWorkspaceTab('inspector')}
            >
              Inspector
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {stackedWorkspaceTab === 'editor' && (
              <EditorPanel
                content={content}
                onChange={setContent}
                isDocumentLoaded={isDocumentLoaded}
                onNewDocument={() => {
                  setShowEditor(true);
                  setDocumentName('');
                  setContent('');
                }}
                onImportFile={handleImportFile}
              />
            )}
            {stackedWorkspaceTab === 'preview' && <PreviewPanel content={content} />}
            {stackedWorkspaceTab === 'inspector' && <InspectorPanel />}
          </div>
        </div>
      );
    }

    return (
      <ResizablePanelGroup direction="horizontal">
        {/* Editor */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <EditorPanel
            content={content}
            onChange={setContent}
            isDocumentLoaded={isDocumentLoaded}
            onNewDocument={() => {
              setShowEditor(true);
              setDocumentName('');
              setContent('');
            }}
            onImportFile={handleImportFile}
          />
        </ResizablePanel>

        <ResizableHandle className="w-px bg-neutral-200" />

        {/* Preview */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <PreviewPanel content={content} />
        </ResizablePanel>

        <ResizableHandle className="w-px bg-neutral-200" />

        {/* Inspector */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <InspectorPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  };

  if (isPhone) {
    return (
      <div className="h-screen w-full max-w-full overflow-hidden bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
        <MobileWorkspace
          content={content}
          onContentChange={setContent}
          documentName={documentName}
          onDocumentNameChange={setDocumentName}
          onImportFile={handleImportFile}
          onNewDocument={() => {
            setShowEditor(true);
            setDocumentName('');
            setContent('');
          }}
          onOpenTemplates={() => setActiveNav('templates')}
          onOpenSavedDocs={() => setActiveNav('saved')}
          onOpenSettings={() => setActiveNav('settings')}
          onOpenExport={() => setExportModalOpen(true)}
        />

        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          content={content}
          onReviewLayout={() => {
            setShowEditor(true);
            setActiveNav('paginator');
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
          onNewDocument={() => {
            setShowEditor(true);
            setDocumentName('');
            setContent('');
          }}
          onOpenTemplates={() => setActiveNav('templates')}
          onOpenSavedDocs={() => setActiveNav('saved')}
          onOpenSettings={() => setActiveNav('settings')}
          onOpenExport={() => setExportModalOpen(true)}
        />

        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          content={content}
          onReviewLayout={() => {
            setShowEditor(true);
            setActiveNav('paginator');
          }}
        />

        <Toaster />
      </div>
    );
  }

  return (
    <div className="relative h-screen flex bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left Sidebar */}
      <div className={`${!isDesktopLayout ? 'absolute inset-y-0 left-0 z-40' : 'relative'} transition-all duration-200 ease-out overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        {isSidebarOpen && (
          <LeftSidebar
            activeNav={activeNav}
            onNavChange={(nav) => {
              setActiveNav(nav);
              if (!isDesktopLayout) setIsSidebarOpen(false);
            }}
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

      {/* Main Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isStackedLayout={isStackedLayout}
          onToggleStackedLayout={() => setIsStackedLayout((prev) => !prev)}
          documentName={documentName}
          onDocumentNameChange={setDocumentName}
          onExportClick={() => setExportModalOpen(true)}
        />

        {/* Main Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        content={content}
        onReviewLayout={() => {
          setShowEditor(true);
          setActiveNav('paginator');
        }}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
