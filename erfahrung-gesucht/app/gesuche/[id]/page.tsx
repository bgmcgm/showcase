import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { matchState } from "@/lib/interest";
import { StatusBox } from "@/components/InterestBox";
import { tName, zNames, aName } from "@/components/labels";
import { ProfileCard } from "@/components/Cards";

export const dynamic = "force-dynamic";

export default async function Posting({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.jobPosting.findUnique({ where: { id }, include: { business: true } });
  if (!p) notFound();
  const u = await getCurrentUser();
  const back = `/gesuche/${p.id}`;

  let box: React.ReactNode = null;
  if (u.role === "guest") {
    box = <p className="notice">Wählen Sie oben im Demo-Modus eine Rolle, um Interesse zu zeigen.</p>;
  } else if (u.role === "senior") {
    const state = await matchState(p.id, u.id, "senior");
    box = <StatusBox state={state} back={back} postingId={p.id} label="Interesse an diesem Gesuch"
      contact={{ name: `${p.business.kontaktName} (${p.business.name})`, email: p.business.kontaktEmail, tel: p.business.kontaktTel }} />;
  } else if (u.id === p.businessId) {
    const interests = await db.interest.findMany({ where: { postingId: p.id }, include: { senior: true } });
    const seniorIds = [...new Set(interests.map((i) => i.seniorId))];
    box = (
      <section>
        <h2>Interessent:innen</h2>
        {seniorIds.length === 0 && <p>Noch niemand. Stöbern Sie in den <Link href="/?zeige=profile&ansicht=liste">Profilen</Link>.</p>}
        {(await Promise.all(seniorIds.map(async (sid) => {
          const s = interests.find((i) => i.seniorId === sid)!.senior;
          const state = await matchState(p.id, sid, "business");
          return (
            <div key={sid} style={{ marginBottom: "1rem" }}>
              <ProfileCard s={s} />
              <StatusBox state={state} back={back} postingId={p.id} seniorId={sid} label={`Kontakt zu ${s.vorname}`}
                contact={{ name: s.vorname, email: s.kontaktEmail, tel: s.kontaktTel }} />
            </div>
          );
        }))) }
      </section>
    );
  }

  return (
    <>
      <p><Link href="/">← Zurück zur Übersicht</Link></p>
      <h1>{tName(p.taetigkeit)} – {p.business.name}</h1>
      <p>{p.business.branche} in {p.business.ort}</p>
      <ul className="chips" aria-label="Merkmale">
        <li className="chip acc">{aName(p.anstellungsart)}</li>
        {zNames(p.zeitraum).map((z) => <li key={z} className="chip">{z}</li>)}
      </ul>
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <table className="kv"><tbody>
          <tr><th>Tage</th><td>{p.tage}</td></tr>
          <tr><th>Stunden/Woche</th><td>{p.stundenProWoche}</td></tr>
          <tr><th>Standort</th><td>{p.business.adresse}</td></tr>
        </tbody></table>
        <p style={{ marginTop: "1rem" }}>{p.beschreibung}</p>
      </div>
      {box}
    </>
  );
}
