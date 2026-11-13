"use client";

import { useLayoutEffect, useState, type FormEvent } from "react";
import { dialogCloseTarget } from "@/components/common/dialog-classes";
import { FormError } from "@/components/common/form-error";
import { Field } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChangePassword } from "@/features/auth/queries";

export const ChangePasswordDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const changePassword = useChangePassword();
  const [mismatch, setMismatch] = useState(false);

  const { reset } = changePassword;
  useLayoutEffect(() => { if (open) { reset(); setMismatch(false); } }, [open, reset]);
  const close = onOpenChange;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("newPassword"));
    setMismatch(newPassword !== String(data.get("confirmPassword")));
    if (newPassword !== String(data.get("confirmPassword")) || changePassword.isPending) return;
    changePassword.mutate({ currentPassword: String(data.get("currentPassword")), newPassword });
  };

  return <Dialog open={open} onOpenChange={close}><DialogContent className={`sm:max-w-md ${dialogCloseTarget}`}><DialogHeader><DialogTitle>Đổi mật khẩu</DialogTitle><DialogDescription>Sau khi đổi, các thiết bị khác đang đăng nhập tài khoản này sẽ bị đăng xuất.</DialogDescription></DialogHeader>
    {changePassword.isSuccess
      ? <><p role="status" className="rounded-md bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700">Đã đổi mật khẩu thành công.</p><DialogFooter><Button size="lg" onClick={() => close(false)}>Xong</Button></DialogFooter></>
      : <form onSubmit={handleSubmit} className="space-y-4"><Field label="Mật khẩu hiện tại" name="currentPassword" type="password" autoComplete="current-password" required maxLength={128}/><Field label="Mật khẩu mới (8–128 ký tự)" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128}/><Field label="Nhập lại mật khẩu mới" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128}/><FormError message={mismatch ? "Mật khẩu nhập lại không khớp." : changePassword.error?.message}/><DialogFooter><Button size="lg" type="button" variant="outline" onClick={() => close(false)}>Hủy</Button><Button size="lg" type="submit" aria-disabled={changePassword.isPending}>{changePassword.isPending ? "Đang lưu…" : "Đổi mật khẩu"}</Button></DialogFooter></form>}
  </DialogContent></Dialog>;
};
