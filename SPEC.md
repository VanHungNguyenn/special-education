# Spec: Làm lại trang Báo cáo (portal → tab "Báo cáo")

Trạng thái: **bản nháp, chờ duyệt**. Phạm vi: chỉ frontend (`frontend/`). Việc tạo file báo cáo (theo mẫu `Mau_GDCN.pdf`) thuộc backend; spec này chỉ định nghĩa phần frontend gọi tới.

## Objective

### Vấn đề hiện tại (đã chụp màn hình 1440px và 375px)

1. Màn hình nhúng nguyên "tờ giấy in": logo thứ hai, tiêu đề "Báo cáo đánh giá học sinh" trùng với tiêu đề trang "Báo cáo", đường kẻ header.
2. Bảng lưới 11 tiêu chí × học sinh quá dày: tiêu đề cột xuống 3–5 dòng; ô chỉ là ký hiệu nhỏ `+`, `+/-`, `-`, không màu, không chữ.
3. Ký hiệu `-` (chưa hoàn thành) và `—` (chưa nhập) gần như giống nhau, nên rất dễ đọc nhầm.
4. Trên desktop, cột **Trạng thái** nằm ngoài khung, phải cuộn ngang mới thấy.
5. Trên điện thoại, mỗi học sinh hiện 11 dòng, nên trang cao khoảng 3.800px với 5 học sinh, và không có phần tóm tắt.
6. Không có con số tổng nào cho biết tháng này đã đánh giá xong bao nhiêu em, còn thiếu ai.
7. In từng em chỉ in ra một dòng của bảng. Không có nội dung can thiệp, không giống mẫu GDCN.

### Người dùng và mục đích

- **Giáo viên chủ nhiệm và quản lý trung tâm** cùng dùng trang này. Mặc định hiển thị "Tất cả lớp" và có bộ lọc lớp.
- Ba việc chính, theo thứ tự ưu tiên:
  1. **Theo dõi tiến độ:** tháng này lớp nào, em nào đã hoàn thành, còn ai chưa đánh giá.
  2. **Xem kết quả từng em:** kết quả và nội dung can thiệp của một học sinh, đọc được ngay.
  3. **Tải file báo cáo:** backend tạo file theo mẫu GDCN, frontend chỉ lấy link và tải về.
- So sánh nhiều học sinh theo từng tiêu chí là nhu cầu phụ, phục vụ bằng **chế độ xem bảng** (không còn là mặc định).

### Màn hình mới (khung sườn)

```
Báo cáo                                                    [HL]
┌──────────────────────────────────────────────────────────────┐
│ [Lớp: Tất cả lớp ▾] [Tháng 7/2026 📅] [🔍 Tìm học sinh…]       │
│                               [Danh sách | Bảng] [⤓ Tải báo cáo] │
├──────────────────────────────────────────────────────────────┤
│  Đã hoàn thành 1/5 │ Đang cập nhật 1 │ Chưa đánh giá 3          │  ← bấm để lọc
├──────────────────────────────────────────────────────────────┤
│ LỚP MẦM XANH · 1/3 hoàn thành ━━━━░░░░                        │
│ (A) Nguyễn Minh Anh   ● Đã hoàn thành   11/11 tiêu chí         │
│     + Hoàn thành 6 · +/- Cần trợ giúp 3 · - Chưa hoàn thành 2  │
│                                  [Xem chi tiết ▾] [⤓ Tải phiếu] │
│ (H) Trần Gia Huy      ● Chưa đánh giá    0/11   [Mở hồ sơ →]   │
│ …                                                             │
└──────────────────────────────────────────────────────────────┘
Xem chi tiết (mở ngay trong dòng):
  Kỹ năng vận động
    Vận động thô   [+ Hoàn thành]     "Tập đi trên ván thăng bằng…"
    Vận động tinh  [+/- Cần trợ giúp] "Xâu hạt…"
  Ngôn ngữ …
```

### User stories và tiêu chí chấp nhận

**US1. Tóm tắt tiến độ.** Là quản lý, tôi muốn thấy ngay số phiếu đã hoàn thành, đang cập nhật và chưa đánh giá của tháng đang chọn.
- Hiện 3 ô số: **Đã hoàn thành** (`locked`), **Đang cập nhật** (`updated`), **Chưa đánh giá** (`draft` hoặc chưa có phiếu). Mỗi ô có nhãn chữ, không chỉ dựa vào màu.
- Các con số tính theo lớp và tháng đang lọc. Tổng ba ô bằng số học sinh đang hiển thị.
- Bấm một ô sẽ lọc danh sách theo trạng thái đó. Bấm lại thì bỏ lọc. Ô đang chọn có `aria-pressed`.

**US2. Danh sách gọn (chế độ mặc định).** Là giáo viên, tôi muốn lướt qua cả lớp mà không bị ngợp.
- Mỗi học sinh một dòng (trên mobile là một thẻ): chữ cái đầu, tên, lớp, badge trạng thái, tiến độ `x/11 tiêu chí`, và số lượng từng mức kết quả (`+ Hoàn thành n · +/- Cần trợ giúp n · - Chưa hoàn thành n`).
- Khi chọn "Tất cả lớp", danh sách được nhóm theo lớp. Đầu mỗi nhóm có tên lớp và tiến độ hoàn thành của lớp đó.
- Học sinh chưa có phiếu hiện "Chưa đánh giá" và link **Mở hồ sơ**, dẫn tới hồ sơ đúng tháng đó (dùng deep link `?student=<id>` đang có).
- Ô tìm theo tên thay cho ô chọn "Học sinh" hiện tại. Tìm không phân biệt dấu (dùng `fold()` có sẵn).

**US3. Chi tiết từng em.** Là giáo viên, tôi muốn đọc kết quả và nội dung can thiệp của một em ngay tại trang báo cáo.
- Nút "Xem chi tiết" mở rộng ngay trong dòng (`aria-expanded`, dùng được bằng bàn phím), mỗi lần chỉ mở một em.
- Tiêu chí được nhóm theo lĩnh vực (`criteria[].group`). Mỗi tiêu chí có chip kết quả gồm **ký hiệu và chữ** cùng nội dung can thiệp; nội dung dài thì tối đa 3 dòng, có nút "Xem thêm".
- Tiêu chí chưa nhập hiện "Chưa nhập" (màu xám, chữ nghiêng), phân biệt rõ với "- Chưa hoàn thành".

**US4. Chế độ xem bảng (tùy chọn).** Là quản lý, tôi muốn so sánh cả lớp theo từng tiêu chí khi cần.
- Nút chuyển "Danh sách | Bảng" chỉ hiện từ `md` (≥ 768px) trở lên. Dưới `md` luôn là danh sách.
- Cột tên học sinh và cột **Trạng thái** luôn hiện, không phải cuộn ngang mới thấy (cố định hai bên).
- Tiêu đề cột tối đa 2 dòng. Tên đầy đủ có trong `title`/`abbr` và trong nhãn đọc cho trình đọc màn hình.
- Ô kết quả dùng cùng chip màu và chữ như US3 (dạng thu gọn). Ô chưa nhập được phân biệt rõ.

**US5. Tải file báo cáo (backend tạo file).**
- "Tải báo cáo" tải file theo bộ lọc hiện tại (lớp và tháng). "Tải phiếu" trên mỗi dòng tải phiếu GDCN của một em.
- Frontend gọi `getReportDownloadUrl()` (xem *Giao diện với backend*), rồi tải file từ URL trả về.
- Có đủ trạng thái:
  - **Đang tạo file:** nút bị khóa, có `aria-busy` và chữ "Đang tạo file…".
  - **Thành công:** tải file về.
  - **Lỗi:** thông báo ngay cạnh nút, có `role="alert"` và nút "Thử lại".
- Không còn in bằng trình duyệt. Xóa `window.print`, `flushSync` và các CSS chỉ phục vụ việc in báo cáo.

**US6. Bỏ phần "tờ giấy" khỏi màn hình.** Trên màn hình không còn logo hay tiêu đề "Báo cáo đánh giá học sinh" lặp lại. Thông tin "đang xem lớp nào, tháng nào" nằm ngay ở bộ lọc.

**Trạng thái rỗng:**
- Không có học sinh khớp bộ lọc: hiện "Không có học sinh phù hợp" và nút "Xóa bộ lọc".
- Tháng chưa có phiếu nào: hiện "Chưa có phiếu đánh giá nào cho tháng MM/YYYY" và link sang tab Học sinh.

### Từ vựng kết quả (dùng thống nhất ở mọi chỗ)

| Giá trị | Chip hiển thị | Màu (token có sẵn) |
|---|---|---|
| `+` | `+ Hoàn thành` | brand-50 / brand-700 |
| `+/-` | `+/- Cần trợ giúp` | amber-50 / amber-700 |
| `-` | `- Chưa hoàn thành` | coral-50 / coral-600 |
| `""` | `Chưa nhập` | slate-100 / slate-600, chữ nghiêng |

Tất cả các cặp màu phải đạt tỉ lệ tương phản ≥ 4.5:1 (`pnpm a11y-check` sẽ kiểm tra). Bảng này nằm cùng chỗ với `statusMeta` trong `features/school/data.ts`.

## Tech Stack

Giữ nguyên stack hiện tại: Next.js 16.2 (App Router), React 19.2, Tailwind 4, shadcn/ui (Radix), lucide-react, pnpm 12.18, Node 22+. **Không thêm thư viện npm.** Nếu cần component shadcn chưa có (ví dụ `toggle-group`, `collapsible`) thì thêm bằng `pnpm dlx shadcn@latest add`, vì chúng dùng `radix-ui` đã cài sẵn.

## Commands

```bash
cd frontend
pnpm dev                 # http://localhost:3000/portal?tab=reports
pnpm build               # type-check + build
pnpm test                # node:test cho src/lib và logic báo cáo
pnpm a11y-check          # cần dev server; 375/768/1024/1440, cảm ứng và chuột
pnpm layout-check        # cần dev server
pnpm screenshot -- --pages=/portal?tab=reports --widths=375,768,1440
```

## Project Structure

```
frontend/src/features/school/
  data.ts              → statusMeta (đã có), thêm resultMeta (từ vựng kết quả)
  report.ts            → MỚI: hàm thuần, ví dụ summarizeMonth(), studentProgress(), groupByCriteria()
  report-export.ts     → MỚI: getReportDownloadUrl(); bản mock cho tới khi có backend
frontend/src/components/school/
  report-view.tsx      → điều phối: bộ lọc, tóm tắt, chuyển chế độ xem, trạng thái tải file
  report-list.tsx      → MỚI: danh sách nhóm theo lớp, dòng học sinh, phần chi tiết mở rộng
  report-table.tsx     → MỚI: bảng lưới (chế độ tùy chọn), cố định cột tên và trạng thái
frontend/scripts/
  report.test.mjs      → MỚI: unit test cho features/school/report.ts
frontend/src/app/tailwind.css → xóa các rule @media print chỉ dùng cho báo cáo
```

## Code Style

Theo `frontend/CLAUDE.md`: arrow function, named export, JSX gọn trên một dòng, shadcn trước, chữ hiển thị bằng tiếng Việt, tên trung tâm lấy từ `siteConfig`. Logic tính toán nằm trong `features/`, là hàm thuần và có test. Component chỉ hiển thị.

```ts
// features/school/report.ts
export const summarizeMonth = (students: Student[], statuses: EvaluationStatuses, month: string) =>
  students.reduce((sum, student) => { sum[statuses[`${student.id}-${month}`] || "draft"]++; return sum; }, { draft: 0, updated: 0, locked: 0 });
```

```tsx
// components/school/report-list.tsx
const ResultChip = ({ value }: { value: Rating["result"] }) => <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${resultMeta[value].className}`}>{resultMeta[value].label}</span>;
```

## Giao diện với backend (đề xuất, cần backend xác nhận)

```ts
// features/school/report-export.ts
type ReportScope = { month: string; classId?: number; studentId?: number }; // month: "YYYY-MM"
export const getReportDownloadUrl = (scope: ReportScope): Promise<string>;  // URL tải file (có thể hết hạn)
```

- Có `studentId`: phiếu GDCN của một em. Chỉ có `classId`: phiếu của cả lớp. Không có cả hai: tất cả lớp.
- Lỗi được ném ra dưới dạng `Error` có `message` tiếng Việt để hiện cho người dùng.
- Cho tới khi có backend, bản mock trả lỗi "Chức năng tải báo cáo chưa được kết nối", để luồng lỗi có thể kiểm thử thật. Xem câu hỏi mở số 3.

## Testing Strategy

- **Unit (`pnpm test`, node:test):** `summarizeMonth` (tổng ba trạng thái bằng số học sinh; trường hợp chưa có phiếu tính là "Chưa đánh giá"), `studentProgress` (đếm `x/11` và số lượng từng mức kết quả; ô rỗng không bị đếm), `groupByCriteria` (giữ đúng thứ tự `criteria`).
- **UI (Playwright, headless):** bổ sung vào `scripts/a11y-check.mjs`:
  - Bấm "Xem chi tiết" bằng phím Enter thì `aria-expanded` chuyển thành `true`.
  - Bấm ô tóm tắt thì danh sách được lọc.
  - "Tải phiếu" với mock lỗi hiện `role="alert"`.
  - Ở 1440px, cột Trạng thái nằm trong khung nhìn khi ở chế độ bảng.
- **Bằng mắt:** `pnpm screenshot` ở 375/768/1440, so với ảnh trước khi làm.

## Boundaries

- **Always:**
  - Kết quả luôn có chữ đi kèm, không chỉ dựa vào màu hay ký hiệu.
  - Phân biệt "Chưa nhập" với "Chưa hoàn thành".
  - Chạy `pnpm build`, `pnpm test`, `pnpm a11y-check` và `pnpm layout-check` trước khi báo xong.
  - Dùng `siteConfig` cho tên trung tâm.
  - Giữ quy tắc phiếu đã khóa thì không sửa được.
- **Ask first:**
  - Thêm thư viện npm.
  - Đổi kiểu dữ liệu trong `types.ts` hoặc nhóm tiêu chí trong `data.ts`.
  - Chốt hợp đồng API thật với backend.
  - Đưa bộ lọc hay chế độ xem lên URL.
- **Never:**
  - Tạo file PDF hay DOCX ở frontend.
  - Viết cứng tên trung tâm (mẫu PDF có tên "Tâm Anh"; frontend không được chép tên đó vào).
  - Xóa hoặc nới lỏng các kiểm tra trong `a11y-check` cho dễ qua.

## Success Criteria

1. Ở 1440px, chế độ mặc định: thấy trạng thái của mọi học sinh mà **không cần cuộn ngang**. Ở chế độ bảng, cột Trạng thái nằm trong khung nhìn.
2. Ở 375px, 5 học sinh mẫu đều thu gọn: trang cao **≤ 1.700px** (hiện tại khoảng 3.800px).
3. Màn hình không còn tiêu đề hay logo lặp lại. Mỗi trang chỉ có một `h1` ("Báo cáo").
4. Ba ô tóm tắt đúng với dữ liệu, và có unit test chứng minh.
5. Mọi kết quả hiển thị đều có chữ. "Chưa nhập" có cách hiển thị khác hẳn "- Chưa hoàn thành".
6. Chi tiết từng em có nội dung can thiệp, nhóm theo lĩnh vực, và mở/đóng được bằng bàn phím.
7. Hai nút tải có đủ ba trạng thái (đang tải, thành công, lỗi), và lỗi được trình đọc màn hình đọc ra.
8. Không còn `window.print`, `flushSync` hay CSS chỉ dùng để in báo cáo trong code.
9. `pnpm build`, `pnpm test`, `pnpm a11y-check` và `pnpm layout-check` đều không lỗi.

## Open Questions

1. **API tải báo cáo:**
   - Endpoint, cách xác thực, và backend trả về URL hay trả thẳng file?
   - File tạo ngay (đồng bộ) hay phải chờ job (cần polling)?
   - Định dạng là PDF hay DOCX? Link có hết hạn không?
2. **Tải cả lớp hoặc tất cả lớp:** một file PDF nhiều trang hay một file zip gồm nhiều phiếu? Có cần thêm bảng tổng hợp dạng lưới không?
3. **Trước khi có backend,** nút tải nên:
   - (a) hiện nhưng báo "chưa kết nối" (đề xuất),
   - (b) bị ẩn, hay
   - (c) tạm giữ cách in bằng trình duyệt như hiện tại?
4. **Nhóm tiêu chí lệch với mẫu GDCN.** `data.ts` xếp "Kỹ năng bắt chước" vào nhóm "Kỹ năng", "Luyện hơi" vào nhóm "Ngôn ngữ", và "Tập trung chú ý" vào nhóm "Giao tiếp – xã hội". Trong mẫu PDF, cả ba là lĩnh vực riêng. Có sửa `data.ts` cho khớp mẫu không? Việc này ảnh hưởng tới cách nhóm ở US3 và tới file backend tạo ra.
5. **Mẫu GDCN có "Họ và tên trị liệu viên"**, nhưng dữ liệu hiện chỉ có giáo viên của lớp. Backend lấy tên trị liệu viên từ đâu?
6. Có cần đưa bộ lọc (lớp, tháng, trạng thái, chế độ xem) lên URL để gửi link cho người khác không?
