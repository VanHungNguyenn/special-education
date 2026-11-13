"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Labelled form controls composed from shadcn primitives.
const labelClass = "text-sm font-bold text-slate-600";

export const RequiredMark = () => <span aria-hidden className="-ml-1.5 text-coral-600">*</span>;

export const RequiredNote = () => <p className="text-xs text-slate-600">Các trường có dấu <span className="font-bold text-coral-600">*</span> là bắt buộc.</p>;

export const Field = ({ label, className, ...props }: ComponentProps<typeof Input> & { label: string }) => {
  const id = useId();
  return <div className="grid gap-2"><Label htmlFor={id} className={labelClass}>{label}{props.required && <RequiredMark/>}</Label><Input id={id} className={`h-11 ${className ?? ""}`} {...props}/></div>;
};

export const TextareaField = ({ label, className, ...props }: ComponentProps<typeof Textarea> & { label: string }) => {
  const id = useId();
  return <div className="grid gap-2"><Label htmlFor={id} className={labelClass}>{label}{props.required && <RequiredMark/>}</Label><Textarea id={id} className={`min-h-20 ${className ?? ""}`} {...props}/></div>;
};

type SelectFieldProps = { label: string; name?: string; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; required?: boolean; children: ReactNode };

export const SelectField = ({ label, children, ...props }: SelectFieldProps) => {
  const id = useId();
  return <div className="grid gap-2"><Label htmlFor={id} className={labelClass}>{label}{props.required && <RequiredMark/>}</Label><Select {...props}><SelectTrigger id={id} aria-required={props.required || undefined} className="w-full data-[size=default]:h-11"><SelectValue/></SelectTrigger><SelectContent position="popper">{children}</SelectContent></Select></div>;
};
