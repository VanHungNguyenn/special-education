import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./tailwind.css";
import "./globals.css";

const sans = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700", "800"], display: "swap", variable: "--font-be-vietnam" });
const serif = Lora({ subsets: ["latin", "vietnamese"], style: ["normal", "italic"], display: "swap", variable: "--font-lora" });

export const metadata: Metadata = { title: siteConfig.name, description: "Kiên nhẫn – Yêu thương – Thấu hiểu. Đồng hành cùng trẻ trên hành trình phát triển mỗi ngày." };

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="vi" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning><body suppressHydrationWarning>{children}</body></html>
);

export default RootLayout;
