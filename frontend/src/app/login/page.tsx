"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useLogin } from "@/features/auth/queries";
import { safeNext } from "@/features/auth/redirect";
import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/common/form-field";
import styles from "./login.module.css";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const login = useLogin();
  const busy = login.isPending || login.isSuccess;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    login.mutate(
      { email: String(data.get("email")), password: String(data.get("password")), remember },
      { onSuccess: () => router.replace(safeNext(new URLSearchParams(window.location.search).get("next"))) },
    );
  };

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <BrandLogo tone="light" className={styles.brand}/>
        <div className={styles.introCopy}>
          <span className={styles.eyebrow}>Dành cho đội ngũ nhà trường</span>
          <h1>Mỗi ngày {"đồng\u00a0hành"},<br/>thêm một {"bước\u00a0tiến."}</h1>
          <p>Một không gian chung để giáo viên theo dõi, ghi nhận và phối hợp chăm sóc từng học sinh.</p>
          <div className={styles.quote}><span>“</span><p>Khi cả đội ngũ cùng nhìn về một hướng, mỗi tiến bộ nhỏ của con đều được nâng niu và tiếp nối.</p></div>
        </div>
        <div className={styles.pattern}><i/><i/><i/><i/><i/></div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.formBox}>
          <Link className={styles.back} href="/">← Về trang chủ</Link>
          <span className={`brandMark ${styles.mobileMark}`} aria-hidden>{siteConfig.initial}</span>
          <h2>Chào mừng {"cô/thầy\u00a0trở\u00a0lại"}</h2>
          <p>Đăng nhập để tiếp tục vào cổng quản lý học sinh.</p>
          <form onSubmit={handleSubmit}>
            <p className="mb-4 text-xs text-[#586b65]">Các trường có dấu <span className="font-bold text-coral-600">*</span> là bắt buộc.</p>
            <div className={styles.field}><Label htmlFor="email">Email<RequiredMark/></Label><Input id="email" name="email" type="email" className="h-12 bg-white text-[15px]" placeholder="Nhập email của bạn" required autoComplete="email" aria-describedby={login.error ? "login-error" : undefined}/></div>
            <div className={styles.field}><Label htmlFor="password">Mật khẩu<RequiredMark/></Label><div className="relative"><Input id="password" name="password" type={showPassword ? "text" : "password"} className="h-12 bg-white pr-16 text-[15px]" required autoComplete="current-password" aria-describedby={login.error ? "login-error" : undefined}/><Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-brand-600" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={() => setShowPassword(value => !value)}>{showPassword ? "Ẩn" : "Hiện"}</Button></div></div>
            <div className={styles.options}><div className="flex items-center gap-2"><Checkbox id="remember" checked={remember} onCheckedChange={(value) => setRemember(value === true)}/><Label htmlFor="remember" className="min-h-11 font-normal text-[#586b65]">Ghi nhớ đăng nhập</Label></div><a href="#help">Quên mật khẩu?</a></div>
            {login.error && <p id="login-error" role="alert" className="mb-4 rounded-md bg-coral-50 px-3 py-2.5 text-sm font-medium text-coral-600">{login.error.message}</p>}
            <Button type="submit" size="lg" className="h-12 w-full text-[15px] font-bold" aria-disabled={busy}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</Button>
          </form>
          <div id="help" className={styles.help}><span>?</span><p><strong>Không thể đăng nhập?</strong><br/>Vui lòng liên hệ quản trị viên của Trung tâm {siteConfig.shortName}.</p></div>
          <small className={styles.security}><Lock className="mr-1 inline size-3.5 align-[-2px]"/>Dữ liệu học sinh được bảo mật và chỉ dành cho người được phân quyền.</small>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
