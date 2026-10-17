# Nghiệp vụ và mô hình dữ liệu

Các kiểu dữ liệu được định nghĩa trong `src/features/school/types.ts` và `data.ts`.

## Lớp học (`SchoolClass`)

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `id` | number | |
| `name` | string | Ví dụ: "Lớp Mầm Xanh" |
| `teacher` | string | Giáo viên phụ trách |
| `note` | string | Định hướng của lớp |

## Học sinh (`Student`)

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `id` | number | |
| `classId` | number | Lớp mà học sinh thuộc về |
| `name` | string | |
| `birthDate` | string | Định dạng `YYYY-MM-DD` |
| `gender` | string | "Nam" hoặc "Nữ" |
| `guardian` | string | Phụ huynh hoặc người giám hộ |
| `phone`, `address`, `note` | string | |

## Phiếu đánh giá theo tháng

Mỗi học sinh có một phiếu đánh giá cho mỗi tháng. Phiếu gồm 11 tiêu chí, lấy từ mảng `criteria` theo đúng thứ tự:

| # | Nhóm | Tiêu chí |
|---|---|---|
| 0 | Kỹ năng vận động | Vận động thô |
| 1 | Kỹ năng vận động | Vận động tinh |
| 2 | Kỹ năng | Kỹ năng bắt chước |
| 3 | Ngôn ngữ | Luyện hơi/cơ quan cấu âm |
| 4 | Nhận thức | Nhận thức |
| 5 | Ngôn ngữ | Ngôn ngữ thể hiện |
| 6 | Ngôn ngữ | Ngôn ngữ tiếp nhận |
| 7 | Kỹ năng | Kỹ năng tự phục vụ |
| 8 | Giao tiếp – xã hội | Kỹ năng giao tiếp – xã hội |
| 9 | Giao tiếp – xã hội | Tập trung chú ý – giao tiếp mắt |
| 10 | Hành vi | Các vấn đề về hành vi |

Mỗi tiêu chí có một `Rating` gồm:

- `result`: `"+"` là Đã hoàn thành, `"+/-"` là Thực hiện cần trợ giúp, `"-"` là Chưa hoàn thành, `""` là chưa đánh giá.
- `intervention`: ghi chú về biện pháp can thiệp (dạng text).

### Cấu trúc lưu trữ

```ts
Evaluations        = Record<"<studentId>-<YYYY-MM>", Record<criteriaIndex, Rating>>
EvaluationStatuses = Record<"<studentId>-<YYYY-MM>", "draft" | "updated" | "locked">
```

Lưu ý: rating được tham chiếu theo **chỉ số** trong mảng `criteria`. Nếu đổi thứ tự hoặc chèn thêm tiêu chí, dữ liệu cũ sẽ bị lệch.

### Trạng thái phiếu

```
draft (Bản nháp) ──Lưu──▶ updated (Đã cập nhật) ──Khóa và hoàn thành──▶ locked (Đã khóa)
```

- Phiếu chưa có trạng thái được coi là `draft`.
- Khi phiếu ở trạng thái `locked`, không thể sửa nữa: `updateRating` bỏ qua mọi thay đổi và giao diện vô hiệu hóa các ô nhập. Trước khi khóa, hệ thống hiện hộp thoại xác nhận.
- Hiện chưa có thao tác mở khóa.

## Quy tắc nghiệp vụ

- **Không được xóa lớp còn học sinh.** Hệ thống hiện thông báo "Chưa thể xóa lớp" và yêu cầu chuyển hoặc xóa học sinh trước.
- Xóa học sinh cần xác nhận. Nếu đang mở hồ sơ của học sinh đó, màn hình sẽ quay về danh sách.
- Bộ lọc lớp và tháng dùng chung cho tab Học sinh và tab Báo cáo.

## Báo cáo

Tab Báo cáo lọc theo lớp và tháng, và hiển thị trạng thái phiếu của từng học sinh. Tab này cho phép **xuất báo cáo danh sách** hoặc **xuất báo cáo từng học sinh**. Việc xuất dùng `window.print()`, tức là in hoặc lưu PDF từ trình duyệt. Header của bản in hiển thị logo và tên ngắn của trung tâm.
