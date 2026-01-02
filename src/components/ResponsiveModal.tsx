import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  open,
  onOpenChange,
  title,
  children,
  className = '',
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={`max-h-[85vh] rounded-t-3xl ${className}`}>
          <DrawerHeader className="pb-2 border-b border-border">
            <DrawerTitle className="text-xl font-bold text-center">{title}</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="max-h-[calc(85vh-80px)]">
            <div className="px-4 pb-8">
              {children}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md rounded-2xl p-0 overflow-hidden ${className}`}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="px-6 pb-6">
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// A variant for larger modals (like cart)
export const ResponsiveModalLarge: React.FC<ResponsiveModalProps> = ({
  open,
  onOpenChange,
  title,
  children,
  className = '',
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={`max-h-[90vh] rounded-t-3xl ${className}`}>
          <DrawerHeader className="pb-2 border-b border-border">
            <DrawerTitle className="text-xl font-bold text-center">{title}</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="max-h-[calc(90vh-80px)]">
            <div className="px-4 pb-8">
              {children}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-lg rounded-2xl p-0 overflow-hidden ${className}`}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh]">
          <div className="px-6 pb-6">
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
