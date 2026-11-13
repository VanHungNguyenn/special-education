"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis, KeyRound, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dialogCloseTarget } from "@/components/common/dialog-classes";
import { ChangePasswordDialog } from "@/components/school/change-password-dialog";
import { useLogout, useMe } from "@/features/auth/queries";
import { roleLabel } from "@/features/auth/types";
import { nameInitials } from "@/lib/utils";

export const AccountMenu = ({ compact }: { compact?: boolean }) => {
  const { data: me } = useMe(); const logout = useLogout();
  const [profileOpen,setProfileOpen] = useState(false); const [passwordOpen,setPasswordOpen] = useState(false);
  const name = me?.fullName ?? "Đang tải…"; const role = me ? roleLabel[me.role] : ""; const initials = me ? nameInitials(me.fullName) : "";
  const avatar = (size: string, text: string) => <Avatar className={size}><AvatarFallback className={`bg-[#e5a58d] ${text} font-bold text-brand-800`}>{initials}</AvatarFallback></Avatar>;
  return <><DropdownMenu><DropdownMenuTrigger asChild>{compact ? <Button variant="ghost" size="icon" aria-label={`Tài khoản: ${name}`} className="size-11 rounded-full p-0">{avatar("size-10","text-xs")}</Button> : <Button variant="ghost" className="h-auto w-full justify-start gap-3 rounded-lg p-2 text-left text-white hover:bg-brand-500 hover:text-white">{avatar("size-10","text-xs")}<div className="min-w-0 flex-1"><strong className="block truncate text-sm">{name}</strong><small className="text-xs text-brand-200">{role}</small></div><Ellipsis className="text-brand-200"/></Button>}</DropdownMenuTrigger><DropdownMenuContent side={compact ? "bottom" : "right"} align="end" className="min-w-56"><DropdownMenuLabel><strong className="block text-sm text-slate-700">{name}</strong><span className="font-normal">{me?.email}</span></DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>setProfileOpen(true)}><User/>Thông tin cá nhân</DropdownMenuItem><DropdownMenuItem onSelect={()=>setPasswordOpen(true)}><KeyRound/>Đổi mật khẩu</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem variant="destructive" disabled={logout.isPending} onSelect={()=>logout.mutate()}><LogOut/>Đăng xuất</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className={`sm:max-w-md ${dialogCloseTarget}`}><DialogHeader><DialogTitle>Thông tin cá nhân</DialogTitle><DialogDescription>Thông tin tài khoản đang sử dụng hệ thống. Liên hệ quản lý trung tâm nếu cần sửa.</DialogDescription></DialogHeader><div className="flex items-center gap-4 rounded-lg bg-brand-50 p-4">{avatar("size-14","text-base")}<div><strong className="text-lg">{name}</strong><p className="text-sm text-slate-600">{role}</p></div></div><dl className="mt-4 divide-y divide-slate-100">{[["Email",me?.email ?? ""],["Điện thoại",me?.phone || "Chưa có"],["Vai trò",role]].map(([label,value])=><div className="grid grid-cols-[100px_1fr] py-3 text-sm" key={label}><dt className="text-slate-500">{label}</dt><dd className="font-medium text-slate-700">{value}</dd></div>)}</dl></DialogContent></Dialog><ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen}/></>;
};
