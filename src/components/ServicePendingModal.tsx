import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface ServicePendingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServicePendingModal({
  open,
  onOpenChange,
}: ServicePendingModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {t('servicePending.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            {t('servicePending.confirm')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

