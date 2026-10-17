# Tài liệu dự án — Frontend trung tâm giáo dục trẻ đặc biệt

Ứng dụng web gồm hai phần:

1. **Trang giới thiệu** (`/`): giới thiệu trung tâm, chương trình học và một ngày tại trung tâm.
2. **Cổng quản lý học sinh** (`/login` → `/portal`): giáo viên quản lý lớp học, hồ sơ học sinh, phiếu đánh giá kỹ năng theo tháng, và xuất (in) báo cáo.

> Tên trung tâm hiện là tên chung tạm thời (**"Trung tâm ABC"**), cấu hình qua biến môi trường. Xem [configuration.md](configuration.md).

## Mục lục

| Tài liệu | Nội dung |
|---|---|
| [architecture.md](architecture.md) | Công nghệ, cấu trúc thư mục, routes, quản lý state |
| [domain.md](domain.md) | Mô hình dữ liệu, tiêu chí đánh giá, quy trình phiếu đánh giá, quy tắc nghiệp vụ |
| [configuration.md](configuration.md) | Biến môi trường, cách đổi tên trung tâm |
| [deployment.md](deployment.md) | Docker, docker-compose, CI/CD GitHub Actions |
| [ui-guidelines.md](ui-guidelines.md) | Quy ước giao diện: nút, xuống dòng tiếng Việt, card, section, màu, font |
| [testing.md](testing.md) | Chụp ảnh kiểm tra giao diện bằng Playwright (`pnpm screenshot`) |
| [RUNNING.md](../../RUNNING.md) | Hướng dẫn chạy nhanh (local và Docker) |

## Chạy nhanh

```bash
cd frontend
cp .env.example .env   # nếu chưa có .env
pnpm install
pnpm dev               # http://localhost:3000
```

## Hạn chế hiện tại / TODO

- **Đăng nhập giả lập:** form login không xác thực gì. Bấm đăng nhập là chuyển thẳng vào `/portal`. Tài khoản demo được điền sẵn (`giaovien@<domain>` / `demo2026`).
- **Không có backend, không lưu dữ liệu:** toàn bộ dữ liệu là mock trong `src/features/school/data.ts` và chỉ nằm trong React state, nên tải lại trang là mất mọi thay đổi.
- **Chưa phân quyền:** chưa có vai trò quản trị, giáo viên hay phụ huynh. Thông tin tài khoản trong menu đang cố định.
- **Chưa có lint và unit test.** Hiện chỉ kiểm tra bằng `pnpm build` và chụp ảnh giao diện bằng `pnpm screenshot` (xem [testing.md](testing.md)).
- Hình minh họa ở hero đang được vẽ bằng CSS, chỉ là tạm thời; nên thay bằng ảnh thật của trung tâm.
- Tháng mặc định của phiếu đánh giá đang cố định là `2026-07`.
