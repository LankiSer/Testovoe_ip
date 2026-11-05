import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { mantineHtmlProps } from "@mantine/core";
import { AppProviders } from "@/config/providers/app-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Объекты и задачи",
  description: "Управление объектами и задачами",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" {...mantineHtmlProps} className={geistSans.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
