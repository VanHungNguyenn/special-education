import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const control = "mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
export const Field = ({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) => <label className="block text-sm font-bold text-slate-600">{label}<input className={control} {...props}/></label>;
export const TextareaField = ({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) => <label className="block text-sm font-bold text-slate-600">{label}<textarea className={`${control} h-20 resize-y py-3`} {...props}/></label>;
