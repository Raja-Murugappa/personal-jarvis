import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import type { LinkInput, LinkKind } from '@/types/link';

interface DynamicLinksSectionProps {
  links: any[];
  onChange: (links: any[]) => void;
}

const LINK_KINDS: { value: LinkKind; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'demo', label: 'Live Demo' },
  { value: 'linkedin', label: 'LinkedIn Post' },
  { value: 'video', label: 'Video Demo' },
  { value: 'documentation', label: 'Docs' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'dataset', label: 'Dataset' },
  { value: 'other', label: 'Other Link' },
];

export function DynamicLinksSection({ links, onChange }: DynamicLinksSectionProps) {
  const handleAdd = () => {
    onChange([...links, { kind: 'github', label: '', url: '', sort_order: links.length }]);
  };

  const handleUpdate = (index: number, field: keyof LinkInput, value: any) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <LinkIcon className="w-4 h-4 text-primary" />
          <span>Links & Repositories</span>
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Link</span>
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-xs text-muted-foreground italic p-3 rounded-lg border border-dashed border-border text-center">
          No external links or repositories added yet.
        </p>
      ) : (
        <div className="space-y-2">
          {links.map((link, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-lg border border-border/80 bg-muted/20"
            >
              <select
                value={link.kind}
                onChange={(e) => handleUpdate(idx, 'kind', e.target.value as LinkKind)}
                className="w-full sm:w-36 px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground"
              >
                {LINK_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Label (e.g. GitHub Repository)"
                value={link.label || ''}
                onChange={(e) => handleUpdate(idx, 'label', e.target.value)}
                className="w-full sm:w-44 px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground"
              />

              <input
                type="url"
                placeholder={link.kind === 'github' ? 'https://github.com/...' : 'https://...'}
                value={link.url}
                onChange={(e) => handleUpdate(idx, 'url', e.target.value)}
                className="w-full sm:flex-1 px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground"
                required
              />

              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors self-end sm:self-center"
                title="Remove link"
                aria-label="Remove link"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

