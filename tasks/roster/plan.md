# Implementation Plan: Module `audit` + `roster`

Nguồn: [SPEC-audit.md](../../SPEC-audit.md), [SPEC-roster.md](../../SPEC-roster.md), [SPEC-backend.md](../../SPEC-backend.md), [docs/architecture.md](../../docs/architecture.md). Danh sách task: [todo.md](todo.md). Lộ trình tới PDF: [tasks/gdcn-pdf/plan.md](../gdcn-pdf/plan.md) (plan này là Phase 2–3 của lộ trình đó).

## Overview

1. **audit:** thêm Unit of Work (transaction qua `AsyncLocalStorage`) và bảng `AuditLog`; gắn vào các use case tài khoản đã có.
2. **roster:** lớp và học sinh lưu trong Postgres, giáo viên chỉ thấy lớp mình; FE tab Lớp học và Học sinh gọi API thật. Phiếu đánh giá vẫn là mock ở FE (khóa theo id mới).

## Architecture Decisions

- **Unit of Work không thêm thư viện:** `UnitOfWork.run(fn)` + `PrismaService.db`. Repository của `auth` chuyển sang `prisma.db` trước (task riêng, không đổi hành vi) để tách rủi ro.
- **audit là module `@Global`** export `AUDIT_LOGGER`, để `auth`, `roster`, `evaluations` inject mà không import chéo.
- **Phạm vi xem lọc trong SQL** qua `scope` truyền vào repository; ngoài phạm vi trả 404.
- **FE đổi id `number → string` một lần** (task R4), cùng lúc chuyển đọc dữ liệu sang API, vì hai việc chạm cùng các file.
- **FE làm sau khi BE xong cả lớp và học sinh**: tab Lớp học cần số học sinh và tiến độ đánh giá theo học sinh, nên chuyển riêng lớp trước sẽ phải viết code tạm.

## Dependency graph

```
A1 UnitOfWork + auth repos dùng prisma.db
 └─ A2 AuditLog + diff + gắn vào auth
     └─ R1 Schema Class/Student + domain + AccessPolicy
         ├─ R2 API lớp
         │   └─ R3 API học sinh (+ CLASS_NOT_EMPTY, StudentAccess)
         │       ├─ R4 seed demo
         │       └─ R5 FE đọc từ API (id → string, deep link, 404, trạng thái rỗng)
         │           └─ R6 FE ghi qua API (form lớp chọn giáo viên, form học sinh, xóa, lỗi từng trường)
         └─ (evaluations sau này dùng StudentAccess)
```

## Task List

### Phase 1: audit
- [ ] A1: Unit of Work + repository `auth` dùng `prisma.db`
- [ ] A2: `AuditLog`, `diff`, `AuditLogger`; ghi audit cho 4 use case tài khoản

### Checkpoint A
- [ ] BE lint/test/e2e/build xanh; e2e rollback chứng minh audit cùng transaction

### Phase 2: roster backend
- [ ] R1: Schema + migration `Class`, `Student`; domain + `AccessPolicy`
- [ ] R2: API lớp (CRUD, quyền, trùng tên, audit)
- [ ] R3: API học sinh (CRUD, phạm vi, xóa mềm, `CLASS_NOT_EMPTY`, `StudentAccess`, audit)
- [ ] R4: `db:seed:demo` lớp + học sinh

### Checkpoint R-BE
- [ ] Gọi API bằng tài khoản `linh@demo.local` chỉ thấy lớp Mầm Xanh

### Phase 3: roster frontend
- [ ] R5: FE đọc lớp/học sinh từ API
- [ ] R6: FE thêm/sửa/xóa lớp và học sinh qua API

### Checkpoint: Complete
- [ ] Success Criteria 1–7 của SPEC-roster đạt
- [ ] Cập nhật CLAUDE.md (Status), docs/backend-requirements.md, frontend/docs
- [ ] Review với chủ dự án, rồi viết `SPEC-evaluations.md`

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| `AsyncLocalStorage` mất ngữ cảnh qua `$transaction` callback của Prisma 7 adapter-pg | High | A1 có e2e chứng minh: ghi trong `run` rồi ném lỗi → không có gì được lưu |
| Partial unique index viết tay bị Prisma `migrate dev` coi là drift | Med | Dùng `migrate dev --create-only`, thêm SQL, ghi chú cách làm trong `backend/CLAUDE.md` |
| Đổi id sang string làm vỡ mock đánh giá, deep link, `Number(classFilter)` | Med | R5 grep mọi `Number(`, `Date.now()`, `id ===` trong `features/school` và `components/school`; `pnpm build` bắt lỗi kiểu |
| Check script FE (`a11y-check`, `layout-check`, `screenshot`) dựa vào dữ liệu mock | Med | Chạy `db:seed:demo` trước; sửa script nếu nó giả định id số |
| `pnpm` trên máy đang lỗi (`Failed to switch pnpm to v12.18.0`) | High | Sửa trước khi làm A1 (chủ dự án chạy `corepack install` hoặc cho phép tự xử lý) |

## Open Questions

Đã chốt hết (2026-11-13): không ghi đăng nhập sai; màn hình lịch sử để sau; Giáo viên được thêm và xóa (mềm) học sinh lớp mình; gán lớp cho Quản lý được.
