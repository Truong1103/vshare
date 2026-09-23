import { PublicHeader, PublicFooter } from "@/components/shell";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="kicker">404</p>
        <h1 className="mt-3 text-4xl font-extrabold">Không tìm thấy trang</h1>
        <p className="mt-3 text-muted">Nội dung có thể đã được ẩn hoặc đường dẫn không còn tồn tại.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white">
          Về trang chủ
        </Link>
      </div>
      <PublicFooter />
    </div>
  );
}
