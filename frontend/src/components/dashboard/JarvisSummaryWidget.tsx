import { WidgetCard } from './WidgetCard';
import { Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function JarvisSummaryWidget() {
  const navigate = useNavigate();

  return (
    <WidgetCard
      title="JARVIS Summary"
      subtitle="Executive intelligence briefing"
      icon={<Bot className="w-4 h-4 text-neutral-500" />}
      status="ready"
    >
      <div className="py-7 px-4 rounded-lg border border-dashed border-border/80 flex flex-col items-center justify-center text-center">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
          <Bot className="w-4 h-4" />
        </div>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-4">
          Connect the AI assistant to see your personalised summary.
        </p>
        <button
          onClick={() => navigate('/assistant')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60 transition-colors"
        >
          Open JARVIS Assistant
        </button>
      </div>
    </WidgetCard>
  );
}
