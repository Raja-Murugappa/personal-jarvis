import { useState, useRef, useEffect } from 'react';
import { X, Plus, Cpu } from 'lucide-react';
import { useTechnologies } from '@/hooks/useTechnologies';

interface TechChipsInputProps {
  technologies: string[];
  onChange: (techs: string[]) => void;
}

export function TechChipsInput({ technologies, onChange }: TechChipsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [] } = useTechnologies(inputValue);

  const handleAdd = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    const exists = technologies.some((t) => t.toLowerCase() === clean.toLowerCase());
    if (!exists) {
      onChange([...technologies, clean]);
    }
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const handleRemove = (nameToRemove: string) => {
    onChange(technologies.filter((t) => t.toLowerCase() !== nameToRemove.toLowerCase()));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && technologies.length > 0) {
      handleRemove(technologies[technologies.length - 1]);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter autocomplete suggestions not yet selected
  const filteredSuggestions = suggestions.filter(
    (s) => !technologies.some((t) => t.toLowerCase() === s.name.toLowerCase())
  );

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-input bg-background min-h-[42px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium"
          >
            <span>{tech}</span>
            <button
              type="button"
              onClick={() => handleRemove(tech)}
              className="text-muted-foreground hover:text-foreground rounded"
              aria-label={`Remove ${tech}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={technologies.length === 0 ? "Type tech and press Enter (e.g. Python, React)..." : "Add more..."}
          className="flex-1 min-w-[140px] bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Autocomplete dropdown */}
      {isDropdownOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 z-30 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-lg shadow-md max-h-48 overflow-y-auto p-1">
          {filteredSuggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleAdd(s.name)}
              className="w-full text-left px-3 py-1.5 text-xs rounded-md hover:bg-muted flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{s.name}</span>
              </span>
              <Plus className="w-3 h-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

