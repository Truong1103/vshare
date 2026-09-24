import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { BackToTop } from "@/components/back-to-top";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "VShare – Ngân hàng Thời gian",
  description:
    "Ai cũng có thể cho đi và ai cũng được nhận lại. Nền tảng timebank phi tiền tệ, thí điểm tại Hà Nội và Nghệ An.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <BackToTop />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
