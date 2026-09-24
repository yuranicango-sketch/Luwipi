import type { Metadata, Viewport } from "next";
import { OfflineRegister } from "@/components/offline-register";
import { OfflineAccessManager } from "@/components/offline-access-manager";
import { LocalLearningBootstrap } from "@/components/local-learning-bootstrap";
import "./globals.css";

const base = new URL(process.env.APP_URL || "https://luwipi.vercel.app");

export const metadata: Metadata = {
  metadataBase: base,
  title: { default: "Luwipi — Aulas de piano infantil", template: "%s · Luwipi" },
  description: "Aulas prontas, currículo em espiral e apoio ao professor de piano para crianças dos 2 aos 8 anos.",
  applicationName: "Luwipi",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "pt_AO", url: "/", siteName: "Luwipi", title: "Luwipi — Aulas de piano infantil", description: "Menos tempo a preparar. Mais tempo a ensinar." },
  twitter: { card: "summary_large_image", title: "Luwipi — Aulas de piano infantil", description: "Aulas prontas para professor, criança e família." },
  icons: { icon: "/icon.svg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f5f8f6", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
  return <html lang="pt" data-supabase-url={url} data-supabase-key={key}><body><OfflineRegister /><OfflineAccessManager /><LocalLearningBootstrap />{children}</body></html>;
}
