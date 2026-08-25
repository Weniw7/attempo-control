import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Attempo Control", description: "Centro interno de rentabilidad, proveedores, oportunidades y conversaciones de Attempo.", openGraph: { title: "Attempo Control", description: "Rentabilidad, proveedores y oportunidades", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: "Attempo Control", description: "Rentabilidad, proveedores y oportunidades", images: ["/og.png"] }, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
