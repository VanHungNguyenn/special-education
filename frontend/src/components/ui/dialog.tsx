"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "./icon";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = ({ className = "", ...props }: ComponentProps<typeof DialogPrimitive.Title>) => <DialogPrimitive.Title className={`text-2xl font-bold text-brand-800 ${className}`} {...props}/>;
export const DialogDescription = ({ className = "", ...props }: ComponentProps<typeof DialogPrimitive.Description>) => <DialogPrimitive.Description className={`mt-1 text-sm text-slate-500 ${className}`} {...props}/>;
export const DialogContent = ({ children, className = "", showClose = true, ...props }: ComponentProps<typeof DialogPrimitive.Content> & { children: ReactNode; showClose?: boolean }) => <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[#102f29aa] backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in"/><DialogPrimitive.Content className={`fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-40px)] w-[calc(100%-40px)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-slate-200 bg-white p-7 shadow-2xl outline-none ${className}`} {...props}>{children}{showClose && <DialogPrimitive.Close className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"><Icon name="close" className="size-4"/><span className="sr-only">Đóng</span></DialogPrimitive.Close>}</DialogPrimitive.Content></DialogPrimitive.Portal>;

export const DialogHeader = ({ children }: { children: ReactNode }) => <div className="mb-6 pr-12">{children}</div>;
export const DialogFooter = ({ children }: { children: ReactNode }) => <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">{children}</div>;

