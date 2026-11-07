import { useState } from 'react';
import { Check, Share2, FileCode2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { Showcase } from '@/types/showcase';

interface ShowcaseCopyButtonsProps {
  getShowcase: () => Promise<Showcase>;
}

export function ShowcaseCopyButtons({ getShowcase }: ShowcaseCopyButtonsProps) {
  const { toast } = useToast();
  const [copyingLinkedin, setCopyingLinkedin] = useState(false);
  const [copyingMarkdown, setCopyingMarkdown] = useState(false);

  const handleCopyLinkedin = async () => {
    try {
      setCopyingLinkedin(true);
      const data = await getShowcase();
      await navigator.clipboard.writeText(data.linkedin_text);
      toast('Copied LinkedIn-style showcase text to clipboard!');
    } catch {
      toast('Failed to generate showcase text');
    } finally {
      setTimeout(() => setCopyingLinkedin(false), 2000);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      setCopyingMarkdown(true);
      const data = await getShowcase();
      await navigator.clipboard.writeText(data.markdown);
      toast('Copied Markdown summary to clipboard!');
    } catch {
      toast('Failed to generate markdown');
    } finally {
      setTimeout(() => setCopyingMarkdown(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopyLinkedin}
        disabled={copyingLinkedin}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
        title="Copy professional summary formatted for LinkedIn posts"
      >
        {copyingLinkedin ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
        )}
        <span>{copyingLinkedin ? 'Copied LinkedIn!' : 'Copy LinkedIn'}</span>
      </button>

      <button
        onClick={handleCopyMarkdown}
        disabled={copyingMarkdown}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
        title="Copy GitHub-ready Markdown summary"
      >
        {copyingMarkdown ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <FileCode2 className="w-3.5 h-3.5 text-muted-foreground" />
        )}
        <span>{copyingMarkdown ? 'Copied Markdown!' : 'Copy Markdown'}</span>
      </button>
    </div>
  );
}

