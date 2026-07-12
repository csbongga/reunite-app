import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reunite — แพลตฟอร์มแจ้งของหายและพบของ",
  description: "Reunite ช่วยเชื่อมเจ้าของของหายกับผู้พบของอย่างปลอดภัย ตรวจสอบได้ และนัดรับคืนได้สะดวก",
  authors: [{ name: "Reunite" }],
  openGraph: {
    title: "Reunite — แพลตฟอร์มแจ้งของหายและพบของ",
    description: "ตามหา แจ้งพบ และนัดรับของคืนได้อย่างปลอดภัยในชุมชนที่ไว้ใจได้",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Reunite — แพลตฟอร์มแจ้งของหายและพบของ",
    description: "Reunite Found is a secure platform for reporting lost and found items to help reunite owners with their belongings.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
