export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatCredit(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  const fixed = Math.round(n * 100) / 100;
  const [intPart, dec] = Math.abs(fixed).toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = fixed < 0 ? "-" : "";
  if (dec === "00") return `${sign}${grouped}`;
  return `${sign}${grouped},${dec.replace(/0$/, "")}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function sanitizeSearch(raw: string) {
  return raw.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function hoursToCredit(hours: number) {
  return Math.round(hours * 100) / 100;
}

export function mapError(message: string) {
  const key = message.replace(/^.*ERROR:\s*/i, "").split("\n")[0].trim();
  const table: Record<string, string> = {
    UNAUTHENTICATED: "Bạn cần đăng nhập.",
    BANNED: "Tài khoản đang bị khóa.",
    NOT_FOUND: "Không tìm thấy dữ liệu.",
    REQUEST_NOT_OPEN: "Yêu cầu này không còn mở.",
    CANNOT_HELP_SELF: "Bạn không thể nhận hỗ trợ chính mình.",
    ALREADY_MATCHED: "Yêu cầu đã được người khác nhận.",
    REQUESTER_INSUFFICIENT_CREDIT: "Người cần hỗ trợ không đủ Time Credit.",
    INSUFFICIENT_CREDIT: "Bạn không đủ Time Credit.",
    SKILL_UNAVAILABLE: "Tin kỹ năng không còn khả dụng.",
    CANNOT_REQUEST_SELF: "Bạn không thể gửi yêu cầu cho chính mình.",
    INVALID_HOURS: "Thời lượng không hợp lệ.",
    FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
    INVALID_STATUS: "Trạng thái giao dịch không phù hợp.",
    CANCELLED: "Giao dịch đã bị hủy.",
    NOT_ACCEPTED: "Giao dịch chưa được nhận.",
    NOT_COMPLETED: "Chỉ đánh giá sau khi giao dịch hoàn thành.",
    INVALID_RATING: "Điểm đánh giá phải từ 1 đến 5 sao.",
    duplicate_key: "Bạn đã đánh giá giao dịch này rồi.",
  };
  for (const [k, v] of Object.entries(table)) {
    if (key.includes(k) || message.includes(k)) return v;
  }
  return "Không thể hoàn tất thao tác. Vui lòng thử lại.";
}

export function formAction(
  fn: ((data: FormData) => Promise<unknown>) | (() => Promise<unknown>)
): (data: FormData) => Promise<void> {
  return fn as unknown as (data: FormData) => Promise<void>;
}

export function one<T>(value: T | T[] | null | undefined): (T extends (infer U)[] ? U : T) | null {
  if (value == null) return null;
  return (Array.isArray(value) ? value[0] ?? null : value) as T extends (infer U)[] ? U : T;
}

export function initials(name?: string | null) {
  const parts = (name || "V").trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "V").join("");
}
