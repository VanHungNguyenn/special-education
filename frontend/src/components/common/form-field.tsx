"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Labelled form controls composed from shadcn primitives.
const labelClass = "text-sm font-bold text-slate-600";

export const Field = ({ label, className, ...props }: ComponentProps<typeof Input> & { label: string }) => {
  const id = useId();
  return <div className="grid gap-2"><Label htmlFor={id} className={labelClass}>{label}</Label><Input id={id} className={`h-11 ${className ?? ""}`} {...props}/></div>;
};

export const TextareaField = ({ label, className, ...props }: ComponentProps<typeof Textarea> & { label: string }) => {
  const id = useId();
  return <div className="grid gap-2"><Label htmlFor={id} className={labelClass}>{label}</Label><Textarea id={id} className={`min-h-20 ${className ?? ""}`} {...props}/></div>;
};

type SelectFieldProps = { label: string; name?: string; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; required?: boolean; children: ReactNode };

export const SelectField = ({ label, children, ...props }: SelectFieldProps) => {
  const id = useId();
  return <div className="grid gap-2"><Label htmlFor={id} className={labelClass}>{label}</Label><Select {...props}><SelectTrigger id={id} className="w-full data-[size=default]:h-11"><SelectValue/></SelectTrigger><SelectContent>{children}</SelectContent></Select></div>;
};
