"use client";
import { useState } from "react";
import { createProfile } from "@/app/actions";
import { region } from "@/config/regions.config";
import { erfahrungTags, zeitraeume } from "@/config/app.config";
import { texts, tr, type Anrede } from "@/config/texts";

export default function Onboarding({ anrede }: { anrede: Anrede }) {
  const [step, setStep] = useState(1);
  const [ort, setOrt] = useState(region.orte[0].name);
  const [a, setA] = useState<Anrede>(anrede);
  const o = texts.onboarding;
  const teile = region.orte.find((x) => x.name === ort)?.ortsteile ?? [];
  const titles = [tr(o.schritt1, a), tr(o.schritt2, a), tr(o.schritt3, a)];

  function next(e: React.MouseEvent) {
    const form = (e.currentTarget as HTMLElement).closest("form")!;
    const sec = form.querySelector<HTMLElement>(`[data-step="${step}"]`)!;
    for (const el of sec.querySelectorAll<HTMLInputElement>("input,select,textarea")) if (!el.reportValidity()) return;
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  }

  return (
    <form action={createProfile} className="card" style={{ fontSize: "1.1rem" }}>
      <ol className="steps" style={{ listStyle: "none", padding: 0 }} aria-label="Fortschritt">
        {titles.map((_, i) => <li key={i} className={"" } style={{ display: "contents" }}><span className={step === i + 1 ? "on" : ""} aria-current={step === i + 1 ? "step" : undefined}>Schritt {i + 1} von 3</span></li>)}
      </ol>
      <h2 aria-live="polite">{titles[step - 1]}</h2>

      <div data-step="1" hidden={step !== 1}>
        <div className="field"><label htmlFor="vorname">Vorname</label>
          <input id="vorname" name="vorname" type="text" required autoComplete="given-name" maxLength={40} /></div>
        <div className="field"><label htmlFor="ort">Ort</label>
          <select id="ort" name="ort" value={ort} onChange={(e) => setOrt(e.target.value)}>
            {region.orte.map((x) => <option key={x.name}>{x.name}</option>)}
          </select></div>
        {teile.length > 0 && (
          <div className="field"><label htmlFor="ortsteil">Ortsteil (freiwillig)</label>
            <select id="ortsteil" name="ortsteil"><option value="">–</option>{teile.map((t) => <option key={t}>{t}</option>)}</select></div>
        )}
        <div className="field"><label htmlFor="anrede">Wie möchten Sie angesprochen werden?</label>
          <select id="anrede" name="anrede" value={a} onChange={(e) => setA(e.target.value as Anrede)}>
            <option value="sie">Mit „Sie“</option><option value="du">Mit „Du“</option>
          </select></div>
        <p className="notice ok">{tr(o.datenschutz, a)}</p>
      </div>

      <div data-step="2" hidden={step !== 2}>
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: ".3rem" }}>Was passt? (mehrere möglich)</legend>
          <div className="check-grid">{erfahrungTags.map((t) => <label key={t}><input type="checkbox" name="tags" value={t} />{t}</label>)}</div>
        </fieldset>
        <div className="field"><label htmlFor="erfahrung">In eigenen Worten</label>
          <textarea id="erfahrung" name="erfahrung" maxLength={1000} placeholder="z. B. 30 Jahre im Service gearbeitet …" /></div>
      </div>

      <div data-step="3" hidden={step !== 3}>
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: ".3rem" }}>Wann haben Sie Zeit?</legend>
          <div className="check-grid">{Object.entries(zeitraeume).map(([k, v]) => <label key={k}><input type="checkbox" name="verfuegbarkeit" value={k} />{v}</label>)}</div>
        </fieldset>
        <div className="field"><label htmlFor="radius">Wie weit würden Sie fahren?</label>
          <select id="radius" name="radius" defaultValue="10">{[5, 10, 15, 25].map((r) => <option key={r} value={r}>{r} km</option>)}</select></div>
        <div className="field"><label htmlFor="email">E-Mail</label><input id="email" name="email" type="email" required autoComplete="email" />
          <p className="hint">Wird erst sichtbar, wenn beide Seiten Interesse gezeigt haben.</p></div>
        <div className="field"><label htmlFor="tel">Telefon (freiwillig)</label><input id="tel" name="tel" type="tel" autoComplete="tel" /></div>
        <p className="hint">Ein Foto ist nicht nötig.</p>
      </div>

      <div className="actions">
        {step > 1 && <button type="button" className="btn secondary big" onClick={() => setStep(step - 1)}>Zurück</button>}
        {step < 3 && <button type="button" className="btn big" onClick={next}>Weiter</button>}
        {step === 3 && <button className="btn big">Profil anlegen</button>}
      </div>
    </form>
  );
}
