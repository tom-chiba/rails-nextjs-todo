import type { Metadata } from "next";
import { DM_Serif_Display, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Sumi Todo",
  description: "A todo app inspired by washi paper and sumi ink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${dmSerif.variable} ${zenKaku.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink-black focus:px-4 focus:py-2 focus:text-washi-white focus:outline-none"
        >
          メインコンテンツへスキップ
        </a>
        {children}
      </body>
    </html>
  );
}
