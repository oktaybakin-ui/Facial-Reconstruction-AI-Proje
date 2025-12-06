'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmDialogOptions | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    setDialog(options);
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialog) {
      dialog.onConfirm();
      setDialog(null);
    }
  }, [dialog]);

  const handleCancel = useCallback(() => {
    if (dialog) {
      dialog.onCancel?.();
      setDialog(null);
    }
  }, [dialog]);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <Card className="max-w-md w-full p-6 animate-slideIn">
            <h3 className="text-2xl font-bold gradient-text mb-4">{dialog.title}</h3>
            <p className="text-slate-700 mb-6 leading-relaxed">{dialog.message}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleCancel}>
                {dialog.cancelText || 'Cancel'}
              </Button>
              <Button onClick={handleConfirm}>
                {dialog.confirmText || 'Confirm'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return context;
}

