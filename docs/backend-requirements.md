# Yêu cầu backend (rút ra từ frontend hiện tại)

Tài liệu này ghi lại những gì frontend đang làm bằng dữ liệu giả, tức là những gì backend phải cung cấp thật. Đây chưa phải thiết kế API, chỉ là đầu vào để lên kế hoạch. Chi tiết nghiệp vụ phía FE: [frontend/docs/domain.md](../frontend/docs/domain.md).

## 1. Thực thể

Lấy theo `frontend/src/features/school/types.ts`.

| Thực thể | Trường hiện có ở FE | Ghi chú cho BE |
|---|---|---|
| Lớp (`SchoolClass`) | `id`, `name`, `teacher`, `note` | `teacher` đang là chuỗi tên tự do. Khi có tài khoản giáo viên thì nên đổi thành khóa ngoại tới user |
| Học sinh (`Student`) | `id`, `classId`, `name`, `birthDate` (`YYYY-MM-DD`), `gender` ("Nam"/"Nữ"), `guardian`, `phone`, `address`, `note` | Đây là dữ liệu cá nhân của trẻ em nên cần phân quyền chặt |
| Phiếu đánh giá | khóa `` `${studentId}-${YYYY-MM}` ``, gồm 11 `Rating` (theo chỉ số tiêu chí) và một `status` | Mỗi học sinh có tối đa một phiếu cho mỗi tháng |
| `Rating` | `result`: `""` \| `"+"` \| `"+/-"` \| `"-"`, `intervention`: text | `""` nghĩa là chưa nhập, khác với `"-"` (chưa hoàn thành) |
| Tiêu chí | 11 mục `{ group, name }` cố định trong `data.ts` | FE tham chiếu tiêu chí theo **chỉ số mảng**. BE nên có id ổn định, FE sẽ đổi theo |
| Tài khoản | chưa có (đang viết cứng "Nguyễn Hà Linh", vai trò Giáo viên) | Spec báo cáo nhắc tới hai vai trò: giáo viên chủ nhiệm và quản lý trung tâm |

ID của lớp và học sinh mới hiện được sinh bằng `Date.now()` ở `entity-modal.tsx`. Khi có backend, ID sẽ do BE cấp.

## 2. Thao tác frontend cần

Lấy theo `use-school-management.ts` và `portal/page.tsx`.

| Thao tác FE | Việc BE cần làm |
|---|---|
| Tải `classes`, `students` khi mở portal | Lấy danh sách lớp và học sinh |
| `saveClass` / `saveStudent` | Tạo mới hoặc cập nhật (upsert theo `id`) |
| `deleteClass` | Xóa lớp. **Từ chối nếu lớp còn học sinh** |
| `deleteStudent` | Xóa học sinh (đã có hộp thoại xác nhận ở FE). Cần chốt: xóa cứng hay xóa mềm, và xử lý thế nào với phiếu đánh giá cũ |
| `updateRating(studentId, index, patch)` | Cập nhật một tiêu chí trong phiếu của tháng đang chọn. **Từ chối nếu phiếu đã `locked`** |
| `updateEvaluationStatus(studentId, "updated" \| "locked")` | Bấm "Lưu" thì chuyển sang `updated`, bấm "Khóa và hoàn thành" thì chuyển sang `locked`. Chưa có thao tác mở khóa |
| Tab Báo cáo: lọc theo lớp và tháng | Lấy phiếu và trạng thái của nhiều học sinh trong một tháng (để tránh N+1 request) |
| Xuất báo cáo | Hiện dùng `window.print()`. Theo [SPEC.md](../SPEC.md): BE tạo file theo mẫu `Mau_GDCN.pdf` và trả URL tải về, phạm vi `{ month, classId?, studentId? }` |
| Đăng nhập / đăng xuất | Hiện là giả lập. Cần xác thực thật, và trả về thông tin user cho menu tài khoản (tên, email, điện thoại, vai trò) |

Lọc theo tên học sinh hiện làm ở client (bỏ dấu bằng `fold()` trong `src/lib/utils.ts`). Với số lượng học sinh của một trung tâm thì không cần đưa lên server.

## 3. Quy tắc nghiệp vụ BE phải tự kiểm tra

FE đã chặn các trường hợp này trên giao diện, nhưng BE vẫn phải kiểm tra lại vì không được tin client:

- Phiếu ở trạng thái `locked` thì không sửa được.
- Trạng thái chỉ đi một chiều: `draft → updated → locked`. Phiếu chưa có bản ghi được coi là `draft`.
- Không xóa được lớp còn học sinh.
- `month` có định dạng `YYYY-MM`. `birthDate` có định dạng `YYYY-MM-DD` và là trường bắt buộc (FE đã chặn lưu khi thiếu).
- Thông báo lỗi nên viết bằng tiếng Việt để FE hiện thẳng cho người dùng (SPEC.md cũng đề xuất như vậy).

## 4. Cấu hình

- Tên trung tâm, tên ngắn và domain email không được viết cứng. FE lấy từ `NEXT_PUBLIC_CENTER_*` ([frontend/docs/configuration.md](../frontend/docs/configuration.md)). File báo cáo do BE tạo cũng cần đọc các giá trị này từ cấu hình.
- Biến `NEXT_PUBLIC_*` được nhúng vào lúc build FE. Nếu FE cần biết URL của API thì cũng phải truyền lúc build, hoặc gọi qua cùng domain bằng reverse proxy / rewrite của Next.

## 5. Triển khai

Hiện chỉ có service `frontend`. Khi thêm BE cần:

- Thêm service `backend` (và database nếu có) vào `docker-compose.yml` và `docker-compose.dev.yml`.
- Mở rộng `docker.sh` (lệnh `logs` và `status` đang lọc theo tên `special-education-frontend`).
- Workflow `.github/workflows/deploy.yml` chỉ chạy khi `frontend/**` thay đổi và chỉ build image FE. Cần thêm job build cho BE.

## 6. Câu hỏi mở

Các câu hỏi đã có trong mục Open Questions của [SPEC.md](../SPEC.md) (định dạng file báo cáo, sinh file đồng bộ hay qua job, nhóm tiêu chí lệch với mẫu GDCN, lấy tên trị liệu viên từ đâu). Ngoài ra còn:

1. Có những vai trò nào, và mỗi vai trò được xem hay sửa những gì? Giáo viên chỉ thấy lớp của mình hay thấy tất cả?
2. Có cần thao tác mở khóa phiếu (ví dụ chỉ quản lý được mở) không?
3. Có cần lưu lịch sử chỉnh sửa phiếu (ai sửa, sửa lúc nào) không?
4. Một học sinh chuyển lớp thì các phiếu cũ thuộc lớp nào?
5. Tháng mặc định hiện đang cố định là `2026-07`. Có nên lấy theo tháng hiện tại không?
