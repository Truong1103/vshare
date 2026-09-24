"use client";

import { Field, inputClass, Button } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import { AreaPicker } from "@/components/area-picker";
import type { GiftCategory } from "@/types";

export function GiftFields({
  categories,
  defaults,
}: {
  categories: GiftCategory[];
  defaults?: {
    title?: string | null;
    description?: string | null;
    extra_info?: string | null;
    category_id?: string | null;
    area?: string | null;
    time_credit?: number | string | null;
    image_urls?: string[] | null;
    video_url?: string | null;
    status?: string | null;
  };
}) {
  const images = defaults?.image_urls || [];
  return (
    <div className="grid gap-4">
      <Field label="Tên món đồ / vật phẩm">
        <input name="title" required className={inputClass()} defaultValue={defaults?.title ?? ""} placeholder="Ví dụ: Bàn học gỗ, sách tiếng Anh..." />
      </Field>
      <Field label="Mô tả (tình trạng, đặc điểm)">
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
        <Field label="Time Credit muốn nhận">
          <input name="time_credit" type="number" min="0.5" step="0.5" required className={inputClass()} defaultValue={defaults?.time_credit ?? 1} />
        </Field>
      </div>
      <Field label="Địa điểm nhận / giao">
        <AreaPicker defaultValue={defaults?.area ? String(defaults.area) : ""} />
      </Field>
      <Field label="Thông tin bổ sung (không bắt buộc)">
        <textarea name="extra_info" rows={3} className={inputClass()} defaultValue={defaults?.extra_info ?? ""} placeholder="Giờ nhận đồ, lưu ý khi vận chuyển..." />
      </Field>
      {images.length ? (
        <div>
          <p className="mb-2 text-sm font-semibold">Ảnh hiện có — bỏ chọn để xóa</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {images.map((url) => (
              <label key={url} className="grid gap-2 rounded-xl border border-line p-2 text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-24 w-full rounded-lg object-cover" />
                <span className="flex items-center gap-2">
                  <input type="checkbox" name="keep_image" value={url} defaultChecked />
                  Giữ ảnh
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      <Field label="Thêm ảnh (tối đa 4, mỗi ảnh ≤ 5MB)">
        <input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className={inputClass()} />
      </Field>
      {defaults?.video_url ? (
        <div className="rounded-xl border border-line p-3">
          <p className="mb-2 text-sm font-semibold">Video hiện có</p>
          <video src={defaults.video_url} controls className="max-h-48 w-full rounded-lg bg-black" />
          <input type="hidden" name="keep_video" value={defaults.video_url} />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="remove_video" value="1" />
            Xóa video
          </label>
        </div>
      ) : null}
      <Field label="Video (không bắt buộc, 1 file ≤ 25MB)">
        <input name="video" type="file" accept="video/mp4,video/webm,video/quicktime" className={inputClass()} />
      </Field>
      {defaults?.status != null ? (
        <Field label="Trạng thái tin">
          <select name="status" className={inputClass()} defaultValue={String(defaults.status)}>
            <option value="open">Đang nhận yêu cầu</option>
            <option value="hidden">Ẩn</option>
            <option value="cancelled">Hủy tin</option>
          </select>
        </Field>
      ) : null}
      <div className="flex gap-2">
        <SubmitButton>Lưu tin tặng quà</SubmitButton>
        <Button type="reset" variant="secondary">
          Xóa nhập
        </Button>
      </div>
    </div>
  );
}
