"use client";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps } from "react";
export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuContent = ({ className = "", sideOffset = 8, ...props }: ComponentProps<typeof DropdownPrimitive.Content>) => <DropdownPrimitive.Portal><DropdownPrimitive.Content sideOffset={sideOffset} className={`z-50 min-w-56 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 shadow-xl ${className}`} {...props}/></DropdownPrimitive.Portal>;
export const DropdownMenuLabel = ({ className = "", ...props }: ComponentProps<typeof DropdownPrimitive.Label>) => <DropdownPrimitive.Label className={`px-2 py-2 text-xs font-semibold text-slate-500 ${className}`} {...props}/>;
export const DropdownMenuItem = ({ className = "", ...props }: ComponentProps<typeof DropdownPrimitive.Item>) => <DropdownPrimitive.Item className={`flex min-h-10 cursor-default items-center gap-2 rounded-md px-2.5 text-sm outline-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-700 ${className}`} {...props}/>;
export const DropdownMenuSeparator = ({ className = "", ...props }: ComponentProps<typeof DropdownPrimitive.Separator>) => <DropdownPrimitive.Separator className={`my-1 h-px bg-slate-100 ${className}`} {...props}/>;

