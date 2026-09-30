import Link from "next/link";
import { db } from "@/lib/db";
import { app, taetigkeiten, zeitraeume, umkreise } from "@/config/app.config";
import { region } from "@/config/regions.config";
import { texts } from "@/config/texts";
import { parseFilters, withinRadius, taetigkeitTags } from "@/lib/filters";
import { csv } from "@/lib/util";
import MapLoader from "@/components/MapLoader";
import { PostingCard, ProfileCard } from "@/components/Cards";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = parseFilters(sp);
  const ansicht = sp.ansicht === "liste" ? "liste" : "karte";

  const [postingsAll, seniorsAll] = await Promise.all([
    db.jobPosting.findMany({ where: { aktiv: true }, include: { business: true }, orderBy: { erstelltAm: "desc" } }),
    db.seniorProfile.findMany({ where: { aktiv: true, region: region.key }, orderBy: { vorname: "asc" } }),
  ]);

  const postings = postingsAll.filter((p) =>
    (!f.taetigkeit || p.taetigkeit === f.taetigkeit) &&
    (!f.zeitraum || csv(p.zeitraum).includes(f.zeitraum)) &&
    withinRadius(f, [p.business.lat, p.business.lng]));
  const seniors = seniorsAll.filter((s) => {
    const need = f.taetigkeit ? taetigkeitTags[f.taetigkeit] ?? [] : [];
    return (need.length === 0 || csv(s.tags).some((t) => need.includes(t))) &&
      (!f.zeitraum || csv(s.verfuegbarkeit).includes(f.zeitraum)) &&
      withinRadius(f, [s.fuzzyLat, s.fuzzyLng]);
  });

  const showP = f.zeige !== "profile";
  const showS = f.zeige !== "gesuche";

  const byBiz = new Map<string, { id: string; lat: number; lng: number; name: string; ort: string; postings: { id: string; label: string }[] }>();
  for (const p of postings) {
    const b = byBiz.get(p.businessId) ?? { id: p.businessId, lat: p.business.lat, lng: p.business.lng, name: p.business.name, ort: p.business.ort, postings: [] };
    b.postings.push({ id: p.id, label: `${taetigkeiten[p.taetigkeit as keyof typeof taetigkeiten] ?? p.taetigkeit} (${p.stundenProWoche} Std.)` });
    byBiz.set(p.businessId, b);
  }

  const q = (extra: Record<string, string>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && v) u.set(k, v);
    for (const [k, v] of Object.entries(extra)) u.set(k, v);
    return `/?${u.toString()}`;
  };

  return (
    <>
      <h1>{texts.home.titel}: {region.name}</h1>
      <p>{texts.home.claim}</p>
      <p className="notice">{texts.home.disclaimer}</p>

      <form method="get" className="card" aria-label="Filter">
        <div className="filters">
          <div><label htmlFor="taetigkeit">Tätigkeit</label>
            <select id="taetigkeit" name="taetigkeit" defaultValue={f.taetigkeit ?? ""}>
              <option value="">Alle</option>
              {Object.entries(taetigkeiten).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div><label htmlFor="zeitraum">Zeitraum</label>
            <select id="zeitraum" name="zeitraum" defaultValue={f.zeitraum ?? ""}>
              <option value="">Alle</option>
              {Object.entries(zeitraeume).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div><label htmlFor="ort">Ort</label>
            <select id="ort" name="ort" defaultValue={f.ort ?? ""}>
              <option value="">Ganzer Bezirk</option>
              {region.orte.map((o) => <option key={o.name}>{o.name}</option>)}
            </select></div>
          <div><label htmlFor="umkreis">Umkreis</label>
            <select id="umkreis" name="umkreis" defaultValue={f.umkreis ? String(f.umkreis) : ""}>
              <option value="">Beliebig</option>
              {umkreise.map((u) => <option key={u} value={u}>{u} km</option>)}
            </select></div>
          <div><label htmlFor="zeige">Anzeigen</label>
            <select id="zeige" name="zeige" defaultValue={f.zeige}>
              <option value="beide">Gesuche und Profile</option>
              <option value="gesuche">Nur Gesuche der Betriebe</option>
              <option value="profile">Nur Profile</option>
            </select></div>
        </div>
        <input type="hidden" name="ansicht" value={ansicht} />
        <div className="actions" style={{ marginTop: 0 }}>
          <button className="btn">Filtern</button>
          <Link className="btn secondary" href={`/?ansicht=${ansicht}`}>Zurücksetzen</Link>
        </div>
      </form>

      <div className="tabs" role="navigation" aria-label="Ansicht">
        <Link href={q({ ansicht: "karte" })} aria-current={ansicht === "karte"}>Karte</Link>
        <Link href={q({ ansicht: "liste" })} aria-current={ansicht === "liste"}>Liste</Link>
      </div>
      <p role="status">
        {showP && <>{postings.length} Gesuch{postings.length === 1 ? "" : "e"}</>}
        {showP && showS && " · "}
        {showS && <>{seniors.length} Profil{seniors.length === 1 ? "" : "e"}</>}
      </p>

      {ansicht === "karte" ? (
        <>
          <div className="legend" aria-hidden="true">
            <span><span className="sw" style={{ background: "var(--accent)" }} />Betrieb mit Gesuch (exakter Standort)</span>
            <span><span className="sw" style={{ background: "var(--primary)" }} />Senior:in – nur ungefährer Bereich (~1 km)</span>
          </div>
          <MapLoader
            center={region.center} zoom={region.zoom} tileUrl={app.tiles.url} attribution={app.tiles.attribution}
            businesses={showP ? [...byBiz.values()] : []}
            seniors={showS ? seniors.map((s) => ({ id: s.id, lat: s.fuzzyLat, lng: s.fuzzyLng, vorname: s.vorname, ort: s.ort, tags: s.tags })) : []}
          />
          <p className="hint">Kartenkacheln stammen von OpenStreetMap. Tipp: Alle Einträge finden Sie auch in der <Link href={q({ ansicht: "liste" })}>Liste</Link>.</p>
        </>
      ) : (
        <>
          {showP && (<><h2>Gesuche der Betriebe</h2><div className="grid">{postings.map((p) => <PostingCard key={p.id} p={p} />)}</div>{postings.length === 0 && <p>Keine Gesuche für diese Auswahl.</p>}</>)}
          {showS && (<><h2 style={{ marginTop: "1.5rem" }}>Profile: „Ich biete“</h2><div className="grid">{seniors.map((s) => <ProfileCard key={s.id} s={s} />)}</div>{seniors.length === 0 && <p>Keine Profile für diese Auswahl.</p>}</>)}
        </>
      )}
    </>
  );
}
