# Hướng dẫn chạy dự án

## Yêu cầu

- [Node.js 22+](https://nodejs.org) và [pnpm](https://pnpm.io): để chạy dev local
- [Docker Desktop](https://www.docker.com/products/docker-desktop): để chạy Postgres và chạy toàn bộ bằng Docker

---

## 1. Chạy toàn bộ bằng Docker (dễ nhất)

```bash
./docker.sh dev        # hot reload FE + BE + Postgres
./docker.sh            # bản giống production (build image)
./docker.sh logs       # xem log (thêm frontend | backend | db để xem riêng)
./docker.sh status     # trạng thái container
./docker.sh restart    # build lại và chạy lại
./docker.sh down       # dừng (không xóa dữ liệu)
```

- Lần đầu, `docker.sh` tự tạo `.env` ở thư mục gốc từ `.env.example`.
- FE: http://localhost:3000.
- Ở chế độ dev, API mở ở http://localhost:4000/api/v1/health, tài liệu API ở http://localhost:4000/api/v1/docs.
- Ở bản production, chỉ cổng 3000 được mở; API vẫn gọi được qua http://localhost:3000/api/v1/health.

Khi cổng bị trùng:

```bash
PORT=8080 ./docker.sh                           # đổi cổng FE
BACKEND_PORT=4100 DB_PORT=5433 ./docker.sh dev  # đổi cổng BE và DB ở chế độ dev
```

### Tài khoản để đăng nhập

Lần đầu, tạo tài khoản demo (chỉ chạy được ngoài production):

```bash
cd backend && pnpm db:seed:demo          # quanly@demo.local, linh@ / thu@ / trang@demo.local — mật khẩu demo2026
node dist/cli/seed-demo.js --clean       # xóa toàn bộ tài khoản @demo.local
```

Khi chạy bằng Docker dev, chạy lệnh trên trong máy (cổng DB 5432 đã mở), hoặc: `docker compose -f docker-compose.dev.yml exec backend pnpm db:seed:demo`.

Sai mật khẩu 5 lần thì tài khoản bị khóa 15 phút. Quản lý mở khóa bằng cách đặt lại mật khẩu trong tab **Tài khoản**.

---

## 2. Chạy từng phần trên máy (không dùng Docker cho code)

Postgres vẫn chạy bằng Docker:

```bash
docker compose -f docker-compose.dev.yml up -d db
```

Backend (terminal 1):

```bash
cd backend
cp .env.example .env
pnpm install
pnpm db:deploy
pnpm start:dev        # http://localhost:4000/api/v1/health
```

Frontend (terminal 2):

```bash
cd frontend
cp .env.example .env  # BACKEND_URL=http://localhost:4000
pnpm install
pnpm dev              # http://localhost:3000, /api/* được chuyển sang backend
```

Nếu backend chạy ở cổng khác (đổi `PORT` trong `backend/.env`), sửa `BACKEND_URL` trong `frontend/.env` cho khớp, rồi khởi động lại `pnpm dev`.

---

## 3. Kiểm thử

```bash
cd backend && pnpm lint && pnpm test && pnpm test:e2e && pnpm build
cd frontend && pnpm build && pnpm test
cd frontend && pnpm auth-flow && pnpm a11y-check && pnpm layout-check   # cần BE đang chạy + tài khoản demo
```

e2e của backend dùng database `special_education_test` trong cùng container Postgres, không đụng dữ liệu dev.

---

## Cấu trúc thư mục

```
special-education/
├── frontend/                # Next.js app
├── backend/                 # NestJS API + Prisma
├── docker-compose.yml       # production: frontend, backend, db
├── docker-compose.dev.yml   # dev: hot reload
├── docker.sh
└── docs/                    # kiến trúc, triển khai, yêu cầu backend
```

Triển khai lên server: [docs/deployment.md](docs/deployment.md).
