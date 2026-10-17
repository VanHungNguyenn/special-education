"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./login.module.css";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => router.push("/portal"), 450);
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
          <span className={`brandMark ${styles.mobileMark}`}>{siteConfig.initial}</span>
          <h2>Chào mừng {"cô/thầy\u00a0trở\u00a0lại"}</h2>
          <p>Đăng nhập để tiếp tục vào cổng quản lý học sinh.</p>
          <form onSubmit={handleSubmit}>
            <div className={styles.field}><Label htmlFor="email">Email nhà trường</Label><Input id="email" type="email" className="h-12 bg-white text-[15px]" defaultValue={`giaovien@${siteConfig.emailDomain}`} placeholder={`ten@${siteConfig.emailDomain}`} required autoComplete="email"/></div>
            <div className={styles.field}><Label htmlFor="password">Mật khẩu</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} className="h-12 bg-white pr-16 text-[15px]" defaultValue="demo2026" required autoComplete="current-password"/><Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-brand-600" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={() => setShowPassword(value => !value)}>{showPassword ? "Ẩn" : "Hiện"}</Button></div></div>
            <div className={styles.options}><div className="flex items-center gap-2"><Checkbox id="remember" defaultChecked/><Label htmlFor="remember" className="font-normal text-[#6c7e78]">Ghi nhớ đăng nhập</Label></div><a href="#">Quên mật khẩu?</a></div>
            <Button type="submit" size="lg" className="h-12 w-full text-[15px] font-bold" disabled={loading}>{loading ? "Đang đăng nhập…" : "Đăng nhập"}</Button>
          </form>
          <div className={styles.help}><span>?</span><p><strong>Không thể đăng nhập?</strong><br/>Vui lòng liên hệ quản trị viên của Trung tâm {siteConfig.shortName}.</p></div>
          <small className={styles.security}>🔒 Dữ liệu học sinh được bảo mật và chỉ dành cho người được phân quyền.</small>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
