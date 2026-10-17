"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type { ComponentProps, ReactNode } from "react";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogCancel = ({ className = "", ...props }: ComponentProps<typeof AlertDialogPrimitive.Cancel>) => <AlertDialogPrimitive.Cancel className={`inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 ${className}`} {...props}/>;
export const AlertDialogAction = ({ className = "", ...props }: ComponentProps<typeof AlertDialogPrimitive.Action>) => <AlertDialogPrimitive.Action className={`inline-flex h-11 items-center justify-center rounded-md bg-coral-500 px-4 text-sm font-bold text-white transition hover:bg-[#d96853] ${className}`} {...props}/>;
export const AlertDialogTitle = ({ className = "", ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) => <AlertDialogPrimitive.Title className={`text-xl font-bold text-brand-800 ${className}`} {...props}/>;
export const AlertDialogDescription = ({ className = "", ...props }: ComponentProps<typeof AlertDialogPrimitive.Description>) => <AlertDialogPrimitive.Description className={`mt-2 text-sm leading-6 text-slate-500 ${className}`} {...props}/>;
export const AlertDialogContent = ({ children, className = "", ...props }: ComponentProps<typeof AlertDialogPrimitive.Content> & { children: ReactNode }) => <AlertDialogPrimitive.Portal><AlertDialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-[#102f29aa] backdrop-blur-[2px]"/><AlertDialogPrimitive.Content className={`fixed left-1/2 top-1/2 z-[70] w-[calc(100%-40px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl outline-none ${className}`} {...props}>{children}</AlertDialogPrimitive.Content></AlertDialogPrimitive.Portal>;
export const AlertDialogHeader = ({ children }: { children: ReactNode }) => <div>{children}</div>;
export const AlertDialogFooter = ({ children }: { children: ReactNode }) => <div className="mt-6 flex justify-end gap-2">{children}</div>;

