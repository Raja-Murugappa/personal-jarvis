import { Inbox } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-border/70 flex items-center gap-3">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      {/* Proper Empty State - No invented content */}
      <div className="p-12 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-card/40 my-8">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
          <Inbox className="w-5 h-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">No records found</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          This section is not connected to any backend endpoints yet. Data will appear here once configured.
        </p>
      </div>
    </div>
  );
}
