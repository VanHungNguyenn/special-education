# Hệ thống quản lý trung tâm giáo dục trẻ đặc biệt

Ứng dụng web gồm trang giới thiệu trung tâm và cổng quản lý cho giáo viên: quản lý lớp, hồ sơ học sinh, phiếu đánh giá kỹ năng theo tháng (11 tiêu chí), và xuất báo cáo theo mẫu GDCN (`Mau_GDCN.pdf`).

## Trạng thái

- **Frontend** (`frontend/`): đã dựng xong giao diện, nhưng đang dùng dữ liệu giả. Đăng nhập là giả lập, tải lại trang là mất dữ liệu.
- **Backend** (`backend/`): đã có nền tảng (NestJS 12, Prisma 7, PostgreSQL, Docker, CI). Chưa có module nghiệp vụ; module tiếp theo là đăng nhập (`auth`).

## Đọc theo thứ tự

1. [RUNNING.md](RUNNING.md): chạy dự án (local hoặc Docker).
2. [frontend/docs/README.md](frontend/docs/README.md): kiến trúc, nghiệp vụ, cấu hình, triển khai, quy ước giao diện, kiểm thử của frontend.
3. [docs/architecture.md](docs/architecture.md): kiến trúc và design pattern của toàn hệ thống. [docs/deployment.md](docs/deployment.md): triển khai. [docs/backend-requirements.md](docs/backend-requirements.md): frontend cần backend cung cấp những gì.
4. [SPEC.md](SPEC.md): bản nháp làm lại tab Báo cáo và API tải báo cáo.
5. [CLAUDE.md](CLAUDE.md) và [frontend/CLAUDE.md](frontend/CLAUDE.md): hướng dẫn ngắn gọn cho AI agent, cũng hữu ích cho người.

## Chạy nhanh

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev        # http://localhost:3000, vào /login rồi bấm đăng nhập
```
