"use client";

import { useState } from "react";
import { KeyRound, Pencil, UserCheck, UserX } from "lucide-react";
import { FormError } from "@/components/common/form-error";
import { IconAction } from "@/components/common/icon-action";
import { AccountFormDialog, ResetPasswordDialog } from "@/components/school/account-dialogs";
import { ConfirmDialog } from "@/components/school/confirm-dialog";
import { roleLabel, type User } from "@/features/auth/types";
import { accountStatus, type AccountStatus } from "@/features/users/account";
import { useUpdateUser, useUsers } from "@/features/users/queries";
import { errorText } from "@/lib/api/http-client";
import { nameInitials } from "@/lib/utils";

const statusClass: Record<AccountStatus["kind"], string> = { active: "bg-brand-50 text-brand-700 ring-brand-200", locked: "bg-coral-50 text-coral-600 ring-coral-500/30", disabled: "bg-slate-100 text-slate-600 ring-slate-300" };

const StatusBadge = ({ user }: { user: User }) => { const status = accountStatus(user); return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass[status.kind]}`}>{status.label}</span>; };

type Props = { currentUserId: string; createOpen: boolean; onCreateOpenChange: (open: boolean) => void };

export const AccountList = ({ currentUserId, createOpen, onCreateOpenChange }: Props) => {
  const users = useUsers(); const update = useUpdateUser();
  const [editing, setEditing] = useState<User | null>(null); const [editOpen, setEditOpen] = useState(false); const [resetting, setResetting] = useState<User | null>(null); const [toggling, setToggling] = useState<User | null>(null);
  const list = users.data ?? [];
  const confirmToggle = () => { if (toggling) update.mutate({ id: toggling.id, changes: { isActive: !toggling.isActive } }); setToggling(null); };
  const actions = (user: User) => <div className="flex shrink-0 justify-end gap-1"><IconAction icon={Pencil} label={`Sửa ${user.fullName}`} onClick={() => { setEditing(user); setEditOpen(true); }}/><IconAction icon={KeyRound} label={`Đặt lại mật khẩu cho ${user.fullName}`} onClick={() => setResetting(user)}/>{user.id !== currentUserId && <IconAction icon={user.isActive ? UserX : UserCheck} danger={user.isActive} label={`${user.isActive ? "Vô hiệu hóa" : "Kích hoạt lại"} ${user.fullName}`} onClick={() => { update.reset(); setToggling(user); }}/>}</div>;
  const avatar = (user: User) => <span className={`grid size-10 shrink-0 place-items-center rounded-full font-extrabold ${user.isActive ? "bg-brand-100 text-brand-600" : "bg-slate-100 text-slate-500"}`}>{nameInitials(user.fullName)}</span>;
  const name = (user: User) => <div className="min-w-0"><strong className="block text-sm text-slate-700 wrap-break-word">{user.fullName}{user.id === currentUserId && <span className="ml-1.5 font-normal text-slate-500">(bạn)</span>}</strong><span className="block text-xs text-slate-500 wrap-anywhere">{user.email}</span></div>;

  return <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex min-h-16 items-center gap-3 border-b border-slate-200 px-4 md:px-6"><p className="text-sm text-slate-600">Chỉ quản lý thấy trang này. Tài khoản không xóa được, chỉ vô hiệu hóa.</p><span className="ml-auto shrink-0 whitespace-nowrap text-sm font-medium text-slate-500">{list.length} tài khoản</span></div>
    {update.error && <div className="px-4 pt-4 md:px-6"><FormError message={errorText(update.error)}/></div>}
    {users.isPending && <p className="p-12 text-center text-base text-slate-500">Đang tải danh sách tài khoản…</p>}
    {users.isError && <div className="p-6"><FormError message={errorText(users.error)}/></div>}
    <ul className="divide-y divide-slate-100 md:hidden">{list.map((user) => <li key={user.id} className="flex items-start gap-3 p-4">{avatar(user)}<div className="min-w-0 flex-1">{name(user)}<p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600"><span>{roleLabel[user.role]}</span>{user.phone && <span className="whitespace-nowrap">{user.phone}</span>}<StatusBadge user={user}/></p></div>{actions(user)}</li>)}</ul>
    {list.length > 0 && <div className="hidden overflow-x-auto md:block"><table className="w-full table-fixed border-collapse"><colgroup><col className="w-[38%]"/><col className="w-[14%]"/><col className="w-[16%]"/><col/><col className="w-36"/></colgroup><thead><tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><th className="py-4 pl-4 lg:pl-6">Họ tên</th><th>Vai trò</th><th>Điện thoại</th><th>Trạng thái</th><th><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{list.map((user) => <tr key={user.id} className="h-17.5 border-t border-slate-100 text-sm text-slate-600"><td className="py-3 pl-4 pr-3 lg:pl-6"><div className="flex items-center gap-3">{avatar(user)}{name(user)}</div></td><td className="pr-3">{roleLabel[user.role]}</td><td className="whitespace-nowrap pr-3">{user.phone || "—"}</td><td className="pr-3"><StatusBadge user={user}/></td><td className="pr-2 lg:pr-4">{actions(user)}</td></tr>)}</tbody></table></div>}
    <AccountFormDialog open={createOpen || editOpen} user={createOpen ? null : editing} isSelf={!createOpen && editing?.id === currentUserId} onOpenChange={(open) => { if (!open) { setEditOpen(false); onCreateOpenChange(false); } }}/>
    <ResetPasswordDialog user={resetting} onOpenChange={(open) => { if (!open) setResetting(null); }}/>
    <ConfirmDialog open={Boolean(toggling)} title={toggling?.isActive ? "Vô hiệu hóa tài khoản?" : "Kích hoạt lại tài khoản?"} description={toggling ? (toggling.isActive ? `${toggling.fullName} sẽ bị đăng xuất ngay và không đăng nhập được cho tới khi được kích hoạt lại.` : `${toggling.fullName} sẽ đăng nhập lại được bằng mật khẩu hiện tại.`) : ""} confirmLabel={toggling?.isActive ? "Vô hiệu hóa" : "Kích hoạt lại"} destructive={Boolean(toggling?.isActive)} onConfirm={confirmToggle} onOpenChange={(open) => { if (!open) setToggling(null); }}/>
  </section>;
};
