import React from "react";
import { Label } from "./ui/label";

interface MemoTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export function MemoTextarea({
  id,
  value,
  onChange,
}: MemoTextareaProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}></Label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="업체 내부 메모 (고객에게 보이지 않음)"
        className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}