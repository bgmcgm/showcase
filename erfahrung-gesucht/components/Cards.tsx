import Link from "next/link";
import { tName, zNames, aName } from "./labels";
import { csv } from "@/lib/util";

export function PostingCard({ p }: { p: { id: string; taetigkeit: string; zeitraum: string; tage: string; stundenProWoche: number; anstellungsart: string; business: { name: string; ort: string } } }) {
  return (
    <article className="card">
      <h3><Link href={`/gesuche/${p.id}`}>{tName(p.taetigkeit)} – {p.business.name}</Link></h3>
      <p style={{ margin: 0 }}>{p.business.ort} · {p.stundenProWoche} Std./Woche · {p.tage}</p>
      <ul className="chips" aria-label="Merkmale">
        <li className="chip acc">{aName(p.anstellungsart)}</li>
        {zNames(p.zeitraum).map((z) => <li key={z} className="chip">{z}</li>)}
      </ul>
    </article>
  );
}

export function ProfileCard({ s }: { s: { id: string; vorname: string; ort: string; ortsteil: string | null; erfahrung: string; tags: string; verfuegbarkeit: string; radiusKm: number } }) {
  return (
    <article className="card">
      <h3><Link href={`/profile/${s.id}`}>{s.vorname}</Link> · Raum {s.ort}{s.ortsteil ? `, ${s.ortsteil}` : ""}</h3>
      <p style={{ margin: 0 }}>{s.erfahrung.length > 110 ? s.erfahrung.slice(0, 110) + "…" : s.erfahrung}</p>
      <ul className="chips" aria-label="Merkmale">
        {csv(s.tags).map((t) => <li key={t} className="chip acc">{t}</li>)}
        {zNames(s.verfuegbarkeit).map((z) => <li key={z} className="chip">{z}</li>)}
        <li className="chip">Radius {s.radiusKm} km</li>
      </ul>
    </article>
  );
}
