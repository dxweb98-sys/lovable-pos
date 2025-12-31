import React from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  rightContent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = false,
  showMenu = false,
  rightContent,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {rightContent}
        {showMenu && (
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
