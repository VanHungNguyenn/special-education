"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const AccountMenu = () => {
  const router = useRouter(); const [profileOpen,setProfileOpen] = useState(false);
  return <><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-auto w-full justify-start gap-3 rounded-lg p-2 text-left text-white hover:bg-brand-500 hover:text-white"><Avatar className="size-10"><AvatarFallback className="bg-[#e5a58d] text-xs font-bold text-white">HL</AvatarFallback></Avatar><div className="min-w-0 flex-1"><strong className="block truncate text-sm">Nguyễn Hà Linh</strong><small className="text-xs text-brand-200">Giáo viên</small></div><Ellipsis className="text-brand-200"/></Button></DropdownMenuTrigger><DropdownMenuContent side="right" align="end"><DropdownMenuLabel><strong className="block text-sm text-slate-700">Nguyễn Hà Linh</strong><span className="font-normal">giaovien@{siteConfig.emailDomain}</span></DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>setProfileOpen(true)}><User/>Thông tin cá nhân</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem variant="destructive" onSelect={()=>router.push("/login")}><LogOut/>Đăng xuất</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Thông tin cá nhân</DialogTitle><DialogDescription>Thông tin tài khoản đang sử dụng hệ thống.</DialogDescription></DialogHeader><div className="flex items-center gap-4 rounded-lg bg-brand-50 p-4"><Avatar className="size-14"><AvatarFallback className="bg-[#e5a58d] text-base font-bold text-white">HL</AvatarFallback></Avatar><div><strong className="text-lg">Nguyễn Hà Linh</strong><p className="text-sm text-slate-500">Giáo viên chủ nhiệm</p></div></div><dl className="mt-4 divide-y divide-slate-100">{[["Email",`giaovien@${siteConfig.emailDomain}`],["Điện thoại","090 123 4567"],["Vai trò","Giáo viên"]].map(([label,value])=><div className="grid grid-cols-[100px_1fr] py-3 text-sm" key={label}><dt className="text-slate-400">{label}</dt><dd className="font-medium text-slate-700">{value}</dd></div>)}</dl></DialogContent></Dialog></>;
};
