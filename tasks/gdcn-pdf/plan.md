# Implementation Plan: Backend xuất phiếu GDCN ra PDF

Nguồn: [SPEC-backend.md](../../SPEC-backend.md), [SPEC.md](../../SPEC.md) (US5, câu hỏi mở 1–5), [docs/architecture.md](../../docs/architecture.md), mẫu [Mau_GDCN.pdf](../../Mau_GDCN.pdf). Danh sách task: [todo.md](todo.md).

## Overview

Mục tiêu: FE bấm "Tải phiếu" thì nhận về file PDF **giống mẫu `Mau_GDCN.pdf`**, do backend tạo từ phiếu đánh giá đã điền. Bỏ `window.print()`.

Chủ dự án đã chọn (2026-11-13): **backend đọc dữ liệu từ DB**, không nhận dữ liệu từ FE. Vì vậy phải làm theo thứ tự trong SPEC-backend: `audit → roster → evaluations → reports`. Mỗi module có spec riêng (`SPEC-<module>.md`) được duyệt trước khi code, và mỗi module nối luôn FE.

Plan này là lộ trình chung cho cả 4 module. Task của từng module sẽ được chỉnh lại sau khi spec module đó được duyệt.

## Architecture Decisions

- **Làm phần tạo PDF trước tiên, dưới dạng spike (Phase 1).** Đây là phần rủi ro nhất: Chromium trong Docker, font tiếng Việt, dựng lại đúng bảng của mẫu. Spike dùng dữ liệu cố định, không phụ thuộc roster/evaluations, nên làm song song được. Chủ dự án duyệt hình dạng PDF sớm, trước khi làm các module dữ liệu.
- **PDF tạo từ HTML template bằng Chromium headless (Playwright)**, theo SPEC-backend. Template là hàm thuần `renderGdcnHtml(data) → string`, test được không cần trình duyệt. Adapter `PdfRenderer` (port trong `domain`, implementation Playwright trong `infrastructure`) để unit test use case bằng renderer giả.
- **Image backend đổi từ `node:22-alpine` sang `node:22-bookworm-slim`** cho stage chạy, vì Playwright không hỗ trợ Alpine. Cài `chromium` bằng `playwright install --with-deps chromium` và font có dấu tiếng Việt (Times New Roman thay thế: `fonts-liberation` hoặc nhúng font vào template). Spike sẽ xác nhận kích thước image và thời gian tạo 1 phiếu.
- **Một trình duyệt dùng chung cho cả app**, mở lúc khởi động (hoặc lần gọi đầu), đóng khi app tắt. Mỗi request mở một page mới. Giới hạn số phiếu tạo cùng lúc (ví dụ 2) để không hết RAM trên server nhỏ.
- **Trả thẳng file**, không lưu: `GET /api/v1/reports/gdcn?studentId=…&month=YYYY-MM` trả `application/pdf` với `Content-Disposition: attachment; filename="GDCN_<ten-khong-dau>_<YYYY-MM>.pdf"`. FE tải bằng `fetch` + blob (để bắt được lỗi JSON và hiện thông báo), không mở link trần.
- **Tên, địa chỉ, logo trung tâm lấy từ env** (`CENTER_NAME`, `CENTER_ADDRESS`, `CENTER_LOGO_PATH` tùy chọn), không viết cứng "Tâm Anh".
- **Dữ liệu phiếu theo mẫu, không theo FE hiện tại.** Mẫu có nhiều dòng "Nội dung can thiệp", mỗi dòng có "Đánh giá" riêng; SPEC-backend đã chốt `EvaluationGoal` (nhiều mục tiêu mỗi tiêu chí). FE hiện chỉ có 1 ô nội dung + 1 kết quả mỗi tiêu chí, nên hồ sơ học sinh phải sửa ở Phase 4.
- **Tiêu chí lấy theo cột "Lĩnh vực can thiệp" của mẫu**: nhóm "Kỹ năng Vận động" (thô, tinh), "Ngôn ngữ" (thể hiện, tiếp nhận), "Kỹ năng" (tự phục vụ, giao tiếp – xã hội); các mục đứng riêng: Bắt chước, Luyện hơi/cơ quan cấu âm, Nhận thức, Tập trung chú ý – Giao tiếp mắt, Các vấn đề về hành vi. Trả lời câu hỏi mở 4 của SPEC.md: sửa theo mẫu. Bảng PDF gộp ô nhóm (`rowspan`) như mẫu.
- **Trị liệu viên = giáo viên phụ trách lớp** (SPEC-backend). Tuổi tính theo ngày sinh tại cuối tháng của phiếu. Ý kiến và chữ ký in trống.
- **Dòng chấm trống**: mỗi tiêu chí in tối thiểu số dòng như mẫu (4 hoặc 3); nếu có nhiều mục tiêu hơn thì thêm dòng. Phiếu chưa có nội dung vẫn in được (ra đúng mẫu trống).
- **Quyền**: giáo viên chỉ tải phiếu của học sinh lớp mình; quản lý tải được tất cả. Dùng lại phạm vi xem của `roster`.

## Dependency graph

```
Phase 1  Spike PDF (template + renderer + Docker)   ─────────────┐
Phase 2  audit (AuditLog, AuditRecorder)                          │
            │                                                     │
Phase 3  roster (Class, Student, phạm vi xem) + FE tab Lớp/Học sinh│
            │                                                     │
Phase 4  evaluations (Criterion seed theo mẫu, Evaluation, Goal)   │
         + FE hồ sơ học sinh (nhiều mục tiêu)                     │
            │                                                     │
Phase 5  reports: GET /reports/gdcn ◄────────────────────────────┘
         + FE "Tải phiếu", bỏ window.print
```

## Task List

### Phase 1: Spike tạo PDF (rủi ro cao, làm trước)
- [ ] T1: Template HTML phiếu GDCN + renderer Playwright, dữ liệu cố định → PDF giống mẫu
- [ ] T2: Chạy được trong Docker (dev + prod image), đo thời gian và dung lượng

### Checkpoint 1
- [ ] Chủ dự án so PDF mẫu với PDF sinh ra và duyệt

### Phase 2: audit
- [ ] T3: Viết `SPEC-audit.md` (bản tối giản: chỉ ghi, chưa có màn hình xem)
- [ ] T4: `AuditLog` + `AuditRecorder` dùng chung, ghi trong cùng transaction

### Phase 3: roster
- [ ] T5: Viết `SPEC-roster.md`
- [ ] T6: Lớp: API CRUD + FE tab "Lớp" dùng API
- [ ] T7: Học sinh: API CRUD (xóa mềm, phạm vi theo lớp) + FE tab "Học sinh" dùng API
- [ ] T8: `db:seed:demo` nạp lớp/học sinh mẫu

### Checkpoint 3
- [ ] Lớp và học sinh không còn mất khi tải lại trang; giáo viên chỉ thấy lớp mình

### Phase 4: evaluations
- [ ] T9: Viết `SPEC-evaluations.md`
- [ ] T10: Danh mục tiêu chí seed theo mẫu GDCN + API đọc
- [ ] T11: Phiếu tháng: lấy/tạo (snapshot tiêu chí), sửa mục tiêu + đánh giá; FE hồ sơ học sinh nhiều mục tiêu
- [ ] T12: Trạng thái `draft → updated → locked`, quản lý mở khóa; FE nút Cập nhật/Khóa

### Checkpoint 4
- [ ] Phiếu đánh giá lưu thật; phiếu đã khóa không sửa được (kiểm tra cả ở server)

### Phase 5: reports
- [ ] T13: Viết `SPEC-reports.md` (chốt API tải, trả lời câu hỏi mở 1–3, 5 của SPEC.md)
- [ ] T14: `GET /reports/gdcn` một học sinh + FE "Tải phiếu" ở hồ sơ và tab Báo cáo
- [ ] T15: Tải cả lớp / tất cả lớp (một PDF nhiều phiếu) + bỏ `window.print`, `flushSync`, CSS in
- [ ] T16: Deploy thật, smoke test tải phiếu trên server

### Checkpoint 5: Complete
- [ ] PDF tải từ server giống mẫu, đúng dữ liệu đã điền
- [ ] Không còn code in bằng trình duyệt

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Chromium không chạy trên Alpine; image to thêm ~300MB | High | Đổi stage chạy sang `bookworm-slim` (T2). Đo dung lượng; nếu server không đủ thì cân nhắc container Gotenberg riêng (hỏi trước) |
| Thiếu font tiếng Việt, dấu bị vỡ hoặc đổi font | High | Nhúng font (Liberation Serif / Tinos, giống Times New Roman) vào template; T1 có test so ảnh chụp trang |
| Hết RAM khi nhiều người tải cùng lúc | Med | Một browser dùng chung, giới hạn số trang đồng thời, timeout 20 giây |
| Bảng bị cắt giữa một tiêu chí khi sang trang 2 | Med | `break-inside: avoid` cho mỗi nhóm; test với phiếu có nhiều mục tiêu |
| Đổi id số → UUID làm vỡ FE (deep link `?student=`) | Med | Làm cùng T6–T7, sửa `types.ts` và deep link trong cùng task |
| Hồ sơ học sinh đổi sang nhiều mục tiêu là thay đổi UI lớn | Med | Chốt UI trong `SPEC-evaluations.md` trước khi làm T11 |
| Phiếu cũ trong mock dùng chỉ số mảng tiêu chí | Low | Mock không giữ lại; seed demo tạo phiếu mới theo id tiêu chí |

## Open Questions

1. **audit làm tối giản (chỉ ghi, chưa có màn hình xem lịch sử) có được không?** Plan đang giả định là có.
2. **Logo trung tâm:** có file logo thật không? Nếu chưa, PDF để trống chỗ logo (vẫn giữ bố cục).
3. **Địa chỉ trung tâm** in dưới tên: lấy từ env `CENTER_ADDRESS`, FE có cần biến tương ứng không?
4. **Tải cả lớp:** một PDF nhiều phiếu (plan đang chọn) hay file zip?
5. **Server deploy có bao nhiêu RAM?** Chromium cần khoảng 200–300MB khi đang tạo file.
6. Redesign tab Báo cáo trong SPEC.md (tóm tắt, danh sách, bảng) **không nằm trong plan này**; T14–T15 chỉ thay nút in bằng nút tải. Làm redesign sau hay gộp vào Phase 5?
