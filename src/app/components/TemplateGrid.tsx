import React, { useEffect, useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { FileText, BookOpen, Grid3x3 } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  category: 'zine' | 'book' | 'catalogue';
  description: string;
  icon: React.ReactNode;
}

const templates: Template[] = [
  {
    id: 'zine-a5',
    name: 'A5 Booklet',
    category: 'zine',
    description: 'Folded A4 into A5 booklet format',
    icon: <FileText className="w-6 h-6" />,
  },
  {
    id: 'zine-half',
    name: 'Half-Letter Zine',
    category: 'zine',
    description: 'US Letter folded in half',
    icon: <FileText className="w-6 h-6" />,
  },
  {
    id: 'zine-folded',
    name: 'Folded A4 Zine',
    category: 'zine',
    description: 'Classic folded zine layout',
    icon: <FileText className="w-6 h-6" />,
  },
  {
    id: 'book-print',
    name: 'Print Book',
    category: 'book',
    description: 'Standard print book with margins',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: 'book-manuscript',
    name: 'Manuscript',
    category: 'book',
    description: 'Double-spaced manuscript format',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: 'book-trade',
    name: 'Trade Paperback',
    category: 'book',
    description: '6×9 trade paperback format',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: 'cat-product',
    name: 'Product Catalogue',
    category: 'catalogue',
    description: 'Grid-based product showcase',
    icon: <Grid3x3 className="w-6 h-6" />,
  },
  {
    id: 'cat-lookbook',
    name: 'Lookbook',
    category: 'catalogue',
    description: 'Fashion and photography layout',
    icon: <Grid3x3 className="w-6 h-6" />,
  },
  {
    id: 'cat-editorial',
    name: 'Editorial Grid',
    category: 'catalogue',
    description: 'Magazine-style editorial layout',
    icon: <Grid3x3 className="w-6 h-6" />,
  },
];

export function TemplateGrid() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (!selectedTemplateId) return;
    setIsPreviewLoading(true);
    const timer = window.setTimeout(() => setIsPreviewLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, [selectedTemplateId]);

  const categories = [
    { id: 'zine', label: 'Zine Templates' },
    { id: 'book', label: 'Book Templates' },
    { id: 'catalogue', label: 'Catalogue Templates' },
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">Apply Template</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Start with a pre-configured layout
        </p>
      </div>

      {!selectedTemplateId && (
        <div className="mx-6 mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-900">Choose a layout template</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Templates define page structure, numbering, and spacing rules.
          </p>
        </div>
      )}

      {isPreviewLoading && (
        <div className="mx-6 mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-900">Template preview loading</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Switch templates to reflow the document instantly.
          </p>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {categories.map((category) => {
            const categoryTemplates = templates.filter(
              (t) => t.category === category.id
            );

            return (
              <div key={category.id} className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
                  {category.label}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`p-6 cursor-pointer hover:shadow-lg transition-shadow border-neutral-200 hover:border-neutral-300 ${
                        selectedTemplateId === template.id ? 'ring-1 ring-neutral-900 border-neutral-900' : ''
                      }`}
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        toast.success('Layout updated');
                      }}
                    >
                      {/* Preview Thumbnail */}
                      <div className="aspect-[3/4] bg-neutral-100 rounded-lg mb-4 flex items-center justify-center border border-neutral-200">
                        <div className="text-neutral-400">{template.icon}</div>
                      </div>

                      {/* Template Info */}
                      <div className="space-y-1">
                        <h4 className="font-semibold text-neutral-900">
                          {template.name}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {template.description}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
