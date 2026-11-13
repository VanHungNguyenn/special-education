# Todo: Module `auth`

Kế hoạch: [plan.md](plan.md). Spec: [SPEC-auth.md](../../SPEC-auth.md).

Definition of Done cho mọi task:
- backend: `pnpm lint && pnpm test && pnpm test:e2e && pnpm build`;
- frontend (khi có sửa): `pnpm build && pnpm test`;
- không có comment trong code; mọi thông báo cho người dùng bằng tiếng Việt.

## Phase 1: Backend

### B1: Domain `User`/`Session`, mật khẩu, schema + migration ✅

**Description:** Thêm model `User`, `Session`, enum `Role` vào Prisma và tạo migration `auth`. Trong `src/modules/auth/domain/`:
- `User`: kiểm tra có được đăng nhập không, ghi nhận đăng nhập sai/đúng, vô hiệu hóa/kích hoạt, đổi vai trò, đổi mật khẩu;
- `Session`: thời hạn 12 giờ / 30 ngày, có cần gia hạn không;
- `password-policy` (8–128 ký tự), chuẩn hóa email;
- các port `UserRepository`, `SessionRepository`, `PasswordHasher`, `Clock` và các lỗi nghiệp vụ.

`infrastructure/`: `ScryptPasswordHasher`, `SystemClock`.

**Acceptance criteria:**
- [x] Unit test cho `User`:
  - lần sai thứ 5 thì khóa 15 phút; hết 15 phút thì đăng nhập được;
  - đăng nhập đúng thì bộ đếm về 0;
  - tài khoản bị vô hiệu hóa thì nhận `ACCOUNT_DISABLED`.
- [x] Unit test cho `Session`:
  - không tích "Ghi nhớ": hết hạn sau 12 giờ, không gia hạn;
  - có tích: 30 ngày, chỉ gia hạn khi lần dùng trước đã cách hơn 1 giờ.
- [x] Unit test cho hasher:
  - hash rồi verify đúng; sai mật khẩu trả về false;
  - chuỗi hash hỏng trả về false (không ném lỗi);
  - hai lần hash cùng mật khẩu cho kết quả khác nhau;
  - có in thời gian một lần hash.
- [x] Migration áp dụng được vào DB dev và DB test.

**Ghi chú khi làm:** scrypt N=2^17 mất khoảng 200ms trên máy dev, 290ms trong container Alpine (dưới ngưỡng 500ms). Quy tắc "Quản lý cuối cùng" là hàm thuần `assertManagerChangeAllowed` trong `domain/manager-rules.ts`. Các port nằm chung trong `domain/ports.ts`.

**Verification:** `pnpm test`, `pnpm db:migrate`, `pnpm test:e2e`
**Dependencies:** platform
**Files:** `prisma/schema.prisma`, `prisma/migrations/*_auth`, `src/modules/auth/domain/*`, `src/modules/auth/infrastructure/{scrypt-password-hasher,system-clock}.ts`
**Scope:** M

### B2: Đăng nhập, `me`, đăng xuất, guard toàn cục ✅

**Description:**
- Prisma repository cho user và session.
- Các use case `Login`, `AuthenticateSession`, `GetCurrentUser`, `Logout`.
- `AuthController` (`POST /auth/login`, `GET /auth/me`, `POST /auth/logout`) và `session-cookie.ts` (đặt/xóa cookie theo `remember` và `COOKIE_SECURE`).
- `SessionGuard` đăng ký bằng `APP_GUARD`; decorator `@Public()` và `@CurrentUser()`.
- Thêm `cookie-parser` vào `configureApp`; thêm `COOKIE_SECURE` vào `Env`.
- Gắn `@Public()` cho health; docs vốn không đi qua guard.
- Helper e2e `test/utils/auth.ts`: `createUser(app, data)` và `loginAs(app, user)` trả về một agent có cookie. Sửa e2e của `_template` để đăng nhập trước.

**Acceptance criteria:**
- [x] e2e: đăng nhập đúng trả về 200 và `User` (không có `passwordHash`).
  - Cookie `sid` có `HttpOnly`, `SameSite=Lax`, `Path=/`.
  - `remember=false` thì không có `Max-Age`/`Expires`; `remember=true` thì có `Max-Age` 30 ngày.
- [x] e2e: sai email và sai mật khẩu nhận cùng `401 INVALID_CREDENTIALS` với cùng message.
- [x] e2e:
  - `GET /auth/me` không có cookie hoặc cookie rác: `401 UNAUTHENTICATED`;
  - đăng xuất xong, dùng lại cookie cũ: 401;
  - `/health` vẫn trả về 200 khi không đăng nhập.
- [x] Bảng `Session` chỉ chứa `tokenHash` (64 ký tự hex), không chứa token gốc.

**Ghi chú khi làm:**
- Thứ tự kiểm tra trong `Login`: đang khóa thì báo khóa (trước khi kiểm tra mật khẩu, nên khóa có tác dụng kể cả khi nhập đúng); rồi kiểm tra mật khẩu; **chỉ khi mật khẩu đúng** mới báo "đã vô hiệu hóa". Người đoán mò không biết tài khoản bị vô hiệu hóa.
- Phiên "Ghi nhớ" được gia hạn thì guard đặt lại cookie (`Max-Age` mới), để cookie không hết hạn trước phiên.
- `COOKIE_SECURE` đọc `"false"`/`"true"` bằng `@Transform`, vì chuyển kiểu ngầm biến chuỗi `"false"` thành `true`.
- Các module khác import qua `modules/auth/index.ts` (`Public`, `Roles`, `CurrentUser`, `CurrentSession`, `AuthModule`).
- Không làm use case `GetCurrentUser`: guard đã nạp user, `GET /auth/me` chỉ trả về user đó.

**Verification:** `pnpm test:e2e`, `pnpm lint`
**Dependencies:** B1
**Files:** `src/modules/auth/{application,infrastructure,http}/*`, `auth.module.ts`, `src/app.module.ts`, `src/app.setup.ts`, `src/config/env.validation.ts`, `test/utils/auth.ts`, `test/auth.e2e-spec.ts`, `test/template.e2e-spec.ts`
**Scope:** L (nhiều file nhỏ; không tách được vì guard và đăng nhập phải có cùng lúc thì e2e mới chạy được)

### B3: Khóa sau 5 lần sai, thời gian phản hồi đồng đều ✅

**Description:** Nối quy tắc khóa của domain vào `Login`:
- ghi lại số lần sai;
- trả `423 ACCOUNT_LOCKED` kèm số phút còn lại;
- chạy hash giả khi email không tồn tại.

**Acceptance criteria:**
- [x] e2e: 5 lần sai, lần 6 dù đúng mật khẩu vẫn nhận 423, message có số phút.
- [x] Unit (với `Clock` giả): sau 15 phút thì đăng nhập được.
- [x] e2e: thời gian trung bình (5 lần) giữa email không tồn tại và sai mật khẩu chênh nhau dưới 50%.

**Ghi chú khi làm:** Phần hiện thực đã có từ B1–B2, nên các test này qua ngay từ lần chạy đầu: chúng là bằng chứng, không phải TDD đỏ trước. Thêm bản giả trong `test/fakes/auth-fakes.ts` (repository trong bộ nhớ, `FakeClock`, `FakeHasher`) để unit test use case. Test thời gian phản hồi dùng 4 lần sai, ít hơn ngưỡng khóa, để tài khoản không bị khóa giữa chừng.

**Dependencies:** B2 · **Scope:** S

### B4: Tự đổi mật khẩu ✅

**Description:** `PUT /auth/me/password` `{ currentPassword, newPassword }`. Đổi xong thì xóa mọi phiên khác của người đó, giữ phiên hiện tại.

**Acceptance criteria:**
- [x] e2e:
  - sai mật khẩu hiện tại: `400 WRONG_PASSWORD`;
  - mật khẩu mới dưới 8 ký tự: `400 VALIDATION_FAILED`.
- [x] e2e: hai phiên A và B; đổi mật khẩu bằng A thì B nhận 401, A vẫn dùng được. Mật khẩu mới đăng nhập được, mật khẩu cũ thì không.

**Dependencies:** B2 · **Scope:** S

### B5: `RolesGuard`, danh sách và tạo tài khoản

**Description:** Decorator `@Roles('MANAGER')` + `RolesGuard`.
- `GET /users`: sắp theo họ tên.
- `POST /users`: email chuẩn hóa, trùng thì `409 EMAIL_TAKEN`.

**Acceptance criteria:**
- [ ] e2e: Giáo viên gọi `/users` nhận `403 FORBIDDEN`; chưa đăng nhập nhận 401.
- [ ] e2e: Quản lý tạo tài khoản được (201), người mới đăng nhập được. Email trùng (khác hoa thường) nhận 409.
- [ ] e2e: body thiếu hoặc sai trường (role lạ, email sai, thừa trường) nhận 400 kèm `details`.

**Dependencies:** B2 · **Scope:** M

### B6: Sửa, vô hiệu hóa, đặt lại mật khẩu, quy tắc Quản lý cuối cùng

**Description:**
- `PATCH /users/:id` (email, họ tên, điện thoại, vai trò, `isActive`).
- `PUT /users/:id/password`.
- Quy tắc `LAST_MANAGER` và `CANNOT_CHANGE_SELF` nằm trong domain/use case.
- Vô hiệu hóa hoặc đặt lại mật khẩu thì xóa mọi phiên của người đó. Đặt lại mật khẩu thì mở khóa.

**Acceptance criteria:**
- [ ] Unit: không vô hiệu hóa hay hạ vai trò Quản lý cuối cùng đang hoạt động; Quản lý không tự vô hiệu hóa hay tự hạ vai trò.
- [ ] e2e: vô hiệu hóa giáo viên thì phiên đang mở của người đó nhận 401, và đăng nhập lại nhận `403 ACCOUNT_DISABLED`.
- [ ] e2e: đặt lại mật khẩu cho tài khoản đang bị khóa thì đăng nhập ngay bằng mật khẩu mới được.
- [ ] e2e: id không tồn tại nhận `404 USER_NOT_FOUND`; id không phải UUID nhận 400.

**Dependencies:** B5 · **Scope:** M

### B7: Seed, CLI tạo Quản lý, seed demo, dọn phiên hết hạn

**Description:**
- `src/cli/create-manager.ts`:
  - đọc `SEED_MANAGER_*`;
  - không có Quản lý nào thì tạo, đã có thì thoát 0 và in ra thông báo;
  - dùng lại `CreateUser` qua `NestFactory.createApplicationContext`.
- `prisma/seed.ts` gọi lại CLI này.
- `prisma/seed-demo.ts`: tạo 1 Quản lý và 3 Giáo viên `@demo.local`, mật khẩu `demo2026`; `--clean` xóa mọi user `@demo.local`.
- Lúc app khởi động: xóa các phiên đã hết hạn.

**Acceptance criteria:**
- [ ] Chạy `pnpm db:seed` hai lần: chỉ có một Quản lý.
- [ ] Trong container production: `docker compose exec -e SEED_MANAGER_EMAIL=… backend node dist/cli/create-manager.js` tạo được tài khoản và đăng nhập được.
- [ ] `pnpm db:seed:demo` rồi `pnpm db:seed:demo --clean`: không còn user `@demo.local`.
- [ ] Thiếu biến `SEED_MANAGER_*` thì báo rõ thiếu biến nào.

**Dependencies:** B5 · **Scope:** M

## Checkpoint BE
- [ ] `pnpm lint && pnpm test && pnpm test:e2e && pnpm build` không lỗi
- [ ] Success Criteria 2–6 chứng minh được

## Phase 2: Frontend

### F1: Nền tảng `lib/api` + TanStack Query

**Description:** Cài `@tanstack/react-query` (bản ổn định đã phát hành ít nhất hai tuần).
- `lib/api/api-error.ts`.
- `lib/api/http-client.ts`: `request<T>(path, { method, body })`, luôn `credentials: "same-origin"`, parse `{ error }` thành `ApiError`, 204 trả `undefined`, lỗi mạng thành `ApiError(0, "NETWORK_ERROR", "Không kết nối được máy chủ…")`.
- `lib/api/query-provider.tsx`: `QueryClient` với `retry` bỏ qua lỗi 4xx; `QueryCache` và `MutationCache` có `onError`: gặp 401 thì xóa cache và chuyển `/login?next=…`.
- Bọc provider trong `app/layout.tsx`.

**Acceptance criteria:**
- [ ] Unit (`node:test`):
  - `request` parse đúng lỗi BE thành `ApiError` (code, message, status);
  - 204 trả về `undefined`;
  - lỗi mạng ra `NETWORK_ERROR`.
- [ ] Trang `/` vẫn là server component và render như cũ (`pnpm build` báo `/` là static).

**Dependencies:** Checkpoint BE · **Scope:** M

### F2: Màn hình đăng nhập thật + chặn `/portal`

**Description:**
- `features/auth/` gồm `api`, `queries`, `query-keys`, `types`; các hook `useMe`, `useLogin`, `useLogout`, `useChangePassword`.
- Trang `/login`:
  - bỏ giá trị demo điền sẵn;
  - ô "Ghi nhớ" gửi `remember`;
  - lỗi hiện trong `role="alert"`;
  - thành công thì chuyển tới `next` (chỉ nhận đường dẫn bắt đầu bằng `/` và không bắt đầu bằng `//`), mặc định `/portal`.
- `src/proxy.ts`: matcher `/portal/:path*`; không có cookie `sid` thì chuyển `/login?next=<path+query>`.

**Acceptance criteria:**
- [ ] Không có cookie, vào `/portal?tab=reports` thì nhận 307 tới `/login?next=%2Fportal%3Ftab%3Dreports`.
- [ ] Đăng nhập đúng thì về đúng `next`. Sai thì hiện thông báo của BE, focus vẫn ở form.
- [ ] `next=https://evil.com` hoặc `next=//evil.com` thì về `/portal`.

**Dependencies:** F1 · **Scope:** M

### F3: Menu tài khoản, đổi mật khẩu, đăng xuất

**Description:** `AccountMenu` dùng `useMe()`:
- tên, email, điện thoại, vai trò thật; avatar dùng `nameInitial`;
- thêm mục "Đổi mật khẩu" (dialog: mật khẩu hiện tại, mới, nhập lại);
- "Đăng xuất" gọi API, xóa cache, về `/login`.

**Acceptance criteria:**
- [ ] Menu hiện đúng thông tin người đăng nhập (đổi tài khoản thì đổi theo).
- [ ] Đổi mật khẩu: nhập lại không khớp thì báo ngay ở FE; sai mật khẩu hiện tại thì hiện lỗi của BE; thành công thì thông báo và đóng dialog.
- [ ] Đăng xuất xong, bấm "Back" về `/portal` thì bị chuyển lại `/login`.

**Dependencies:** F2 · **Scope:** M

### F4: Tab Tài khoản cho Quản lý

**Description:**
- Thêm `accounts` vào `TabId`; mục điều hướng chỉ hiện khi `me.role === "MANAGER"`. `?tab=accounts` với giáo viên thì về tab mặc định.
- `features/users/` gồm `api` + hook (`useUsers`, `useCreateUser`, `useUpdateUser`, `useResetPassword`).
- `components/school/account-list.tsx`:
  - bảng/danh sách responsive (theo kiểu `StudentList`), có trạng thái;
  - dialog tạo/sửa (shadcn `Dialog`, `Field`, `SelectField`; nút "Tạo ngẫu nhiên" mật khẩu 12 ký tự bằng `crypto.getRandomValues`);
  - dialog đặt lại mật khẩu;
  - nút vô hiệu hóa/kích hoạt có `ConfirmDialog`.

**Acceptance criteria:**
- [ ] Giáo viên không thấy tab. Quản lý tạo, sửa, vô hiệu hóa, đặt lại mật khẩu được; danh sách tự cập nhật (invalidate `userKeys.lists()`).
- [ ] Lỗi BE (`EMAIL_TAKEN`, `LAST_MANAGER`…) hiện ngay trong dialog.
- [ ] Hiển thị đúng ở 375, 768 và 1440px; mọi nút đạt kích thước chạm theo quy ước.

**Dependencies:** F3 · **Scope:** L (danh sách cùng ba dialog; tách nhỏ hơn thì không thử được trọn luồng)

### F5: Công cụ kiểm tra tự đăng nhập; thử trên trình duyệt thật

**Description:**
- Helper đăng nhập dùng chung cho `a11y-check`, `layout-check`, `screenshot`: gọi API login trong context Playwright với `CHECK_EMAIL`/`CHECK_PASSWORD`, mặc định là tài khoản demo.
- Thêm `/portal?tab=accounts` vào danh sách trang của `a11y-check`.
- Script `scripts/auth-flow.mjs` chạy luồng: chưa đăng nhập bị chuyển về login, đăng nhập, tải lại vẫn còn phiên, đăng xuất.

**Acceptance criteria:**
- [ ] Với `./docker.sh dev` và dữ liệu demo: `a11y-check`, `layout-check`, `auth-flow` đều không lỗi.
- [ ] `auth-flow` cũng chạy được với `./docker.sh` (production ở local, cookie `Secure` qua `http://localhost`).
- [ ] BE không chạy thì script báo lỗi rõ ràng, không treo.

**Dependencies:** F4 · **Scope:** M

### F6: Tài liệu

**Acceptance criteria:**
- [ ] `RUNNING.md`: seed demo, tài khoản demo, các lệnh kiểm tra cần BE chạy.
- [ ] `docs/deployment.md`: lệnh tạo Quản lý đầu tiên trên server (email để placeholder), `COOKIE_SECURE`.
- [ ] `backend/CLAUDE.md`: `@Public`, `@Roles`, `@CurrentUser`, helper `loginAs` trong e2e.
- [ ] `frontend/CLAUDE.md` và `frontend/docs/*`: cấu trúc `lib/api`, `features/auth`, `features/users`; mục "đăng nhập giả lập" không còn nữa.
- [ ] `docs/architecture.md`: hash mật khẩu bằng scrypt (thay cho argon2/bcrypt).
- [ ] Không có link hỏng.

**Dependencies:** F5 · **Scope:** S

## Checkpoint hoàn thành
- [ ] Success Criteria 1–7 của SPEC-auth.md
- [ ] Review với chủ dự án
