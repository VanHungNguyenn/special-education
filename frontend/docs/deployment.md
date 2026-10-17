# Triển khai

## Docker

`frontend/Dockerfile` dùng image `node:22-alpine`. Các bước: bật corepack, chạy `pnpm install` và `pnpm build`, sau đó chạy `pnpm start` ở cổng 3000.

`docker-compose.yml` (ở thư mục gốc):

- Service `frontend`, container tên `special-education-frontend`.
- Image là `${FRONTEND_IMAGE:-special-education-frontend:latest}`. Khi deploy, image được lấy từ GHCR. Khi chạy local, image được build từ `./frontend`.
- Cổng: `${PORT:-3000}:3000`. Có `restart: unless-stopped` và healthcheck bằng `wget` tới `http://localhost:3000`.

Các lệnh thường dùng (chạy từ thư mục gốc):

```bash
docker compose up --build        # build và chạy
docker compose up --build -d     # chạy nền
docker compose down              # dừng
```

## CI/CD (`.github/workflows/deploy.yml`)

Workflow chạy khi push lên nhánh **`main`** có thay đổi trong `frontend/**`, `docker-compose.yml` hoặc chính file workflow. Cũng có thể chạy tay (`workflow_dispatch`).

> Lưu ý: repo hiện dùng nhánh `master`. Cần đổi tên nhánh hoặc sửa trigger thì workflow mới chạy.

1. **build:** build image từ `./frontend` rồi push lên `ghcr.io/<owner>/special-education-frontend`, gắn tag `sha-<short>` và `latest` (với nhánh mặc định). Bước này dùng cache của GitHub Actions.
2. **deploy** (environment `production`): copy `docker-compose.yml` lên server vào `/opt/special-education`, rồi SSH vào server để chạy lần lượt: login GHCR, `docker compose pull`, `docker compose up -d --no-build`, `docker image prune -f`.

### Secrets cần cấu hình

| Secret | Mô tả |
|---|---|
| `SSH_HOST` | Địa chỉ server |
| `SSH_USER` | User SSH |
| `SSH_PRIVATE_KEY` | Private key SSH |
| `SSH_PORT` | Không bắt buộc, mặc định là 22 |

`GITHUB_TOKEN` được cấp tự động. Trên server, cần đặt `FRONTEND_IMAGE` (ví dụ trong `/opt/special-education/.env`) trỏ tới image trên GHCR. Nếu không, compose sẽ tìm image local mặc định.

Xem [configuration.md](configuration.md) để biết vì sao biến tên trung tâm được nhúng vào lúc build.
