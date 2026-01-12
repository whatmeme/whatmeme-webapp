import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "whatmeme",
  description: "한국 밈 트렌드 분석 및 추천 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
