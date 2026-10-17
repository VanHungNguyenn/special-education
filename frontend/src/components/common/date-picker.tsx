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
  return <div className="grid gap-2">
    <Label htmlFor={id} className="text-sm font-bold text-slate-600">{label}</Label>
    <input type="hidden" name={name} value={date ? format(date, "yyyy-MM-dd") : ""} required={required}/>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button id={id} type="button" variant="outline" className={`h-11 w-full justify-between font-normal ${date ? "text-slate-700" : "text-slate-400"}`}>{date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}<CalendarIcon className="text-slate-400"/></Button></PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={(value) => { setDate(value); if (value) setOpen(false); }} locale={vi} captionLayout="dropdown" startMonth={new Date(2000, 0)} endMonth={new Date()} defaultMonth={date} formatters={{ formatMonthDropdown: (month) => `Tháng ${month.getMonth() + 1}` }}/>
      </PopoverContent>
    </Popover>
  </div>;
};
