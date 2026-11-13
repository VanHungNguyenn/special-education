# Todo: Backend xuất phiếu GDCN ra PDF

Kế hoạch: [plan.md](plan.md). Task của Phase 2–5 sẽ được chỉnh lại sau khi spec từng module được duyệt.

Definition of Done cho mọi task:
- backend: `pnpm lint && pnpm test && pnpm test:e2e && pnpm build`;
- frontend (khi có sửa): `pnpm build && pnpm test`, sau đó `pnpm a11y-check` và `pnpm screenshot` khi đổi UI;
- không có comment trong code; mọi thông báo cho người dùng bằng tiếng Việt; không viết cứng tên trung tâm.

## Phase 1: Spike tạo PDF

### T1: Template HTML phiếu GDCN + renderer Playwright

**Description:** Tạo module `reports` (chỉ phần tạo file). `domain/gdcn-sheet.ts`: kiểu dữ liệu phiếu (trung tâm, tháng, học sinh, tuổi, trị liệu viên, các lĩnh vực → tiêu chí → mục tiêu + đánh giá). `infrastructure/gdcn-template.ts`: hàm thuần `renderGdcnHtml(sheet)` dựng lại 2 trang A4 của mẫu (header, bảng có `rowspan` cho nhóm, dòng chấm, khối chữ ký, ô ý kiến). `infrastructure/playwright-pdf-renderer.ts` hiện thực port `PdfRenderer`. Script `pnpm pdf:sample` sinh `out/gdcn-sample.pdf` từ dữ liệu cố định.

**Acceptance criteria:**
- [ ] PDF sinh ra có đủ các phần của mẫu, đúng thứ tự và gộp ô; chữ tiếng Việt có dấu hiển thị đúng.
- [ ] Phiếu trống in ra giống mẫu trống; phiếu có 6 mục tiêu ở một tiêu chí tự thêm dòng, không cắt giữa tiêu chí khi sang trang.
- [ ] Tên, địa chỉ, logo trung tâm lấy từ config; không có chữ "Tâm Anh" trong code.

**Verification:**
- [ ] Unit test `renderGdcnHtml`: escape HTML trong nội dung, số dòng tối thiểu mỗi tiêu chí, `rowspan` đúng.
- [ ] `pnpm pdf:sample` rồi so bằng mắt với `Mau_GDCN.pdf` (chụp từng trang thành PNG đặt cạnh nhau).

**Dependencies:** None
**Files:** `backend/src/modules/reports/{domain,infrastructure}/*`, `backend/scripts/pdf-sample.ts`, `backend/package.json`, `backend/src/config/env.ts`
**Scope:** M

### T2: Chạy được trong Docker

**Description:** Đổi stage chạy của `backend/Dockerfile` sang `node:22-bookworm-slim`, cài Chromium của Playwright và font. Dev compose cũng chạy được renderer. Browser mở một lần, đóng khi app tắt (`OnApplicationShutdown`), giới hạn số trang đồng thời.

**Acceptance criteria:**
- [ ] `./docker.sh` (prod-like) và `./docker.sh dev` đều tạo được `gdcn-sample.pdf` bên trong container, dấu tiếng Việt đúng.
- [ ] Ghi vào plan: dung lượng image trước/sau, thời gian tạo 1 phiếu (lần đầu và lần sau), RAM lúc tạo.
- [ ] CI (`deploy.yml`) vẫn build và test được.

**Verification:** `docker compose build backend`, chạy `pnpm pdf:sample` trong container, `docker image ls`
**Dependencies:** T1
**Files:** `backend/Dockerfile`, `docker-compose*.yml`, `.github/workflows/deploy.yml`, `backend/src/modules/reports/infrastructure/playwright-pdf-renderer.ts`
**Scope:** S

### Checkpoint 1
- [ ] Chủ dự án duyệt PDF mẫu (bố cục, font, dòng chấm)
- [ ] Chủ dự án trả lời câu hỏi mở 1–5 trong plan.md

## Phase 2: audit

### T3: Viết `SPEC-audit.md`
**Description:** Spec tối giản: bảng `AuditLog`, cách các module gọi `AuditRecorder` trong cùng transaction, dữ liệu before/after, chưa có API đọc.
**Acceptance criteria:**
- [ ] Spec được chủ dự án duyệt.
**Verification:** review
**Dependencies:** Checkpoint 1 (không bắt buộc, có thể song song)
**Scope:** XS

### T4: `AuditLog` + `AuditRecorder`
**Description:** Model + migration, port `AuditRecorder` export từ module `audit`, implementation Prisma nhận transaction client.
**Acceptance criteria:**
- [ ] Ghi audit và thay đổi dữ liệu cùng commit hoặc cùng rollback (e2e).
- [ ] Ghi đúng `actorId`, `entityType`, `entityId`, `action`, `before`, `after`.
**Verification:** `pnpm test:e2e`
**Dependencies:** T3
**Files:** `prisma/schema.prisma`, `prisma/migrations/*_audit`, `src/modules/audit/*`
**Scope:** S

## Phase 3: roster

### T5: Viết `SPEC-roster.md`
**Acceptance criteria:**
- [ ] Chốt API lớp/học sinh, phạm vi xem của giáo viên, xóa mềm, đổi id sang UUID ở FE, cách gán giáo viên cho lớp.
**Dependencies:** T4
**Scope:** XS

### T6: Lớp: API + FE tab "Lớp"
**Description:** `Class` (gắn `teacherId`), CRUD, lớp còn học sinh thì không xóa (`CLASS_NOT_EMPTY`). FE: `features/classes/{api,queries}.ts`, tab Lớp dùng API thay `useSchoolManagement`.
**Acceptance criteria:**
- [ ] Giáo viên chỉ thấy lớp mình; chỉ quản lý tạo/xóa lớp và đổi giáo viên.
- [ ] Xóa lớp còn học sinh trả lỗi tiếng Việt, FE hiện thông báo.
- [ ] Tải lại trang không mất dữ liệu.
**Verification:** e2e quyền + rule xóa; `pnpm a11y-check`
**Dependencies:** T5
**Scope:** M

### T7: Học sinh: API + FE tab "Học sinh"
**Description:** `Student` CRUD, xóa mềm, lọc theo lớp và phạm vi giáo viên. FE đổi id sang string, sửa deep link `?student=`.
**Acceptance criteria:**
- [ ] Giáo viên không đọc/sửa được học sinh lớp khác (403/404).
- [ ] Học sinh đã xóa không hiện trong danh sách nhưng vẫn tồn tại trong DB.
- [ ] Deep link `?student=<uuid>` mở đúng hồ sơ.
**Verification:** e2e; `pnpm build`; mở hồ sơ qua deep link
**Dependencies:** T6
**Scope:** M

### T8: `db:seed:demo` cho lớp/học sinh
**Acceptance criteria:**
- [ ] Seed nạp 3 lớp, 5 học sinh mẫu gắn với giáo viên demo; chạy lại không bị trùng.
**Verification:** `pnpm db:seed:demo` hai lần
**Dependencies:** T7
**Scope:** XS

### Checkpoint 3
- [ ] Lớp và học sinh lưu thật; giáo viên chỉ thấy lớp mình
- [ ] Review với chủ dự án trước khi viết `SPEC-evaluations.md`

## Phase 4: evaluations

### T9: Viết `SPEC-evaluations.md`
**Acceptance criteria:**
- [ ] Chốt: tiêu chí theo mẫu GDCN (nhóm lĩnh vực), snapshot khi tạo phiếu, nhiều mục tiêu mỗi tiêu chí, quy tắc khóa/mở khóa, UI nhập nhiều mục tiêu trong hồ sơ học sinh.
**Dependencies:** Checkpoint 3
**Scope:** XS

### T10: Danh mục tiêu chí
**Description:** `Criterion` (id ổn định, `groupName`, `position`, `isActive`), seed đúng 11 tiêu chí của mẫu, `GET /criteria`.
**Acceptance criteria:**
- [ ] Seed khớp cột "Lĩnh vực can thiệp" của mẫu, kể cả nhóm.
- [ ] FE bỏ việc tham chiếu tiêu chí theo chỉ số mảng.
**Verification:** e2e; `pnpm build`
**Dependencies:** T9
**Scope:** S

### T11: Phiếu tháng + mục tiêu, FE hồ sơ học sinh
**Description:** `Evaluation` unique(studentId, month), tạo khi mở lần đầu với snapshot tiêu chí; thêm/sửa/xóa/sắp xếp `EvaluationGoal` (nội dung + đánh giá). FE tab "Đánh giá theo tháng" cho nhập nhiều mục tiêu mỗi tiêu chí.
**Acceptance criteria:**
- [ ] Sửa danh mục tiêu chí không làm đổi phiếu đã tạo.
- [ ] Mỗi thay đổi ghi audit.
- [ ] Dữ liệu còn nguyên sau khi tải lại trang.
**Verification:** unit test domain; e2e; `pnpm a11y-check`, `pnpm screenshot`
**Dependencies:** T10
**Scope:** L → tách BE/FE khi viết spec nếu quá lớn

### T12: Trạng thái phiếu
**Description:** `draft → updated → locked`; quản lý mở khóa. Server từ chối sửa phiếu đã khóa (`EVALUATION_LOCKED`).
**Acceptance criteria:**
- [ ] Unit test chuyển trạng thái một chiều; e2e sửa phiếu khóa nhận 409.
- [ ] Chỉ quản lý mở khóa được.
**Verification:** `pnpm test`, `pnpm test:e2e`
**Dependencies:** T11
**Scope:** S

### Checkpoint 4
- [ ] Phiếu đánh giá lưu thật, đúng quy tắc khóa
- [ ] Review với chủ dự án

## Phase 5: reports

### T13: Viết `SPEC-reports.md`
**Acceptance criteria:**
- [ ] Chốt endpoint, quyền, tên file, cách FE tải và hiện lỗi; trả lời câu hỏi mở 1–3, 5 của SPEC.md.
**Dependencies:** Checkpoint 4
**Scope:** XS

### T14: Tải phiếu một học sinh
**Description:** Use case `ExportGdcnSheet` đọc học sinh, lớp, giáo viên, phiếu tháng → `GdcnSheet` → `PdfRenderer`. `GET /api/v1/reports/gdcn?studentId&month`. FE `features/reports/api.ts` tải bằng blob; nút "Tải phiếu" ở hồ sơ học sinh và tab Báo cáo, có trạng thái đang tạo/lỗi (`aria-busy`, `role="alert"`).
**Acceptance criteria:**
- [ ] PDF chứa đúng tên, tuổi, tháng/năm, trị liệu viên, mục tiêu và đánh giá đã điền.
- [ ] Giáo viên tải phiếu học sinh lớp khác nhận 403; phiếu chưa tạo vẫn tải được bản trống.
- [ ] Lỗi tạo file hiện thông báo tiếng Việt ngay cạnh nút.
**Verification:** unit test mapping `Evaluation → GdcnSheet` (tuổi, nhóm, thứ tự); e2e kiểm tra `Content-Type`, `Content-Disposition`, file bắt đầu bằng `%PDF`; tải thử trên trình duyệt
**Dependencies:** T13, T2
**Scope:** M

### T15: Tải cả lớp, bỏ in bằng trình duyệt
**Description:** `classId` hoặc không truyền gì → một PDF, mỗi học sinh một phiếu bắt đầu ở trang mới. FE nút "Tải báo cáo" theo bộ lọc. Xóa `window.print`, `flushSync`, `.no-print`, `.print-page` và `@media print` trong `tailwind.css`.
**Acceptance criteria:**
- [ ] File cả lớp có số phiếu bằng số học sinh trong phạm vi được xem.
- [ ] `grep -r "window.print\|flushSync\|no-print" frontend/src` không còn kết quả.
**Verification:** e2e; `pnpm build`; `pnpm a11y-check`
**Dependencies:** T14
**Scope:** M

### T16: Deploy và smoke test
**Acceptance criteria:**
- [ ] Image mới chạy trên server, tải phiếu thành công qua domain thật.
- [ ] Smoke test trong `deploy.yml` gọi endpoint tải phiếu (đăng nhập bằng tài khoản kiểm tra) và kiểm tra `%PDF`.
**Verification:** chạy workflow deploy
**Dependencies:** T15
**Scope:** S

### Checkpoint 5: Complete
- [ ] PDF tải từ server giống mẫu và đúng dữ liệu
- [ ] Cập nhật `CLAUDE.md` (bảng Status), `docs/backend-requirements.md`, `RUNNING.md`
- [ ] Review với chủ dự án
