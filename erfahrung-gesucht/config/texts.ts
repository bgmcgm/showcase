// UI-Texte mit Sie-/Du-Variante. Nur Texte, die Senior:innen direkt ansprechen, brauchen beide.
import { app } from "./app.config";

export type Anrede = "sie" | "du";

const t = (sie: string, du: string) => ({ sie, du });

export const texts = {
  nav: {
    karte: "Karte",
    ideen: "Ideen",
    kontakte: "Meine Kontakte",
    fuerBetriebe: "Für Betriebe",
  },
  home: {
    titel: app.title,
    claim: app.claim,
    disclaimer:
      "Wir sind Treffpunkt und Ideengeber – kein Arbeitgeber und keine Vermittlung. Ein Dienstverhältnis kommt direkt zwischen Betrieb und Person zustande.",
  },
  onboarding: {
    titel: t("Was können Sie anbieten?", "Was kannst Du anbieten?"),
    schritt1: t("Wer sind Sie?", "Wer bist Du?"),
    schritt2: t("Was haben Sie gemacht?", "Was hast Du gemacht?"),
    schritt3: t("Wann haben Sie Zeit?", "Wann hast Du Zeit?"),
    datenschutz: t(
      "Ihre genaue Adresse speichern wir nie. Andere sehen nur einen ungefähren Bereich.",
      "Deine genaue Adresse speichern wir nie. Andere sehen nur einen ungefähren Bereich.",
    ),
  },
  interest: {
    zeigen: "Interesse zeigen",
    gezeigt: "Interesse gezeigt",
    warten: "Warten auf Antwort",
    match: "Gegenseitiges Interesse – Kontakt freigegeben",
    erklaerung:
      "Kontaktdaten werden erst sichtbar, wenn beide Seiten Interesse gezeigt haben.",
  },
  ideenBetriebe: {
    titel: "So beschäftigen Sie Pensionist:innen",
    abschnitte: [
      { h: "Anstellungsformen im Überblick", p: "PLATZHALTER: Geringfügig, Teilzeit, freier Dienstvertrag – Vor- und Nachteile kurz erklärt." },
      { h: "Anmeldung bei der Sozialversicherung", p: "PLATZHALTER: Schritte zur Anmeldung, Fristen, Ansprechstellen (ÖGK, WKO)." },
      { h: "Einsatzideen im Betrieb", p: "PLATZHALTER: Wo Erfahrung besonders hilft – Heuriger, Küche, Gartenpflege, Botendienste." },
      { h: "Kosten und Abgaben", p: "PLATZHALTER: Dienstgeberbeiträge, Lohnnebenkosten, mögliche Förderungen." },
      { h: "Gute Zusammenarbeit", p: "PLATZHALTER: Einschulung, flexible Zeiten, Wertschätzung, Generationen-Mix im Team." },
    ],
  },
  jobBeispiele: [
    { taetigkeit: "service", titel: "Ausschank im Heurigen", umfang: "ca. 8–12 Std./Woche, Fr–So Abend", beispiel: "z. B. Buschenschank in Gumpoldskirchen" },
    { taetigkeit: "kueche", titel: "Küchenhilfe für Gulasch & Co.", umfang: "ca. 10 Std./Woche, vormittags", beispiel: "z. B. Wirtshaus in Mödling" },
    { taetigkeit: "kassa", titel: "Kassa im Hofladen", umfang: "ca. 6 Std./Woche, Sa Vormittag", beispiel: "z. B. Hofladen in Brunn am Gebirge" },
    { taetigkeit: "garten", titel: "Gartenpflege für Heurigengarten", umfang: "ca. 5–8 Std./Woche, saisonal", beispiel: "z. B. Heuriger in Perchtoldsdorf" },
    { taetigkeit: "boten", titel: "Botendienste & Lieferfahrten", umfang: "ca. 6 Std./Woche, flexibel", beispiel: "z. B. Bäckerei in Guntramsdorf" },
  ],
  rechtlich: {
    impressum: "PLATZHALTER: Impressum (Medieninhaber, Anschrift, Kontakt, UID, Aufsichtsbehörde …)",
    datenschutz:
      "PLATZHALTER: Datenschutzerklärung. Hinweise für die Ausarbeitung: keine Tracker/Cookies außer technisch notwendigen; Kartenkacheln werden von OpenStreetMap geladen (IP-Übermittlung) – für Echtbetrieb eigenen Tile-Server empfohlen; Standort von Senior:innen wird nur verfremdet gespeichert; Kontaktdaten erst nach beidseitigem Interesse sichtbar.",
  },
};

export const tr = (o: { sie: string; du: string }, a: Anrede) => o[a];
