# Spec: Module `roster`

Trạng thái: **đã duyệt** (2026-11-13). Thuộc [SPEC-backend.md](SPEC-backend.md), phụ thuộc `auth` (xong) và `audit` ([SPEC-audit.md](SPEC-audit.md)). Kiến trúc: [docs/architecture.md](docs/architecture.md). Plan: [tasks/roster/plan.md](tasks/roster/plan.md).

## Objective

Lớp và học sinh được lưu thật trong DB thay cho dữ liệu giả trong `useSchoolManagement`. Tải lại trang không còn mất dữ liệu. Giáo viên chỉ thấy lớp mình phụ trách.

Phiếu đánh giá **chưa** nằm trong module này: vẫn là mock ở FE cho tới module `evaluations`, chỉ đổi khóa sang id mới của học sinh.

### Người dùng

| Vai trò | Lớp | Học sinh |
|---|---|---|
| Quản lý (`MANAGER`) | Xem tất cả; tạo, sửa, xóa; gán giáo viên phụ trách | Xem, thêm, sửa, xóa học sinh mọi lớp |
| Giáo viên (`TEACHER`) | Chỉ xem lớp mình phụ trách; **không** tạo/sửa/xóa lớp | Xem, thêm, sửa, xóa học sinh **trong lớp mình**; chỉ chuyển học sinh giữa các lớp mình phụ trách |

### User stories và acceptance criteria

**US1. Danh sách lớp**
1. Tab "Lớp học" lấy dữ liệu từ API. Mỗi lớp có: tên, giáo viên phụ trách (họ tên), ghi chú, số học sinh.
2. Giáo viên chỉ thấy lớp có `teacherId` là mình. Chưa được giao lớp nào thì hiện "Bạn chưa được phân công lớp nào. Liên hệ quản lý trung tâm."
3. Nút "Thêm lớp", "Sửa", "Xóa" lớp chỉ hiện với Quản lý. Giáo viên gọi API sửa lớp nhận 403.

**US2. Tạo/sửa lớp (Quản lý)**
1. Form gồm: Tên lớp (bắt buộc, 1–100 ký tự), **Giáo viên phụ trách** (bắt buộc, chọn từ danh sách tài khoản đang hoạt động, thay cho ô nhập tên tự do hiện tại), Ghi chú (tùy chọn, tối đa 1.000 ký tự).
2. Tên lớp không trùng với lớp khác chưa xóa (không phân biệt hoa thường, bỏ khoảng trắng hai đầu): "Tên lớp đã tồn tại."
3. Chọn tài khoản đã bị vô hiệu hóa thì báo lỗi "Giáo viên này đã bị vô hiệu hóa." Lớp đang gán cho người đã bị vô hiệu hóa vẫn hiện bình thường, có nhãn "(đã vô hiệu hóa)" cạnh tên để Quản lý biết mà đổi.

**US3. Xóa lớp (Quản lý)**
1. Lớp còn học sinh (chưa xóa) thì không xóa được: "Không thể xóa lớp vì vẫn còn học sinh. Hãy chuyển hoặc xóa học sinh trước." (server kiểm tra; FE giữ thông báo hiện có).
2. Xóa là xóa mềm (`deletedAt`). Lớp đã xóa không hiện ở đâu nữa, và tên của nó được dùng lại được.

**US4. Danh sách và hồ sơ học sinh**
1. Tab "Học sinh" lấy dữ liệu từ API, chỉ gồm học sinh thuộc lớp người dùng được xem. Lọc theo lớp và tìm theo tên vẫn làm ở FE như hiện tại.
2. Mở hồ sơ học sinh không thuộc phạm vi (ví dụ dán link `?student=<id>` của lớp khác) thì nhận 404 và FE hiện "Không tìm thấy học sinh." (404 thay vì 403 để không lộ học sinh tồn tại).
3. Deep link `?student=<id>` dùng id mới (UUID).

**US5. Thêm/sửa học sinh**
1. Trường: Họ và tên (bắt buộc, 1–100), Lớp (bắt buộc), Ngày sinh (bắt buộc, `YYYY-MM-DD`, từ 1900-01-01 tới hôm nay), Giới tính (bắt buộc, Nam/Nữ), Phụ huynh (bắt buộc, 1–100), Điện thoại (bắt buộc, 8–20 ký tự gồm số, khoảng trắng, `+`, `.`, `-`), Địa chỉ (tùy chọn, tối đa 255), Ghi chú (tùy chọn, tối đa 1.000). Khớp với các dấu `*` đang có trên form.
2. Lỗi từng trường hiện ngay dưới ô đó (dùng `details` của định dạng lỗi chung).
3. Giáo viên chỉ chọn được lớp của mình; gửi `classId` lớp khác thì nhận 403.

**US6. Xóa học sinh**
1. Xóa mềm. Học sinh đã xóa không hiện trong danh sách, không mở được hồ sơ, nhưng dữ liệu (và sau này là phiếu đánh giá) vẫn còn trong DB.
2. Hộp thoại xác nhận như hiện tại.

**US7. Dữ liệu mẫu**
1. `pnpm db:seed:demo` tạo thêm 3 lớp và 5 học sinh giống dữ liệu mẫu hiện tại của FE, gán cho 3 giáo viên demo (Linh → Mầm Xanh, Thư → Cầu Vồng, Trang → Ánh Dương). Chạy lại không tạo trùng.
2. `pnpm db:seed:demo --clean` xóa luôn lớp, học sinh và audit của các tài khoản demo (xóa cứng, chỉ dữ liệu demo).

**US8. Mọi thay đổi có audit** theo [SPEC-audit.md](SPEC-audit.md): `Class` và `Student` với `CREATE`, `UPDATE`, `DELETE`.

### Ngoài phạm vi
- Khôi phục lớp/học sinh đã xóa (dữ liệu còn trong DB, làm sau nếu cần).
- Một lớp nhiều giáo viên.
- Tìm kiếm, phân trang ở server: một trung tâm chỉ vài chục lớp, vài trăm học sinh.
- Phiếu đánh giá: module `evaluations`.

## Quyết định kỹ thuật

| Chủ đề | Quyết định | Lý do |
|---|---|---|
| ID | UUID cho lớp và học sinh. FE đổi `id`/`classId` từ `number` sang `string` | Theo quy ước API trong SPEC-backend |
| Giáo viên phụ trách | `Class.teacherId` → `User` (bắt buộc). Gán được cho bất kỳ tài khoản đang hoạt động (kể cả Quản lý) | Quản lý cũng có thể đứng lớp |
| Phạm vi xem | `AccessPolicy` trong `roster/domain`: Quản lý thấy hết; Giáo viên thấy lớp có `teacherId = user.id`. Repository nhận `scope` (`{ all: true }` hoặc `{ teacherId }`) và lọc ngay trong câu SQL. Module `roster` export `StudentAccess` (`findAccessibleStudent(user, id)`) để `evaluations`/`reports` dùng lại | Một chỗ duy nhất quyết định "ai thấy gì" |
| Không thấy = 404 | Học sinh/lớp ngoài phạm vi trả `STUDENT_NOT_FOUND`/`CLASS_NOT_FOUND` 404. Riêng thao tác chỉ dành cho Quản lý (sửa lớp) trả 403 qua `@Roles('MANAGER')` | Không lộ dữ liệu trẻ ở lớp khác |
| Xóa mềm | `deletedAt` trên `Class` và `Student`. Repository mặc định lọc `deletedAt IS NULL` | Theo SPEC-backend |
| Tên lớp duy nhất | Kiểm tra trong use case (so sánh `lower(trim(name))` với lớp chưa xóa) và partial unique index `WHERE "deletedAt" IS NULL` trên `lower(name)` (migration SQL thủ công) | Prisma chưa khai báo được partial index; index chặn trường hợp hai request cùng lúc |
| Giới tính | Enum `Gender { MALE, FEMALE }`; FE hiển thị "Nam"/"Nữ" | Không lưu chuỗi hiển thị |
| Ngày sinh | Cột `@db.Date`, API nhận/trả `YYYY-MM-DD` | Không lệch múi giờ |
| Học sinh chuyển lớp | Chỉ đổi `classId`. Phiếu đánh giá thuộc về học sinh, không thuộc lớp, nên phiếu cũ đi theo học sinh. Trị liệu viên trên phiếu được chép khi khóa phiếu (module `evaluations`) | Trả lời câu hỏi mở 4 của docs/backend-requirements.md |
| Danh sách giáo viên cho form lớp | Dùng `GET /users` có sẵn (chỉ Quản lý gọi được, và chỉ Quản lý mở form lớp). FE lọc tài khoản đang hoạt động | Không thêm endpoint |
| FE | `features/roster/{api,queries,query-keys,types}.ts`. `useSchoolManagement` bỏ `classes`/`students`/`saveClass`/`deleteClass`/`saveStudent`/`deleteStudent`, chỉ còn UI state và mock đánh giá. Component vẫn nhận props như cũ | Theo docs/architecture.md §3 |
| Lỗi validation từ server | `EntityModal` hiện `details` dưới từng trường (`FormError` có sẵn); lỗi chung hiện đầu form | Như form tài khoản |

## API

Prefix `/api/v1`. Mọi route cần đăng nhập.

| Method | Path | Quyền | Body | Response |
|---|---|---|---|---|
| GET | `/classes` | Đăng nhập (lọc theo phạm vi) | | 200 `Class[]` (sắp theo tên) |
| POST | `/classes` | MANAGER | `{ name, teacherId, note? }` | 201 `Class` |
| PATCH | `/classes/:id` | MANAGER | một phần của body trên | 200 `Class` |
| DELETE | `/classes/:id` | MANAGER | | 204 |
| GET | `/students` | Đăng nhập (lọc theo phạm vi) | query `classId?` | 200 `Student[]` (sắp theo tên) |
| GET | `/students/:id` | Đăng nhập (trong phạm vi) | | 200 `Student` |
| POST | `/students` | Đăng nhập (lớp trong phạm vi) | `StudentInput` | 201 `Student` |
| PATCH | `/students/:id` | Đăng nhập (trong phạm vi, lớp mới cũng trong phạm vi) | một phần của `StudentInput` | 200 `Student` |
| DELETE | `/students/:id` | Đăng nhập (trong phạm vi) | | 204 |

```ts
type Class = { id: string; name: string; note: string; teacher: { id: string; fullName: string; isActive: boolean }; studentCount: number };
type StudentInput = { classId: string; name: string; birthDate: string; gender: "MALE" | "FEMALE"; guardian: string; phone: string; address?: string; note?: string };
type Student = StudentInput & { id: string; address: string; note: string };
```

Mã lỗi mới: `CLASS_NOT_FOUND` 404, `STUDENT_NOT_FOUND` 404, `CLASS_NAME_TAKEN` 409, `CLASS_NOT_EMPTY` 409, `TEACHER_NOT_FOUND` 422, `TEACHER_INACTIVE` 422, `VALIDATION_FAILED` 400 (đã có).

## Mô hình dữ liệu

```prisma
enum Gender { MALE FEMALE }

model Class {
  id        String    @id @default(uuid()) @db.Uuid
  name      String
  note      String    @default("")
  teacherId String    @db.Uuid
  teacher   User      @relation(fields: [teacherId], references: [id], onDelete: Restrict)
  students  Student[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([teacherId])
}

model Student {
  id        String    @id @default(uuid()) @db.Uuid
  classId   String    @db.Uuid
  class     Class     @relation(fields: [classId], references: [id], onDelete: Restrict)
  name      String
  birthDate DateTime  @db.Date
  gender    Gender
  guardian  String
  phone     String
  address   String    @default("")
  note      String    @default("")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([classId])
}
```

## Project Structure

```
backend/src/modules/roster/
├── domain/        school-class.ts, student.ts (+ .spec), access-policy.ts (+ .spec), roster-errors.ts, ports.ts
├── application/   list/create/update/delete-class.use-case.ts, list/get/create/update/delete-student.use-case.ts, student-access.ts
├── infrastructure/prisma-class.repository.ts, prisma-student.repository.ts
├── http/          classes.controller.ts, students.controller.ts, *.dto.ts
├── roster.module.ts, index.ts
backend/prisma/    schema.prisma, migrations/*_roster (kèm partial unique index)
backend/src/cli/seed-demo.ts                       # thêm lớp, học sinh demo
backend/test/{classes,students}.e2e-spec.ts

frontend/src/features/roster/                      # MỚI: api, queries, query-keys, types
frontend/src/features/school/{types,use-school-management,data}.ts  # id → string; bỏ mock lớp/học sinh
frontend/src/app/portal/page.tsx                   # lấy lớp/học sinh từ useClasses/useStudents; loading, lỗi
frontend/src/components/school/{entity-modal,class-overview,student-list,student-profile}.tsx
```

## Testing Strategy

| Mức | Nội dung |
|---|---|
| Unit (BE) | `SchoolClass`/`Student`: chuẩn hóa và kiểm tra trường (trim, độ dài, ngày sinh trong khoảng, điện thoại). `AccessPolicy`: Quản lý thấy mọi lớp; Giáo viên chỉ lớp mình; chuyển học sinh sang lớp không thuộc mình bị từ chối. Use case xóa lớp còn học sinh → `CLASS_NOT_EMPTY`. Use case ghi audit đúng |
| E2E (BE) | Mỗi endpoint: thành công, 401, 403 (giáo viên sửa lớp), 404 (giáo viên xem học sinh lớp khác), 400 (body sai), 409 (trùng tên lớp, xóa lớp còn học sinh). Xóa mềm: học sinh biến mất khỏi danh sách nhưng còn trong DB. Tên lớp đã xóa dùng lại được. Mỗi thao tác ghi đúng 1 dòng audit |
| FE | `pnpm build`, `pnpm test`. `a11y-check`, `layout-check`, `screenshot` chạy với dữ liệu demo (đăng nhập Quản lý). Kiểm tra bằng tay: đăng nhập `linh@demo.local` chỉ thấy Lớp Mầm Xanh và 3 học sinh |

## Boundaries

- **Always:** lọc phạm vi trong câu truy vấn, không lọc sau khi lấy hết; mọi thay đổi qua `uow.run` + audit; thông báo lỗi tiếng Việt.
- **Ask first:** thêm thư viện; đổi quyền của Giáo viên; xóa cứng dữ liệu ngoài lệnh `--clean` của demo.
- **Never:** trả dữ liệu học sinh ngoài phạm vi; xóa cứng lớp/học sinh qua API; ghi dữ liệu cá nhân của trẻ ra log.

## Success Criteria

1. Thêm lớp, học sinh trên portal, tải lại trang vẫn còn.
2. Đăng nhập `linh@demo.local`: chỉ thấy Lớp Mầm Xanh và 3 học sinh; dán link hồ sơ học sinh lớp khác thì thấy "Không tìm thấy học sinh."
3. Không xóa được lớp còn học sinh, kể cả gọi API trực tiếp.
4. Học sinh đã xóa vẫn còn trong DB với `deletedAt`.
5. Mọi thay đổi có dòng `AuditLog` tương ứng.
6. Tab Đánh giá và Báo cáo vẫn chạy với mock (khóa theo id mới).
7. Backend `lint`, `test`, `test:e2e`, `build`; Frontend `build`, `test`, `a11y-check`, `layout-check` không lỗi.

## Open Questions

Đã chốt (2026-11-13):
1. Giáo viên được xóa (mềm) học sinh trong lớp mình.
2. Giáo viên được thêm học sinh vào lớp mình.
3. Gán lớp cho tài khoản Quản lý được.
