# Spec: Module `platform`

Trạng thái: **chờ duyệt**. Thuộc [SPEC-backend.md](SPEC-backend.md). Module này không có tính năng nghiệp vụ. Nó dựng nền chung: mọi module sau chỉ việc thêm thư mục vào `src/modules/`.

## Objective

Có một service backend chạy được cả ở local, Docker và CI/CD, kết nối PostgreSQL, và FE gọi tới được qua `/api`. Các module sau không phải đụng lại hạ tầng.

Người dùng của module này là **lập trình viên**. Giáo viên và Quản lý chưa thấy thay đổi gì.

Acceptance criteria:

1. `GET /api/v1/health` trả về `200 { "status": "ok", "db": "ok" }`. Khi mất kết nối DB thì trả về `503 { "status": "error", "db": "down" }`.
2. Thiếu hoặc sai biến môi trường bắt buộc (`DATABASE_URL`, `DIRECT_URL`, `PORT`) thì app **dừng ngay lúc khởi động**, kèm thông báo nêu rõ thiếu biến nào.
3. Mọi lỗi trả về đúng định dạng `{ error: { code, message, details } }` trong SPEC-backend.md:
   - `DomainError` thành 4xx, giữ `code` và `message` của nó;
   - lỗi validation thành `400 VALIDATION_FAILED`, có `details` theo từng trường;
   - route không tồn tại thành `404 NOT_FOUND`;
   - lỗi không lường trước thành `500 INTERNAL_ERROR` với message chung, không lộ stack trace. Stack trace chỉ ghi vào log.
4. Có migration `init` rỗng (chưa có bảng nghiệp vụ), để kiểm chứng đường đi của migration từ đầu. Container backend chạy `prisma migrate deploy` trước khi khởi động app, và migration lỗi thì app không lên.
5. Từ FE, `fetch("/api/v1/health")` (cùng domain) nhận được kết quả, cả khi chạy `pnpm dev` lẫn khi chạy Docker. Phần nối này dùng rewrite của Next, đọc biến `BACKEND_URL` ở server runtime (không nhúng vào bundle).
6. `./docker.sh` và `./docker.sh dev` chạy cả ba service: `frontend`, `backend`, `db`. Riêng `db` có volume để giữ dữ liệu.
7. CI chạy test backend (lint, unit, e2e) trên cả pull request và push. Khi push lên `master` (có sửa `frontend/**` hoặc `backend/**`) và test đã qua: build và push cả hai image lên GHCR (có cache), deploy kéo cả hai về server, rồi smoke test health.
8. Đổi sang Neon hoặc Supabase chỉ cần đổi `DATABASE_URL` (connection pooler) và `DIRECT_URL` (kết nối trực tiếp, dùng cho migrate) trong `.env`. Không phải sửa code.
9. `GET /api/v1/docs` hiện OpenAPI khi `NODE_ENV` khác `production`; ở production trả về 404.
10. Khung module mẫu: một module rỗng `src/modules/_template/` gồm đủ 4 lớp, kèm một unit test và một e2e test. Module sau sao chép từ khung này.

## Tech Stack

| Thành phần | Lựa chọn | Ghi chú |
|---|---|---|
| Runtime | Node 22, pnpm (cùng phiên bản với FE) | |
| Framework | NestJS 12 (adapter Express), ESM, TypeScript 6 | Đã chốt ở T1 |
| ORM | Prisma 7.10.1 + `@prisma/adapter-pg` | `prisma.config.ts` dùng `DIRECT_URL` cho migrate; app dùng `DATABASE_URL` qua adapter |
| Validation | `class-validator` + `class-transformer` | Cách làm chuẩn của Nest |
| Config | `@nestjs/config`, kiểm tra biến bằng `class-validator` | |
| Log | Logger mặc định của Nest; ở production ghi JSON ra stdout | Không cần thêm thư viện log riêng ở v1 |
| Test | Vitest + Supertest (mặc định của Nest 12) | e2e chạy với Postgres thật trong Docker |
| Tài liệu API | `@nestjs/swagger` tại `/api/v1/docs`, tắt ở production | Như quy ước trong SPEC-backend |
| Lint/format | oxlint + Prettier (mặc định của Nest 12) | Ranh giới giữa các lớp kiểm tra bằng `no-restricted-imports` |

**Hỏi trước khi thêm** bất kỳ thư viện nào không có trong bảng này.

## Commands

```bash
cd backend
cp .env.example .env
pnpm install
docker compose -f ../docker-compose.dev.yml up -d db   # chỉ chạy Postgres
pnpm prisma migrate dev                                 # tạo/áp dụng migration
pnpm start:dev                                          # http://localhost:4000/api/v1/health
pnpm build
pnpm lint
pnpm test                                               # unit, không cần DB
pnpm test:e2e                                           # cần Postgres đang chạy (dùng DB riêng *_test)
```

Từ thư mục gốc:

```bash
./docker.sh            # bản giống production: chỉ publish frontend :3000 (backend và db chỉ nằm trong mạng Docker)
./docker.sh dev        # hot reload cả FE và BE; publish :3000, :4000, :5432 để debug và dùng công cụ DB
```

## Project Structure

```
backend/
├── src/
│   ├── main.ts                      # bootstrap: gọi configureApp() rồi listen
│   ├── app.setup.ts                 # configureApp(): prefix, pipe, filter, swagger; main.ts và e2e dùng chung
│   ├── app.module.ts
│   ├── config/
│   │   ├── env.validation.ts        # class Env + validate(), dừng app nếu sai
│   │   └── config.module.ts
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts         # @Global
│   ├── common/
│   │   ├── errors/
│   │   │   ├── domain-error.ts      # class DomainError(code, message, status)
│   │   │   └── http-exception.filter.ts
│   │   └── http/
│   │       └── validation.pipe.ts   # map lỗi class-validator sang details[]
│   ├── health/
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   └── modules/
│       └── _template/               # khung 4 lớp để sao chép (domain/application/infrastructure/http)
├── prisma/
│   ├── schema.prisma                # (+ prisma.config.ts nếu bản Prisma yêu cầu, chốt ở T1)
│   ├── migrations/
│   ├── seed.ts                      # dữ liệu bắt buộc; rỗng ở platform, auth thêm tài khoản Quản lý
│   └── seed-demo.ts                 # dữ liệu mẫu từ mock FE; các module thêm dần (pnpm db:seed:demo)
├── test/
│   ├── vitest.config.e2e.ts
│   ├── global-setup.ts              # nạp .env.test, chặn DB không có hậu tố _test, migrate deploy
│   ├── utils/                       # create-test-app.ts, reset-db.ts
│   ├── health.e2e-spec.ts
│   └── template.e2e-spec.ts
├── docker/init-test-db.sql          # tạo DB special_education_test trong container Postgres
├── .env.example
├── .env.test.example
├── pnpm-workspace.yaml              # allowBuilds cho Prisma
├── Dockerfile                       # multi-stage; CMD: prisma migrate deploy && node dist/main
└── package.json
```

Các file khác bị sửa:

| File | Thay đổi |
|---|---|
| `docker-compose.yml` | thêm service `backend` và `db` (postgres:17-alpine, volume `pgdata`, healthcheck `pg_isready`). `frontend` có `BACKEND_URL=http://backend:4000` |
| `docker-compose.dev.yml` | thêm `backend-dev` (mount `./backend`, `pnpm start:dev`) và `db` |
| `docker.sh` | `logs` và `status` hiện mọi container `special-education-*`; thêm `logs backend` |
| `.github/workflows/deploy.yml` | thêm job `backend-test`; job build dùng matrix `[frontend, backend]`; deploy kiểm tra biến trên server, pull cả hai image, smoke test health |
| `frontend/next.config.ts` | `rewrites`: `/api/:path*` → `${BACKEND_URL}/api/:path*` |
| `frontend/.env.example` | thêm `BACKEND_URL=http://localhost:4000` (không có tiền tố `NEXT_PUBLIC_`) |
| `.env.example` (gốc repo, mới) | `POSTGRES_PASSWORD`, `FRONTEND_IMAGE`, `BACKEND_IMAGE` |
| `docs/deployment.md` (mới) | tài liệu triển khai cho cả FE và BE; `frontend/docs/deployment.md` chỉ còn link tới đây |
| `CLAUDE.md`, `backend/CLAUDE.md` (mới), `RUNNING.md`, `docs/backend-requirements.md` | cập nhật cách chạy và cấu trúc |

## Code Style

- TypeScript `strict`. Theo cấu hình oxlint/Prettier Nest sinh ra.
- Tên file kebab-case, có hậu tố theo vai trò: `create-student.use-case.ts`, `student.repository.ts`, `prisma-student.repository.ts`, `create-student.dto.ts`.
- Mỗi use case một class, có một method public là `execute`.
- Repository là interface trong `domain/`, inject qua token `Symbol`.
- Không viết comment trong code (yêu cầu của chủ dự án), trừ khi được yêu cầu.
- Thông báo lỗi cho người dùng viết bằng tiếng Việt. Tên biến, tên hàm và `code` lỗi viết bằng tiếng Anh.

Ví dụ khung `_template`, cũng là kiểu code các module sau phải theo:

```ts
// domain/student.repository.ts
export const STUDENT_REPOSITORY = Symbol("STUDENT_REPOSITORY");
export interface StudentRepository {
  findById(id: string): Promise<Student | null>;
  save(student: Student): Promise<void>;
}

// application/get-student.use-case.ts
@Injectable()
export class GetStudentUseCase {
  constructor(@Inject(STUDENT_REPOSITORY) private readonly students: StudentRepository) {}

  async execute(id: string): Promise<Student> {
    const student = await this.students.findById(id);
    if (!student) throw new DomainError("STUDENT_NOT_FOUND", "Không tìm thấy học sinh.", 404);
    return student;
  }
}

// http/student.controller.ts
@Controller("students")
export class StudentController {
  constructor(private readonly getStudent: GetStudentUseCase) {}

  @Get(":id")
  async get(@Param("id", ParseUUIDPipe) id: string): Promise<StudentResponse> {
    return StudentResponse.from(await this.getStudent.execute(id));
  }
}
```

## Testing Strategy

| Mức | Công cụ | Vị trí | Kiểm tra gì |
|---|---|---|---|
| Unit | Vitest | cạnh file nguồn, `*.spec.ts` | Quy tắc trong `domain/`, use case với repository giả trong bộ nhớ. Không cần DB |
| E2E | Vitest + Supertest | `test/*.e2e-spec.ts` | Route HTTP thật + Postgres thật (DB `*_test`, reset trước mỗi file) |
| Smoke | `curl` | CI và sau deploy | `/api/v1/health` trả về 200 |

Test bắt buộc trong module `platform`:

- **e2e health:**
  - DB sống thì trả về 200;
  - với `DATABASE_URL` sai thì trả về 503.
- **e2e định dạng lỗi:**
  - route không tồn tại thì trả về 404 đúng dạng;
  - body sai thì trả về 400 kèm `details`;
  - route test ném lỗi thì trả về 500 không lộ stack. Route test chỉ có trong môi trường test.
- **unit `env.validation`:** thiếu `DATABASE_URL` thì ném lỗi nêu tên biến.
- **unit + e2e của `_template`:** chứng minh khung phân lớp chạy được.

Từ module `auth` trở đi: mỗi quy tắc nghiệp vụ có ít nhất một unit test, và mỗi endpoint có e2e cho trường hợp thành công, trường hợp sai quyền và trường hợp input sai.

## Boundaries

- **Always:**
  - Chạy `pnpm lint`, `pnpm test`, `pnpm test:e2e` và `pnpm build` (cả FE nếu đã sửa FE) trước khi báo xong.
  - Giữ đúng hướng phụ thuộc giữa các lớp.
  - Chỉ dùng tính năng PostgreSQL chuẩn.
  - Đọc secret từ biến môi trường; `.env.example` chỉ chứa giá trị giả.
- **Ask first:**
  - Thêm thư viện ngoài bảng Tech Stack.
  - Đổi định dạng lỗi hoặc prefix API.
  - Đổi cổng hoặc tên service trong Docker.
  - Sửa workflow deploy ngoài phần mô tả ở trên.
- **Never:**
  - Commit `.env` hay secret.
  - Dùng Supabase Auth, Storage hay RLS.
  - Để kiểu Prisma lọt ra ngoài `infrastructure/`.
  - Trả stack trace về client.
  - Tắt hoặc xóa test để CI xanh.

## Success Criteria

1. Chạy `./docker.sh` từ máy trống, sau khoảng 2 phút có `http://localhost:3000` (FE) và `http://localhost:3000/api/v1/health` trả về `{"status":"ok","db":"ok"}` (đi qua rewrite của FE).
2. Dừng container `db`, gọi lại health: nhận 503.
3. Xóa `DATABASE_URL` khỏi `.env`, chạy `pnpm start:dev`: app dừng với thông báo nêu `DATABASE_URL`.
4. Bốn lệnh `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build` trong `backend/` đều không lỗi. `pnpm build` trong `frontend/` không lỗi.
5. Push lên `master` có sửa `backend/**`: CI test rồi build image; server chạy cả 3 container; smoke test health trả về 200. Một PR chỉ chạy test, không deploy.
6. Trỏ `DATABASE_URL`/`DIRECT_URL` sang một DB Neon (hoặc Supabase) thử nghiệm: `prisma migrate deploy` và health đều chạy được, không sửa code.

## Open Questions

Đã chốt: cổng 4000; Postgres chạy trong Docker cả dev lẫn server; FE và BE là 2 project pnpm độc lập.
