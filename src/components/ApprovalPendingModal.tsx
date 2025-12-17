import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { AlertCircle } from 'lucide-react';

interface ApprovalPendingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApprovalPendingModal({
  open,
  onOpenChange,
}: ApprovalPendingModalProps) {
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
            가입 승인 처리 중입니다
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            관리자의 승인을 기다리고 있습니다.
            <br />
            승인 후 서비스를 이용하실 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            확인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

