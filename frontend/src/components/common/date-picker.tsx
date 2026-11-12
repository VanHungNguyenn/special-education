"use client";

import { useId, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// shadcn "Date Picker" pattern (Popover + Calendar) that also submits the value through a hidden input.
export const DatePicker = ({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string; required?: boolean }) => {
  const id = useId();
  const initial = defaultValue ? parseISO(defaultValue) : undefined;
  const [date, setDate] = useState<Date | undefined>(initial && isValid(initial) ? initial : undefined);
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  return <div className="grid gap-2">
    <Label htmlFor={id} className="text-sm font-bold text-slate-600">{label}</Label>
    {/* A hidden/readOnly input skips form validation, so use a visually hidden text input and show our own error instead of the browser bubble. */}
    <input tabIndex={-1} aria-hidden className="sr-only" name={name} value={date ? format(date, "yyyy-MM-dd") : ""} onChange={() => {}} required={required} onInvalid={(event) => { event.preventDefault(); setInvalid(true); document.getElementById(id)?.focus(); }}/>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button id={id} type="button" variant="outline" aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} className={`h-11 w-full justify-between font-normal ${date ? "text-slate-700" : "text-slate-500"}`}>{date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}<CalendarIcon className="text-slate-400"/></Button></PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={(value) => { setDate(value); if (value) { setOpen(false); setInvalid(false); } }} locale={vi} captionLayout="dropdown" startMonth={new Date(2000, 0)} endMonth={new Date()} defaultMonth={date} formatters={{ formatMonthDropdown: (month) => `Tháng ${month.getMonth() + 1}` }}/>
      </PopoverContent>
    </Popover>
    {invalid && <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">Vui lòng chọn {label.toLowerCase()}.</p>}
  </div>;
};
