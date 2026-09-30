# Erfahrung gesucht (Arbeitstitel) – klickbarer Prototyp

Regionale Matching-Plattform: lokale Betriebe (Gastro, Heurige, Dienstleister) und Pensionist:innen finden zusammen.
Die Plattform ist **Treffpunkt und Ideengeber**, kein Arbeitgeber und keine Vermittlung. Die Anstellung läuft direkt zwischen Betrieb und Person.

Alle Daten im Prototyp sind **fiktiv**. Die Anmeldung ist **simuliert**.

## Stack

Next.js 15 (App Router, TypeScript) · Prisma 6 + SQLite · Leaflet + OpenStreetMap · plain CSS. Keine Tracker, keine externen Fonts.

## Setup

```bash
cd erfahrung-gesucht
npm install
cp .env.example .env        # DATABASE_URL, REGION
npm run setup               # prisma generate + db push + Seed (15 Betriebe, 21 Gesuche, 20 Profile)
npm run dev                 # http://localhost:3000
```

Produktion / Self-Hosting: `npm run build && npm start`. Die Datenbank ist die Datei `prisma/dev.db`.
Demo-Daten zurücksetzen: `npm run db:reset`.

## Bedienung im Prototyp

Oben der **Demo-Modus**: Ansicht als Gast, als beliebiger Betrieb oder als beliebige:r Senior:in wechseln.
Für Gäste lässt sich zusätzlich Sie-/Du-Form wählen; bei Profilen gilt die im Onboarding gewählte Anrede.

- **Karte / Liste** (`/`): Filter Tätigkeit, Zeitraum, Ort, Umkreis. Betriebe als Pins, Senior:innen nur als ~1-km-Kreis.
- **Ich biete** (`/ich-biete`): Onboarding in 3 Schritten, große Schrift, ohne Foto.
- **Gesuch erstellen** (`/gesuche/neu`, als Betrieb).
- **Double-Opt-in**: „Interesse zeigen“ auf beiden Seiten. Kontaktdaten liefert der Server erst, wenn beide Richtungen vorliegen (`/meine-kontakte`). Kein Chat.
  Seed-Beispiel: Herbert (Mödling) hat ein gegenseitiges Interesse mit „Heuriger Zum Weinstöckl“.
- **Ideen** (`/ideen`): Zuverdienst-Rechner, Beispiel-Jobs. `/ideen/fuer-betriebe`: Platzhaltertexte.

## Wo wird was konfiguriert?

| Was | Datei |
|---|---|
| Titel, Claim, Anrede-Default, Tile-Server, Kataloge (Tätigkeiten, Zeiträume, Anstellungsarten, Tags) | `config/app.config.ts` |
| **Region** (Bezirk, Kartenmitte, Orte/Ortsteile). Aktive Region über `REGION` in `.env` | `config/regions.config.ts` |
| Alle UI-Texte (Sie/Du), Info-Seite für Betriebe, Beispiel-Jobs, Impressum/Datenschutz-Platzhalter | `config/texts.ts` |
| **Rechner-Werte** (Grenzen, Beträge, Voraussetzungen, „Stand“-Datum) | `config/earnings.config.ts` |

Neue Region: Eintrag in `regions.config.ts` ergänzen, `REGION=<key>` setzen, `npm run db:reset` (der Seed nutzt die aktive Region). Whitelabel: eigene Instanz mit eigener `.env`, Titel in `app.config.ts`.

> **Rechner-Werte sind Platzhalter.** Alle Zahlen in `earnings.config.ts` (Geringfügigkeitsgrenze, Freibeträge, Steuersätze, Details der Aktivpension ab 2027) müssen vor Livegang geprüft und mit aktuellem „Stand“ eingetragen werden. Keine Rechts-/Steuerberatung.

## Datenschutz by design

- Senior:innen-Standort: Ortsmittelpunkt + Zufallsversatz, auf ~1-km-Raster gerundet (`lib/geo.ts`). Eine genaue Adresse wird nie erfasst oder gespeichert.
- Kontaktdaten sind erst nach beidseitigem Interesse sichtbar (serverseitig geprüft).
- Keine Tracker/Analytics. OSM-Kacheln sind ein externer Request (IP-Übermittlung): für den Echtbetrieb eigenen Tile-Server in `app.config.ts` eintragen und in der Datenschutzerklärung erwähnen.
- Impressum und Datenschutz sind Platzhalter (`config/texts.ts`).

## Barrierefreiheit (Ziel WCAG AA)

Basisschrift 18 px, hohe Kontraste bei den Primärfarben, Touch-Targets ≥ 48 px, sichtbarer Fokus, „Zum Inhalt springen“-Link, Formulare mit Labels, Karte hat Listenalternative, Filter funktionieren ohne JavaScript. Ein manueller Audit (Screenreader, Tastatur) steht noch aus.

## Von Simulation zu echter Auth

Die simulierte Anmeldung liegt in `lib/session.ts` (`getCurrentUser()`) und `switchIdentity` in `app/actions.ts`. Diese beiden Stellen durch echte Auth ersetzen (z. B. Auth.js, E-Mail-Magic-Link).

## Struktur

```
app/         Seiten und Server Actions
components/  Karte, Cards, Onboarding, Rechner, Interesse-Box
config/      App, Region, Texte, Rechner
lib/         db, geo (Verfremdung), Session, Filter
prisma/      schema.prisma, seed.ts
```
