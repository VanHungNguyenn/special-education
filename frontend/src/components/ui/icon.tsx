import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2-6 6-6s6 2 6 6M16 7c3 1 3 5 0 6M16 15c3 0 5 2 5 5"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>, plus: <path d="M12 5v14M5 12h14"/>,
  search: <><circle cx="10" cy="10" r="7"/><path d="m20 20-5-5"/></>, edit: <><path d="m4 16-1 5 5-1L19 9l-4-4Z"/><path d="m13 7 4 4"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/></>, close: <path d="m6 6 12 12M18 6 6 18"/>,
  back: <path d="m15 18-6-6 6-6"/>, download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M4 21h16"/></>,
  chevronDown: <path d="m7 10 5 5 5-5"/>, check: <path d="m5 12 4 4L19 6"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>, profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/></>, logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
};

export const Icon = ({ name, className = "size-5" }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>
);
