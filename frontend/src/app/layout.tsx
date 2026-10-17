import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import "./tailwind.css";
import "./globals.css";

export const metadata: Metadata = { title: siteConfig.name, description: "Kiên nhẫn – Yêu thương – Thấu hiểu. Đồng hành cùng trẻ trên hành trình phát triển mỗi ngày." };

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const fonts = { "--font-sans": 'Aptos, "Segoe UI Variable", "Segoe UI", Arial, sans-serif', "--font-serif": 'Aptos, "Segoe UI Variable", "Segoe UI", Arial, sans-serif' } as React.CSSProperties;
  return <html lang="vi" suppressHydrationWarning><body style={fonts} suppressHydrationWarning>{children}</body></html>;
}

export default RootLayout;
