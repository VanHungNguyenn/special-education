# Cấu hình

## Thông tin trung tâm

Vì mã nguồn được dùng chung, tên trung tâm **không được viết cứng** trong code. Mọi chỗ hiển thị tên, chữ cái logo hay domain email đều đọc từ `siteConfig` (`src/config/site.ts`). Các giá trị này lấy từ biến môi trường:

| Biến | Giá trị tạm thời | Dùng ở đâu |
|---|---|---|
| `NEXT_PUBLIC_CENTER_NAME` | `Trung tâm Giáo dục Trẻ Đặc Biệt ABC` | Tiêu đề trang (metadata), hero, footer |
| `NEXT_PUBLIC_CENTER_SHORT_NAME` | `ABC` | Logo chữ, menu, câu trích dẫn, header báo cáo (viết hoa) |
| `NEXT_PUBLIC_CENTER_INITIAL` | `A` | Ô logo tròn |
| `NEXT_PUBLIC_CENTER_EMAIL_DOMAIN` | `example.edu.vn` | Email demo ở trang đăng nhập và menu tài khoản |

Các file liên quan:

- `frontend/.env`: giá trị dùng khi chạy thực tế. File này **không được commit** vì đã nằm trong `.gitignore`.
- `frontend/.env.example`: file mẫu, có commit. Tạo `.env` bằng lệnh `cp .env.example .env`.

Nếu không có biến môi trường, `site.ts` sẽ dùng giá trị mặc định giống bảng trên.

## Đổi tên trung tâm

1. Sửa các biến trong `frontend/.env`.
2. Khởi động lại `pnpm dev`, hoặc build lại.

Khi viết giao diện mới có hiển thị tên trung tâm, luôn dùng `siteConfig`:

```tsx
import { siteConfig } from "@/config/site";

<span>{siteConfig.shortName}</span>
```

## Lưu ý khi build và Docker

Next.js **nhúng cứng các biến `NEXT_PUBLIC_*` vào bundle tại thời điểm `next build`**. Đổi biến sau khi đã build sẽ không có tác dụng.

- `.dockerignore` loại trừ `.env*`, nên image Docker hiện được build với **giá trị mặc định** trong `site.ts`.
- Khi cần build image với tên thật, có hai cách: sửa giá trị mặc định trong `site.ts`, hoặc truyền biến vào bước build (thêm `ARG`/`ENV` trong `Dockerfile` và `build-args` trong workflow CI).
- Trong code, luôn viết trực tiếp `process.env.NEXT_PUBLIC_X`. Cách truy cập động như `process.env[name]` sẽ không được nhúng.
