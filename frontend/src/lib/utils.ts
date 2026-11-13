import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Vietnamese given name is the last word: "Nguyễn Minh Anh" → "A".
export const nameInitial = (name: string) => name.trim().split(/\s+/).at(-1)?.charAt(0).toUpperCase() ?? "";

export const nameInitials = (name: string) => name.trim().split(/\s+/).filter(Boolean).slice(-2).map((word) => word.charAt(0)).join("").toUpperCase();

// "Lớp Mầm Xanh" → "M"; names without the "Lớp" prefix use their first letter.
export const classInitial = (name: string) => name.trim().replace(/^lớp\s+/i, "").charAt(0).toUpperCase();

// Lowercase without diacritics, so "nguyen" matches "Nguyễn" (đ has no combining mark, map it by hand).
export const fold = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/gi, "d").toLowerCase();
