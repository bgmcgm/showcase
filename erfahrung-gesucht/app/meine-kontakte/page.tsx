import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { tName } from "@/components/labels";

export const metadata = { title: "Meine Kontakte" };
export const dynamic = "force-dynamic";

export default async function Kontakte() {
  const u = await getCurrentUser();
  if (u.role === "guest") return (<><h1>Meine Kontakte</h1><p className="notice">Wählen Sie oben im Demo-Modus eine Rolle.</p></>);

  const rows = await db.interest.findMany({
    where: u.role === "senior" ? { seniorId: u.id } : { posting: { businessId: u.id } },
    include: { posting: { include: { business: true } }, senior: true },
  });
  const pairs = new Map<string, typeof rows>();
  for (const r of rows) { const k = `${r.postingId}|${r.seniorId}`; pairs.set(k, [...(pairs.get(k) ?? []), r]); }
  const items = [...pairs.values()].map((rs) => ({ r: rs[0], match: rs.length === 2, mine: rs.some((x) => x.von === u.role) }));
  items.sort((a, b) => Number(b.match) - Number(a.match));

  return (
    <>
      <h1>Meine Kontakte</h1>
      <p>Kontaktdaten sehen Sie erst, wenn beide Seiten Interesse gezeigt haben.</p>
      {items.length === 0 && <p>Noch nichts vorhanden. Stöbern Sie auf der <Link href="/">Karte</Link>.</p>}
      <div className="grid">
        {items.map(({ r, match, mine }) => {
          const p = r.posting;
          return (
            <article className="card" key={r.id}>
              <h3>{u.role === "senior" ? `${tName(p.taetigkeit)} – ${p.business.name}` : `${r.senior.vorname} für „${tName(p.taetigkeit)}“`}</h3>
              <p className="chip acc" style={{ display: "inline-block" }}>{match ? "Gegenseitig – Kontakt frei" : mine ? "Warten auf Antwort" : "Andere Seite hat Interesse gezeigt"}</p>
              {match && (
                <table className="kv"><tbody>
                  {u.role === "senior"
                    ? (<><tr><th>Ansprechperson</th><td>{p.business.kontaktName}</td></tr><tr><th>E-Mail</th><td><a href={`mailto:${p.business.kontaktEmail}`}>{p.business.kontaktEmail}</a></td></tr><tr><th>Telefon</th><td>{p.business.kontaktTel}</td></tr></>)
                    : (<><tr><th>Name</th><td>{r.senior.vorname}</td></tr><tr><th>E-Mail</th><td><a href={`mailto:${r.senior.kontaktEmail}`}>{r.senior.kontaktEmail}</a></td></tr><tr><th>Telefon</th><td>{r.senior.kontaktTel}</td></tr></>)}
                </tbody></table>
              )}
              <p><Link href={u.role === "senior" ? `/gesuche/${p.id}` : `/profile/${r.seniorId}`}>Details ansehen</Link></p>
            </article>
          );
        })}
      </div>
    </>
  );
}
