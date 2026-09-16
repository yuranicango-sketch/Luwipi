import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luwipi — Piano para crianças",
  description: "Aprendizagem musical lúdica para crianças dos 2 aos 8 anos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
