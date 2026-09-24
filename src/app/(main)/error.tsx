"use client";

export default function ErrorState({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const hidden = /server components|digest/i.test(error.message || "");
  return (
    <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
      <p className="kicker">Lỗi</p>
      <h2 className="mt-2 text-2xl font-extrabold">Có lỗi xảy ra</h2>
      <p className="mt-2 text-sm text-muted">
        {hidden ? "Không tải được trang này. Thử lại, hoặc quay về tổng quan." : error.message}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={reset} className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white">
          Thử lại
        </button>
        <a href="/bang-dieu-khien" className="rounded-xl border border-line px-4 py-2 text-sm font-semibold">
          Tổng quan
        </a>
      </div>
    </div>
  );
}
