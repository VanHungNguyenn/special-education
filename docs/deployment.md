# Triển khai

## Các container

`docker-compose.yml` ở thư mục gốc chạy 3 service:

| Service | Image | Cổng | Ghi chú |
|---|---|---|---|
| `frontend` | `${FRONTEND_IMAGE}` (build từ `./frontend`) | `${PORT:-3000}` mở ra ngoài | Next.js. Chuyển tiếp `/api/*` tới `http://backend:4000` (địa chỉ này được ghi cứng lúc build image) |
| `backend` | `${BACKEND_IMAGE}` (build từ `./backend`) | 4000, chỉ trong mạng Docker | NestJS. Lúc khởi động chạy `prisma migrate deploy`; migration lỗi thì container dừng |
| `db` | `postgres:17-alpine` | 5432, chỉ trong mạng Docker | Dữ liệu nằm trong volume `pgdata` |

Thứ tự khởi động do healthcheck đảm bảo: `db` khỏe thì `backend` mới chạy, `backend` khỏe thì `frontend` mới chạy.

Chạy thử ở máy local: `./docker.sh` (bản giống production) hoặc `./docker.sh dev` (hot reload). Xem [RUNNING.md](../RUNNING.md).

## Biến môi trường trên server

Đặt trong `/opt/special-education/.env`, cạnh `docker-compose.yml`. Bước deploy sẽ dừng nếu thiếu một trong ba biến đầu.

| Biến | Bắt buộc | Ví dụ | Ghi chú |
|---|---|---|---|
| `POSTGRES_PASSWORD` | Có | chuỗi ngẫu nhiên chỉ gồm chữ và số | Nằm trong URL kết nối, nên tránh ký tự đặc biệt. Tạo bằng `openssl rand -hex 24` |
| `FRONTEND_IMAGE` | Có | `ghcr.io/<owner>/special-education-frontend:latest` | |
| `BACKEND_IMAGE` | Có | `ghcr.io/<owner>/special-education-backend:latest` | |
| `PORT` | Không | `3000` | Cổng FE mở ra ngoài |
| `DATABASE_URL`, `DIRECT_URL` | Không | | Chỉ đặt khi dùng DB bên ngoài (xem phần Neon/Supabase) |

> **Đừng xóa volume.** `docker compose down -v` sẽ xóa toàn bộ dữ liệu, và hiện chưa có backup. `./docker.sh down` không bao giờ xóa volume.

## CI/CD (`.github/workflows/deploy.yml`)

Workflow chạy khi có thay đổi trong `frontend/**`, `backend/**`, `docker-compose.yml` hoặc chính file workflow.

1. **`backend-test`:** chạy trên cả pull request và push. Gồm lint, unit test, e2e (với service Postgres của GitHub Actions) và build.
2. **`build`:** chỉ khi không phải pull request, và chỉ sau khi `backend-test` đã qua. Build và push hai image `special-education-frontend` và `special-education-backend` lên GHCR, gắn tag `sha-<short>`; nhánh mặc định thêm tag `latest`.
3. **`deploy`:** chỉ trên `master`. Các bước:
   - copy `docker-compose.yml` lên server;
   - kiểm tra `.env` trên server có đủ biến;
   - `docker compose pull` rồi `up -d`;
   - **smoke test:** gọi `/api/v1/health` qua container frontend; quá 90 giây chưa trả về ok thì job fail và in log backend.

Secrets cần có trên GitHub: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_PORT` (không bắt buộc). `GITHUB_TOKEN` được cấp tự động.

## Chuyển sang Neon hoặc Supabase

Backend chỉ dùng PostgreSQL chuẩn qua Prisma, nên không phải sửa code.

1. Tạo database trên Neon hoặc Supabase. Lấy hai chuỗi kết nối:
   - **pooled** (qua connection pooler: Neon có `-pooler` trong host; Supabase dùng cổng 6543): dùng cho `DATABASE_URL`;
   - **direct** (kết nối thẳng): dùng cho `DIRECT_URL`, vì migration cần kết nối thẳng.
2. Thêm `DATABASE_URL` và `DIRECT_URL` vào `/opt/special-education/.env`. Hai biến này ghi đè giá trị mặc định trỏ tới service `db`.
3. Chạy `docker compose up -d`. Backend tự chạy migration lên DB mới; kiểm tra bằng `docker compose exec -T frontend wget -qO- http://localhost:3000/api/v1/health`.
4. Khi DB mới đã chạy ổn định: chuyển dữ liệu cũ sang (`pg_dump` từ container `db` rồi `pg_restore` vào DB mới), sau đó bỏ service `db` khỏi `docker-compose.yml`.

Thử trước ở máy local: đặt hai biến này trong `.env` ở thư mục gốc rồi chạy `./docker.sh`.

## Cấu hình FE lúc build

Tên trung tâm (`NEXT_PUBLIC_CENTER_*`) và `BACKEND_URL` được ghi cứng vào image FE lúc build. Đổi các giá trị này thì phải build lại image. Xem [frontend/docs/configuration.md](../frontend/docs/configuration.md).
