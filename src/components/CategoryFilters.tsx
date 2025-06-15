
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CategoryFiltersProps {
  visibleCategories: Set<string>;
  onCategoryToggle: (category: string) => void;
  availableCategories: string[];
}

export const CategoryFilters = ({ 
  visibleCategories, 
  onCategoryToggle, 
  availableCategories 
}: CategoryFiltersProps) => {
  const nodeTypes = ["database", "page", "property"];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">Filter by Type</h3>
      
      <div className="space-y-3">
        {nodeTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`type-${type}`}
              checked={visibleCategories.has(type)}
              onCheckedChange={() => onCategoryToggle(type)}
            />
            <Label 
              htmlFor={`type-${type}`} 
              className="text-sm text-slate-600 capitalize cursor-pointer"
            >
              {type}s
            </Label>
          </div>
        ))}
      </div>

      <Separator />

      <h3 className="text-sm font-semibold text-slate-700">Filter by Category</h3>
      
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {availableCategories.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category}`}
              checked={visibleCategories.has(category)}
              onCheckedChange={() => onCategoryToggle(category)}
            />
            <Label 
              htmlFor={`category-${category}`} 
              className="text-xs text-slate-600 capitalize cursor-pointer"
            >
              {category.replace(/_/g, ' ')}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
