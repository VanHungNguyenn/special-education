import Link from "next/link";
import type { ReactNode } from "react";
import type { TabId } from "@/features/school/types";
import { ChartColumn, LayoutGrid, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { AccountMenu } from "./account-menu";

const navigation = [{ id: "classes", label: "Lớp học", icon: LayoutGrid }, { id: "students", label: "Học sinh", icon: Users }, { id: "reports", label: "Báo cáo", icon: ChartColumn }] as const;

export const AppShell = ({ tab, onTabChange, children }: { tab: TabId; onTabChange: (tab: TabId) => void; children: ReactNode }) => (
  <div className="min-h-screen max-w-full overflow-x-clip bg-surface text-base text-brand-800">
    <aside className="no-print fixed inset-x-0 bottom-0 z-20 flex h-[68px] w-full max-w-full flex-col overflow-hidden bg-brand-700 p-2 text-white md:inset-y-0 md:left-0 md:right-auto md:h-screen md:w-[260px] md:px-[18px] md:py-7">
      <Link href="/" className="hidden items-center gap-3 px-3 pb-9 text-xl font-bold md:flex"><b className="grid size-10 place-items-center rounded-[50%_50%_50%_12px] bg-coral-600 text-2xl italic">{siteConfig.initial}</b><span>{siteConfig.shortName}<small className="mt-1 block text-[9px] uppercase tracking-[1.4px] text-brand-200">Quản lý học sinh</small></span></Link>
      <nav className="flex h-full w-full min-w-0 justify-around gap-1 md:h-auto md:flex-col">{navigation.map(({ id, label, icon: NavIcon }) => <Button key={id} variant="ghost" aria-current={tab === id ? "page" : undefined} onClick={() => onTabChange(id)} className={`h-[52px] min-w-0 flex-1 justify-center gap-1 px-1 text-xs font-semibold md:flex-none md:justify-start md:gap-3 md:px-3 md:text-[15px] [&_svg]:size-[18px] ${tab === id ? "bg-brand-500 text-white hover:bg-brand-500 hover:text-white" : "text-brand-200 hover:bg-brand-500 hover:text-white"}`}><NavIcon/><span className="truncate">{label}</span></Button>)}</nav>
      <div className="mt-auto hidden border-t border-brand-500 pt-4 md:block"><AccountMenu/></div>
    </aside>
    <main className="dashboard-main w-full min-w-0 max-w-full overflow-x-hidden px-4 pb-24 pt-6 md:ml-[260px] md:w-[calc(100%-260px)] md:px-9 md:pb-14 md:pt-8">{children}</main>
  </div>
);

export const PageHeader = ({ title, action }: { title: string; action?: ReactNode }) => <header className="no-print mb-6 flex h-[72px] items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[1.4px] text-slate-400">Hệ thống quản lý học sinh</p><h1 className="mt-1 text-[34px] font-bold tracking-tight">{title}</h1></div>{action}</header>;
