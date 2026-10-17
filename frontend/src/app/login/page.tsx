"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
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
        <Link className={styles.brand} href="/"><b>{siteConfig.initial}</b><span>{siteConfig.shortName}<small>Giáo dục trẻ đặc biệt</small></span></Link>
        <div className={styles.introCopy}>
          <span className={styles.eyebrow}>Dành cho đội ngũ nhà trường</span>
          <h1>Mỗi ngày đồng hành,<br/>thêm một bước tiến.</h1>
          <p>Một không gian chung để giáo viên theo dõi, ghi nhận và phối hợp chăm sóc từng học sinh.</p>
          <div className={styles.quote}><span>“</span><p>Khi cả đội ngũ cùng nhìn về một hướng, mỗi tiến bộ nhỏ của con đều được nâng niu và tiếp nối.</p></div>
        </div>
        <div className={styles.pattern}><i/><i/><i/><i/><i/></div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.formBox}>
          <Link className={styles.back} href="/">← Về trang chủ</Link>
          <span className={styles.mobileMark}>{siteConfig.initial}</span>
          <h2>Chào mừng cô/thầy trở lại</h2>
          <p>Đăng nhập để tiếp tục vào cổng quản lý học sinh.</p>
          <form onSubmit={handleSubmit}>
            <label>Email nhà trường<input type="email" defaultValue={`giaovien@${siteConfig.emailDomain}`} placeholder={`ten@${siteConfig.emailDomain}`} required autoComplete="email"/></label>
            <label>Mật khẩu<div className={styles.password}><input type={showPassword ? "text" : "password"} defaultValue="demo2026" required autoComplete="current-password"/><button type="button" onClick={() => setShowPassword(value => !value)}>{showPassword ? "Ẩn" : "Hiện"}</button></div></label>
            <div className={styles.options}><label><input type="checkbox" defaultChecked/> Ghi nhớ đăng nhập</label><a href="#">Quên mật khẩu?</a></div>
            <button className={styles.submit} type="submit" disabled={loading}>{loading ? "Đang đăng nhập…" : "Đăng nhập"}<span>→</span></button>
          </form>
          <div className={styles.help}><span>?</span><p><strong>Không thể đăng nhập?</strong><br/>Vui lòng liên hệ quản trị viên của Trung tâm {siteConfig.shortName}.</p></div>
          <small className={styles.security}>🔒 Dữ liệu học sinh được bảo mật và chỉ dành cho người được phân quyền.</small>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
