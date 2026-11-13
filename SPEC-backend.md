# Spec: Backend v1 (bản đồ module và kiến trúc chung)

Trạng thái: **chờ duyệt**. Kiến trúc và design pattern: [docs/architecture.md](docs/architecture.md). File này là chỉ mục cho các spec module (`SPEC-<module>.md`) và chứa những quyết định áp dụng cho mọi module. Spec FE tab Báo cáo vẫn nằm ở [SPEC.md](SPEC.md); module `reports` sẽ trả lời các câu hỏi mở về API tải báo cáo trong đó.

## Mục tiêu

Thay dữ liệu giả của FE bằng backend thật cho một trung tâm:

- giáo viên đăng nhập, quản lý học sinh trong lớp mình phụ trách;
- giáo viên lập phiếu "Kế hoạch giáo dục cá nhân" hằng tháng;
- hệ thống xuất phiếu ra PDF **đúng theo mẫu `Mau_GDCN.pdf`**.

**Mẫu GDCN là nguồn chuẩn cao nhất.** Mọi ô điền được trong mẫu phải có trường dữ liệu tương ứng. Nếu FE hiện tại lệch mẫu, sửa FE cho khớp mẫu.

## Capability map

| Module id | Trách nhiệm | Phụ thuộc | Spec |
|---|---|---|---|
| `platform` | Khung NestJS, PostgreSQL + Prisma, cấu hình, định dạng lỗi, healthcheck, Docker, CI, nối FE → BE | — | [SPEC-platform.md](SPEC-platform.md) ✅ |
| `auth` | Đăng nhập/đăng xuất, phiên, vai trò Quản lý/Giáo viên, quản lý tài khoản | platform | [SPEC-auth.md](SPEC-auth.md) ✅ |
| `audit` | Lịch sử chỉnh sửa (ai, khi nào, trước/sau) | auth | chưa viết |
| `roster` | Lớp (gắn tài khoản giáo viên), học sinh (xóa mềm), phạm vi xem theo lớp | auth, audit | chưa viết |
| `evaluations` | Danh mục tiêu chí (Quản lý thêm/sửa/ẩn, seed theo mẫu GDCN), phiếu tháng với snapshot tiêu chí, mục tiêu can thiệp + đánh giá, khóa/mở khóa | roster, audit | chưa viết |
| `reports` | Tổng hợp tiến độ tháng, xuất PDF theo mẫu GDCN | evaluations | chưa viết |

Thứ tự làm: `platform → auth → audit → roster → evaluations → reports`. Mỗi module đi đủ vòng Spec → Plan → Tasks → Implement, và **bao gồm cả phần nối FE** vào API của module đó. Làm xong module nào là module đó chạy thật được trên giao diện.

## Quyết định đã chốt

| Chủ đề | Quyết định |
|---|---|
| Stack | NestJS 12 (ESM) + TypeScript, Node 22, pnpm |
| Database | PostgreSQL chạy trong Docker (cả dev và server), không cài lên máy; sau này chọn giữa **Neon** và **Supabase**. Chưa cần backup |
| Repo | `frontend/` và `backend/` là 2 project pnpm độc lập, **không dùng chung kiểu dữ liệu**; hợp đồng là HTTP API + OpenAPI |
| Cổng | FE 3000, BE 4000, DB 5432. Chỉ 3000 mở ra ngoài |
| Tính di động của DB | Chỉ dùng PostgreSQL chuẩn qua Prisma. **Không dùng** Supabase Auth, Storage, RLS hay Edge Functions. Đổi nhà cung cấp chỉ cần đổi `DATABASE_URL` / `DIRECT_URL` |
| ORM | Prisma: schema và migration nằm trong repo |
| Vai trò | `MANAGER` (toàn quyền, quản lý tài khoản, mở khóa phiếu) và `TEACHER` (chỉ thấy lớp mình phụ trách) |
| Phân công | Một lớp có một giáo viên phụ trách; một giáo viên có thể phụ trách nhiều lớp |
| Xác thực | Phiên lưu trong Postgres, gửi qua cookie `httpOnly`. Không tự đăng ký. Quản lý đặt lại mật khẩu (không bắt buộc đổi ở lần đăng nhập đầu). Phiên 12 giờ, hoặc 30 ngày khi tích "Ghi nhớ". Sai 5 lần thì khóa 15 phút. Tài khoản Quản lý đầu tiên tạo bằng lệnh seed |
| Phiếu đánh giá | Mỗi tiêu chí gồm **nhiều mục tiêu can thiệp**, mỗi mục tiêu có đánh giá riêng (`+`, `+/-`, `-`, hoặc chưa đánh giá). Không giới hạn số mục tiêu |
| Tiêu chí | **Linh động**: Quản lý thêm/sửa/sắp xếp/ẩn. Seed ban đầu theo đúng mẫu GDCN. Phiếu chép snapshot tiêu chí lúc tạo, nên sửa danh mục không làm đổi phiếu cũ |
| Trị liệu viên trên phiếu | Giáo viên phụ trách lớp của học sinh |
| Dữ liệu thử | `db:seed:demo` nạp dữ liệu mẫu từ mock FE để test, xóa được sạch khi không cần |
| Phần ý kiến và chữ ký | In trống trên PDF để viết tay, không lưu trong hệ thống |
| Lịch sử | Ghi audit cho mọi thay đổi trên lớp, học sinh và phiếu |
| Xóa học sinh | Xóa mềm (`deletedAt`). Phiếu cũ vẫn được giữ |
| Xuất báo cáo | PDF, tạo từ HTML template bằng Chromium headless (Playwright). Tạo xong trả thẳng file về, không lưu trữ file |
| FE lấy dữ liệu | **TanStack Query** cho server state, tổ chức theo SOLID: `lib/api/http-client` → `features/<tên>/api.ts` → `queries.ts` → component. Xem [docs/architecture.md](docs/architecture.md#3-frontend-tanstack-query--solid) |
| FE gọi BE | FE gọi `/api/*` cùng domain, Next rewrite sang service backend. Không cần CORS, không nhúng URL API lúc build |

## Kiến trúc phân lớp

Mỗi module là một NestJS module, chia thành 4 lớp. **Phụ thuộc chỉ đi vào trong:** `http → application → domain`, còn `infrastructure` hiện thực các interface mà `domain` khai báo.

```
backend/src/modules/<module>/
├── domain/           # Thực thể, value object, quy tắc nghiệp vụ, lỗi nghiệp vụ, interface repository.
│                     # TypeScript thuần: không import @nestjs, @prisma, express.
├── application/      # Use case (mỗi thao tác một class). Điều phối domain + repository + audit.
│                     # Không biết HTTP, không biết Prisma.
├── infrastructure/   # Prisma repository, mapper giữa bản ghi Prisma và thực thể domain, adapter bên ngoài (PDF…).
├── http/             # Controller, DTO request/response (class-validator), guard theo vai trò.
└── <module>.module.ts  # Nối interface repository với implementation (DI token).
```

Quy tắc giữa các lớp:

- Controller chỉ làm ba việc: kiểm tra input (DTO), gọi một use case, map kết quả sang DTO response. Không có logic nghiệp vụ.
- Use case nhận repository qua interface (DI token), nên unit test chỉ cần repository giả trong bộ nhớ, không cần DB.
- Quy tắc nghiệp vụ (phiếu đã khóa thì không sửa, trạng thái chỉ đi một chiều, lớp còn học sinh thì không xóa) nằm trong `domain/` và có unit test.
- Kiểu Prisma không được lọt ra khỏi `infrastructure/`. Response API không trả thẳng bản ghi Prisma.
- Module khác chỉ dùng module này qua những gì nó `export` (use case hoặc service công khai). Không import file nội bộ của module khác.
- Khi thêm tính năng: thêm use case mới, không phình use case cũ. Thêm thực thể mới: thêm repository mới.

Phần dùng chung:

```
backend/src/
├── main.ts               # bootstrap
├── app.setup.ts          # configureApp(): prefix /api/v1, ValidationPipe, filter lỗi, swagger (auth thêm cookie-parser)
├── app.module.ts
├── config/               # đọc và kiểm tra biến môi trường lúc khởi động
├── prisma/               # PrismaService (một kết nối cho cả app)
├── common/
│   ├── errors/           # DomainError (code + message tiếng Việt) và filter map sang HTTP
│   └── http/             # decorator, pipe dùng chung
└── modules/              # platform không có module nghiệp vụ; các module khác thêm vào đây
```

## Quy ước API

- Prefix: `/api/v1`. Đổi hợp đồng không tương thích thì lên `/api/v2`, không sửa ngầm.
- Lỗi luôn có cùng một dạng, và `message` bằng tiếng Việt để FE hiện thẳng cho người dùng:
  ```json
  { "error": { "code": "EVALUATION_LOCKED", "message": "Phiếu đã khóa, không thể sửa.", "details": [] } }
  ```
  `details` dùng cho lỗi validation: `[{ "field": "birthDate", "message": "Ngày sinh không hợp lệ." }]`.
- ID là UUID (string). FE đang dùng `number`, nên sẽ đổi khi nối module `roster`.
- Ngày có định dạng `YYYY-MM-DD`, tháng `YYYY-MM`, thời điểm là ISO 8601 UTC. Múi giờ nghiệp vụ là `Asia/Ho_Chi_Minh` (ví dụ dùng để xác định "tháng hiện tại").
- Có OpenAPI tự sinh (`@nestjs/swagger`) tại `/api/v1/docs`. Chỉ bật khi không phải production.

## Mô hình dữ liệu (tổng quan, chi tiết ở từng spec module)

```
User(id, email, passwordHash, fullName, phone, role, isActive)            ← auth
Session(id, userId, tokenHash, expiresAt)                                  ← auth
AuditLog(id, actorId, entityType, entityId, action, before, after, at)     ← audit
Class(id, name, note, teacherId → User, deletedAt)                         ← roster
Student(id, classId, name, birthDate, gender, guardian, phone, address, note, deletedAt)  ← roster
Criterion(id, name, groupName?, position, isActive)                        ← evaluations (danh mục, seed theo mẫu GDCN)
Evaluation(id, studentId, month, status, therapistName?, lockedAt, lockedById)  ← evaluations, unique(studentId, month)
EvaluationCriterion(id, evaluationId, criterionId, name, groupName?, position)  ← snapshot lúc tạo phiếu
EvaluationGoal(id, evaluationCriterionId, content, result?, position)       ← evaluations
```

## Câu hỏi mở chung

Đã trả lời hết (cổng, Docker, repo tách riêng, chưa backup, tiêu chí linh động, có dữ liệu demo).
