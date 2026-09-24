import { Field, inputClass, Button } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import { AREAS } from "@/lib/constants";
import type { Category } from "@/types";

export function ListingFields({
  categories,
  defaults,
  kind,
}: {
  categories: Category[];
  kind: "skill" | "request";
  defaults?: Record<string, string | number | null | undefined>;
}) {
  return (
    <div className="grid gap-4">
      <Field label="Tiêu đề">
        <input name="title" required className={inputClass()} defaultValue={defaults?.title ?? ""} />
      </Field>
      <Field label="Mô tả">
        <textarea name="description" required rows={5} className={inputClass()} defaultValue={defaults?.description ?? ""} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Danh mục">
          <select name="category_id" className={inputClass()} defaultValue={defaults?.category_id ?? ""}>
            <option value="">Chọn danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Khu vực (thí điểm Hà Nội, Nghệ An hoặc trực tuyến)">
          <select name="area" className={inputClass()} defaultValue={defaults?.area ?? ""}>
            <option value="">Chọn khu vực</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Hình thức hỗ trợ">
          <select name="mode" className={inputClass()} defaultValue={defaults?.mode ?? "both"}>
            <option value="online">Trực tuyến</option>
            <option value="offline">Trực tiếp</option>
            <option value="both">Cả hai</option>
          </select>
        </Field>
        {kind === "skill" ? (
          <Field label="Thời gian có thể hỗ trợ">
            <input name="availability" className={inputClass()} placeholder="Tối các ngày trong tuần" defaultValue={defaults?.availability ?? ""} />
          </Field>
        ) : (
          <Field label="Thời gian mong muốn">
            <input name="desired_time" className={inputClass()} placeholder="Cuối tuần này" defaultValue={defaults?.desired_time ?? ""} />
          </Field>
        )}
      </div>
      {kind === "request" ? (
        <Field label="Thời lượng dự kiến (giờ) — 1 giờ = 1 Time Credit">
          <input
            name="duration_hours"
            type="number"
            min="0.5"
            step="0.5"
            required
            className={inputClass()}
            defaultValue={defaults?.duration_hours ?? 1}
          />
        </Field>
      ) : null}
      {defaults?.status != null ? (
        <Field label="Trạng thái tin">
          <select name="status" className={inputClass()} defaultValue={String(defaults.status)}>
            {kind === "skill" ? (
              <>
                <option value="active">Đang hiển thị</option>
                <option value="hidden">Ẩn</option>
                <option value="closed">Đóng</option>
              </>
            ) : (
              <>
                <option value="open">Đang mở</option>
                <option value="hidden">Ẩn</option>
                <option value="cancelled">Hủy</option>
              </>
            )}
          </select>
        </Field>
      ) : null}
      <div className="flex gap-2">
        <SubmitButton>Lưu</SubmitButton>
        <Button type="reset" variant="secondary">
          Xóa nhập
        </Button>
      </div>
    </div>
  );
}
