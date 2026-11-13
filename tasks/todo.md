# Todo: Module `platform`

Kế hoạch: [plan.md](plan.md). Spec: [SPEC-platform.md](../SPEC-platform.md).

Mọi task đều phải qua Definition of Done chung:
- `pnpm lint`, `pnpm test`, `pnpm build` trong `backend/` không lỗi (từ T2);
- `pnpm test:e2e` không lỗi (từ T6);
- `pnpm build` trong `frontend/` không lỗi, nếu task có sửa FE;
- không có comment trong code.

## Phase 1: Khung ứng dụng

### T1: Spike: xác minh Next rewrite, Prisma, pnpm build scripts ✅

**Description:** Đọc docs của đúng phiên bản sẽ dùng để chốt cách làm trước khi viết code:
- `frontend/node_modules/next/dist/docs/`: rewrites, và config được nạp lúc `next start` hay lúc build;
- docs của Prisma bản ổn định mới nhất;
- cách pnpm (bản trong `frontend/package.json`) cho phép script cài đặt.

**Acceptance criteria:**
- [x] Ghi vào "Architecture Decisions" của `plan.md`: FE chuyển `/api/*` bằng `rewrites()` hay route handler proxy, và vì sao.
- [x] Ghi phiên bản Prisma và cách cấu hình. Cụ thể: `prisma.config.ts` hay không, có driver adapter không, còn engine nhị phân không, cách khai báo `DIRECT_URL`, và cách có CLI trong image runtime.
- [x] Ghi danh sách package cần đưa vào `allowBuilds`.

**Verification:**
- [x] Thử nhanh với FE: build với `BACKEND_URL=A`, chạy `next start` với `BACKEND_URL=B`, xem request đi tới đâu. Xong thì bỏ thay đổi thử (`git status` sạch).

**Dependencies:** None
**Files likely touched:** `tasks/plan.md`
**Estimated scope:** XS

### T2: Tạo project NestJS trong `backend/` ✅

**Description:** Khởi tạo bằng `pnpm dlx @nestjs/cli@12 new backend --package-manager pnpm --strict --skip-git`. Script `lint` phải chạy `oxlint -c oxlint.json` (xem kết luận T1). Phải có `--skip-git`, nếu không CLI sẽ tạo repo git lồng trong repo hiện tại.

Thiết lập:
- `packageManager` cùng phiên bản với FE;
- prefix toàn cục `/api/v1`, cổng lấy từ biến môi trường (mặc định 4000);
- `enableShutdownHooks()`;
- logger JSON khi `NODE_ENV=production` (`ConsoleLogger` của Nest 11 có tùy chọn `json`).

Xóa controller/service mẫu do CLI sinh ra. Không tạo thư mục rỗng (git không lưu thư mục rỗng); mỗi thư mục xuất hiện cùng task tạo ra file đầu tiên trong đó. Tạm bật `passWithNoTests` trong hai file cấu hình Vitest; T3 (unit) và T6 (e2e) bỏ cờ này khi đã có test thật.

**Acceptance criteria:**
- [x] `pnpm start:dev` chạy ở `http://localhost:4000`. `backend/` không có thư mục `.git` riêng.
- [x] `package.json` có đủ các script `lint`, `test`, `test:e2e`, `build` và `start:dev`.
- [x] Với `NODE_ENV=production`, log in ra dạng JSON mỗi dòng.

**Verification:**
- [x] `pnpm lint && pnpm test && pnpm build`
- [x] `test ! -d backend/.git`

**Dependencies:** T1
**Files likely touched:** `backend/package.json`, `backend/pnpm-workspace.yaml`, `backend/src/main.ts`, `backend/src/app.module.ts`, `backend/tsconfig.json`
**Estimated scope:** M

### T3: Config: kiểm tra biến môi trường, dừng app ngay nếu sai ✅

**Description:** Dùng `@nestjs/config` với hàm `validate()` dựa trên `class-validator`. Các biến: `NODE_ENV`, `PORT`, `DATABASE_URL`, `DIRECT_URL`. Code khác lấy config qua `ConfigService<Env, true>` (`get('PORT', { infer: true })`), không đọc `process.env` trực tiếp. Không cần `config.module.ts` riêng: `ConfigModule.forRoot({ validate: validateEnv })` đặt thẳng trong `AppModule`. Ngoại lệ duy nhất: logger trong `main.ts` đọc `process.env.NODE_ENV`, vì logger được tạo trước khi config được nạp.

**Acceptance criteria:**
- [x] Thiếu hoặc sai một biến thì app dừng, với thông báo nêu đúng tên biến.
- [x] Có `backend/.env.example` (chỉ giá trị giả) và `backend/.env.test.example`.
- [x] Có unit test cho `validate()`. Bỏ `passWithNoTests` trong `vitest.config.ts`.

**Verification:**
- [x] `pnpm test`
- [ ] Xóa `DATABASE_URL` khỏi `.env`, chạy `pnpm start:dev`: app dừng và nêu đúng `DATABASE_URL`.

**Dependencies:** T2
**Files likely touched:** `backend/src/config/env.validation.ts`, `backend/src/config/env.validation.spec.ts`, `backend/src/config/config.module.ts`, `backend/.env.example`, `backend/.env.test.example`
**Estimated scope:** S

### T4: Định dạng lỗi chung ✅

**Description:** Mọi lỗi trả về dạng `{ error: { code, message, details } }`.
- `DomainError(code, message, status)` là class TypeScript thuần, không phụ thuộc Nest.
- Một exception filter toàn cục map lỗi sang HTTP:
  - `DomainError`: giữ nguyên `code` và `message`;
  - lỗi validation: `400 VALIDATION_FAILED`, `details` theo từng trường, message tiếng Việt;
  - `HttpException` của Nest (ví dụ 404 route không tồn tại): `NOT_FOUND`…;
  - lỗi không lường trước: `500 INTERNAL_ERROR`, chỉ ghi stack vào log.

**Acceptance criteria:**
- [x] Unit test cho filter: `DomainError`, `HttpException` và `Error` thường, mỗi loại ra đúng status và body.
- [x] Response 500 không chứa stack trace hay message gốc.
- [x] `domain-error.ts` không import gì từ `@nestjs/*`.

**Verification:**
- [x] `pnpm test`
- [x] `curl -s localhost:4000/api/v1/khong-ton-tai` trả về 404 đúng dạng.

**Ghi chú khi làm:** `DomainError` có thêm `details` (validation dùng lại chính nó, nên filter chỉ cần xử lý một loại lỗi nghiệp vụ). Request ngoài prefix `/api/v1` vẫn nhận trang 404 HTML mặc định của Express; chấp nhận được, vì FE chỉ chuyển tiếp `/api/*`. Cổng 4000 trên máy dev đang bị một dự án khác chiếm, nên kiểm tra bằng tay dùng `PORT=4100`.

**Dependencies:** T2
**Files likely touched:** `backend/src/common/errors/domain-error.ts`, `backend/src/common/errors/http-exception.filter.ts`, `backend/src/common/errors/http-exception.filter.spec.ts`, `backend/src/common/http/validation.pipe.ts`, `backend/src/main.ts`
**Estimated scope:** M

## Checkpoint A
- [x] `pnpm lint && pnpm test && pnpm build` không lỗi
- [x] Route lạ trả về 404 đúng định dạng lỗi

## Phase 2: Database và khung module

### T5: Postgres trong Docker dev + Prisma

**Description:**
- Thêm service `db` vào `docker-compose.dev.yml`:
  - image postgres:17-alpine, volume `pgdata`, healthcheck `pg_isready`;
  - publish cổng 5432 để backend chạy trên máy (`pnpm start:dev`) kết nối được;
  - script init tạo thêm DB `special_education_test`.
- Cài Prisma theo kết luận của T1. `PrismaService` / `PrismaModule` (global) **không gọi `$connect()` lúc khởi động**.
- Tạo migration rỗng `init` (`prisma migrate dev --create-only --name init`).
- Thêm các script:
  - `db:migrate`;
  - `db:deploy`;
  - `db:seed`: `prisma/seed.ts`, hiện rỗng;
  - `db:seed:demo`: `prisma/seed-demo.ts`, hiện rỗng;
  - `db:reset`.
- Thêm rule oxlint `no-restricted-imports`: chỉ `src/prisma/**` và `**/infrastructure/**` được import `@prisma/*`.

**Acceptance criteria:**
- [ ] Chạy `docker compose -f docker-compose.dev.yml up -d db` thì có hai DB `special_education` và `special_education_test`.
- [ ] `pnpm db:deploy` chạy thành công, migration `init` đã commit.
- [ ] Khi container `db` đang dừng, `pnpm start:dev` vẫn khởi động được.

**Verification:**
- [ ] `pnpm db:deploy && pnpm lint && pnpm build`
- [ ] Dừng `db`, chạy `pnpm start:dev`: app lên bình thường.

**Dependencies:** T3
**Files likely touched:** `docker-compose.dev.yml`, `backend/docker/init-test-db.sql`, `backend/prisma/schema.prisma` (+ `prisma.config.ts` nếu cần), `backend/src/prisma/prisma.service.ts`, `backend/src/prisma/prisma.module.ts`
**Estimated scope:** M

### T6: Khung e2e (DB test, tạo app, reset)

**Description:**
- `vitest.config.e2e.ts` có `globalSetup`: nạp `.env.test`, kiểm tra tên DB kết thúc bằng `_test`, chạy `prisma migrate deploy` vào DB test.
- `test/utils/create-test-app.ts` dựng app **giống hệt `main.ts`** (prefix, pipe, filter). Phần cấu hình chung tách ra thành `configureApp(app)` để `main.ts` và test dùng chung.
- `test/utils/reset-db.ts`: truncate mọi bảng trừ `_prisma_migrations`.
- Viết e2e đầu tiên: route lạ trả về 404 đúng định dạng.

**Acceptance criteria:**
- [ ] `pnpm test:e2e` chạy được với DB test.
- [ ] Trỏ `.env.test` sang DB không có hậu tố `_test` thì e2e dừng ngay, kèm thông báo rõ.
- [ ] `main.ts` và test app dùng chung `configureApp`.
- [ ] Bỏ `passWithNoTests` trong `vitest.config.e2e.ts`.

**Verification:**
- [ ] `pnpm test:e2e`

**Dependencies:** T4, T5
**Files likely touched:** `backend/vitest.config.e2e.ts`, `backend/test/global-setup.ts`, `backend/test/utils/create-test-app.ts`, `backend/test/utils/reset-db.ts`, `backend/src/app.setup.ts`
**Estimated scope:** M

### T7: Healthcheck có kiểm tra DB

**Description:** `GET /api/v1/health` chạy `SELECT 1` với timeout 2 giây:
- thành công: `200 { status: "ok", db: "ok" }`;
- thất bại: `503 { status: "error", db: "down" }`.

**Acceptance criteria:**
- [ ] Có e2e: DB sống thì trả về 200.
- [ ] Có e2e: app dựng với `DATABASE_URL` trỏ tới cổng không có DB thì trả về 503 trong vòng dưới 3 giây.

**Verification:**
- [ ] `pnpm test:e2e`
- [ ] Dừng container `db`, gọi `curl` health: nhận 503.

**Dependencies:** T6
**Files likely touched:** `backend/src/health/health.controller.ts`, `backend/src/health/health.module.ts`, `backend/test/health.e2e-spec.ts`
**Estimated scope:** S

### T8: Module mẫu `_template` (4 lớp)

**Description:** Tạo `src/modules/_template/`, dùng ví dụ `Note`:
- `domain`: entity có một quy tắc (tiêu đề không được rỗng), interface repository, token;
- `application`: `GetNoteUseCase`, `CreateNoteUseCase`;
- `infrastructure`: `InMemoryNoteRepository`;
- `http`: controller, DTO, một route ném lỗi thường để test 500.

Module này chỉ được đăng ký khi `NODE_ENV=test`. Thêm rule oxlint: `**/domain/**` không được import `@nestjs/*` hay `@prisma/*`; `**/application/**` không được import `@prisma/*`.

**Acceptance criteria:**
- [ ] Unit test cho entity và use case, dùng repository giả.
- [ ] e2e cho các trường hợp:
  - tạo thành công: 201;
  - body sai: 400 kèm `details`;
  - không tìm thấy: 404 với `code` của domain;
  - route test ném lỗi thường: 500 đúng dạng, không lộ stack.
- [ ] Thêm thử một import `@nestjs/common` vào `domain/`: `pnpm lint` báo lỗi. Thử xong thì bỏ.

**Verification:**
- [ ] `pnpm test && pnpm test:e2e && pnpm lint`

**Dependencies:** T6
**Files likely touched:** `backend/src/modules/_template/**` (khoảng 7 file nhỏ, mỗi file một vai trò), `backend/test/template.e2e-spec.ts`, `backend/oxlint.json`
**Estimated scope:** M

### T9: OpenAPI tại `/api/v1/docs`

**Description:** Dùng `@nestjs/swagger` để sinh tài liệu từ controller và DTO. Chỉ bật khi `NODE_ENV` khác `production`. Bật plugin CLI của swagger để không phải gắn decorator thủ công cho từng trường DTO.

**Acceptance criteria:**
- [ ] Ở dev, `/api/v1/docs` hiện health và `_template`. Ở production trả về 404.
- [ ] `/api/v1/docs-json` trả về OpenAPI JSON. FE sẽ tra file này khi viết kiểu dữ liệu.

**Verification:**
- [ ] `pnpm build`
- [ ] `curl` hai route trên ở dev, và với `NODE_ENV=production`.

**Dependencies:** T8
**Files likely touched:** `backend/src/app.setup.ts`, `backend/nest-cli.json`, `backend/package.json`
**Estimated scope:** S

## Checkpoint B
- [ ] `pnpm lint && pnpm test && pnpm test:e2e && pnpm build` không lỗi
- [ ] Dừng `db` thì health trả về 503
- [ ] **Chủ dự án review `_template`** trước khi các module sau sao chép

## Phase 3: Docker

### T10: Dockerfile backend + `docker-compose.yml`

**Description:**
- Dockerfile multi-stage, dùng node:22-alpine:
  - stage build: cài package, `prisma generate`, `pnpm build`;
  - stage runtime: dependency production, `dist/`, `prisma/` và CLI `prisma` (theo kết luận của T1);
  - lệnh khởi động: `prisma migrate deploy && node dist/main`.
- Trong `docker-compose.yml`:
  - `backend`: image `${BACKEND_IMAGE:-special-education-backend:latest}`, không publish cổng, healthcheck `wget` tới `/api/v1/health`, `depends_on: db (service_healthy)`;
  - `db`: volume `pgdata`, `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Thiếu POSTGRES_PASSWORD}`;
  - `frontend`: thêm `BACKEND_URL=http://backend:4000` và `depends_on: backend (service_healthy)`.
- Thêm `.env.example` ở gốc repo.

**Acceptance criteria:**
- [ ] Chạy `docker compose up --build -d` thì cả 3 container đều `healthy`.
- [ ] Image backend không chứa `src/` hay devDependencies, trừ CLI `prisma`.
- [ ] Chỉ cổng 3000 được publish ra host.
- [ ] Làm hỏng thử một migration thì container backend không lên và log nêu rõ lỗi. Thử xong thì bỏ.

**Verification:**
- [ ] `docker compose ps` thấy cả 3 `healthy`; `docker compose exec backend wget -qO- localhost:4000/api/v1/health`.
- [ ] `docker run --rm --entrypoint ls <image> /app` không có `src`.

**Dependencies:** T7
**Files likely touched:** `backend/Dockerfile`, `backend/.dockerignore`, `docker-compose.yml`, `.env.example`
**Estimated scope:** M

### T11: FE rewrite `/api/*` → backend

**Description:** Làm theo kết luận của T1: dùng `rewrites()` trong `next.config.ts`, hoặc route handler proxy. Đọc `BACKEND_URL` lúc chạy; mặc định là `http://localhost:4000`. Thêm `BACKEND_URL` vào `frontend/.env.example`. Nếu dùng proxy tự viết thì phải chuyển tiếp nguyên method, body, query, header `cookie` và `set-cookie`, và thêm `x-forwarded-for`.

**Acceptance criteria:**
- [ ] Chạy FE bằng `pnpm dev` và BE bằng `pnpm start:dev`: `curl localhost:3000/api/v1/health` trả về ok.
- [ ] Trong Docker: `curl localhost:3000/api/v1/health` trả về ok, đi qua container frontend.
- [ ] Header `cookie` đi tới backend và `set-cookie` quay về được qua proxy. Kiểm tra bằng `curl -i` với route lạ (404 vẫn trả header) và đọc cấu hình proxy. Việc kiểm tra cookie phiên thật qua trình duyệt chuyển sang module `auth`, vì route có `Set-Cookie` đầu tiên là đăng nhập.

**Verification:**
- [ ] `pnpm build` (FE); hai lệnh `curl` ở trên.
- [ ] `pnpm a11y-check` vẫn không lỗi.

**Dependencies:** T1, T10
**Files likely touched:** `frontend/next.config.ts` hoặc `frontend/src/app/api/[...path]/route.ts`, `frontend/.env.example`
**Estimated scope:** S

### T12: `docker-compose.dev.yml` + `docker.sh`

**Description:**
- Thêm `backend-dev` vào `docker-compose.dev.yml`:
  - mount `./backend`, giữ `node_modules` riêng trong container;
  - lệnh chạy: `pnpm install && pnpm prisma generate && pnpm db:deploy && pnpm start:dev`;
  - publish cổng 4000, `depends_on: db (healthy)`.
- `frontend-dev` có `BACKEND_URL=http://backend-dev:4000`.
- Sửa `docker.sh`:
  - `up` tự tạo `.env` từ `.env.example` nếu chưa có;
  - `logs [frontend|backend|db]` (mặc định: tất cả);
  - `status` hiện mọi container `special-education-*`;
  - `down` không bao giờ xóa volume.

**Acceptance criteria:**
- [ ] `./docker.sh dev`: sửa file trong `backend/src` thì backend tự khởi động lại; FE vẫn hot reload như cũ.
- [ ] `./docker.sh` và `./docker.sh dev` vẫn không chạy chồng lên nhau, như hành vi hiện tại.
- [ ] `./docker.sh down` xong rồi `up` lại: dữ liệu DB vẫn còn.

**Verification:**
- [ ] Chạy tay ba kịch bản trên.

**Dependencies:** T5, T10, T11
**Files likely touched:** `docker-compose.dev.yml`, `docker.sh`
**Estimated scope:** S

## Checkpoint C (local chạy đủ)
- [ ] Success Criteria 1–4 của SPEC-platform.md đạt trên máy local

## Phase 4: Triển khai

### T13: CI/CD

**Description:** Sửa `.github/workflows/deploy.yml`:
- trigger thêm `backend/**` và `pull_request`;
- job `backend-test` chạy trên cả PR và push:
  - dùng service Postgres với DB `special_education_test`;
  - chạy `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build`;
- job `build`, chỉ khi push lên `master` và cần `backend-test`:
  - build cả hai image theo matrix `[frontend, backend]`;
  - giữ cách gắn tag hiện tại;
- job `deploy`:
  - copy `docker-compose.yml` lên server;
  - kiểm tra `/opt/special-education/.env` có `POSTGRES_PASSWORD`, `FRONTEND_IMAGE`, `BACKEND_IMAGE` (thiếu thì fail với thông báo rõ);
  - chạy `compose pull` rồi `up -d`;
  - smoke test: chờ tối đa 90 giây tới khi `docker compose exec -T frontend wget -qO- http://localhost:3000/api/v1/health` trả về ok, nếu không thì fail.

**Acceptance criteria:**
- [ ] PR chỉ chạy test, không build, không deploy.
- [ ] Test fail thì không build, không deploy.
- [ ] Smoke test fail thì job deploy fail.

**Verification:**
- [ ] Kiểm tra YAML bằng `actionlint` nếu có, nếu không thì `python -c "import yaml"`.
- [ ] Chạy thật trên nhánh (cần chủ dự án đặt `.env` trên server trước).

**Dependencies:** T8, T10
**Files likely touched:** `.github/workflows/deploy.yml`
**Estimated scope:** M

### T14: Tài liệu

**Description:** Cập nhật tài liệu theo hiện trạng mới. Chuyển tài liệu triển khai lên `docs/deployment.md` (gốc repo, vì giờ áp dụng cho cả FE và BE); `frontend/docs/deployment.md` chỉ còn link tới đó.

**Acceptance criteria:**
- [ ] `RUNNING.md`: chạy BE local và bằng Docker.
- [ ] `CLAUDE.md` gốc: trạng thái và lệnh.
- [ ] `backend/CLAUDE.md` mới: lệnh, quy tắc 4 lớp, cách tạo module mới từ `_template`.
- [ ] `docs/deployment.md`:
  - danh sách biến trên server;
  - cảnh báo về volume;
  - cách chuyển sang Neon/Supabase (`DATABASE_URL` pooler, `DIRECT_URL` trực tiếp).
- [ ] `docs/backend-requirements.md`: đánh dấu các mục đã chốt.

**Verification:**
- [ ] Mọi link tương đối trong các file đã sửa đều trỏ tới file có thật (kiểm tra bằng script nhỏ hoặc `grep`).
- [ ] Chủ dự án làm theo `RUNNING.md` trên máy trống và chạy được.

**Dependencies:** T12, T13
**Files likely touched:** `RUNNING.md`, `CLAUDE.md`, `backend/CLAUDE.md`, `docs/deployment.md`, `frontend/docs/deployment.md`
**Estimated scope:** M

## Checkpoint D (hoàn thành module `platform`)
- [ ] Success Criteria 5 đạt (deploy thật, health trả về 200)
- [ ] Hướng dẫn thử Neon/Supabase (Success Criteria 6) có trong tài liệu
- [ ] Review với chủ dự án, rồi viết `SPEC-auth.md`
