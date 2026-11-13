"use client";

import { useLayoutEffect, useState, type FormEvent } from "react";
import { dialogCloseTarget } from "@/components/common/dialog-classes";
import { FormError } from "@/components/common/form-error";
import { Field, RequiredNote, SelectField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SelectItem } from "@/components/ui/select";
import { roleLabel, type Role, type User } from "@/features/auth/types";
import { generatePassword } from "@/features/users/account";
import { useCreateUser, useResetUserPassword, useUpdateUser } from "@/features/users/queries";
import { errorText } from "@/lib/api/http-client";

const PasswordField = ({ label }: { label: string }) => {
  const [value, setValue] = useState(""); const [visible, setVisible] = useState(false);
  return <div className="grid gap-2"><Field label={label} name="password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={128} value={value} onChange={(event) => setValue(event.target.value)}/><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => { setValue(generatePassword()); setVisible(true); }}>Tạo ngẫu nhiên</Button><Button type="button" variant="ghost" onClick={() => setVisible((current) => !current)}>{visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</Button></div></div>;
};

type FormDialogProps = { open: boolean; user: User | null; isSelf: boolean; onOpenChange: (open: boolean) => void };

export const AccountFormDialog = ({ open, user, isSelf, onOpenChange }: FormDialogProps) => {
  const create = useCreateUser(); const update = useUpdateUser();
  const mutation = user ? update : create;
  const { reset: resetCreate } = create; const { reset: resetUpdate } = update;
  useLayoutEffect(() => { if (open) { resetCreate(); resetUpdate(); } }, [open, resetCreate, resetUpdate]);
  const close = onOpenChange;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending || mutation.isSuccess) return;
    const data = new FormData(event.currentTarget);
    const fields = { email: String(data.get("email")), fullName: String(data.get("fullName")), phone: String(data.get("phone")), role: String(data.get("role") ?? user?.role) as Role };
    const onSuccess = () => close(false);
    if (user) update.mutate({ id: user.id, changes: isSelf ? { email: fields.email, fullName: fields.fullName, phone: fields.phone } : fields }, { onSuccess });
    else create.mutate({ ...fields, password: String(data.get("password")) }, { onSuccess });
  };

  return <Dialog open={open} onOpenChange={close}><DialogContent className={`max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg ${dialogCloseTarget}`}><DialogHeader><DialogTitle>{user ? "Sửa tài khoản" : "Thêm tài khoản"}</DialogTitle><DialogDescription>{user ? "Cập nhật thông tin và vai trò của tài khoản." : "Gửi email và mật khẩu ban đầu cho người dùng sau khi tạo."}</DialogDescription></DialogHeader>
    <form key={user?.id ?? "new"} onSubmit={handleSubmit} className="space-y-4"><RequiredNote/><Field label="Họ và tên" name="fullName" required maxLength={100} defaultValue={user?.fullName} autoComplete="off"/><div className="grid gap-4 sm:grid-cols-2"><Field label="Email" name="email" type="email" required maxLength={254} defaultValue={user?.email} autoComplete="off"/><Field label="Điện thoại" name="phone" type="tel" maxLength={20} defaultValue={user?.phone} autoComplete="off"/></div>{isSelf ? <p className="text-sm text-slate-600">Bạn không thể tự đổi vai trò của mình.</p> : <SelectField label="Vai trò" name="role" required defaultValue={user?.role ?? "TEACHER"}>{(Object.keys(roleLabel) as Role[]).map((role) => <SelectItem value={role} key={role}>{roleLabel[role]}</SelectItem>)}</SelectField>}{!user && <PasswordField label="Mật khẩu ban đầu (8–128 ký tự)"/>}<FormError message={errorText(mutation.error)}/><DialogFooter><Button size="lg" type="button" variant="outline" onClick={() => close(false)}>Hủy</Button><Button size="lg" type="submit" aria-disabled={mutation.isPending || mutation.isSuccess}>{mutation.isPending || mutation.isSuccess ? "Đang lưu…" : user ? "Lưu thay đổi" : "Tạo tài khoản"}</Button></DialogFooter></form>
  </DialogContent></Dialog>;
};

export const ResetPasswordDialog = ({ open, user, onOpenChange }: { open: boolean; user: User | null; onOpenChange: (open: boolean) => void }) => {
  const reset = useResetUserPassword();
  const { reset: resetMutation } = reset;
  useLayoutEffect(() => { if (open) resetMutation(); }, [open, resetMutation]);
  const close = onOpenChange;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || reset.isPending) return;
    reset.mutate({ id: user.id, password: String(new FormData(event.currentTarget).get("password")) });
  };
  return <Dialog open={open} onOpenChange={close}><DialogContent className={`sm:max-w-md ${dialogCloseTarget}`}><DialogHeader><DialogTitle>Đặt lại mật khẩu</DialogTitle><DialogDescription>{user ? `${user.fullName} sẽ bị đăng xuất khỏi mọi thiết bị và đăng nhập lại bằng mật khẩu mới.` : ""}</DialogDescription></DialogHeader>
    {reset.isSuccess
      ? <><p role="status" className="rounded-md bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700">Đã đặt lại mật khẩu. Hãy gửi mật khẩu mới cho {user?.fullName}.</p><DialogFooter><Button size="lg" onClick={() => close(false)}>Xong</Button></DialogFooter></>
      : <form key={user?.id} onSubmit={handleSubmit} className="space-y-4"><RequiredNote/><PasswordField label="Mật khẩu mới (8–128 ký tự)"/><FormError message={errorText(reset.error)}/><DialogFooter><Button size="lg" type="button" variant="outline" onClick={() => close(false)}>Hủy</Button><Button size="lg" type="submit" aria-disabled={reset.isPending}>{reset.isPending ? "Đang lưu…" : "Đặt lại mật khẩu"}</Button></DialogFooter></form>}
  </DialogContent></Dialog>;
};
