import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils'; // Assuming you have a utility for className concatenation

// Dialog Component
export const Dialog = ({ open, onOpenChange, children }) => {
  const dialogRef = useRef(null);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  // Handle click outside to close dialog
  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      {children}
    </div>,
    document.body
  );
};

// DialogContent: Container for dialog content
export const DialogContent = ({ children, className }) => (
  <div
    className={cn(
      'bg-[#11071F] text-white border border-purple-400/20 rounded-lg p-6 max-w-md w-full',
      className
    )}
  >
    {children}
  </div>
);

// DialogHeader: Header section
export const DialogHeader = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

// DialogTitle: Title of the dialog
export const DialogTitle = ({ children, className }) => (
  <h2 className={cn('text-purple-300 text-2xl font-bold', className)}>{children}</h2>
);

// DialogDescription: Description text
export const DialogDescription = ({ children, className }) => (
  <p className={cn('text-purple-300/70 mt-2', className)}>{children}</p>
);

// DialogFooter: Footer for buttons
export const DialogFooter = ({ children, className }) => (
  <div className={cn('flex flex-col sm:flex-row gap-4 mt-6', className)}>{children}</div>
);