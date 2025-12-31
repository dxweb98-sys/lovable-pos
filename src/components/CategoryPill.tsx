import React from 'react';

interface CategoryPillProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  icon,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 min-w-[72px] py-3 px-4 rounded-2xl transition-all duration-200 ${
        isActive 
          ? 'bg-foreground text-background shadow-soft' 
          : 'bg-card text-card-foreground hover:bg-secondary'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
    </button>
  );
};
