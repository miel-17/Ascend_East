import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascend East",
  description: "Rise beyond, move forward, find your Saturn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
