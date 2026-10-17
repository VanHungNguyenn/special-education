"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { Icon } from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export const DatePicker = ({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string; required?: boolean }) => {
  const initial = defaultValue ? parseISO(defaultValue) : undefined;
  const [date, setDate] = useState<Date | undefined>(initial && isValid(initial) ? initial : undefined);
  const [open, setOpen] = useState(false);
  return <label className="block text-sm font-bold text-slate-600"><span>{label}</span><input type="hidden" name={name} value={date ? format(date,"yyyy-MM-dd") : ""} required={required}/><Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button type="button" className={`mt-2 flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${date ? "text-slate-700" : "text-slate-400"}`}><span>{date ? format(date,"dd/MM/yyyy",{locale:vi}) : "Chọn ngày"}</span><Icon name="calendar" className="size-4 text-slate-400"/></button></PopoverTrigger><PopoverContent className="w-auto p-3"><DayPicker mode="single" selected={date} onSelect={(value) => { setDate(value); if(value) setOpen(false); }} locale={vi} captionLayout="dropdown" startMonth={new Date(2000,0)} endMonth={new Date()} classNames={{months:"flex",month:"space-y-3",month_caption:"flex justify-center items-center h-9 font-bold text-sm",dropdowns:"flex gap-2",dropdown:"rounded border border-slate-200 px-1 text-xs",nav:"flex items-center gap-1",button_previous:"absolute left-3 grid size-8 place-items-center rounded hover:bg-slate-100",button_next:"absolute right-3 grid size-8 place-items-center rounded hover:bg-slate-100",month_grid:"border-collapse",weekdays:"flex",weekday:"w-9 text-center text-[11px] text-slate-400",week:"flex mt-1",day:"size-9 text-center",day_button:"size-9 rounded-md text-sm hover:bg-brand-50",selected:"[&>button]:bg-brand-600 [&>button]:text-white",today:"[&>button]:font-extrabold [&>button]:text-brand-600",outside:"opacity-30",disabled:"opacity-30"}}/></PopoverContent></Popover></label>;
};

