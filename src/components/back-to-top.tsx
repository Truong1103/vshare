"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-terracotta text-white shadow-lg shadow-terracotta/30 transition hover:bg-terracotta-dark"
      aria-label="Về đầu trang"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
