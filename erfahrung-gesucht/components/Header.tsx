import Link from "next/link";
import { app } from "@/config/app.config";
import { texts, type Anrede } from "@/config/texts";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { switchIdentity, setAnrede } from "@/app/actions";

export default async function Header() {
  const u = await getCurrentUser();
  const [businesses, seniors] = await Promise.all([
    db.business.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.seniorProfile.findMany({ orderBy: { vorname: "asc" }, select: { id: true, vorname: true, ort: true } }),
  ]);
  const current = u.role === "guest" ? "guest" : `${u.role}:${u.id}`;
  return (
    <header className="site-header">
      <div className="demo" role="region" aria-label="Demo-Modus">
        <div className="wrap in">
          <strong>Demo-Modus (simulierte Anmeldung):</strong>
          <form action={switchIdentity} style={{ display: "contents" }}>
            <input type="hidden" name="back" value="/" />
            <label htmlFor="who" className="sr">Ansicht als</label>
            <select id="who" name="who" defaultValue={current} style={{ width: "auto", maxWidth: "70vw" }}>
              <option value="guest">Gast (nicht angemeldet)</option>
              <optgroup label="Betrieb">
                {businesses.map((b) => <option key={b.id} value={`business:${b.id}`}>{b.name}</option>)}
              </optgroup>
              <optgroup label="Senior:in">
                {seniors.map((s) => <option key={s.id} value={`senior:${s.id}`}>{s.vorname} ({s.ort})</option>)}
              </optgroup>
            </select>
            <button className="btn secondary" style={{ minHeight: 40 }}>Wechseln</button>
          </form>
          {u.role === "guest" && (
            <form action={setAnrede} style={{ display: "contents" }}>
              <input type="hidden" name="back" value="/" />
              <label htmlFor="anrede" className="sr">Anrede</label>
              <select id="anrede" name="anrede" defaultValue={u.anrede} style={{ width: "auto" }}>
                <option value="sie">Sie-Form</option>
                <option value="du">Du-Form</option>
              </select>
              <button className="btn secondary" style={{ minHeight: 40 }}>OK</button>
            </form>
          )}
          <span>
            {u.role === "guest" ? "Gast" : u.role === "business" ? `Betrieb: ${u.name}` : `Senior:in: ${u.name}`}
          </span>
        </div>
      </div>
      <div className="wrap bar">
        <Link href="/" className="brand">{app.title}</Link>
        <nav className="nav" aria-label="Hauptmenü">
          <Link href="/">{texts.nav.karte}</Link>
          <Link href="/ideen">{texts.nav.ideen}</Link>
          <Link href="/ideen/fuer-betriebe">{texts.nav.fuerBetriebe}</Link>
          <Link href="/meine-kontakte">{texts.nav.kontakte}</Link>
          {u.role === "business" ? <Link href="/gesuche/neu">Gesuch erstellen</Link> : <Link href="/ich-biete">Ich biete</Link>}
        </nav>
      </div>
    </header>
  );
}
