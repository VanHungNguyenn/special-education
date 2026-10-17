import type { SchoolClass, Student } from "./types";

export const initialClasses: SchoolClass[] = [
  { id: 1, name: "Lớp Mầm Xanh", teacher: "Nguyễn Hà Linh", note: "Tập trung phát triển giao tiếp và kỹ năng tự phục vụ." },
  { id: 2, name: "Lớp Cầu Vồng", teacher: "Trần Minh Thư", note: "Tăng cường hoạt động nhóm và tương tác xã hội." },
  { id: 3, name: "Lớp Ánh Dương", teacher: "Phạm Thu Trang", note: "Phát triển nhận thức thông qua trải nghiệm và vận động." },
];

export const initialStudents: Student[] = [
  { id: 1, classId: 1, name: "Nguyễn Minh Anh", birthDate: "2016-04-12", gender: "Nữ", guardian: "Nguyễn Thị Mai", phone: "090 123 4567", address: "Ba Đình, Hà Nội", note: "Giao tiếp tốt bằng hình ảnh trực quan." },
  { id: 2, classId: 1, name: "Trần Gia Huy", birthDate: "2017-08-23", gender: "Nam", guardian: "Trần Hoàng Nam", phone: "091 234 5678", address: "Cầu Giấy, Hà Nội", note: "Cần thêm thời gian làm quen với hoạt động nhóm." },
  { id: 3, classId: 1, name: "Lê Hà My", birthDate: "2016-11-05", gender: "Nữ", guardian: "Lê Minh Hoàng", phone: "098 345 6789", address: "Đống Đa, Hà Nội", note: "Hứng thú với âm nhạc và hoạt động vận động." },
  { id: 4, classId: 2, name: "Phạm Đức Minh", birthDate: "2018-02-17", gender: "Nam", guardian: "Phạm Hồng Nhung", phone: "093 456 7890", address: "Hai Bà Trưng, Hà Nội", note: "Phản hồi tốt với lịch hoạt động có cấu trúc." },
  { id: 5, classId: 2, name: "Vũ Khánh Linh", birthDate: "2017-06-30", gender: "Nữ", guardian: "Vũ Thanh Hà", phone: "097 567 8901", address: "Thanh Xuân, Hà Nội", note: "Đang phát triển kỹ năng tự phục vụ." },
];

export const criteria = [
  { group: "Kỹ năng vận động", name: "Vận động thô" },
  { group: "Kỹ năng vận động", name: "Vận động tinh" },
  { group: "Kỹ năng", name: "Kỹ năng bắt chước" },
  { group: "Ngôn ngữ", name: "Luyện hơi/cơ quan cấu âm" },
  { group: "Nhận thức", name: "Nhận thức" },
  { group: "Ngôn ngữ", name: "Ngôn ngữ thể hiện" },
  { group: "Ngôn ngữ", name: "Ngôn ngữ tiếp nhận" },
  { group: "Kỹ năng", name: "Kỹ năng tự phục vụ" },
  { group: "Giao tiếp – xã hội", name: "Kỹ năng giao tiếp – xã hội" },
  { group: "Giao tiếp – xã hội", name: "Tập trung chú ý – giao tiếp mắt" },
  { group: "Hành vi", name: "Các vấn đề về hành vi" },
];

export const resultOptions = [
  { value: "+", label: "+  Đã hoàn thành" },
  { value: "+/-", label: "+/-  Thực hiện cần trợ giúp" },
  { value: "-", label: "-  Chưa hoàn thành" },
] as const;
