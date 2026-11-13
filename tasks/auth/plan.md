# Implementation Plan: Module `auth`

Nguồn: [SPEC-auth.md](../../SPEC-auth.md). Danh sách task: [todo.md](todo.md). Plan của module trước: [../plan.md](../plan.md) (`platform`; còn các mục chờ chủ dự án kiểm tra).

## Overview

Đăng nhập thật bằng phiên lưu trong Postgres, mọi API mặc định cần đăng nhập, phân quyền Quản lý/Giáo viên, quản lý tài khoản. FE chuyển sang TanStack Query, bắt đầu với: màn hình đăng nhập, menu tài khoản, tab Tài khoản và việc chặn `/portal`. Dữ liệu lớp, học sinh, phiếu của portal **vẫn là mock** cho tới module `roster` và `evaluations`.

## Architecture Decisions

- **Làm backend trước, frontend sau.** Mỗi task backend là một lát dọc (domain, use case, Prisma, HTTP, e2e). Hợp đồng API đã chốt trong spec, nên FE làm theo đúng hợp đồng đó.
- **Guard toàn cục đến ngay ở B2**, cùng helper e2e `loginAs(app, role)`. Mọi e2e hiện có (`_template`, docs) đi qua helper này. Health và docs được gắn `@Public()`.
- **Domain không biết giờ hệ thống:** use case nhận `Clock`, entity nhận `now` làm tham số. Test thử khóa 15 phút hay hết hạn 12 giờ mà không phải chờ.
- **Seed dùng chung code với CLI:** `src/cli/create-manager.ts` được build vào `dist/`, nên chạy được trong image production (không có `tsx`). `prisma/seed.ts` gọi lại cùng hàm đó.
- **Proxy của FE chỉ kiểm tra cookie có tồn tại hay không.** Phiên hợp lệ hay không do BE quyết định qua `GET /auth/me`. Proxy chỉ để tránh trang portal chớp lên trước khi chuyển về `/login`.
- **Công cụ kiểm tra FE (`a11y-check`, `layout-check`, `screenshot`) cần backend đang chạy và có dữ liệu demo.** Chúng đăng nhập bằng `quanly@demo.local / demo2026` (ghi đè được bằng biến môi trường).

## Thứ tự và phụ thuộc

```
B1 domain + schema ─ B2 login/me/logout + guard ─┬─ B3 lockout + timing
                                                  ├─ B4 đổi mật khẩu
                                                  └─ B5 roles + list/create users ─ B6 update/vô hiệu hóa/reset
B2 ─ B7 seed + CLI + dọn phiên
                         ▼ Checkpoint BE
F1 lib/api + TanStack ─ F2 login + proxy ─ F3 menu tài khoản ─ F4 tab Tài khoản ─ F5 công cụ kiểm tra + thử trên trình duyệt ─ F6 tài liệu
```

## Task List

### Phase 1: Backend
- [x] B1: Domain `User`/`Session`, mật khẩu, schema + migration
- [x] B2: Đăng nhập, `me`, đăng xuất, guard toàn cục
- [x] B3: Khóa sau 5 lần sai, thời gian phản hồi đồng đều
- [x] B4: Tự đổi mật khẩu
- [x] B5: `RolesGuard`, danh sách và tạo tài khoản
- [x] B6: Sửa, vô hiệu hóa, đặt lại mật khẩu, quy tắc Quản lý cuối cùng
- [ ] B7: Seed, CLI tạo Quản lý, seed demo, dọn phiên hết hạn

### Checkpoint BE
- [ ] `pnpm lint && pnpm test && pnpm test:e2e && pnpm build` không lỗi
- [ ] Success Criteria 2–6 của spec chứng minh được bằng e2e hoặc `curl`

### Phase 2: Frontend
- [ ] F1: Nền tảng `lib/api` + TanStack Query
- [ ] F2: Màn hình đăng nhập thật + chặn `/portal`
- [ ] F3: Menu tài khoản, đổi mật khẩu, đăng xuất
- [ ] F4: Tab Tài khoản cho Quản lý
- [ ] F5: Công cụ kiểm tra tự đăng nhập; thử đăng nhập trên trình duyệt thật
- [ ] F6: Tài liệu

### Checkpoint hoàn thành
- [ ] Success Criteria 1–7 của SPEC-auth.md đạt
- [ ] Review với chủ dự án, rồi viết spec `audit`

## Risks and Mitigations

| Rủi ro | Mức | Cách xử lý |
|---|---|---|
| scrypt N=2^17 dùng 128MB RAM và khoảng 100–300ms cho mỗi lần hash, nên nhiều người đăng nhập cùng lúc thì chậm | Thấp (một trung tâm) | Truyền `maxmem` đủ lớn. Đo thời gian ở B1; nếu quá 500ms trên server thì hạ N kèm ghi chú. Chuỗi hash có lưu tham số, nên đổi sau không làm hỏng mật khẩu cũ |
| Test thời gian phản hồi (email không tồn tại so với sai mật khẩu) chạy không ổn định trên CI | Trung bình | So sánh trung bình 5 lần, ngưỡng chênh rộng (dưới 50%) |
| Cookie `Secure` qua `http://localhost` khi chạy `./docker.sh` (production ở local) | Thấp | Trình duyệt coi `localhost` là an toàn. Kiểm tra ở F5; nếu không được thì đặt `COOKIE_SECURE=false` trong `.env` local |
| Công cụ kiểm tra FE giờ phụ thuộc backend, nên chạy dễ quên bật BE | Trung bình | Script báo lỗi rõ "Không đăng nhập được: backend có đang chạy và đã chạy `pnpm db:seed:demo`?" |
| Vitest dùng chung DB test, các file e2e đè dữ liệu lên nhau | Trung bình | Đã có `fileParallelism: false`; mỗi file gọi `resetDb` và tự tạo user cần dùng |
| Cổng 4000 trên máy dev bị app khác chiếm | Thấp | Đã biết: dùng `BACKEND_PORT=4100` / `PORT=4100` |

## Open Questions

Không còn.
