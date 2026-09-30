import { texts } from "@/config/texts";
export const metadata = { title: "Für Betriebe" };
export default function Page() {
  return (
    <>
      <h1>{texts.ideenBetriebe.titel}</h1>
      <p className="notice">Platzhaltertexte – Inhalte werden in <code>config/texts.ts</code> befüllt.</p>
      {texts.ideenBetriebe.abschnitte.map((a) => (<section key={a.h} className="card" style={{ marginBottom: "1rem" }}><h2>{a.h}</h2><p>{a.p}</p></section>))}
    </>
  );
}
