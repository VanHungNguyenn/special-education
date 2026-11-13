# Spec: Module `audit`

Trạng thái: **đã duyệt** (2026-11-13). Thuộc [SPEC-backend.md](SPEC-backend.md), phụ thuộc `platform` và `auth` (đã xong). Kiến trúc: [docs/architecture.md](docs/architecture.md) §2.3 (Unit of Work). Plan: [tasks/roster/plan.md](tasks/roster/plan.md) (audit và roster làm chung một plan).

## Objective

Ghi lại **ai đã thay đổi gì, lúc nào, trước và sau** cho mọi thay đổi trên tài khoản, lớp, học sinh và phiếu đánh giá. Hồ sơ của trẻ cần truy vết được khi có tranh chấp ("ai đã sửa đánh giá tháng 7 của em A?").

Module này là **hạ tầng dùng chung**, không có màn hình. Các module sau (`roster`, `evaluations`) gọi nó trong use case của mình. Màn hình xem lịch sử để sau (xem Ngoài phạm vi).

### User stories và acceptance criteria

**US1. Mọi thay đổi đều có bản ghi lịch sử**
1. Mỗi thao tác ghi (tạo, sửa, xóa mềm, đổi trạng thái…) tạo **đúng một** bản ghi `AuditLog` cho mỗi thực thể bị đổi, gồm: người làm (`actorId`), loại thực thể (`entityType`), id thực thể, hành động (`action`), dữ liệu trước (`before`), dữ liệu sau (`after`), thời điểm (`at`, UTC).
2. Tạo mới thì `before = null`. Xóa mềm thì `after` có `deletedAt`. Sửa mà không có gì thay đổi thì **không** ghi.
3. `before`/`after` chỉ chứa **những trường đã đổi** (cùng `id`), không chép cả bản ghi, để dễ đọc và đỡ phình DB.

**US2. Không bao giờ có thay đổi mà không có lịch sử (và ngược lại)**
1. Dữ liệu nghiệp vụ và bản ghi audit được ghi trong **cùng một transaction**: lỗi ở bất kỳ bước nào thì cả hai cùng rollback.
2. Ghi audit lỗi thì thao tác nghiệp vụ cũng lỗi (không "nuốt" lỗi audit).

**US3. Không lộ bí mật**
1. Không bao giờ ghi `passwordHash`, token phiên, cookie vào audit. Đặt lại hay đổi mật khẩu chỉ ghi hành động (`PASSWORD_RESET`, `PASSWORD_CHANGED`), không có giá trị.
2. Dữ liệu cá nhân của trẻ chỉ nằm trong bảng `AuditLog` (trong DB), không ghi ra log ứng dụng (stdout).

**US4. Gắn audit vào module `auth` đã có**
- Các use case: tạo tài khoản, sửa tài khoản (họ tên, email, điện thoại, vai trò, kích hoạt/vô hiệu hóa), Quản lý đặt lại mật khẩu, tự đổi mật khẩu.
- **Không** ghi đăng nhập/đăng xuất/đăng nhập sai (đó là log bảo mật, không phải lịch sử dữ liệu; để sau nếu cần).

### Ngoài phạm vi
- API và màn hình xem lịch sử (Quản lý xem lịch sử một học sinh/phiếu). Sẽ thêm khi cần; dữ liệu đã đủ để làm.
- Xóa hay sửa bản ghi audit. Bảng này chỉ thêm, không sửa.
- Thời hạn lưu: giữ vĩnh viễn (dữ liệu nhỏ: vài nghìn dòng mỗi tháng).

## Quyết định kỹ thuật

| Chủ đề | Quyết định | Lý do |
|---|---|---|
| Transaction | Thêm `UnitOfWork` vào `src/prisma/`: `uow.run(fn)` mở `prisma.$transaction` và lưu transaction client vào `AsyncLocalStorage`. Repository lấy client qua `PrismaService.db` (client của transaction nếu đang trong `run`, ngược lại là client thường) | Repository và use case không phải truyền `tx` qua tham số; port trong `domain` không biết Prisma. Không thêm thư viện (`@nestjs-cls/transactional` làm đúng việc này nhưng là phụ thuộc mới) |
| Port | `AUDIT_LOGGER` với `record(entry)`; module `audit` export port và token. Use case gọi `uow.run(async () => { await repo.save(x); await audit.record({...}) })` | Theo Adapter/DI như các port khác |
| Tính diff | Hàm thuần `diff(before, after)` trong `audit/domain` trả về `{ before, after }` chỉ gồm trường đổi, hoặc `null` nếu không đổi. So sánh `Date` theo giá trị | Unit test được, dùng chung cho mọi module |
| Người làm | `actorId` bắt buộc, khóa ngoại tới `User` (không cascade). Lệnh CLI (`create-manager`, `seed-demo`) không ghi audit | Mọi thay đổi qua API đều có người đăng nhập |
| `entityType` | Chuỗi cố định: `User`, `Class`, `Student`, `Evaluation`… | Đọc được bằng SQL thường |
| `action` | Chuỗi: `CREATE`, `UPDATE`, `DELETE`, `PASSWORD_RESET`, `PASSWORD_CHANGED`; module sau thêm `LOCK`, `UNLOCK`… | |
| Index | `(entityType, entityId, at)` và `(actorId, at)` | Hai cách tra cứu sẽ cần khi có màn hình xem |

## Mô hình dữ liệu

```prisma
model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  actorId    String   @db.Uuid
  actor      User     @relation(fields: [actorId], references: [id], onDelete: Restrict)
  entityType String
  entityId   String   @db.Uuid
  action     String
  before     Json?
  after      Json?
  at         DateTime @default(now())

  @@index([entityType, entityId, at])
  @@index([actorId, at])
}
```

## Project Structure

```
backend/src/
├── prisma/unit-of-work.ts                 # MỚI: UnitOfWork + AsyncLocalStorage
├── prisma/prisma.service.ts               # thêm getter `db`
└── modules/audit/
    ├── domain/{audit-entry.ts, diff.ts, diff.spec.ts, ports.ts}
    ├── infrastructure/prisma-audit-logger.ts
    ├── audit.module.ts                    # @Global, export AUDIT_LOGGER
    └── index.ts
backend/src/modules/auth/                  # repository dùng prisma.db; 4 use case bọc trong uow.run + ghi audit
backend/test/fakes/                        # FakeAuditLogger, FakeUnitOfWork cho unit test
backend/test/audit.e2e-spec.ts             # MỚI
```

## Testing Strategy

| Mức | Nội dung |
|---|---|
| Unit | `diff`: không đổi → `null`; chỉ trả trường đổi; `Date` cùng giá trị coi là không đổi; bỏ các trường cấm (`passwordHash`). Use case auth: gọi `record` đúng `action`, `before`/`after` |
| E2E | Sửa tài khoản qua API → có đúng 1 dòng `AuditLog` với diff đúng. Ép `audit.record` ném lỗi → thay đổi tài khoản **không** được lưu (kiểm tra rollback). Đặt lại mật khẩu → audit không chứa `passwordHash`. Sửa mà không đổi gì → không có dòng mới |

## Boundaries

- **Always:** mọi use case ghi dữ liệu của `roster`, `evaluations` đi qua `uow.run` và ghi audit.
- **Ask first:** thêm thư viện; ghi audit cho đọc dữ liệu (xem).
- **Never:** ghi bí mật vào audit; sửa/xóa `AuditLog`; ghi audit ngoài transaction của thay đổi.

## Success Criteria

1. Sửa một tài khoản trên tab Tài khoản → bảng `AuditLog` có 1 dòng với đúng người sửa và trường đã đổi.
2. E2E rollback chứng minh không có thay đổi nào thiếu audit.
3. `grep passwordHash` trong dữ liệu `AuditLog` sau khi chạy e2e không ra kết quả.
4. Backend `lint`, `test`, `test:e2e`, `build` không lỗi.

## Open Questions

Đã chốt (2026-11-13):
1. Chưa ghi đăng nhập sai/bị khóa.
2. Màn hình xem lịch sử để sau, chưa xếp lịch.
