# Kiểm tra giao diện (Playwright)

Dự án chưa có test tự động. Sau mỗi lần sửa giao diện, chụp ảnh màn hình bằng Playwright để xem lại kết quả theo [ui-guidelines.md](ui-guidelines.md).

## Chạy

```bash
cd frontend
pnpm dev                  # terminal 1
pnpm screenshot           # terminal 2, mặc định http://localhost:3000
```

Các tùy chọn:

```bash
pnpm screenshot http://localhost:3100            # đổi base URL (ví dụ chạy bản build: pnpm build && pnpm start -p 3100)
pnpm screenshot --pages=/,/login --widths=375     # chỉ chụp một số trang / độ rộng
```

**Windows / Git Bash:** Git Bash tự đổi đối số bắt đầu bằng `/` thành đường dẫn Windows (`/login` thành `C:/Program Files/Git/login`). Khi dùng `--pages`, chạy kèm `MSYS_NO_PATHCONV=1`:

```bash
MSYS_NO_PATHCONV=1 pnpm screenshot --pages=/,/login
```

PowerShell và cmd không bị lỗi này.

Lần đầu trên máy mới, cài trình duyệt cho Playwright:

```bash
pnpm exec playwright install chromium
```

## Kiểm tra layout responsive

```bash
pnpm layout-check                         # mặc định http://localhost:3000
pnpm layout-check http://localhost:3100   # khi chạy bản build
```

Lệnh này quét `/` và `/login` ở 19 độ rộng (320 → 1920px) và báo ✗ khi gặp:

- tràn ngang;
- phần tử bị đẩy ra ngoài mép màn hình;
- hai khối cạnh nhau (chữ và hình, chữ và nút, các cột footer…) chồng lên nhau hoặc cách nhau dưới 24px;
- hình trang trí đè lên chữ (vòng tròn và chấm ở trang login).

Có lỗi thì lệnh kết thúc với exit code 1. Danh sách các cặp cần kiểm tra nằm trong `checks` ở `scripts/layout-check.mjs`. Trang dùng CSS module (login) phải dùng selector `[class*=tên]`, vì tên class bị băm (hash).

Nên chạy `layout-check` trước, rồi `screenshot` để xem bằng mắt ở những độ rộng bị báo lỗi.

## Kết quả

- Ảnh full-page được lưu ở `frontend/screenshots/<trang>-<độ rộng>.png`, ví dụ `home-375.png`, `portal-1440.png`. Thư mục này đã nằm trong `.gitignore`.
- Mặc định script chụp các trang `/`, `/login`, `/portal` ở 3 độ rộng: **375** (điện thoại), **768** (tablet), **1440** (desktop).
- Script tự báo lỗi (✗) khi có **tràn ngang** (`scrollWidth > clientWidth`) hoặc **lỗi console / lỗi JS**. Khi có lỗi, lệnh kết thúc với exit code 1.

Code nằm ở `frontend/scripts/screenshot.mjs`.

## Cần xem gì trong ảnh

| Hạng mục | Tiêu chí |
|---|---|
| Font | Chữ hiển thị bằng Be Vietnam Pro (nội dung) và Lora (tiêu đề), dấu tiếng Việt không bị chồng hoặc cắt |
| Độ tương phản | Chữ thường ≥ 4.5:1, chữ lớn (≥ 24px, hoặc ≥ 18.66px đậm) ≥ 3:1. Chữ màu coral dùng `--coral-ink` (`#b84a33`), còn `--coral` chỉ dùng cho trang trí |
| Cỡ chữ | Nội dung ≥ 13px; nhãn viết hoa nhỏ nhất 10px |
| Mobile (375) | Header gọn một dòng (logo, nút "Đăng nhập" xanh, nút menu); menu mở được và có đủ link |
| Xuống dòng | Không dòng nào cắt ngang từ ghép tiếng Việt ("yêu / thương", "hoạt / động"…), không có dòng chỉ lẻ một từ ở tiêu đề |
| Nút | Không icon, chữ trong nút nằm trên một dòng |
| Card | Nếu các card cùng hàng có CTA, các CTA thẳng hàng ở đáy card |
| Trust row | Mỗi mục nằm trên một dòng; ở ≤620px cả hàng chuyển thành cột |
| Section | Có padding hai bên ở mọi độ rộng (kiểm tra kỹ 768 và 1024) |
| Bàn phím | Nhấn Tab sẽ thấy link "Bỏ qua đến nội dung" và viền focus màu coral trên link hoặc nút |
| Không tràn ngang | Script không báo `horizontal overflow` |

## Chụp trạng thái tương tác

Script mặc định chỉ chụp trạng thái ban đầu của trang. Muốn chụp menu đang mở, focus, hay modal, viết một script Playwright ngắn tạm thời. Ví dụ:

```js
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 700 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.click(".menuButton");
await page.screenshot({ path: "screenshots/menu-open.png" });
await browser.close();
```

## Kiểm tra độ tương phản

Công thức WCAG (Python) để kiểm tra nhanh một cặp màu:

```python
def L(h):
    c = [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def contrast(a, b):
    la, lb = sorted((L(a), L(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

print(contrast("#b84a33", "#f8f4eb"))  # 4.71
```
