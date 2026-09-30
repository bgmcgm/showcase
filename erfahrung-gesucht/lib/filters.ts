import { region } from "@/config/regions.config";
import { haversineKm } from "./geo";

export type Filters = { taetigkeit?: string; zeitraum?: string; ort?: string; umkreis?: number; zeige: "beide" | "gesuche" | "profile" };

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const g = (k: string) => (typeof sp[k] === "string" && sp[k] ? (sp[k] as string) : undefined);
  const zeige = (["gesuche", "profile"].includes(g("zeige") ?? "") ? g("zeige") : "beide") as Filters["zeige"];
  return { taetigkeit: g("taetigkeit"), zeitraum: g("zeitraum"), ort: g("ort"), umkreis: g("umkreis") ? Number(g("umkreis")) : undefined, zeige };
}

export function withinRadius(f: Filters, pos: [number, number]) {
  if (!f.ort || !f.umkreis) return true;
  const o = region.orte.find((x) => x.name === f.ort);
  return !o || haversineKm([o.lat, o.lng], pos) <= f.umkreis;
}

// Grobe Zuordnung Tätigkeit → Erfahrungs-Tags, um Profile mitzufiltern
export const taetigkeitTags: Record<string, string[]> = {
  service: ["Gastronomie", "Verkauf"],
  kueche: ["Kochen", "Gastronomie"],
  kassa: ["Verkauf", "Buchhaltung", "Büro"],
  garten: ["Garten", "Landwirtschaft"],
  boten: ["Fahren (Führerschein B)"],
  sonstiges: [],
};
