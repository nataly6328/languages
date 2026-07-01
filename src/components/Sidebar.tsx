import { Layers, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  disabled?: boolean;
}

export function Sidebar({ categories, activeCategory, onSelectCategory, disabled }: SidebarProps) {
  return (
    <div className="flex flex-col gap-2 p-4 md:w-64 shrink-0 overflow-y-auto" data-testid="sidebar-categories">
      <div className="flex items-center gap-2 mb-4 px-2 text-primary font-bold">
        <Layers className="w-5 h-5" />
        <span>Categories</span>
      </div>
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {categories.map(category => (
          <button
            key={category}
            data-testid={`category-btn-${category}`}
            disabled={disabled}
            onClick={() => onSelectCategory(category)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap",
              activeCategory === category
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-transparent hover:bg-muted text-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {category !== 'All words' && <Tag className="w-4 h-4 opacity-70" />}
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
