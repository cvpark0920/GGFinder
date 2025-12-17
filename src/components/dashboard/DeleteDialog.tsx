import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteTarget: {
    id: number;
    type: "groom" | "bride" | "agency" | "user" | "video";
    name: string;
  } | null;
  onConfirm: () => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  deleteTarget,
  onConfirm,
}: DeleteDialogProps) {
  const getTitle = () => {
    if (deleteTarget?.type === "video") {
      return "동영상 삭제 확인";
    }
    return "프로필 삭제 확인";
  };

  const getDescription = () => {
    if (deleteTarget?.type === "video") {
      return (
        <>
          정말로{" "}
          <span className="font-semibold text-slate-900">
            {deleteTarget?.name || "이 동영상"}
          </span>
          을(를) 삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 없습니다.
        </>
      );
    }
    return (
      <>
        정말로{" "}
        <span className="font-semibold text-slate-900">
          {deleteTarget?.name}
        </span>
        님의 프로필을 삭제하시겠습니까?
        <br />이 작업은 되돌릴 수 없습니다.
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

