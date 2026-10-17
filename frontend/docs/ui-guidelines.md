# Quy ước giao diện

Các quy tắc dưới đây được chốt qua những lần review landing page. Phần **Component** áp dụng cho toàn bộ app. Các phần còn lại áp dụng cho **trang giới thiệu (`/`) và trang đăng nhập (`/login`)**, trừ khi ghi rõ phạm vi khác. Khi sửa giao diện, kiểm tra lại theo [testing.md](testing.md).

## Component: dùng shadcn/ui trước

**Quy tắc quan trọng nhất:** cần component nào thì cài bằng shadcn và dùng component đó. Không tự viết lại những gì shadcn đã có.

1. Trước khi viết bất kỳ component giao diện nào, tra danh sách ở https://ui.shadcn.com/docs/components. Nếu shadcn có, cài vào:
   ```bash
   cd frontend
   pnpm dlx shadcn@latest add <tên>        # ví dụ: pnpm dlx shadcn@latest add tabs tooltip
   ```
   Cấu hình nằm ở `frontend/components.json`: style `new-york`, theme ghi vào `src/app/tailwind.css`, icon dùng `lucide`.
2. **Kiểm tra sau khi `add`** (CLI từng sinh sai):
   - Import phải là `from "@/lib/utils"`. Nếu thấy `from "cn"` thì sửa lại.
   - `package.json` không được có package lạ. CLI từng tự cài package `cn` không liên quan; nếu có, gỡ bằng `pnpm remove cn`.
   - Chạy `pnpm build`.
3. **`src/components/ui/` chỉ chứa file do shadcn sinh ra.** Hạn chế sửa trực tiếp:
   - Màu, bo góc: sửa biến CSS trong `src/app/tailwind.css` (`--primary`, `--destructive`, `--radius`…, đã map theo màu thương hiệu).
   - Kích thước, giao diện riêng: truyền `className` ở chỗ dùng.
4. **Nơi đặt component:**
   | Thư mục | Nội dung |
   |---|---|
   | `components/ui/` | Component shadcn (button, dialog, select…) |
   | `components/common/` | Component dùng chung: `BrandLogo`, `DatePicker` (Popover + Calendar), `MonthPicker`, `Field`/`TextareaField`/`SelectField` |
   | `components/school/` | Component nghiệp vụ của portal |
   | `components/landing/` | Component client của trang giới thiệu (`MobileNav`) |
5. **Icon:** dùng `lucide-react`, không vẽ SVG riêng. Riêng nút có chữ ở landing/login thì không gắn icon (xem phần Nút).
6. **Kích thước quy ước:**
   - Ô nhập, select và nút trong form cao 44px: `h-11`. Riêng `SelectTrigger` phải dùng `data-[size=default]:h-11`.
   - Nút hành động chính dùng `size="lg"`.
   - Nút chỉ có icon dùng `size="icon"` và luôn có `aria-label`.
7. **Con trỏ chuột:** mọi chỗ bấm được (nút, link, mục menu, mục select, checkbox, label của checkbox…) đều phải hiện con trỏ hình bàn tay (`cursor: pointer`). Phần tử bị disabled dùng `not-allowed`.
   - Tailwind v4 không còn tự đặt `pointer` cho `button`. Rule chung nằm trong `@layer base` của `tailwind.css`.
   - shadcn đặt `cursor-default` cho mục menu và select. Utility này có `!important`, nên CSS chung không ghi đè được. Vì vậy trong `components/ui/dropdown-menu.tsx` và `select.tsx` đã đổi `cursor-default` → `cursor-pointer`. **Khi cài lại hoặc cài thêm component shadcn, kiểm tra và đổi tương tự.**
   - Phần tử tự làm cho bấm được (`div`/`tr` có `onClick`) phải có class `cursor-pointer`. Nếu được thì dùng `Button` hoặc `role="button"` thay vì `div`.
   - `pnpm layout-check` kiểm tra con trỏ trên `/`, `/login`, `/portal`, kể cả khi menu tài khoản và select đang mở.
8. **Đã cài:** alert-dialog, avatar, button, calendar, checkbox, dialog, dropdown-menu, input, label, popover, select, textarea.

## Logo

- Mọi chỗ hiển thị logo trung tâm (header, footer trang chủ, trang login) đều dùng **`<BrandLogo/>`** (`components/common/brand-logo.tsx`). Không tự dựng lại markup logo.
  - `tone="light"` cho nền tối, `size="sm"` cho footer.
  - Style nằm ở `.brand`, `.brandMark`, `.brandSub` trong `globals.css`: chữ cái logo dùng font serif in nghiêng, dòng tên và dòng phụ sát nhau (`line-height:1`, cách 5px), dòng phụ cỡ 10px.
- Dưới logo phải có khoảng trống rõ ràng trước nội dung tiếp theo. Ở cột trái trang login là `gap:48px`.

## Nút (button)

- Dùng `Button` của shadcn. Link trông như nút thì bọc bằng `<Button asChild><Link href="…">…</Link></Button>`. Không còn class `.button` trong `globals.css`.
- **Không gắn icon trong nút có chữ** (landing + login): không có mũi tên, không có đồng hồ… Chỉ để chữ.
- **Nút không bao giờ xuống dòng**: `Button` của shadcn đã có `whitespace-nowrap shrink-0`. Nếu chỗ đặt nút quá hẹp, xếp các nút theo chiều dọc (như `.heroButtons` ở ≤620px). Không để chữ trong nút tự xuống dòng.
- **Các mục ngắn đi theo hàng** (như trust row "Kế hoạch giáo dục cá nhân / Can thiệp 1–1 / Phối hợp cùng phụ huynh"): mỗi mục `white-space:nowrap`. Khi màn hình hẹp, chuyển cả hàng sang cột (`flex-direction:column`), không để từng mục tự xuống dòng.
- **Mỗi khu vực chỉ có một nút chính**. Header chỉ có **một** nút chính là **"Đăng nhập" (nền xanh, `.button.small`)**, hiện ở mọi kích thước màn hình. Không thêm nút "Tìm hiểu trung tâm" lên header.
- Menu mobile chỉ chứa các link điều hướng tới các mục của trang. Nút đăng nhập đã nằm sẵn trên header.
- Portal (`/portal`) không áp dụng quy tắc "không icon": các nút như "+ Thêm lớp" và các nút sửa/xoá chỉ có icon vẫn giữ nguyên.

## Xuống dòng tiếng Việt

Tiếng Việt viết các âm tiết cách nhau bằng dấu cách, nên trình duyệt có thể ngắt dòng ngay giữa một từ ghép, ví dụ "yêu / thương", "hoạt / động", "phát triển / phù hợp". Như vậy là sai nghĩa và không được chấp nhận.

- Dùng helper `keep()` trong `src/app/page.tsx`. Hàm này nối các âm tiết bằng dấu cách không ngắt (` `) cho từ ghép và cụm từ trong **tiêu đề, tên thẻ, câu trích dẫn và các dòng chữ ngắn**:
  ```tsx
  <h2>Học qua chơi, {keep("tiến bộ")} qua từng {keep("hoạt động.")}</h2>
  ```
- `h1, h2, h3` có `text-wrap: balance` và `p` có `text-wrap: pretty` (trong `globals.css`), để các dòng dài đều nhau và dòng cuối không bị lẻ một từ.
- **Không viết cứng `<br/>`** trong tiêu đề để ép xuống dòng. Chỉ giữ `<br/>` khi chỗ ngắt là có chủ ý và đã kiểm tra ở 375px (hiện chỉ có ở h1 hero: "Mỗi trẻ là một / cá thể đặc biệt.").
- Tên trung tâm đầy đủ lấy từ env nên không biết trước chỗ ngắt hợp lý. Ở ≤620px, eyebrow hero hiện dạng ngắn "Trung tâm {shortName}" (class `nameShort`/`nameFull`). Tên ngắn và chữ "Trung tâm" luôn được giữ liền một dòng.
- Đoạn văn dài (`<p>` nội dung) không cần `keep()`. Chỉ cần `text-wrap: pretty`.

## Card

- Các CTA trong những card cùng hàng phải **thẳng hàng ở đáy card**: card dùng `display:flex; flex-direction:column`, CTA dùng `margin-top:auto` (xem `.programCard`).

## Responsive và khoảng cách trái/phải

- **Hai khối đặt cạnh nhau (trái/phải) luôn phải có `gap`**, không chỉ dựa vào `justify-content: space-between`. Khi màn hình hẹp, `space-between` không tạo khoảng cách nào và hai khối sẽ dính vào nhau. Mức tối thiểu:
  - Hero: 48px.
  - Section `.visit` (tiêu đề và nút): 56px.
  - Footer: 48px theo chiều ngang, 24px theo chiều dọc.
  - Chữ và hình trong mọi section: không dưới 24px.
- **Hình minh họa / trang trí không được che nội dung:**
  - Nếu hình có kích thước cố định (vẽ bằng CSS, định vị tuyệt đối), phải chuyển bố cục sang một cột trước khi hình bị chật. Hero landing chuyển sang một cột ở **≤1024px**.
  - Ở khoảng độ rộng còn hơi chật, thu nhỏ cả cụm hình bằng `zoom` (hero: `zoom:.84` ở 1025–1180px, `zoom:.85` ở ≤400px) thay vì để hình lấn sang chữ.
  - Hình trang trí đặt góc (ví dụ vòng tròn và chấm ở trang login) phải có **vùng riêng**: thêm `padding` ở khối cha để chữ không đi vào vùng đó, và đặt `pointer-events:none`.
- **Bố cục chuyển sang cột** ở các mốc: footer ≤900px; section `.visit` ≤620px; trust row ≤620px; trang login ẩn cột giới thiệu ở ≤800px.
- **Header mobile:** khi logo, nút "Đăng nhập" và nút menu không đủ chỗ, ẩn dòng phụ "Giáo dục trẻ đặc biệt" trên header (≤400px). Không được để chữ chạm vào nút.
- **Kiểm tra bắt buộc sau khi sửa layout:** `pnpm layout-check` (xem [testing.md](testing.md)). Lệnh này quét 19 độ rộng từ 320 đến 1920px, báo tràn ngang, phần tử bị đẩy ra ngoài màn hình, các khối cạnh nhau cách dưới 24px và trang trí đè lên chữ. Khi thêm section mới có hai khối cạnh nhau, khai báo thêm cặp selector vào `checks` trong `scripts/layout-check.mjs`.

## Section và khoảng cách

- **Mọi section đều phải có padding hai bên**: 32px trên desktop và tablet, 20px ở ≤620px. Không được để `padding: … 0` khiến nội dung dính sát mép màn hình.
- Nội dung trong section dùng chung `max-width: 1240px` với hero, trừ các dải nền tràn hết chiều rộng như `.programs`, `.visit` và footer: những dải này dùng `padding: … max(32px, calc((100vw - 1176px)/2))`.

## Nội dung

- **Không hiển thị thông tin cụ thể khi chưa có dữ liệu thật** của trung tâm: giờ học, lịch, con số, cam kết. Ví dụ, khối giờ "8:30 / 10:30 / 15:00" đã bị bỏ vì không chính xác.
- Không viết cứng tên trung tâm, xem [configuration.md](configuration.md).
- Hình minh họa ở hero đang được vẽ bằng CSS, chỉ là tạm thời; nên thay bằng ảnh thật.

## Màu sắc

- Bảng màu: xanh lá đậm (`--green`, `--ink`), kem (`--cream`), coral, vàng (`--yellow`), xanh mint (`--mint`). Giữ tông dịu, ít kích thích thị giác, phù hợp với phụ huynh có con cần hỗ trợ đặc biệt.
- **Chữ màu coral** dùng `--coral-ink` (`#b84a33`). Trong Tailwind dùng `coral-600`. `--coral` (`#ef765e`) và `coral-500` **chỉ dùng cho trang trí** (icon, chấm, hình), vì chỉ đạt khoảng 2.6:1 trên nền sáng.
- Chữ xám phụ dùng `--muted` (`#566862`).
- Mọi cặp chữ/nền phải đạt ≥ 4.5:1. Chữ lớn (≥ 24px, hoặc ≥ 18.66px đậm) cần ≥ 3:1. Cách đo có trong [testing.md](testing.md).

## Chữ

- Font: **Be Vietnam Pro** cho nội dung, **Lora** cho tiêu đề (có italic). Cả hai nạp qua `next/font/google` với subset `vietnamese` trong `layout.tsx`.
- Cỡ chữ: nội dung ≥ 13px. Nhãn viết hoa nhỏ nhất 10px.

## Khả năng truy cập

- Có link "Bỏ qua đến nội dung" (`.skipLink`) và viền focus `:focus-visible` màu `--coral-ink`.
- Tôn trọng `prefers-reduced-motion`.
- Nút chỉ có icon (ví dụ nút menu) phải có `aria-label`.
