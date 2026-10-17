"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import type { ComponentProps } from "react";
import { Icon } from "./icon";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = ({ className = "", children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger className={`flex h-11 min-w-0 items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 shadow-sm outline-none transition hover:border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 data-[placeholder]:text-slate-400 ${className}`} {...props}>{children}<SelectPrimitive.Icon><Icon name="chevronDown" className="size-4 text-slate-400"/></SelectPrimitive.Icon></SelectPrimitive.Trigger>
);

export const SelectContent = ({ className = "", children, position = "popper", ...props }: ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal><SelectPrimitive.Content position={position} sideOffset={6} className={`z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-xl data-[state=closed]:animate-out data-[state=open]:animate-in ${className}`} {...props}><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>
);

export const SelectItem = ({ className = "", children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item className={`relative flex min-h-10 cursor-default select-none items-center rounded-md py-2 pl-9 pr-3 text-sm text-slate-700 outline-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-700 data-[state=checked]:font-bold ${className}`} {...props}><span className="absolute left-3 grid size-4 place-items-center text-brand-600"><SelectPrimitive.ItemIndicator><Icon name="check" className="size-4"/></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>
);

export const SelectField = ({ label, name, value, defaultValue, onValueChange, children, required }: { label: string; name?: string; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; children: React.ReactNode; required?: boolean }) => <label className="block text-sm font-bold text-slate-600"><span>{label}</span><Select name={name} value={value} defaultValue={defaultValue} onValueChange={onValueChange} required={required}><SelectTrigger className="mt-2 w-full"><SelectValue/></SelectTrigger><SelectContent>{children}</SelectContent></Select></label>;

