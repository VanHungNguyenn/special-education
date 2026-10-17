"use client";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type { ComponentProps } from "react";
export const Avatar = ({ className = "", ...props }: ComponentProps<typeof AvatarPrimitive.Root>) => <AvatarPrimitive.Root className={`relative flex size-10 shrink-0 overflow-hidden rounded-full ${className}`} {...props}/>;
export const AvatarImage = ({ className = "", ...props }: ComponentProps<typeof AvatarPrimitive.Image>) => <AvatarPrimitive.Image className={`aspect-square size-full object-cover ${className}`} {...props}/>;
export const AvatarFallback = ({ className = "", ...props }: ComponentProps<typeof AvatarPrimitive.Fallback>) => <AvatarPrimitive.Fallback className={`grid size-full place-items-center bg-[#e5a58d] text-xs font-bold text-white ${className}`} {...props}/>;

