import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { createPosting } from "@/app/actions";
import { taetigkeiten, zeitraeume, anstellungsarten } from "@/config/app.config";

export const metadata = { title: "Gesuch erstellen" };
export const dynamic = "force-dynamic";

export default async function Neu() {
  const u = await getCurrentUser();
  if (u.role !== "business") {
    return (<><h1>Gesuch erstellen</h1><p className="notice">Bitte wählen Sie oben im Demo-Modus einen Betrieb aus.</p></>);
  }
  return (
    <>
      <h1>Gesuch erstellen</h1>
      <p>Für {u.name}. Ort und Standort stammen aus Ihrem Betriebsprofil.</p>
      <form action={createPosting} className="card">
        <div className="field"><label htmlFor="taetigkeit">Tätigkeit</label>
          <select id="taetigkeit" name="taetigkeit" required>
            {Object.entries(taetigkeiten).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: ".3rem" }}>Zeitraum</legend>
          <div className="check-grid">
            {Object.entries(zeitraeume).map(([k, v]) => <label key={k}><input type="checkbox" name="zeitraum" value={k} />{v}</label>)}
          </div></fieldset>
        <div className="field"><label htmlFor="tage">Tage / genaue Zeiten</label>
          <input id="tage" name="tage" type="text" placeholder="z. B. Fr–So ab 15 Uhr" required /></div>
        <div className="field"><label htmlFor="stunden">Stunden pro Woche</label>
          <input id="stunden" name="stunden" type="number" min={1} max={40} defaultValue={8} required /></div>
        <div className="field"><label htmlFor="anstellungsart">Gewünschte Anstellungsart</label>
          <select id="anstellungsart" name="anstellungsart">
            {Object.entries(anstellungsarten).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div className="field"><label htmlFor="beschreibung">Beschreibung</label>
          <textarea id="beschreibung" name="beschreibung" required maxLength={1500} />
          <p className="hint">Die Anstellung läuft direkt zwischen Ihnen und der Person, wir sind nur der Treffpunkt.</p></div>
        <button className="btn big">Gesuch veröffentlichen</button>
      </form>
    </>
  );
}
