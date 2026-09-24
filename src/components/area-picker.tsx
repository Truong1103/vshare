"use client";

import { useMemo, useState } from "react";
import { PROVINCES, districtsOf, formatArea, parseArea, wardsOf } from "@/lib/locations";
import { inputClass } from "@/components/ui";

export function AreaPicker({
  name = "area",
  defaultValue,
  onChange,
  autoSubmit,
}: {
  name?: string;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  autoSubmit?: boolean;
}) {
  const initial = parseArea(defaultValue);
  const [province, setProvince] = useState(initial.province);
  const [district, setDistrict] = useState(initial.district);
  const [ward, setWard] = useState(initial.ward);

  const districts = useMemo(() => districtsOf(province), [province]);
  const wards = useMemo(() => wardsOf(province, district), [province, district]);
  const online = province === "Trực tuyến";
  const value = formatArea(province, online ? "" : district, online ? "" : ward);

  function emit(next: { province?: string; district?: string; ward?: string }, form?: HTMLFormElement | null) {
    const p = next.province ?? province;
    const d = next.district ?? district;
    const w = next.ward ?? ward;
    const composed = formatArea(p, p === "Trực tuyến" ? "" : d, p === "Trực tuyến" ? "" : w);
    onChange?.(composed);
    if (autoSubmit && form) {
      window.setTimeout(() => form.requestSubmit(), 0);
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <input type="hidden" name={name} value={value} />
      <select
        value={province}
        className={inputClass()}
        onChange={(e) => {
          const p = e.target.value;
          setProvince(p);
          setDistrict("");
          setWard("");
          emit({ province: p, district: "", ward: "" }, e.currentTarget.form);
        }}
      >
        <option value="">Tỉnh / thành</option>
        {PROVINCES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <select
        value={district}
        disabled={online || !province}
        className={inputClass()}
        onChange={(e) => {
          const d = e.target.value;
          setDistrict(d);
          setWard("");
          emit({ district: d, ward: "" }, e.currentTarget.form);
        }}
      >
        <option value="">{online ? "Không áp dụng" : "Quận / huyện"}</option>
        {districts.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={ward}
        disabled={online || !district}
        className={inputClass()}
        onChange={(e) => {
          const w = e.target.value;
          setWard(w);
          emit({ ward: w }, e.currentTarget.form);
        }}
      >
        <option value="">{online || !district ? "Không áp dụng" : "Phường / xã"}</option>
        {wards.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
    </div>
  );
}
