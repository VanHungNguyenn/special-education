# Kiến trúc

## Công nghệ

| Thành phần | Phiên bản / ghi chú |
|---|---|
| Next.js (App Router) | 16.2. Có thay đổi lớn so với các bản cũ, cần tham khảo `node_modules/next/dist/docs/` |
| React | 19.2 |
| TypeScript | 5 |
| Tailwind CSS | 4 (qua `@tailwindcss/postcss`) |
| shadcn/ui | Style new-york trên `radix-ui`, cài qua CLI (`components.json`). Đã cài: alert-dialog, avatar, button, calendar, checkbox, dialog, dropdown-menu, input, label, popover, select, textarea |
| lucide-react | Bộ icon |
| cva, clsx, tailwind-merge, tw-animate-css | Thư viện đi kèm shadcn (variant, `cn()`, animation) |
| date-fns, react-day-picker | Chọn ngày và tháng |
| pnpm | Trình quản lý package, chạy trên Node 22 |
| Font | Be Vietnam Pro (nội dung), Lora (tiêu đề), nạp qua `next/font/google` với subset `vietnamese` |
| Playwright | Chụp ảnh kiểm tra giao diện (dev) |

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, metadata (title = tên trung tâm), font
│   │   ├── page.tsx            # Trang giới thiệu (server component)
│   │   ├── globals.css         # CSS cho trang giới thiệu (biến CSS, đã minify)
│   │   ├── tailwind.css        # Tailwind v4, token màu thương hiệu, theme shadcn, CSS cho bản in
│   │   ├── login/              # Trang đăng nhập (CSS module)
│   │   └── portal/             # Cổng quản lý: page.tsx → portal.tsx (client)
│   ├── components/
│   │   ├── landing/            # Component client cho trang giới thiệu (menu mobile)
│   │   ├── ui/                 # Chỉ chứa component shadcn/ui (sinh bằng CLI)
│   │   ├── common/             # Component ghép từ shadcn: DatePicker, MonthPicker, form field
│   │   └── school/             # App shell, danh sách lớp, học sinh, hồ sơ, báo cáo, modal
│   ├── features/school/
│   │   ├── types.ts            # Kiểu dữ liệu
│   │   ├── data.ts             # Dữ liệu mẫu, tiêu chí đánh giá, các lựa chọn kết quả
│   │   └── use-school-management.ts  # Hook giữ toàn bộ state của portal
│   ├── lib/utils.ts            # cn() = clsx + tailwind-merge
│   └── config/site.ts          # Thông tin trung tâm (đọc từ env)
├── docs/                       # Tài liệu này
├── scripts/screenshot.mjs      # Chụp ảnh giao diện bằng Playwright
├── components.json             # Cấu hình shadcn/ui
├── .env.example                # Mẫu biến môi trường
└── Dockerfile
```

## Routes

| Route | Loại | Mô tả |
|---|---|---|
| `/` | Server component | Trang giới thiệu: hero, phương châm, 3 chương trình, một ngày tại trung tâm, footer |
| `/login` | Client component | Form đăng nhập giả lập. Sau 450ms sẽ chuyển tới `/portal` |
| `/portal` | Client component | Cổng quản lý gồm 3 tab |

### Cổng quản lý (`/portal`)

`portal.tsx` điều phối toàn bộ màn hình bên trong `AppShell`. Trên desktop đó là sidebar, trên mobile là thanh tab ở dưới cùng.

- **Lớp học** (`classes`), dùng `ClassOverview`: hiển thị thẻ lớp kèm số học sinh, cho phép thêm, sửa, xóa lớp. Bấm vào một lớp để xem học sinh của lớp đó.
- **Học sinh** (`students`): `StudentList` (tìm theo tên, lọc theo lớp) dẫn tới `StudentProfile` (thông tin học sinh và phiếu đánh giá theo tháng).
- **Báo cáo** (`reports`), dùng `ReportView`: tổng hợp trạng thái đánh giá theo lớp và tháng, xuất (in) báo cáo danh sách hoặc báo cáo từng học sinh.

Deep link: `/portal?tab=reports`, hoặc `/portal?student=3` để mở thẳng hồ sơ học sinh. Các tham số này chỉ được đọc một lần khi trang mount.

Việc thêm và sửa lớp hay học sinh dùng chung `EntityModal`. Việc xác nhận xóa dùng `ConfirmDialog`.

## Quản lý state

Toàn bộ state nằm trong hook `useSchoolManagement`. Hook được gọi một lần trong `portal.tsx` và truyền xuống các component qua props.

- `classes`, `students`: khởi tạo từ `initialClasses` và `initialStudents`.
- `evaluations`, `evaluationStatuses`: phiếu đánh giá và trạng thái của phiếu (xem [domain.md](domain.md)).
- `query`, `classFilter`, `month`: bộ lọc dùng chung cho tab Học sinh và tab Báo cáo.
- Các hàm: `saveClass`, `deleteClass`, `saveStudent`, `deleteStudent`, `updateRating`, `updateEvaluationStatus`.

Dự án không dùng context, store hay API. Khi thêm backend, hook này là chỗ cần thay thế.

## Styling

- **Portal và components:** Tailwind v4, được import với `important` trong `tailwind.css`. Các token gồm `brand-50…800` (xanh lá đậm), `coral-50/500/600`, `surface`, `shadow-card`. Các class `no-print`, `print-page`… điều khiển bản in báo cáo.
- **Theme shadcn/ui:** khai báo bằng biến CSS (`--primary`, `--destructive`, `--border`, `--ring`, `--radius`…) trong `:root` của `tailwind.css`, map theo màu thương hiệu (primary `#1f5a4d`, destructive `#b84a33`, bo góc 7px). Muốn đổi màu component thì sửa ở đây, không sửa trong `components/ui/`. Xem [ui-guidelines.md](ui-guidelines.md#component-dùng-shadcnui-trước).
- **Trang giới thiệu:** `globals.css`, dùng biến CSS (`--ink`, `--green`, `--cream`, `--coral`…). Chữ màu coral phải dùng `--coral-ink` (`#b84a33`) để đạt độ tương phản; `--coral` (`#ef765e`) chỉ dùng cho phần trang trí. Trong Tailwind, dùng `coral-600` cho nền có chữ trắng.
- **Trang đăng nhập:** `login.module.css`.
- Font: `layout.tsx` nạp Be Vietnam Pro và Lora vào biến `--font-be-vietnam` và `--font-lora`. `--font-sans` và `--font-serif` (khai báo trong `tailwind.css` và `globals.css`) trỏ tới hai biến này.
