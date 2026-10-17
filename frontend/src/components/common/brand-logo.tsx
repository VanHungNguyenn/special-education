import Link from "next/link";
import { siteConfig } from "@/config/site";

// Center logo (mark + short name + tagline), styled by .brand/.brandMark/.brandSub in globals.css.
// tone="light" for dark backgrounds, size="sm" for the footer.
export const BrandLogo = ({ tone = "dark", size = "md", className = "" }: { tone?: "dark" | "light"; size?: "md" | "sm"; className?: string }) => (
  <Link className={`brand ${tone === "light" ? "light" : ""} ${size === "sm" ? "inverse" : ""} ${className}`} href="/">
    <span className="brandMark">{siteConfig.initial}</span>
    <span>{siteConfig.shortName}<span className="brandSub">{"Giáo dục trẻ đặc biệt".replaceAll(" ", "\u00a0")}</span></span>
  </Link>
);
