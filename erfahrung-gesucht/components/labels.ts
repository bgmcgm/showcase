import { taetigkeiten, zeitraeume, anstellungsarten } from "@/config/app.config";
import { csv } from "@/lib/util";

export const tName = (k: string) => (taetigkeiten as Record<string, string>)[k] ?? k;
export const zNames = (s: string) => csv(s).map((k) => (zeitraeume as Record<string, string>)[k] ?? k);
export const aName = (k: string) => (anstellungsarten as Record<string, string>)[k] ?? k;
