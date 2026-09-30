// Zentrale App-Konfiguration. Titel, Claim und Kataloge hier ändern.

export const app = {
  title: "Erfahrung gesucht", // Arbeitstitel (Platzhalter)
  claim: "Der Treffpunkt für Betriebe und Pensionist:innen in Ihrer Region",
  defaultAnrede: "sie" as "sie" | "du",
  // OSM-Tiles: für Echtbetrieb eigenen Tile-Server eintragen (DSGVO, IP-Übermittlung)
  tiles: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
  },
};

export const taetigkeiten = {
  service: "Service",
  kueche: "Küchenhilfe",
  kassa: "Kassa",
  garten: "Gartenpflege",
  boten: "Botendienste",
  sonstiges: "Sonstiges",
} as const;
export type TaetigkeitKey = keyof typeof taetigkeiten;

export const zeitraeume = {
  wochenende: "Wochenende",
  abend: "Abend",
  saison: "Saison",
  werktags: "Werktags",
} as const;
export type ZeitraumKey = keyof typeof zeitraeume;

export const anstellungsarten = {
  geringfuegig: "Geringfügig",
  teilzeit: "Teilzeit",
  offen: "Offen / nach Absprache",
} as const;
export type AnstellungKey = keyof typeof anstellungsarten;

export const erfahrungTags = [
  "Gastronomie", "Buchhaltung", "Verkauf", "Garten", "Handwerk",
  "Kinderbetreuung", "Büro", "Kochen", "Fahren (Führerschein B)", "Landwirtschaft",
];

export const umkreise = [5, 10, 15, 25];
