export { AREAS, POPULAR_SEARCHES } from "@/lib/brand";

export const MODE_LABEL: Record<string, string> = {
  online: "Trực tuyến",
  offline: "Trực tiếp",
  both: "Cả hai",
};

export const TX_LABEL: Record<string, string> = {
  pending: "Đang chờ",
  accepted: "Đã nhận",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const REQUEST_LABEL: Record<string, string> = {
  open: "Đang mở",
  matched: "Đã kết nối",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  hidden: "Đã ẩn",
};

export const LISTING_LABEL: Record<string, string> = {
  active: "Đang hiển thị",
  hidden: "Đã ẩn",
  closed: "Đã đóng",
  deleted: "Đã xóa",
};

export const REPORT_LABEL: Record<string, string> = {
  open: "Chưa xử lý",
  reviewing: "Đang xem",
  resolved: "Đã xử lý",
  dismissed: "Bỏ qua",
};

export const REPORT_TARGET_LABEL: Record<string, string> = {
  user: "Tài khoản",
  skill: "Tin kỹ năng",
  request: "Yêu cầu",
  review: "Đánh giá",
};

export const LEDGER_LABEL: Record<string, string> = {
  earn: "Nhận Time Credit",
  spend: "Sử dụng Time Credit",
  bonus: "Thưởng hệ thống",
  adjustment: "Điều chỉnh",
};
