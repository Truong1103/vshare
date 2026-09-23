"use client";

export default function ErrorState({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
      <p className="kicker">Lỗi</p>
      <h2 className="mt-2 text-2xl font-extrabold">Có lỗi xảy ra</h2>
      <p className="mt-2 text-sm text-muted">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white">
        Thử lại
      </button>
    </div>
  );
}
