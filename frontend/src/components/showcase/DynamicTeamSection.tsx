import { Plus, Trash2, Users } from 'lucide-react';
import type { TeamMemberInput } from '@/types/team-member';

interface DynamicTeamSectionProps {
  teamMembers: TeamMemberInput[];
  onChange: (members: TeamMemberInput[]) => void;
}

export function DynamicTeamSection({ teamMembers, onChange }: DynamicTeamSectionProps) {
  const handleAdd = () => {
    onChange([...teamMembers, { name: '', role: '', linkedin_url: '' }]);
  };

  const handleUpdate = (index: number, field: keyof TeamMemberInput, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(teamMembers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary" />
          <span>Team Members</span>
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {teamMembers.length === 0 ? (
        <p className="text-xs text-muted-foreground italic p-3 rounded-lg border border-dashed border-border text-center">
          Solo project / no external team members listed.
        </p>
      ) : (
        <div className="space-y-2">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-lg border border-border/80 bg-muted/20"
            >
              <input
                type="text"
                placeholder="Name *"
                value={member.name}
                onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                className="w-full sm:w-1/3 px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground"
                required
              />
              <input
                type="text"
                placeholder="Role (e.g. Frontend Dev)"
                value={member.role || ''}
                onChange={(e) => handleUpdate(idx, 'role', e.target.value)}
                className="w-full sm:w-1/3 px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground"
              />
              <input
                type="url"
                placeholder="LinkedIn Profile URL"
                value={member.linkedin_url || ''}
                onChange={(e) => handleUpdate(idx, 'linkedin_url', e.target.value)}
                className="w-full sm:flex-1 px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors self-end sm:self-center"
                title="Remove member"
                aria-label="Remove member"
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

