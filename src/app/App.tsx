import React, { useState } from 'react';
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
import { Toaster } from './components/ui/sonner';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from './components/ui/resizable';
import { toast } from 'sonner';

const defaultMarkdown = '';

export default function App() {
  const [activeNav, setActiveNav] = useState('new');
  const [content, setContent] = useState(defaultMarkdown);
  const [documentName, setDocumentName] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
      toast.success(`Imported ${file.name}`);
    } catch {
      toast.error('Could not read that file.');
    }
  };

  const renderMainContent = () => {
    // Show new document welcome view
    if (activeNav === 'new' && !showEditor) {
      return (
        <NewDocumentView
          onStartBlank={() => setShowEditor(true)}
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

  return (
    <div className="h-screen flex bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left Sidebar */}
      <div className={`transition-all duration-200 ease-out overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        {isSidebarOpen && (
          <LeftSidebar 
            activeNav={activeNav} 
            onNavChange={setActiveNav}
            onExportClick={() => setExportModalOpen(true)}
            onImportFile={handleImportFile}
          />
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          documentName={documentName}
          onDocumentNameChange={setDocumentName}
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
