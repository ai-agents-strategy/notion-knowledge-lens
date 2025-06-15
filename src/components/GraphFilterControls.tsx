
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface GraphFilterControlsProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export const GraphFilterControls: React.FC<GraphFilterControlsProps> = ({ searchTerm, onSearchTermChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search nodes..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="w-full pl-9"
        aria-label="Search nodes"
      />
    </div>
  );
};
