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
    <aside className="no-print fixed inset-x-0 bottom-0 z-20 flex h-17 w-full max-w-full flex-col overflow-hidden bg-brand-700 p-2 text-white lg:inset-y-0 lg:left-0 lg:right-auto lg:h-screen lg:w-65 lg:px-4.5 lg:py-7">
      <Link href="/" className="hidden items-center gap-3 px-3 pb-9 text-xl font-bold lg:flex"><b className="grid size-10 place-items-center rounded-[50%_50%_50%_12px] bg-coral-600 text-2xl italic">{siteConfig.initial}</b><span>{siteConfig.shortName}<small className="mt-1 block text-[9px] uppercase tracking-[1.4px] text-brand-200">Quản lý học sinh</small></span></Link>
      <nav className="mx-auto flex h-full w-full max-w-xl min-w-0 justify-around gap-1 lg:mx-0 lg:h-auto lg:max-w-none lg:flex-col">{navigation.map(({ id, label, icon: NavIcon }) => <Button key={id} variant="ghost" aria-current={tab === id ? "page" : undefined} onClick={() => onTabChange(id)} className={`h-13 min-w-0 flex-1 justify-center gap-1 px-1 text-xs font-semibold sm:gap-2 sm:text-sm lg:flex-none lg:justify-start lg:gap-3 lg:px-3 lg:text-[15px] [&_svg]:size-4.5 ${tab === id ? "bg-brand-500 text-white hover:bg-brand-500 hover:text-white" : "text-brand-200 hover:bg-brand-500 hover:text-white"}`}><NavIcon/><span className="truncate">{label}</span></Button>)}</nav>
      <div className="mt-auto hidden border-t border-brand-500 pt-4 lg:block"><AccountMenu/></div>
    </aside>
    <main className="dashboard-main w-full min-w-0 max-w-full overflow-x-hidden px-4 pb-24 pt-6 sm:px-6 md:px-8 md:pt-8 lg:ml-65 lg:w-[calc(100%-260px)] lg:px-9 lg:pb-14">{children}</main>
  </div>
);

// Below lg the sidebar becomes a bottom bar, so the account menu moves into the page header.
export const PageHeader = ({ title, action }: { title: string; action?: ReactNode }) => <header className="no-print mb-6 flex min-h-18 items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[1.4px] text-slate-400">Hệ thống quản lý học sinh</p><h1 className="mt-1 text-[28px] font-bold tracking-tight sm:text-[34px]">{title}</h1></div><div className="flex shrink-0 items-center gap-2">{action}<div className="lg:hidden"><AccountMenu compact/></div></div></header>;
