import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Header from "@/components/Header";
import { app } from "@/config/app.config";
import { region } from "@/config/regions.config";

export const metadata: Metadata = {
  title: { default: `${app.title} – ${region.name}`, template: `%s – ${app.title}` },
  description: app.claim,
  robots: { index: false }, // Prototyp
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-AT">
      <body>
        <a className="skip" href="#inhalt">Zum Inhalt springen</a>
        <Header />
        <main id="inhalt" className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p>
              {app.title} · Region: {region.name}. Prototyp mit fiktiven Daten. Wir sind Treffpunkt und Ideengeber, kein Arbeitgeber und keine Vermittlung.
            </p>
            <p><Link href="/impressum">Impressum</Link> · <Link href="/datenschutz">Datenschutz</Link> · Keine Tracker, keine Cookies außer technisch notwendigen.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
