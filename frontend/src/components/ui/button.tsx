import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; icon?: ReactNode };

export const Button = ({ variant = "primary", icon, className = "", children, ...props }: Props) => {
  const variants = { primary: "bg-brand-600 text-white hover:bg-brand-700", secondary: "border border-slate-200 bg-white text-brand-600 hover:bg-brand-50", ghost: "bg-transparent text-slate-500 hover:bg-slate-100" };
  return <button className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-[13px] font-bold transition ${variants[variant]} ${className}`} {...props}>{icon}{children}</button>;
};

