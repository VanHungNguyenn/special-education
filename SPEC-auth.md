# Spec: Module `auth`

Trạng thái: **đã duyệt** (2026-11-13). Plan: [tasks/auth/plan.md](tasks/auth/plan.md). Thuộc [SPEC-backend.md](SPEC-backend.md), phụ thuộc module `platform` (đã xong). Kiến trúc: [docs/architecture.md](docs/architecture.md).

## Objective

Thay đăng nhập giả lập bằng đăng nhập thật, và cho Quản lý quản lý tài khoản ngay trong portal. Đây cũng là module đầu tiên FE gọi API, nên nó dựng luôn nền TanStack Query cho FE (`lib/api/`).

### Người dùng

| Vai trò | Làm được gì trong module này |
|---|---|
| Giáo viên (`TEACHER`) | Đăng nhập, đăng xuất, xem thông tin của mình, tự đổi mật khẩu |
| Quản lý (`MANAGER`) | Như giáo viên, thêm tab **Tài khoản**: tạo tài khoản, sửa thông tin và vai trò, vô hiệu hóa/kích hoạt lại, đặt lại mật khẩu |

### User stories và acceptance criteria

**US1. Đăng nhập**
1. Nhập đúng email và mật khẩu thì vào `/portal`. Email không phân biệt hoa thường và bỏ khoảng trắng hai đầu.
2. Sai email hoặc sai mật khẩu đều nhận **cùng một** thông báo: "Email hoặc mật khẩu không đúng." Không để lộ email nào tồn tại.
3. Phiên đăng nhập:
   - **không tích** "Ghi nhớ đăng nhập": cookie mất khi đóng trình duyệt, và phiên hết hạn sau tối đa **12 giờ** kể từ lúc đăng nhập;
   - **có tích**: phiên giữ **30 ngày**, tự gia hạn thêm 30 ngày khi còn dùng (gia hạn tối đa mỗi giờ một lần để đỡ ghi DB).
4. Sai mật khẩu **5 lần liên tiếp** thì tài khoản bị khóa **15 phút**, kể cả khi nhập đúng trong thời gian khóa. Thông báo nêu số phút còn lại. Đăng nhập đúng thì bộ đếm về 0.
5. Tài khoản đã vô hiệu hóa không đăng nhập được: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản lý trung tâm."
6. Bỏ email và mật khẩu demo đang điền sẵn trên form.

**US2. Bảo vệ portal**
1. Chưa đăng nhập mà vào `/portal` thì bị chuyển sang `/login?next=/portal…`; đăng nhập xong quay lại đúng trang cũ (chỉ chấp nhận đường dẫn nội bộ bắt đầu bằng `/`).
2. Phiên hết hạn giữa chừng: request API đầu tiên nhận 401, FE xóa cache và chuyển về `/login`.
3. **Mọi API đều cần đăng nhập**, trừ `POST /auth/login`, `/health` và `/docs`. Route nào muốn công khai phải ghi rõ `@Public()`.

**US3. Tài khoản của tôi**
1. Menu tài khoản hiện họ tên, email, điện thoại, vai trò thật. Chữ cái trên avatar lấy từ tên.
2. "Đổi mật khẩu": nhập mật khẩu hiện tại và mật khẩu mới (8–128 ký tự). Đổi xong thì **mọi phiên khác** của người đó bị đăng xuất; phiên đang dùng giữ nguyên.
3. "Đăng xuất": xóa phiên trên server, xóa cookie, chuyển về `/login`.

**US4. Quản lý tài khoản (chỉ `MANAGER`)**
1. Tab "Tài khoản" chỉ hiện với Quản lý. Giáo viên gọi API quản lý tài khoản nhận 403.
2. Danh sách hiện: họ tên, email, điện thoại, vai trò, trạng thái (Đang hoạt động / Đã vô hiệu hóa / Tạm khóa đến HH:mm).
3. Tạo tài khoản gồm email, họ tên, điện thoại, vai trò và mật khẩu ban đầu (8–128 ký tự; form có nút "Tạo ngẫu nhiên"). Email trùng thì báo "Email đã được dùng cho tài khoản khác."
4. Sửa được họ tên, email, điện thoại, vai trò.
5. Vô hiệu hóa thì mọi phiên của người đó bị đăng xuất ngay. Kích hoạt lại thì đăng nhập được như cũ. **Không có xóa tài khoản**: tài khoản còn gắn với lịch sử chỉnh sửa và lớp học.
6. Đặt lại mật khẩu: Quản lý nhập mật khẩu mới; mọi phiên của người đó bị đăng xuất, tài khoản được mở khóa (nếu đang tạm khóa).
7. **Luôn còn ít nhất một Quản lý đang hoạt động:** không thể vô hiệu hóa hay hạ vai trò Quản lý cuối cùng. Quản lý cũng không tự vô hiệu hóa hay tự hạ vai trò của mình.

**US5. Tài khoản đầu tiên**
1. Môi trường dev: `pnpm db:seed` tạo Quản lý từ `SEED_MANAGER_EMAIL`, `SEED_MANAGER_PASSWORD`, `SEED_MANAGER_NAME` nếu chưa có Quản lý nào. Chạy lại nhiều lần không tạo trùng.
2. Server: `docker compose exec -e SEED_MANAGER_EMAIL=… -e SEED_MANAGER_PASSWORD=… -e SEED_MANAGER_NAME=… backend node dist/cli/create-manager.js`. Lệnh này dùng code đã build, không cần `tsx`.
3. `pnpm db:seed:demo` tạo tài khoản mẫu: 1 Quản lý và 3 Giáo viên, trùng tên giáo viên trong dữ liệu mẫu của FE (Nguyễn Hà Linh, Trần Minh Thư, Phạm Thu Trang), mật khẩu `demo2026`. Tài khoản mẫu dùng domain `@demo.local`, nên xóa sạch được bằng một lệnh (`pnpm db:seed:demo --clean`).

### Ngoài phạm vi
- Quên mật khẩu qua email; tự đăng ký.
- Giới hạn số request theo IP: sau proxy của Next, backend chưa biết IP thật nếu phía trước không có nginx gắn `X-Forwarded-For`.
- Người dùng tự sửa họ tên và điện thoại: Quản lý làm việc này.
- Ghi audit cho thao tác tài khoản: module `audit` làm ngay sau, và sẽ gắn vào các use case của module này.

## Quyết định kỹ thuật

| Chủ đề | Quyết định | Lý do |
|---|---|---|
| Hash mật khẩu | `crypto.scrypt` có sẵn của Node, N=2^17, r=8, p=1 (theo OWASP). Lưu dạng `scrypt$N$r$p$salt$hash`, nên tăng tham số sau này mà không làm hỏng mật khẩu cũ | Không thêm thư viện native (argon2/bcrypt cần build cho Alpine) |
| Thời gian phản hồi | Email không tồn tại vẫn chạy hash giả, nên thời gian phản hồi giống hệt sai mật khẩu | Không đoán được email nào tồn tại |
| Token phiên | 32 byte ngẫu nhiên, gửi trong cookie `sid`. DB chỉ lưu `sha256(token)` | Lộ DB thì cũng không dùng lại được phiên |
| Cookie | `httpOnly`, `sameSite=lax`, `path=/`, `secure` theo `COOKIE_SECURE` (mặc định bật khi `NODE_ENV=production`). Không tích "Ghi nhớ" thì là session cookie (không có `Max-Age`) | `lax` cộng với việc FE và API cùng domain chặn được CSRF từ trang khác. Biến `COOKIE_SECURE` cần cho server chưa có HTTPS (xem Open Questions) |
| Kiểm tra quyền | `SessionGuard` toàn cục (đăng ký bằng `APP_GUARD`), `@Public()` để mở route; `RolesGuard` + `@Roles('MANAGER')`; `@CurrentUser()` lấy người dùng | Mặc định là đóng: quên gắn guard thì route vẫn được bảo vệ |
| Đọc cookie | Thêm `cookie-parser` | Cách làm chuẩn của Nest/Express |
| Mã lỗi | `INVALID_CREDENTIALS` 401, `ACCOUNT_LOCKED` 423, `ACCOUNT_DISABLED` 403, `UNAUTHENTICATED` 401, `FORBIDDEN` 403, `EMAIL_TAKEN` 409, `LAST_MANAGER` 409, `CANNOT_CHANGE_SELF` 409, `WRONG_PASSWORD` 400, `USER_NOT_FOUND` 404 | Mọi message bằng tiếng Việt, theo định dạng lỗi chung |
| Thời gian trong code | Port `Clock`: test thay được giờ để thử khóa 15 phút hay hết hạn 12 giờ mà không phải chờ | |
| FE gọi API | TanStack Query theo [docs/architecture.md §3](docs/architecture.md#3-frontend-tanstack-query--solid) | Đã chốt |
| FE chặn trang | `proxy.ts` của Next 16 (trước đây là middleware): không có cookie `sid` thì chuyển hướng ngay, không chớp trang portal. Kiểm tra phiên thật vẫn do BE làm | Đọc docs Next 16 trước khi viết |

## API

Prefix `/api/v1`. Body và response là JSON.

| Method | Path | Quyền | Body | Response |
|---|---|---|---|---|
| POST | `/auth/login` | Public | `{ email, password, remember }` | 200 `User` + `Set-Cookie: sid` |
| POST | `/auth/logout` | Đăng nhập | | 204, xóa cookie |
| GET | `/auth/me` | Đăng nhập | | 200 `User` |
| PUT | `/auth/me/password` | Đăng nhập | `{ currentPassword, newPassword }` | 204 |
| GET | `/users` | MANAGER | | 200 `User[]` (sắp theo họ tên) |
| POST | `/users` | MANAGER | `{ email, fullName, phone, role, password }` | 201 `User` |
| PATCH | `/users/:id` | MANAGER | `{ email?, fullName?, phone?, role?, isActive? }` | 200 `User` |
| PUT | `/users/:id/password` | MANAGER | `{ password }` | 204 |

`User` = `{ id, email, fullName, phone, role: "MANAGER" | "TEACHER", isActive, lockedUntil: string | null }`. Không bao giờ trả `passwordHash`, số lần sai hay token.

## Dữ liệu

```prisma
enum Role { MANAGER TEACHER }

model User {
  id                String    @id @default(uuid()) @db.Uuid
  email             String    @unique
  passwordHash      String
  fullName          String
  phone             String    @default("")
  role              Role
  isActive          Boolean   @default(true)
  failedLoginCount  Int       @default(0)
  lockedUntil       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  sessions          Session[]
}

model Session {
  id         String   @id @default(uuid()) @db.Uuid
  tokenHash  String   @unique
  userId     String   @db.Uuid
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  remember   Boolean
  expiresAt  DateTime
  lastUsedAt DateTime @default(now())
  createdAt  DateTime @default(now())
  @@index([userId])
}
```

Email lưu ở dạng chữ thường. Phiên hết hạn được dọn khi người đó đăng nhập lại, và bằng một truy vấn dọn dẹp chạy khi app khởi động. v1 không cần job định kỳ.

## Project Structure

```
backend/src/modules/auth/
├── domain/          user.ts (lockout, kích hoạt/vô hiệu hóa, đổi vai trò), password-policy.ts, session.ts (hết hạn, gia hạn),
│                    user.repository.ts, session.repository.ts, password-hasher.ts, clock.ts, auth-errors.ts
├── application/     login, logout, get-current-user, change-own-password, authenticate-session,
│                    list-users, create-user, update-user, reset-user-password (*.use-case.ts)
├── infrastructure/  prisma-user.repository.ts, prisma-session.repository.ts, scrypt-password-hasher.ts, system-clock.ts
├── http/            auth.controller.ts, users.controller.ts, dto/, session.guard.ts, roles.guard.ts,
│                    decorators.ts (Public, Roles, CurrentUser), session-cookie.ts
└── auth.module.ts   exports: SessionGuard, RolesGuard và các decorator cho module khác
backend/src/cli/create-manager.ts       # dùng chung với prisma/seed.ts
backend/prisma/seed.ts, seed-demo.ts

frontend/src/
├── lib/api/          http-client.ts, api-error.ts, query-provider.tsx
├── features/auth/    api.ts, queries.ts, query-keys.ts, types.ts
├── features/users/   api.ts, queries.ts, query-keys.ts, types.ts
├── proxy.ts          chặn /portal khi chưa có cookie
├── app/login/page.tsx                  # nối API thật
├── components/school/account-menu.tsx  # dữ liệu thật, đổi mật khẩu, đăng xuất
└── components/school/account-list.tsx  # tab Tài khoản (mới), dialog tạo/sửa/đặt lại mật khẩu
```

## Commands

```bash
cd backend
pnpm db:migrate --name auth
pnpm db:seed && pnpm db:seed:demo
pnpm lint && pnpm test && pnpm test:e2e && pnpm build

cd frontend
pnpm build && pnpm test
BACKEND_PORT=4100 ../docker.sh dev       # rồi chạy:
pnpm a11y-check && pnpm layout-check     # tự đăng nhập bằng tài khoản demo
```

## Code Style

Theo `backend/CLAUDE.md` và `frontend/CLAUDE.md`. Ví dụ quy tắc khóa tài khoản nằm trong domain, có thể test không cần DB:

```ts
export class User {
  registerFailedLogin(now: Date): void {
    this.failedLoginCount += 1;
    if (this.failedLoginCount >= MAX_FAILED_LOGINS) {
      this.lockedUntil = new Date(now.getTime() + LOCK_MINUTES * 60_000);
      this.failedLoginCount = 0;
    }
  }

  assertCanLogIn(now: Date): void {
    if (!this.isActive) throw new AccountDisabledError();
    if (this.lockedUntil && this.lockedUntil > now) throw new AccountLockedError(this.lockedUntil, now);
  }
}
```

## Testing Strategy

| Mức | Nội dung |
|---|---|
| Unit (BE) | `User`: khóa ở lần sai thứ 5, hết khóa sau 15 phút, đăng nhập đúng thì bộ đếm về 0, quy tắc Quản lý cuối cùng, không tự hạ vai trò. `Session`: 12 giờ / 30 ngày, gia hạn tối đa mỗi giờ một lần. Hasher: hash rồi verify, sai mật khẩu, chuỗi hash hỏng. Use case với repository trong bộ nhớ và `Clock` giả |
| E2E (BE) | Mỗi endpoint: thành công, chưa đăng nhập (401), sai vai trò (403), body sai (400). Cookie có `HttpOnly`, `SameSite=Lax`; không tích "Ghi nhớ" thì không có `Max-Age`. Đăng xuất thì cookie cũ dùng lại nhận 401. Vô hiệu hóa hoặc đặt lại mật khẩu thì phiên cũ của người đó nhận 401. Thời gian phản hồi của email không tồn tại và sai mật khẩu chênh nhau dưới 50% |
| FE | `pnpm build`. `a11y-check` và `layout-check` được sửa để tự đăng nhập bằng tài khoản demo trước khi vào portal, và thêm kiểm tra tab Tài khoản |
| Trình duyệt thật | Một script Playwright đăng nhập qua `localhost:3000` (đi qua rewrite của Next), tải lại trang vẫn còn đăng nhập, đăng xuất thì về `/login`. Đây là phép thử cookie qua proxy đã hoãn từ `platform` |

## Boundaries

- **Always:**
  - Mọi route mới mặc định cần đăng nhập.
  - So sánh mật khẩu và token chỉ qua hasher hoặc hash, không so sánh chuỗi thường.
  - Không log mật khẩu, token, cookie.
  - Thông báo lỗi bằng tiếng Việt, và không cho biết email có tồn tại hay không.
- **Ask first:**
  - Thêm thư viện ngoài `cookie-parser` (BE) và `@tanstack/react-query` (FE).
  - Đổi thời hạn phiên hoặc ngưỡng khóa.
  - Thêm vai trò mới.
- **Never:**
  - Lưu token phiên chưa hash.
  - Trả `passwordHash` ra API.
  - Lưu token trong `localStorage`.
  - Xóa cứng tài khoản.
  - Nới lỏng `a11y-check` cho dễ qua.

## Success Criteria

1. Chạy `pnpm db:seed:demo`, rồi đăng nhập ở `localhost:3000/login` bằng tài khoản demo: vào được portal và menu hiện đúng tên. Tải lại trang vẫn đăng nhập. Đăng xuất thì về `/login`, và quay lại `/portal` thì bị chuyển về `/login`.
2. Sai mật khẩu 5 lần thì lần thứ 6 (kể cả đúng mật khẩu) nhận thông báo khóa kèm số phút.
3. Giáo viên không thấy tab Tài khoản, và gọi `GET /api/v1/users` nhận 403.
4. Quản lý tạo tài khoản giáo viên, người đó đăng nhập được. Quản lý vô hiệu hóa tài khoản đó thì phiên của người đó lập tức nhận 401.
5. Không vô hiệu hóa được Quản lý cuối cùng.
6. DB chỉ có `tokenHash`, không có token gốc. `passwordHash` có dạng `scrypt$…`.
7. Backend: `lint`, `test`, `test:e2e`, `build` không lỗi. Frontend: `build`, `test`, `a11y-check`, `layout-check` không lỗi.

## Open Questions

Đã chốt:
1. Server production **đã có HTTPS**, nên cookie `secure` bật mặc định khi `NODE_ENV=production`. `COOKIE_SECURE=false` chỉ dùng khi cần thử bản production qua HTTP ở một host khác `localhost` (trình duyệt coi `http://localhost` là an toàn, nên `./docker.sh` chạy ở local vẫn đăng nhập được).
2. Email Quản lý đầu tiên trên server: `vanhungnguyenbku@gmail.com`. Chủ dự án tự chạy lệnh ở US5.2 với mật khẩu riêng. Hướng dẫn deploy dùng placeholder, không ghi email này.
