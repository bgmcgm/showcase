// ZUVERDIENST-RECHNER: alle Grenzwerte und Beträge zentral.
// ACHTUNG: PLATZHALTERWERTE! Vor Livegang prüfen (z. B. sozialministerium.gv.at, pv.at, oesterreich.gv.at).
// Keine Rechts- oder Steuerberatung.

export const earnings = {
  stand: "30.09.2026",
  hinweis:
    "Stand: 30.09.2026 – Werte sind Platzhalter, bitte prüfen. Keine Rechts- oder Steuerberatung. Verbindliche Auskunft erteilt die Pensionsversicherung.",

  geringfuegigkeitsgrenzeMonat: 551.10, // PLATZHALTER (Jahreswert prüfen)

  szenarien: {
    regelpension: {
      label: "Regelpension (ab Regelpensionsalter)",
      beschreibung:
        "Beim Erreichen des Regelpensionsalters darf zur Pension unbegrenzt dazuverdient werden. Es fallen Sozialversicherung und Lohnsteuer nach den üblichen Regeln an.",
      freibetragMonat: null as number | null, // kein Limit
      pauschalSteuersatz: null as number | null,
      svSatzDienstnehmer: 0.0, // PLATZHALTER: Anteil der SV-Abgaben auf Zuverdienst (Arbeitslosenvers. entfällt ggf.)
      voraussetzungen: ["Regelpensionsalter erreicht (PLATZHALTER: Alter prüfen)"],
    },
    aktivpension: {
      label: "Aktivpension (ab 2027)",
      beschreibung:
        "PLATZHALTER: Geplantes Modell ab 2027 zur Anreizsetzung für Arbeit in der Pension. Konkrete Ausgestaltung (Freibetrag, Steuersatz, Beiträge) bitte anhand der finalen Gesetzeslage eintragen.",
      freibetragMonat: 0 as number | null, // PLATZHALTER
      pauschalSteuersatz: 0.25 as number | null, // PLATZHALTER
      svSatzDienstnehmer: 0.0, // PLATZHALTER
      voraussetzungen: ["Regelpensionsalter erreicht (PLATZHALTER)", "Gesetzlicher Start 2027 (PLATZHALTER)"],
    },
    fruehpension: {
      label: "Früh-/Korridorpension",
      beschreibung:
        "Bei vorzeitiger Alterspension gilt eine Zuverdienstgrenze; wird sie überschritten, kann die Pension ruhen. In der Regel ist nur eine geringfügige Beschäftigung unschädlich.",
      freibetragMonat: 551.10 as number | null, // PLATZHALTER = Geringfügigkeitsgrenze
      pauschalSteuersatz: null as number | null,
      svSatzDienstnehmer: 0.0,
      voraussetzungen: [
        "Zuverdienst nur bis zur Geringfügigkeitsgrenze (PLATZHALTER)",
        "Über der Grenze: Ruhen der Pension möglich (PLATZHALTER)",
      ],
    },
  },
};
export type SzenarioKey = keyof typeof earnings.szenarien;
