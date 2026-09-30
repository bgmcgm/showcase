import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { matchState } from "@/lib/interest";
import { StatusBox } from "@/components/InterestBox";
import { zNames } from "@/components/labels";
import { csv } from "@/lib/util";
import { tName } from "@/components/labels";

export const dynamic = "force-dynamic";

export default async function Profile({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ neu?: string }> }) {
  const { id } = await params;
  const { neu } = await searchParams;
  const s = await db.seniorProfile.findUnique({ where: { id } });
  if (!s) notFound();
  const u = await getCurrentUser();
  const back = `/profile/${s.id}`;

  let box: React.ReactNode = null;
  if (u.role === "business") {
    const mine = await db.jobPosting.findMany({ where: { businessId: u.id, aktiv: true } });
    box = mine.length === 0 ? <p className="notice">Erstellen Sie zuerst ein <Link href="/gesuche/neu">Gesuch</Link>.</p> : (
      <>
        <h2>Interesse zeigen für eines Ihrer Gesuche</h2>
        {(await Promise.all(mine.map(async (p) => (
          <div key={p.id} style={{ marginBottom: "1rem" }}>
            <StatusBox state={await matchState(p.id, s.id, "business")} back={back} postingId={p.id} seniorId={s.id}
              label={`Gesuch: ${tName(p.taetigkeit)}`} contact={{ name: s.vorname, email: s.kontaktEmail, tel: s.kontaktTel }} />
          </div>
        ))))}
      </>
    );
  } else if (u.role === "guest") {
    box = <p className="notice">Wählen Sie oben im Demo-Modus „Betrieb“, um Interesse zu zeigen.</p>;
  }

  return (
    <>
      {neu && <p className="notice ok" role="status"><strong>Danke! Ihr Profil ist angelegt.</strong> Sie sind jetzt als {s.vorname} angemeldet (Demo). Stöbern Sie in den <Link href="/?zeige=gesuche">Gesuchen</Link>.</p>}
      <p><Link href="/">← Zurück zur Übersicht</Link></p>
      <h1>{s.vorname}</h1>
      <p>Raum {s.ort}{s.ortsteil ? `, ${s.ortsteil}` : ""} · Radius {s.radiusKm} km</p>
      <ul className="chips" aria-label="Merkmale">
        {csv(s.tags).map((t) => <li key={t} className="chip acc">{t}</li>)}
        {zNames(s.verfuegbarkeit).map((z) => <li key={z} className="chip">{z}</li>)}
      </ul>
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <p>{s.erfahrung}</p>
        <p className="hint">Es wird nur ein ungefährer Bereich angezeigt, niemals eine genaue Adresse.</p>
      </div>
      {box}
    </>
  );
}
