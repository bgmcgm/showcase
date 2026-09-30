import { PrismaClient } from "@prisma/client";
import { region } from "../config/regions.config";
import { fuzzPosition } from "../lib/geo";

const db = new PrismaClient();

// reproduzierbarer Zufall
let s = 42;
const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
const ort = (n: string) => region.orte.find((o) => o.name === n)!;
const jit = (n: number) => (rand() - 0.5) * n;

const betriebe = [
  { name: "Heuriger Zum Weinstöckl", branche: "Heuriger", ort: "Gumpoldskirchen", strasse: "Weinstöckl-Gasse 3" },
  { name: "Buschenschank Hausleitner", branche: "Heuriger", ort: "Perchtoldsdorf", strasse: "Hochstraße 12" },
  { name: "Heuriger Sonnenberg", branche: "Heuriger", ort: "Mödling", strasse: "Sonnenbergweg 7" },
  { name: "Gasthaus Zur Linde", branche: "Gasthaus", ort: "Mödling", strasse: "Lindenplatz 1" },
  { name: "Café Hofgarten", branche: "Café", ort: "Maria Enzersdorf", strasse: "Hofgartenstraße 5" },
  { name: "Weingut & Heuriger Bauer", branche: "Heuriger", ort: "Gumpoldskirchen", strasse: "Kirchengasse 9" },
  { name: "Wirtshaus Zum Goldenen Hirschen", branche: "Gasthaus", ort: "Brunn am Gebirge", strasse: "Hauptstraße 44" },
  { name: "Bäckerei Steinmetz", branche: "Bäckerei", ort: "Guntramsdorf", strasse: "Bahngasse 2" },
  { name: "Hofladen Grünwald", branche: "Hofladen", ort: "Brunn am Gebirge", strasse: "Feldweg 6" },
  { name: "Heuriger Kellergasse 8", branche: "Heuriger", ort: "Perchtoldsdorf", strasse: "Kellergasse 8" },
  { name: "Gartenbau Blumenwiese", branche: "Gartenbau", ort: "Hinterbrühl", strasse: "Seegrottenweg 4" },
  { name: "Pizzeria Bella Vista", branche: "Gastro", ort: "Wiener Neudorf", strasse: "Neudorfer Straße 30" },
  { name: "Heuriger Schlossblick", branche: "Heuriger", ort: "Laxenburg", strasse: "Schlossgasse 11" },
  { name: "Reinigung & Service Klar", branche: "Dienstleister", ort: "Biedermannsdorf", strasse: "Ringstraße 15" },
  { name: "Cateringküche Genuss", branche: "Catering", ort: "Guntramsdorf", strasse: "Industriestraße 9" },
];

const postingsBySeed: Record<string, { t: string; z: string; tage: string; h: number; a: string; b: string }[]> = {
  Heuriger: [
    { t: "service", z: "wochenende,abend", tage: "Fr–So ab 15 Uhr", h: 10, a: "geringfuegig", b: "Wir suchen freundliche Verstärkung für den Ausschank. Erfahrung mit Gästen willkommen, Einschulung vor Ort." },
    { t: "garten", z: "saison", tage: "Mai–September, nach Absprache", h: 6, a: "offen", b: "Pflege unseres Heurigengartens: Rasen, Blumen, Sitzgarnituren." },
  ],
  Gasthaus: [{ t: "kueche", z: "werktags", tage: "Mo–Fr vormittags", h: 12, a: "teilzeit", b: "Unterstützung in der Küche: Gemüse, Vorbereitung, einfache Beilagen." }],
  "Café": [{ t: "service", z: "wochenende", tage: "Sa und So 9–15 Uhr", h: 8, a: "geringfuegig", b: "Servicekraft fürs Wochenende, ruhige Atmosphäre, nette Stammgäste." }],
  "Bäckerei": [{ t: "boten", z: "werktags", tage: "Mo–Fr früh", h: 6, a: "geringfuegig", b: "Auslieferung von Gebäck an Kunden im Ort mit eigenem Auto (Kostenersatz)." }],
  Hofladen: [{ t: "kassa", z: "wochenende", tage: "Sa 8–13 Uhr", h: 5, a: "geringfuegig", b: "Betreuung der Kassa und Beratung im Hofladen." }],
  Gartenbau: [{ t: "garten", z: "saison", tage: "April–Oktober", h: 15, a: "teilzeit", b: "Unterstützung bei Pflanzung, Rückschnitt und Pflege." }],
  Gastro: [{ t: "kassa", z: "abend", tage: "Do–Sa Abend", h: 10, a: "offen", b: "Kassa und Abholung, freundlicher Umgang mit Stammkundschaft." }],
  Dienstleister: [{ t: "sonstiges", z: "werktags", tage: "flexibel", h: 8, a: "geringfuegig", b: "Leichte Reinigungs- und Organisationsaufgaben, flexible Zeiten." }],
  Catering: [{ t: "kueche", z: "wochenende,saison", tage: "bei Veranstaltungen", h: 8, a: "geringfuegig", b: "Mithilfe bei Buffets und Vorbereitung." }],
};

const vornamen = ["Herbert", "Gertrude", "Franz", "Helga", "Josef", "Ingrid", "Karl", "Elfriede", "Walter", "Christa", "Ernst", "Margarete", "Anton", "Renate", "Rudolf", "Brigitte", "Friedrich", "Waltraud", "Leopold", "Gerda"];
const erfahrungen = [
  { t: "Ich habe 30 Jahre im Service gearbeitet und kenne den Umgang mit Gästen.", tags: "Gastronomie,Verkauf", v: "wochenende,abend" },
  { t: "Ehemals Buchhalterin, gerne für leichte Büro- und Kassaarbeiten.", tags: "Buchhaltung,Büro", v: "werktags" },
  { t: "Gelernter Koch, unterstütze gerne in der Küche.", tags: "Kochen,Gastronomie", v: "werktags,wochenende" },
  { t: "Gartenliebhaber mit langjähriger Erfahrung im Obst- und Weinbau.", tags: "Garten,Landwirtschaft", v: "saison" },
  { t: "Früher Verkäuferin im Lebensmittelhandel, freundlich und zuverlässig.", tags: "Verkauf", v: "werktags,wochenende" },
  { t: "Handwerker im Ruhestand, helfe gerne bei Reparaturen und Botenfahrten.", tags: "Handwerk,Fahren (Führerschein B)", v: "werktags" },
  { t: "Habe viele Jahre Kinder betreut, aber auch im Buffetdienst gearbeitet.", tags: "Kinderbetreuung,Gastronomie", v: "wochenende" },
];

async function main() {
  await db.interest.deleteMany();
  await db.jobPosting.deleteMany();
  await db.business.deleteMany();
  await db.seniorProfile.deleteMany();

  const postings: { id: string; ort: string }[] = [];
  for (const b of betriebe) {
    const o = ort(b.ort);
    const biz = await db.business.create({
      data: {
        region: region.key, name: b.name, branche: b.branche, ort: b.ort,
        adresse: `${b.strasse}, ${b.ort}`,
        lat: o.lat + jit(0.008), lng: o.lng + jit(0.012),
        kontaktName: "Fiktive Ansprechperson",
        kontaktEmail: `kontakt@${b.name.toLowerCase().replace(/[^a-z]+/g, "-")}.example`,
        kontaktTel: "+43 660 0000000",
      },
    });
    for (const p of postingsBySeed[b.branche] ?? postingsBySeed.Gastro) {
      const jp = await db.jobPosting.create({
        data: { businessId: biz.id, taetigkeit: p.t, zeitraum: p.z, tage: p.tage, stundenProWoche: p.h, beschreibung: p.b, anstellungsart: p.a },
      });
      postings.push({ id: jp.id, ort: b.ort });
    }
  }

  const seniors: string[] = [];
  for (let i = 0; i < 20; i++) {
    const o = region.orte[i % region.orte.length];
    const e = erfahrungen[i % erfahrungen.length];
    const [flat, flng] = fuzzPosition(o.lat + jit(0.01), o.lng + jit(0.015), rand);
    const sp = await db.seniorProfile.create({
      data: {
        region: region.key, vorname: vornamen[i], ort: o.name, ortsteil: pick(o.ortsteile ?? ["Zentrum"]),
        fuzzyLat: flat, fuzzyLng: flng, radiusKm: pick([5, 10, 15]),
        erfahrung: e.t, tags: e.tags, verfuegbarkeit: e.v,
        anrede: i % 3 === 0 ? "du" : "sie",
        kontaktEmail: `${vornamen[i].toLowerCase()}@senior.example`, kontaktTel: "+43 664 0000000",
      },
    });
    seniors.push(sp.id);
  }

  // Demo-Interessen: 3 gegenseitig, einige einseitig
  const mk = (p: number, sIdx: number, von: string) =>
    db.interest.create({ data: { postingId: postings[p].id, seniorId: seniors[sIdx], von } });
  await mk(0, 0, "business"); await mk(0, 0, "senior");
  await mk(2, 1, "business"); await mk(2, 1, "senior");
  await mk(5, 2, "senior"); await mk(5, 2, "business");
  await mk(1, 3, "business");
  await mk(3, 4, "senior");
  await mk(6, 5, "senior");

  console.log(`Seed fertig: ${betriebe.length} Betriebe, ${postings.length} Gesuche, ${seniors.length} Profile.`);
}
main().finally(() => db.$disconnect());
