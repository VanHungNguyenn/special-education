# Todo: Module `audit` + `roster`

Kế hoạch: [plan.md](plan.md). Spec: [SPEC-audit.md](../../SPEC-audit.md), [SPEC-roster.md](../../SPEC-roster.md).

Definition of Done cho mọi task:
- backend: `pnpm lint && pnpm test && pnpm test:e2e && pnpm build`;
- frontend (khi có sửa): `pnpm build && pnpm test`; đổi UI thì thêm `pnpm a11y-check`, `pnpm layout-check`, `pnpm screenshot` (backend chạy với `db:seed:demo`);
- không có comment trong code; mọi thông báo cho người dùng bằng tiếng Việt.

## Phase 1: audit

### A1: Unit of Work + repository `auth` dùng `prisma.db`

**Description:** Thêm `src/prisma/unit-of-work.ts`: `UnitOfWork.run(fn)` mở `prisma.$transaction(async (tx) => …)` và đặt `tx` vào `AsyncLocalStorage`; `PrismaService.db` trả `tx` nếu có, ngược lại là chính nó. `run` lồng nhau dùng lại transaction đang mở. Hai repository của `auth` đổi `this.prisma.x` → `this.prisma.db.x`. Không đổi hành vi.

**Acceptance criteria:**
- [ ] e2e: ghi user trong `uow.run` rồi ném lỗi → user không tồn tại; không ném lỗi → user tồn tại.
- [ ] e2e: `run` lồng nhau dùng chung một transaction.
- [ ] Toàn bộ e2e `auth` hiện có vẫn xanh.

**Verification:** `pnpm test:e2e`, `pnpm build`
**Dependencies:** pnpm chạy được trên máy
**Files:** `src/prisma/{unit-of-work.ts,prisma.service.ts,prisma.module.ts}`, `src/modules/auth/infrastructure/prisma-{user,session}.repository.ts`, `test/unit-of-work.e2e-spec.ts`
**Scope:** S

### A2: `AuditLog` + ghi audit cho tài khoản

**Description:** Model `AuditLog` + migration `audit`. Module `audit` (`@Global`): `domain/diff.ts` (chỉ trường đổi, bỏ trường cấm), port `AUDIT_LOGGER`, `PrismaAuditLogger` dùng `prisma.db`. Bọc 4 use case `CreateUser`, `UpdateUser`, `ResetUserPassword`, `ChangeOwnPassword` trong `uow.run` và ghi `CREATE`/`UPDATE`/`PASSWORD_RESET`/`PASSWORD_CHANGED`. Fake `AuditLogger`/`UnitOfWork` cho unit test.

**Acceptance criteria:**
- [ ] Unit `diff`: không đổi → `null`; chỉ trường đổi + `id`; `Date` so theo giá trị; không bao giờ có `passwordHash`.
- [ ] e2e: sửa tài khoản → đúng 1 dòng audit với diff đúng; sửa không đổi gì → không có dòng mới.
- [ ] e2e: logger ném lỗi → thay đổi tài khoản không được lưu.
- [ ] e2e: đặt lại mật khẩu → audit có `PASSWORD_RESET`, không có giá trị mật khẩu.

**Verification:** `pnpm test`, `pnpm test:e2e`
**Dependencies:** A1
**Files:** `prisma/schema.prisma`, `prisma/migrations/*_audit`, `src/modules/audit/*`, `src/app.module.ts`, `src/modules/auth/application/{create-user,update-user,reset-user-password,change-own-password}.use-case.ts` (+ spec), `test/fakes/*`, `test/audit.e2e-spec.ts`
**Scope:** M

### Checkpoint A
- [ ] BE lint/test/e2e/build xanh
- [ ] Sửa tài khoản trên tab Tài khoản → thấy dòng `AuditLog` trong DB

## Phase 2: roster backend

### R1: Schema + domain + `AccessPolicy`

**Description:** Model `Class`, `Student`, enum `Gender`; migration `roster` tạo bằng `--create-only` và thêm partial unique index `lower(name) WHERE "deletedAt" IS NULL`. Domain: `SchoolClass`, `Student` (chuẩn hóa, kiểm tra trường theo SPEC-roster US2/US5), `AccessPolicy` (`scopeFor(user)`, `assertCanUseClass(user, schoolClass)`), lỗi nghiệp vụ, port repository.

**Acceptance criteria:**
- [ ] Unit: trim tên, giới hạn độ dài, ngày sinh ngoài [1900-01-01, hôm nay] bị từ chối, điện thoại sai định dạng bị từ chối.
- [ ] Unit: Quản lý → scope tất cả; Giáo viên → scope `teacherId`; giáo viên dùng lớp của người khác → `CLASS_NOT_FOUND`.
- [ ] Migration áp dụng được vào DB dev và test; `prisma migrate dev` sau đó không báo drift.

**Verification:** `pnpm test`, `pnpm db:migrate`, `pnpm test:e2e`
**Dependencies:** Checkpoint A
**Files:** `prisma/schema.prisma`, `prisma/migrations/*_roster`, `src/modules/roster/domain/*`
**Scope:** M

### R2: API lớp

**Description:** `PrismaClassRepository` (lọc `deletedAt`, scope, đếm học sinh chưa xóa). Use case `ListClasses`, `CreateClass`, `UpdateClass`, `DeleteClass` (xóa mềm; kiểm tra học sinh để R3 điền khi đã có repository học sinh — ở R2 đếm trực tiếp trong repository lớp). `ClassesController` + DTO. Kiểm tra giáo viên tồn tại/đang hoạt động qua `USER_REPOSITORY` của `auth`. Ghi audit.

**Acceptance criteria:**
- [ ] e2e: Quản lý tạo/sửa/xóa lớp; Giáo viên `GET` chỉ thấy lớp mình, `POST`/`PATCH`/`DELETE` nhận 403.
- [ ] e2e: trùng tên (khác hoa thường) → 409 `CLASS_NAME_TAKEN`; tên của lớp đã xóa dùng lại được; giáo viên vô hiệu hóa → 422 `TEACHER_INACTIVE`.
- [ ] e2e: mỗi thao tác ghi 1 dòng audit `Class`.

**Verification:** `pnpm test:e2e`; xem `/api/v1/docs`
**Dependencies:** R1
**Files:** `src/modules/roster/{application,infrastructure,http}/*class*`, `src/modules/roster/roster.module.ts`, `src/app.module.ts`, `test/classes.e2e-spec.ts`
**Scope:** M

### R3: API học sinh

**Description:** `PrismaStudentRepository`, use case `ListStudents` (lọc `classId?`), `GetStudent`, `CreateStudent`, `UpdateStudent` (lớp mới cũng phải trong phạm vi), `DeleteStudent` (xóa mềm). `StudentAccess.findAccessibleStudent(user, id)` export cho module sau. `DeleteClass` từ chối khi còn học sinh chưa xóa. Ghi audit.

**Acceptance criteria:**
- [ ] e2e: Giáo viên xem/sửa/xóa học sinh lớp khác → 404; tạo học sinh vào lớp khác → 404; chuyển học sinh giữa hai lớp của mình → 200.
- [ ] e2e: body sai → 400 với `details` theo trường; ngày sinh trả về đúng `YYYY-MM-DD`.
- [ ] e2e: xóa học sinh → biến mất khỏi danh sách nhưng còn trong DB với `deletedAt`; xóa lớp còn học sinh → 409 `CLASS_NOT_EMPTY`, xóa hết học sinh rồi xóa lớp → 204.

**Verification:** `pnpm test:e2e`
**Dependencies:** R2
**Files:** `src/modules/roster/{application,infrastructure,http}/*student*`, `src/modules/roster/{roster.module.ts,index.ts}`, `test/students.e2e-spec.ts`
**Scope:** M

### R4: Dữ liệu demo

**Description:** `seed-demo.ts` tạo 3 lớp, 5 học sinh như mock FE (Linh → Mầm Xanh, Thư → Cầu Vồng, Trang → Ánh Dương). `--clean` xóa audit, học sinh, lớp của tài khoản demo rồi xóa tài khoản.

**Acceptance criteria:**
- [ ] Chạy `db:seed:demo` hai lần không tạo trùng.
- [ ] `--clean` chạy xong DB không còn dữ liệu demo và không lỗi khóa ngoại.

**Verification:** `pnpm db:seed:demo && pnpm db:seed:demo && pnpm db:seed:demo --clean`
**Dependencies:** R3
**Files:** `src/cli/seed-demo.ts`, `test/cli.e2e-spec.ts`
**Scope:** S

### Checkpoint R-BE
- [ ] BE lint/test/e2e/build xanh
- [ ] Đăng nhập `linh@demo.local` qua `/api/v1/docs`: `GET /classes` chỉ có Mầm Xanh, `GET /students` có 3 em

## Phase 3: roster frontend

### R5: FE đọc lớp và học sinh từ API

**Description:** `features/roster/{types,api,query-keys,queries}.ts` (`useClasses`, `useStudents`). Đổi `id`/`classId` sang `string` trong `features/school/types.ts`; `gender` hiển thị Nam/Nữ từ `MALE`/`FEMALE`. `useSchoolManagement` bỏ state lớp/học sinh, giữ mock đánh giá (khóa `${studentId}-${month}` với id chuỗi). `portal/page.tsx`: trạng thái đang tải và lỗi (có nút Thử lại), deep link `?student=<uuid>`, học sinh không tìm thấy → "Không tìm thấy học sinh.", giáo viên chưa có lớp → thông báo ở US1.2. Hiện tên giáo viên từ `teacher.fullName`. Ẩn nút thêm/sửa/xóa lớp với Giáo viên. Xóa `initialClasses`/`initialStudents` khỏi `data.ts`.

**Acceptance criteria:**
- [ ] Đăng nhập Quản lý thấy 3 lớp, 5 học sinh demo; đăng nhập `linh@` chỉ thấy Mầm Xanh, không có nút thêm/sửa/xóa lớp.
- [ ] Mở `?student=<id lớp khác>` khi đăng nhập `linh@` → "Không tìm thấy học sinh."
- [ ] Nhập đánh giá (mock) cho một học sinh vẫn chạy như trước.

**Verification:** `pnpm build`, `pnpm test`, `pnpm a11y-check`, `pnpm screenshot`
**Dependencies:** R4
**Files:** `features/roster/*`, `features/school/{types,data,use-school-management}.ts`, `app/portal/page.tsx`, `components/school/{class-overview,student-list,student-profile}.tsx`
**Scope:** M

### R6: FE thêm/sửa/xóa qua API

**Description:** Mutation `useCreateClass`/`useUpdateClass`/`useDeleteClass`/`useCreateStudent`/`useUpdateStudent`/`useDeleteStudent` (invalidate danh sách). `EntityModal`: ô "Giáo viên phụ trách" thành `SelectField` lấy từ `useUsers` (tài khoản đang hoạt động; tài khoản đã vô hiệu hóa đang gán thì hiện kèm "(đã vô hiệu hóa)"); giới tính gửi `MALE`/`FEMALE`; nút lưu khóa khi đang gửi; lỗi `details` hiện dưới từng trường, lỗi chung hiện đầu form; đóng modal khi thành công. Xóa lớp còn học sinh hiện message của server. Giáo viên chỉ chọn được lớp của mình.

**Acceptance criteria:**
- [ ] Thêm/sửa/xóa lớp và học sinh, tải lại trang vẫn đúng.
- [ ] Trùng tên lớp, điện thoại sai hiện lỗi ngay dưới ô tương ứng.
- [ ] Xóa lớp còn học sinh hiện "Không thể xóa lớp vì vẫn còn học sinh…".

**Verification:** `pnpm build`, `pnpm a11y-check`, `pnpm layout-check`; thử bằng tay với Quản lý và `linh@`
**Dependencies:** R5
**Files:** `features/roster/queries.ts`, `components/school/entity-modal.tsx`, `app/portal/page.tsx`, `components/common/form-field.tsx` (nếu cần prop lỗi)
**Scope:** M

### Checkpoint: Complete
- [ ] Success Criteria 1–7 của SPEC-roster và 1–4 của SPEC-audit đạt
- [ ] Cập nhật `CLAUDE.md` (Status), `backend/CLAUDE.md`, `docs/backend-requirements.md`, `frontend/CLAUDE.md`/`frontend/docs` (mock chỉ còn đánh giá)
- [ ] Đánh dấu SPEC-audit, SPEC-roster "đã triển khai"
- [ ] Review với chủ dự án, rồi viết `SPEC-evaluations.md`
