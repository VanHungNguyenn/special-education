// Center identity. Values come from NEXT_PUBLIC_* env vars (inlined at build time);
// fallbacks keep Docker/CI builds working when no .env file is present.
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_CENTER_NAME || "Trung tâm Giáo dục Trẻ Đặc Biệt ABC",
  shortName: process.env.NEXT_PUBLIC_CENTER_SHORT_NAME || "ABC",
  initial: process.env.NEXT_PUBLIC_CENTER_INITIAL || "A",
  emailDomain: process.env.NEXT_PUBLIC_CENTER_EMAIL_DOMAIN || "example.edu.vn",
};
