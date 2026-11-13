# Implementation Plan: Module `platform`

Nguồn: [SPEC-platform.md](../SPEC-platform.md), [SPEC-backend.md](../SPEC-backend.md), [docs/architecture.md](../docs/architecture.md). Danh sách task chi tiết: [todo.md](todo.md).

## Overview

Dựng nền backend:
- project NestJS chạy được, kết nối PostgreSQL qua Prisma;
- định dạng lỗi chung, healthcheck, OpenAPI;
- khung module 4 lớp (`_template`) để các module sau sao chép;
- Docker 3 service (`frontend`, `backend`, `db`) cho cả dev và production;
- CI test + build image backend.

FE gọi được `/api/v1/health` qua rewrite cùng domain.

Chưa có tính năng nghiệp vụ. Phần nối FE bằng TanStack Query (`lib/api/`, `QueryClientProvider`) **không nằm trong module này**: nó được làm ở module `auth`, cùng với màn hình đăng nhập, vì đó là nơi FE gọi API lần đầu.

## Architecture Decisions

### Kết luận T1 (đã xác minh bằng thử nghiệm, 2026-11-13)

- **Next 16 nhúng đích của `rewrites()` lúc build.** Thử nghiệm: build với `BACKEND_URL=:4100`, chạy `next start` với `BACKEND_URL=:4101`, request vẫn đi tới `:4100`. Rewrite chuyển tiếp đúng method, body, `cookie`, `set-cookie` và các header `X-Forwarded-*` từ proxy phía trước; tự thêm `x-forwarded-host`, nhưng không tự thêm `x-forwarded-for`.
  - **Chốt:** dùng `rewrites()`, không tự viết proxy. Cả hai file compose đặt tên service backend là `backend`. Image FE build với `BACKEND_URL=http://backend:4000` (`ARG` trong Dockerfile, đặt mặc định luôn). `pnpm dev` trên máy dùng `http://localhost:4000` từ `.env`.
  - **Đánh đổi:** đổi host backend thì phải build lại FE. Chấp nhận được, vì host là tên service cố định trong Docker. Đổi DB (Neon/Supabase) không liên quan tới việc này.
  - Ghi chú cho `auth`: IP thật của người dùng chỉ có khi phía trước có reverse proxy (nginx) gắn `X-Forwarded-For`.
- **NestJS 12** (12.0.0 ra ngày 27/8/2026; dùng bản 12.4.x, đã phát hành hơn hai tuần). Nest 12 thay đổi so với spec:
  - project là **ESM** (`"type": "module"`, import có đuôi `.js`), TypeScript 6;
  - CLI mặc định dùng **Vitest** thay Jest và **oxlint** thay ESLint.

  **Chốt: theo mặc định của Nest 12.** Ép dùng Jest với ESM rất tốn công, và mục đích của spec (unit, e2e, lint) vẫn giữ nguyên.
  - Đã thử: Vitest chạy được DI qua constructor.
  - Đã thử: `no-restricted-imports` của oxlint chặn được `@nestjs/*` trong `**/domain/**` bằng `overrides`.
  - Lưu ý: CLI sinh file `oxlint.json`, nhưng oxlint chỉ tự tìm `.oxlintrc.json`. Script `lint` phải truyền `-c`, nếu không mọi rule sẽ không có tác dụng.
- **Prisma 7.10.1** (bản ổn định). Tag `latest` trên npm đang trỏ tới `8.0.0-rc.33` nên không dùng tag đó.
  - Prisma 7 không còn engine Rust ở runtime: client kết nối qua driver adapter `@prisma/adapter-pg`.
  - Generator `prisma-client` sinh code vào thư mục trong `src/`.
  - CLI đọc `prisma.config.ts` (`defineConfig`, `env()`).
  - **Tách URL tự nhiên:** `prisma.config.ts` có `datasource.url = env("DIRECT_URL")`, dùng cho migrate (kết nối trực tiếp). App chạy dùng `PrismaPg` với `DATABASE_URL` (connection pooler khi lên Neon/Supabase).
  - **CLI trong image runtime:** để `prisma` ở `dependencies`. `prisma.config.ts` import `prisma/config`, nên file này cũng phải có trong image.
- **pnpm 12 chặn script cài đặt** (`ERR_PNPM_IGNORED_BUILDS`): phải có `allowBuilds` cho `prisma` và `@prisma/engines` trong `backend/pnpm-workspace.yaml`.
- **Môi trường máy dev hiện tại:** Node 25 (dự án nhắm tới Node 22, Docker dùng 22); thư mục cache của pnpm 12.18.0 bị cài dở, nên phải gọi qua `npx -y pnpm@12.18.0`. Không ảnh hưởng tới Docker và CI.

### Quyết định từ lúc lập kế hoạch

- **Làm phần rủi ro trước (T1).** Đọc docs trong `node_modules` của đúng phiên bản cài, rồi mới chốt cách làm cho:
  - rewrite của Next 16 đọc `BACKEND_URL` lúc build hay lúc chạy;
  - cấu hình của Prisma bản mới (`prisma.config.ts`, driver adapter, còn engine nhị phân hay không);
  - pnpm chặn script cài đặt (cần `allowBuilds`, giống `frontend/pnpm-workspace.yaml`).

  Nếu rewrite bị nhúng URL lúc build, phương án dự phòng là route handler `app/api/[...path]/route.ts` làm proxy, đọc biến lúc chạy.
- **Prisma kết nối lười (lazy):** không gọi `$connect()` lúc khởi động. Nếu gọi, app sẽ không lên được khi DB chết, và healthcheck không bao giờ trả được 503 như spec yêu cầu. Docker đã đảm bảo thứ tự khởi động bằng `depends_on: service_healthy`.
- **`DomainError` không phụ thuộc Nest** (không kế thừa `HttpException`), vì `domain/` cấm import `@nestjs/*`. Exception filter là nơi duy nhất biết HTTP.
- **Mỗi môi trường compose một volume:** `docker-compose.yml` (project `special-education`) và `docker-compose.dev.yml` (project `special-education-dev`) dùng hai volume khác nhau. Dữ liệu dev không lẫn với bản chạy thử giống production.
- **Một container Postgres cho cả DB dev và DB test:** script init tạo thêm database `special_education_test`. e2e chạy trên DB test; trước khi chạy thì `migrate deploy` vào DB test (globalSetup); trước mỗi file test thì xóa dữ liệu. Helper từ chối chạy nếu tên DB không kết thúc bằng `_test`.
- **`_template` dùng repository trong bộ nhớ** và chỉ được đăng ký khi `NODE_ENV=test`. Nó minh họa đủ 4 lớp mà không cần bảng giả trong migration. Mẫu Prisma repository thật sẽ có ở module `auth`.
- **Migration chạy trước app trong container backend.** CLI `prisma` phải có trong image runtime: hoặc để `prisma` ở `dependencies`, hoặc copy riêng từ stage build. T1 chốt cách nào, T10 hiện thực.
- **CI build cả hai image ở mỗi lần deploy** (cache GHA giúp image không đổi build gần như tức thì), thay vì lọc theo thư mục. Cách này không cần thêm action bên thứ ba. Workflow chạy khi `frontend/**` hoặc `backend/**` thay đổi. Job test backend chạy trên cả pull request; build và deploy chỉ chạy khi push lên `master`.

## Thứ tự và phụ thuộc

```
T1 spike ─ T2 scaffold ─┬─ T3 config ─┐
                        └─ T4 lỗi ────┼─ T5 db + prisma ─ T6 khung e2e ─ T7 health ─ T8 _template ─ T9 OpenAPI
                                      │
       T10 Dockerfile + compose prod ─ T11 FE rewrite ─ T12 compose dev + docker.sh ─ T13 CI/CD ─ T14 docs
```

T3 và T4 độc lập với nhau. T14 có thể viết song song từ sau T12.

## Task List

### Phase 1: Khung ứng dụng
- [x] T1: Spike: xác minh Next rewrite, Prisma, pnpm build scripts
- [x] T2: Tạo project NestJS trong `backend/`
- [x] T3: Config: kiểm tra biến môi trường, dừng app ngay nếu sai
- [x] T4: Định dạng lỗi chung

### Checkpoint A
- [x] `pnpm lint && pnpm test && pnpm build` trong `backend/` không lỗi
- [x] `curl localhost:4000/api/v1/khong-ton-tai` trả về 404 đúng định dạng lỗi

### Phase 2: Database và khung module
- [ ] T5: Postgres trong Docker dev + Prisma
- [ ] T6: Khung e2e (DB test, tạo app, reset)
- [ ] T7: Healthcheck có kiểm tra DB
- [ ] T8: Module mẫu `_template` (4 lớp)
- [ ] T9: OpenAPI tại `/api/v1/docs`

### Checkpoint B
- [ ] `pnpm lint && pnpm test && pnpm test:e2e && pnpm build` không lỗi
- [ ] Dừng container `db` thì health trả về 503
- [ ] **Chủ dự án review `_template`** trước khi các module sau sao chép

### Phase 3: Docker
- [ ] T10: Dockerfile backend + `docker-compose.yml`
- [ ] T11: FE rewrite `/api/*` → backend
- [ ] T12: `docker-compose.dev.yml` + `docker.sh`

### Checkpoint C (local chạy đủ)
- [ ] Success Criteria 1–4 của SPEC-platform.md đạt trên máy local

### Phase 4: Triển khai
- [ ] T13: CI/CD
- [ ] T14: Tài liệu

### Checkpoint D (hoàn thành module)
- [ ] Success Criteria 5 đạt (deploy thật)
- [ ] Hướng dẫn thử Neon/Supabase (Success Criteria 6) có trong tài liệu
- [ ] Review với chủ dự án, rồi viết `SPEC-auth.md`

## Risks and Mitigations

| Rủi ro | Mức | Cách xử lý |
|---|---|---|
| Rewrite của Next nhúng `BACKEND_URL` lúc build, nên image FE không dùng được ở môi trường khác | Cao | T1 xác minh. Dự phòng: route handler proxy |
| Prisma bản mới khác hướng dẫn cũ (config, engine, nhị phân khác nhau giữa macOS và Alpine) | Trung bình | T1 đọc docs đúng phiên bản. Trong container luôn chạy `prisma generate`, không dùng client sinh trên máy host |
| pnpm chặn postinstall của Prisma, nên client không được sinh | Trung bình | `allowBuilds` trong `backend/pnpm-workspace.yaml` (T2/T5) |
| Image runtime thiếu CLI `prisma`, nên `migrate deploy` lỗi và container không lên | Cao | T10 kiểm tra bằng cách build và chạy image thật, không chỉ chạy `pnpm build` |
| Server production thiếu `POSTGRES_PASSWORD`, `BACKEND_IMAGE` | Cao | Compose dùng `${POSTGRES_PASSWORD:?…}` (thiếu thì báo rõ). T13 kiểm tra biến trước `compose up`. T14 ghi danh sách biến |
| Xóa volume `pgdata` (`docker compose down -v`) là mất dữ liệu, mà chưa có backup | Cao | `docker.sh` không dùng `-v`; cảnh báo trong tài liệu |
| e2e xóa nhầm dữ liệu dev | Trung bình | DB test riêng; guard kiểm tra hậu tố `_test` |
| Healthcheck treo khi DB không phản hồi | Thấp | Timeout 2 giây cho `SELECT 1` |
| Sau proxy, backend thấy IP của container FE thay vì IP người dùng (ảnh hưởng audit và giới hạn đăng nhập sai sau này) | Thấp | Ghi chú cho module `auth`: bật `trust proxy` và đọc `X-Forwarded-For` |
| Cookie phiên đăng nhập không đi qua proxy đúng (`Secure`, `SameSite`, domain) | Trung bình | Platform chỉ kiểm tra header được chuyển tiếp. Module `auth` phải có kiểm tra đăng nhập thật qua trình duyệt (`localhost:3000`) trong success criteria |

## Open Questions

Không còn câu hỏi chặn. Một việc cần chủ dự án làm trước T13: tạo file `/opt/special-education/.env` trên server (T14 sẽ ghi danh sách biến đầy đủ; tối thiểu là `POSTGRES_PASSWORD`, `FRONTEND_IMAGE`, `BACKEND_IMAGE`).
