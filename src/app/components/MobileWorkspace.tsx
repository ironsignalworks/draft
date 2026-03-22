import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AlertTriangle,
  Download,
  FileSearch,
  FileText,
  FileOutput,
  Info,
  ImagePlus,
  LayoutTemplate,
  Menu,
  Settings,
  SquarePen,
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { toast } from 'sonner';
import { SavedDocuments, type SavedDocumentRecord } from './SavedDocuments';
import { SettingsPanel, type WorkspaceSettings } from './SettingsPanel';
import { AboutPage } from './AboutPage';
import { markdownUrlTransform } from '../lib/markdown';
import { splitContentIntoPages } from '../lib/paging';
import { analyzeDocument } from '../lib/preflight';
import logoIcon from '../../../icon-app.svg';

type MobileMode = 'edit' | 'preview' | 'layout' | 'preflight';
type UtilityView = 'none' | 'saved' | 'settings' | 'about';

interface MobileWorkspaceProps {
  content: string;
  onContentChange: (content: string) => void;
  documentName: string;
  onDocumentNameChange: (value: string) => void;
  onImportFile: (file: File) => void;
  onNewDocument: () => void;
  onOpenSavedDocs: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenExport: () => void;
  savedDocuments?: SavedDocumentRecord[];
  onOpenSavedDocument?: (id: string) => void;
  onDuplicateSavedDocument?: (id: string) => void;
  onDeleteSavedDocument?: (id: string) => void;
  workspaceSettings?: WorkspaceSettings;
  onWorkspaceSettingsChange?: (next: WorkspaceSettings) => void;
}

export function MobileWorkspace({
  content,
  onContentChange,
  documentName,
  onDocumentNameChange,
  onImportFile,
  onNewDocument,
  onOpenSavedDocs,
  onOpenSettings,
  onOpenAbout,
  onOpenExport,
  savedDocuments = [],
  onOpenSavedDocument,
  onDuplicateSavedDocument,
  onDeleteSavedDocument,
  workspaceSettings,
  onWorkspaceSettingsChange,
}: MobileWorkspaceProps) {
  const [mode, setMode] = React.useState<MobileMode>('edit');
  const [isRenamingTitle, setIsRenamingTitle] = React.useState(false);
  const [columns, setColumns] = React.useState<1 | 2>(1);
  const [utilityView, setUtilityView] = React.useState<UtilityView>('none');
  const [activePreviewPage, setActivePreviewPage] = React.useState(1);
  const [layoutMargin, setLayoutMargin] = React.useState(24);
  const [layoutHeaderFooterEnabled, setLayoutHeaderFooterEnabled] = React.useState(true);
  const editorRef = React.useRef<HTMLTextAreaElement | null>(null);

  const resolvedTitle = documentName.trim() || 'Untitled Document';
  const trimmedContent = content.trim();
  const hasContent = trimmedContent.length > 0;
  const previewChunks = hasContent ? splitContentIntoPages(content, 1600) : [''];
  const preflight = analyzeDocument(content);
  const totalPreviewPages = previewChunks.length;
  const currentPreviewPage = Math.min(Math.max(activePreviewPage, 1), totalPreviewPages);

  React.useEffect(() => {
    setActivePreviewPage((prev) => {
      if (prev < 1) return 1;
      if (prev > totalPreviewPages) return totalPreviewPages;
      return prev;
    });
  }, [totalPreviewPages]);

  const applyInlineWrap = (prefix: string, suffix = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const nextValue = `${content.slice(0, start)}${prefix}${selected}${suffix}${content.slice(end)}`;
    onContentChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const renderEditorMode = () => (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-2">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Content</p>
      </div>

      <div className="flex-1 min-h-0 px-4 py-3">
        <Textarea
          ref={editorRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="h-full min-h-0 rounded-lg border-neutral-300 bg-white text-sm leading-relaxed"
          placeholder="Start writing or paste Markdown..."
        />
      </div>

      <div className="border-t border-neutral-200 bg-white px-4 py-2">
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" onClick={() => applyInlineWrap('# ')}>
            H1
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyInlineWrap('**', '**')}>
            Bold
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyInlineWrap('- ')}>
            List
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyInlineWrap('![Image](' , ')')}>
            <ImagePlus className="h-4 w-4" />
            Image
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreviewMode = () => (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f5f5f5]">
      <div className="border-b border-[#e5e7eb] bg-[#ffffff] px-4 py-2">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Layout Preview</p>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <div className="mx-auto flex h-full w-full max-w-md flex-col gap-3">
          <div className="min-h-0 flex-1 rounded-lg bg-[#ffffff] p-4 shadow-sm">
            <div className="prose prose-sm h-full max-w-none overflow-hidden text-[#404040]">
              {hasContent ? (
                <ReactMarkdown urlTransform={markdownUrlTransform}>
                  {previewChunks[currentPreviewPage - 1] ?? ''}
                </ReactMarkdown>
              ) : (
                <div className="space-y-2 text-center text-sm text-[#6b7280]">
                  <h3 className="text-base font-semibold text-[#262626]">Preview will appear here</h3>
                  <p>As you add content, Draft will format it into pages automatically.</p>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPreviewPage <= 1}
              onClick={() => setActivePreviewPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </Button>
            <div className="flex items-center justify-center rounded-md border border-neutral-200 bg-white text-xs font-medium text-neutral-600">
              Page {currentPreviewPage}/{totalPreviewPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPreviewPage >= totalPreviewPages}
              onClick={() => setActivePreviewPage((prev) => Math.min(totalPreviewPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayoutMode = () => (
    <div className="h-full min-h-0 overflow-hidden bg-white px-4 py-2">
      <Accordion type="single" collapsible defaultValue="template" className="w-full">
        <AccordionItem value="template">
          <AccordionTrigger>Template</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <select
              aria-label="Template"
              title="Template"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
            >
              <option>Book</option>
              <option>Zine</option>
              <option>Catalogue</option>
              <option>Report</option>
            </select>
            <p className="text-xs text-neutral-500">Switch layout format. Content stays unchanged.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="setup">
          <AccordionTrigger>Page Setup</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-neutral-500">Page size</label>
              <select
                aria-label="Page size"
                title="Page size"
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
              >
                <option>A4</option>
                <option>Letter</option>
                <option>Legal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-neutral-500">Margins</label>
              <Slider value={[layoutMargin]} onValueChange={(value) => setLayoutMargin(value[0] ?? layoutMargin)} min={8} max={48} step={1} />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-neutral-500">Columns</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={columns === 1 ? 'bg-neutral-100 border-neutral-900' : ''}
                  onClick={() => setColumns(1)}
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={columns === 2 ? 'bg-neutral-100 border-neutral-900' : ''}
                  onClick={() => setColumns(2)}
                >
                  2
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="typography">
          <AccordionTrigger>Typography</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-neutral-500">Typeface preset</label>
              <select
                aria-label="Typeface preset"
                title="Typeface preset"
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
              >
                <option>Editorial</option>
                <option>Technical</option>
                <option>Compact</option>
                <option>Resume</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-neutral-500">Scale preset</label>
              <select
                aria-label="Scale preset"
                title="Scale preset"
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
              >
                <option>Balanced</option>
                <option>Comfortable</option>
                <option>Dense</option>
              </select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-neutral-500">Flow rules</label>
              <select
                aria-label="Flow rules"
                title="Flow rules"
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
              >
                <option>Balanced</option>
                <option>Keep sections tight</option>
                <option>Allow breaks</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-neutral-500">Page numbering</label>
              <select
                aria-label="Page numbering"
                title="Page numbering"
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
              >
                <option>Bottom center</option>
                <option>Bottom right</option>
                <option>None</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-3">
              <span className="text-sm text-neutral-700">Header/footer</span>
              <Switch checked={layoutHeaderFooterEnabled} onCheckedChange={setLayoutHeaderFooterEnabled} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  const renderPreflightMode = () => {
    const visibleIssues = preflight.issues.slice(0, 3);
    const hiddenIssueCount = Math.max(0, preflight.issues.length - visibleIssues.length);

    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <div className="border-b border-neutral-200 px-4 py-2">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Preflight</p>
        </div>
        <div className="flex-1 min-h-0 px-4 py-3">
          <div
            className={`rounded-lg border p-3 ${
              preflight.severity === 'major'
                ? 'border-amber-300 bg-amber-50'
                : preflight.severity === 'minor'
                  ? 'border-neutral-200 bg-neutral-50'
                  : 'border-emerald-300 bg-emerald-50'
            }`}
          >
            <p className="text-sm font-medium text-neutral-900">
              {preflight.severity === 'major'
                ? 'Major issues found'
                : preflight.severity === 'minor'
                  ? 'Minor issues found'
                  : 'Layout ready for export'}
            </p>
            <p className="mt-1 text-xs text-neutral-600">
              {preflight.severity === 'none'
                ? 'No blocking issues detected.'
                : `${preflight.issues.length} warning${preflight.issues.length > 1 ? 's' : ''} detected.`}
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {visibleIssues.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-700">
                Everything looks good.
              </div>
            ) : (
              visibleIssues.map((issue) => (
                <div key={issue.id} className="rounded-lg border border-neutral-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                    <AlertTriangle className={`h-4 w-4 ${issue.level === 'major' ? 'text-amber-600' : 'text-neutral-500'}`} />
                    {issue.title}
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">{issue.text}</p>
                </div>
              ))
            )}
            {hiddenIssueCount > 0 && (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
                +{hiddenIssueCount} more issue{hiddenIssueCount > 1 ? 's' : ''}. Open export for full review.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModeContent = () => {
    if (utilityView === 'saved') {
      return (
        <SavedDocuments
          compactMode="fixed"
          documents={savedDocuments}
          onOpenDocument={(id) => {
            onOpenSavedDocument?.(id);
            setUtilityView('none');
            setMode('preview');
          }}
          onDuplicateDocument={onDuplicateSavedDocument}
          onDeleteDocument={onDeleteSavedDocument}
        />
      );
    }
    if (utilityView === 'settings') {
      return <SettingsPanel compactMode="fixed" settings={workspaceSettings} onChange={onWorkspaceSettingsChange} />;
    }
    if (utilityView === 'about') {
      return <AboutPage />;
    }

    if (mode === 'edit') return renderEditorMode();
    if (mode === 'preview') return renderPreviewMode();
    if (mode === 'preflight') return renderPreflightMode();
    return renderLayoutMode();
  };

  return (
    <div className="flex h-full w-full max-w-full flex-col overflow-hidden">
      <header className="border-b border-neutral-200 bg-white px-3 py-1.5">
        <div className="relative flex items-center justify-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu" className="absolute left-0 top-1/2 -translate-y-1/2">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[84%] max-w-xs p-0">
              <SheetHeader className="border-b border-neutral-200">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="space-y-2 p-4">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setUtilityView('none');
                      setMode('preflight');
                    }}
                  >
                    <FileSearch className="h-4 w-4" />
                    Preflight
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setUtilityView('none');
                      setMode('edit');
                      onNewDocument();
                    }}
                  >
                    <SquarePen className="h-4 w-4" />
                    New document
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setUtilityView('saved');
                      onOpenSavedDocs();
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    Library
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setUtilityView('settings');
                      onOpenSettings();
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setUtilityView('about');
                      onOpenAbout();
                    }}
                  >
                    <Info className="h-4 w-4" />
                    About
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('mobile-import-input')?.click()}
                  >
                    <Download className="h-4 w-4" />
                    Import File
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 text-center">
            <div className="mb-1 flex items-center justify-center gap-1.5">
              <img src={logoIcon} alt="Draft" className="h-4 w-4 shrink-0 dark:invert" />
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Draft - Publishing Tool</span>
            </div>
            {isRenamingTitle ? (
              <input
                autoFocus
                value={documentName}
                onChange={(e) => onDocumentNameChange(e.target.value)}
                onBlur={() => setIsRenamingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsRenamingTitle(false);
                }}
                className="h-8 w-full rounded-md border border-neutral-300 px-2 text-center text-sm text-neutral-700 outline-none focus:border-neutral-900"
              />
            ) : (
              <button
                type="button"
                className="w-full truncate text-center text-sm font-medium text-neutral-700"
                onClick={() => setIsRenamingTitle(true)}
                title="Tap to rename"
              >
                {resolvedTitle}
              </button>
            )}
          </div>

        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">{renderModeContent()}</main>

      <nav className="grid grid-cols-5 gap-1.5 border-t border-neutral-200 bg-white p-1.5">
        <Button
          variant="outline"
          size="sm"
          className={`h-11 flex-col ${mode === 'edit' && utilityView === 'none' ? 'bg-neutral-100 border-neutral-900' : ''}`}
          onClick={() => {
            setUtilityView('none');
            setMode('edit');
          }}
        >
          <SquarePen className="h-4 w-4" />
          <span className="text-[11px]">Edit</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`h-11 flex-col ${mode === 'preview' && utilityView === 'none' ? 'bg-neutral-100 border-neutral-900' : ''}`}
          onClick={() => {
            setUtilityView('none');
            setMode('preview');
          }}
        >
          <FileText className="h-4 w-4" />
          <span className="text-[11px]">Preview</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`h-11 flex-col ${mode === 'layout' && utilityView === 'none' ? 'bg-neutral-100 border-neutral-900' : ''}`}
          onClick={() => {
            setUtilityView('none');
            setMode('layout');
          }}
        >
          <LayoutTemplate className="h-4 w-4" />
          <span className="text-[11px]">Layout</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`h-11 flex-col ${mode === 'preflight' && utilityView === 'none' ? 'bg-neutral-100 border-neutral-900' : ''}`}
          onClick={() => {
            setUtilityView('none');
            setMode('preflight');
          }}
        >
          <FileSearch className="h-4 w-4" />
          <span className="text-[11px]">Check</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-11 flex-col"
          onClick={onOpenExport}
          aria-label="Export PDF"
        >
          <FileOutput className="h-4 w-4" />
          <span className="text-[11px]">Export</span>
        </Button>
      </nav>

      <input
        id="mobile-import-input"
        type="file"
        className="hidden"
        accept=".md,.markdown,.txt,.rtf,.csv,.json,.xml,.html,.htm,.yml,.yaml,.png,.jpg,.jpeg,.webp,.gif,.svg,image/*,text/plain,text/markdown,text/csv,application/json,application/xml,text/xml,text/html"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportFile(file);
          e.currentTarget.value = '';
        }}
      />
    </div>
  );
}


