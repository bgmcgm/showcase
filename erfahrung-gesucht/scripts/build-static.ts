// Erzeugt static-site/js/config.js (aus config/*.ts) und static-site/js/data.js (aus der Seed-DB).
import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import * as appc from "../config/app.config";
import { region } from "../config/regions.config";
import { texts } from "../config/texts";
import { earnings } from "../config/earnings.config";

const db = new PrismaClient();
async function main() {
  const config = {
    app: appc.app, region,
    taetigkeiten: appc.taetigkeiten, zeitraeume: appc.zeitraeume, anstellungsarten: appc.anstellungsarten,
    erfahrungTags: appc.erfahrungTags, umkreise: appc.umkreise, texts, earnings,
  };
  writeFileSync("static-site/js/config.js",
    "// Konfiguration (aus config/*.ts erzeugt). Hier direkt editierbar: Titel, Region, Texte, Rechnerwerte.\nwindow.EG_CONFIG = " + JSON.stringify(config, null, 2) + ";\n");
  const data = {
    businesses: await db.business.findMany(),
    postings: await db.jobPosting.findMany({ select: { id: true, businessId: true, taetigkeit: true, zeitraum: true, tage: true, stundenProWoche: true, beschreibung: true, anstellungsart: true } }),
    seniors: await db.seniorProfile.findMany(),
    interests: await db.interest.findMany({ select: { postingId: true, seniorId: true, von: true } }),
  };
  writeFileSync("static-site/js/data.js", "// Fiktive Demo-Daten (Seed)\nwindow.EG_DATA = " + JSON.stringify(data, null, 1) + ";\n");
}
main().finally(() => db.$disconnect());
