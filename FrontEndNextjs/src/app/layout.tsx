import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zelon Meal",
  description: "AI 기반 식단 추천 플랫폼",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased bg-[#F8FAFC] select-none text-gray-800">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
