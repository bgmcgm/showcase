import Link from "next/link";
import Rechner from "@/components/Rechner";
import { texts } from "@/config/texts";
import { tName } from "@/components/labels";

export const metadata = { title: "Ideen & Zuverdienst" };

export default function Ideen() {
  return (
    <>
      <h1>Ideen & Zuverdienst</h1>
      <p>Was ist möglich, und was bleibt netto? Hier finden Sie Inspiration und einen ersten Überblick.</p>
      <Rechner />
      <h2 style={{ marginTop: "2rem" }}>Beispiel-Jobs</h2>
      <div className="grid">
        {texts.jobBeispiele.map((j) => (
          <article className="card" key={j.titel}>
            <h3>{j.titel}</h3>
            <p className="chip acc" style={{ display: "inline-block" }}>{tName(j.taetigkeit)}</p>
            <p>{j.umfang}</p>
            <p className="hint">{j.beispiel} (fiktiv)</p>
            <Link className="btn secondary" href={`/?taetigkeit=${j.taetigkeit}&ansicht=liste`}>Passende Gesuche</Link>
          </article>
        ))}
      </div>
      <p style={{ marginTop: "1.5rem" }}>Sie sind Betrieb? <Link href="/ideen/fuer-betriebe">So beschäftigen Sie Pensionist:innen</Link>.</p>
    </>
  );
}
