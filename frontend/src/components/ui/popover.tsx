"use client";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = ({ className = "", sideOffset = 6, align = "start", ...props }: ComponentProps<typeof PopoverPrimitive.Content>) => <PopoverPrimitive.Portal><PopoverPrimitive.Content sideOffset={sideOffset} align={align} className={`z-50 rounded-lg border border-slate-200 bg-white p-3 shadow-xl outline-none ${className}`} {...props}/></PopoverPrimitive.Portal>;

