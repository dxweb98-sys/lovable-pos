import React from 'react';

interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap ${
        isActive 
          ? 'bg-foreground text-background font-semibold shadow-soft' 
          : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      <span className="text-sm">{label}</span>
    </button>
  );
};
