"use client";
import { useState } from "react";
import { earnings, type SzenarioKey } from "@/config/earnings.config";

const eur = (n: number) => n.toLocaleString("de-AT", { style: "currency", currency: "EUR" });

export default function Rechner() {
  const [sz, setSz] = useState<SzenarioKey>("regelpension");
  const [monat, setMonat] = useState(450);
  const s = earnings.szenarien[sz];
  const ueber = s.freibetragMonat != null && s.freibetragMonat > 0 && monat > s.freibetragMonat;
  const abzug = monat * ((s.svSatzDienstnehmer ?? 0) + (s.pauschalSteuersatz ?? 0));
  const geringfuegig = monat <= earnings.geringfuegigkeitsgrenzeMonat;

  return (
    <section className="card" aria-labelledby="rechner-h">
      <h2 id="rechner-h">Zuverdienst-Rechner</h2>
      <p className="notice"><strong>{earnings.hinweis}</strong></p>
      <fieldset className="field" style={{ border: 0, padding: 0 }}>
        <legend style={{ fontWeight: 600, marginBottom: ".4rem" }}>Ihre Pensionsart</legend>
        {(Object.keys(earnings.szenarien) as SzenarioKey[]).map((k) => (
          <label key={k} style={{ display: "flex", gap: ".6rem", alignItems: "center", fontWeight: 500, minHeight: 48 }}>
            <input type="radio" name="sz" checked={sz === k} onChange={() => setSz(k)} style={{ width: 24, height: 24, accentColor: "var(--primary)" }} />
            {earnings.szenarien[k].label}
          </label>
        ))}
      </fieldset>
      <p>{s.beschreibung}</p>
      <div className="field">
        <label htmlFor="monat">Geplanter Zuverdienst pro Monat (brutto, in Euro)</label>
        <input id="monat" type="number" min={0} step={10} value={monat} onChange={(e) => setMonat(Math.max(0, Number(e.target.value)))} />
      </div>
      <div aria-live="polite">
        <p>Jahreszuverdienst brutto: <span className="big-number">{eur(monat * 12)}</span></p>
        <p>Geringfügigkeitsgrenze ({eur(earnings.geringfuegigkeitsgrenzeMonat)}/Monat): {geringfuegig ? "unterschritten (geringfügig)" : "überschritten (vollversichert)"}.</p>
        {s.freibetragMonat != null && s.freibetragMonat > 0 && (
          <p className={ueber ? "notice" : "notice ok"}>
            Zuverdienstgrenze in diesem Szenario: {eur(s.freibetragMonat)}/Monat – {ueber ? "überschritten: Pension könnte ruhen oder gekürzt werden." : "eingehalten."}
          </p>
        )}
        {s.freibetragMonat == null && <p className="notice ok">In diesem Szenario gibt es keine Zuverdienstgrenze.</p>}
        <p>Grobe Abgabenschätzung: {eur(abzug)} · verbleibend ca. {eur(monat - abzug)} <span className="hint">(Platzhaltersätze!)</span></p>
      </div>
      <h3>Voraussetzungen</h3>
      <ul>{s.voraussetzungen.map((v) => <li key={v}>{v}</li>)}</ul>
      <p className="hint">Stand: {earnings.stand}. Bitte prüfen. Keine Rechts- oder Steuerberatung.</p>
    </section>
  );
}
