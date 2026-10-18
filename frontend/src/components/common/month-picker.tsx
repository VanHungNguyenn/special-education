"use client";

import { useId, useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const monthNames = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

// Month + year picker (value "YYYY-MM") composed from shadcn Popover and Button.
export const MonthPicker = ({ value, onChange, label, className = "" }: { value: string; onChange: (value: string) => void; label?: string; className?: string }) => {
  const id = useId();
  const [year, month] = value.split("-").map(Number);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);
  const picker = <Popover open={open} onOpenChange={(next) => { setOpen(next); if (next) setViewYear(year); }}>
    <PopoverTrigger asChild><Button id={id} type="button" variant="outline" className={`h-11 min-w-48 justify-between font-normal text-slate-700 ${className}`}>{monthNames[month - 1]} / {year}<CalendarIcon className="text-slate-400"/></Button></PopoverTrigger>
    <PopoverContent className="w-72" align="start">
      <div className="mb-3 flex items-center justify-between"><Button variant="ghost" size="icon-sm" aria-label="Năm trước" onClick={() => setViewYear((current) => current - 1)}><ChevronLeft/></Button><strong className="text-sm">{viewYear}</strong><Button variant="ghost" size="icon-sm" aria-label="Năm sau" onClick={() => setViewYear((current) => current + 1)}><ChevronRight/></Button></div>
      <div className="grid grid-cols-3 gap-1">{monthNames.map((name, index) => <Button key={name} size="sm" variant={viewYear === year && index === month - 1 ? "default" : "ghost"} className="text-xs font-normal" onClick={() => { onChange(`${viewYear}-${String(index + 1).padStart(2, "0")}`); setOpen(false); }}>{name}</Button>)}</div>
    </PopoverContent>
  </Popover>;
  return label ? <div className="grid gap-2"><Label htmlFor={id} className="text-sm font-bold text-slate-600">{label}</Label>{picker}</div> : picker;
};
