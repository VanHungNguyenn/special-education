"use client";
import { useState } from "react";
import { Icon } from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const monthNames = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
export const MonthPicker = ({ value, onChange, label }: { value: string; onChange: (value: string) => void; label?: string }) => {
  const [open,setOpen] = useState(false); const [selectedYear,setSelectedYear] = useState(Number(value.split("-")[0])); const selectedMonth = Number(value.split("-")[1])-1;
  const picker = <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button type="button" className="flex h-11 min-w-48 items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"><span>{monthNames[selectedMonth]} / {value.split("-")[0]}</span><Icon name="calendar" className="size-4 text-slate-400"/></button></PopoverTrigger><PopoverContent className="w-72"><div className="mb-3 flex items-center justify-between"><button className="grid size-8 place-items-center rounded hover:bg-slate-100" onClick={()=>setSelectedYear((year)=>year-1)}>‹</button><strong className="text-sm">{selectedYear}</strong><button className="grid size-8 place-items-center rounded hover:bg-slate-100" onClick={()=>setSelectedYear((year)=>year+1)}>›</button></div><div className="grid grid-cols-3 gap-1">{monthNames.map((month,index)=><button key={month} onClick={()=>{onChange(`${selectedYear}-${String(index+1).padStart(2,"0")}`);setOpen(false)}} className={`rounded-md px-2 py-2.5 text-xs transition hover:bg-brand-50 ${selectedYear===Number(value.split("-")[0])&&index===selectedMonth?"bg-brand-600 font-bold text-white hover:bg-brand-600":"text-slate-600"}`}>{month}</button>)}</div></PopoverContent></Popover>;
  return label ? <label className="block text-sm font-bold text-slate-600"><span className="mb-2 block">{label}</span>{picker}</label> : picker;
};

