// SIMULIERTE Auth: Rolle und Demo-Person stehen im Cookie. Später durch echte Auth ersetzen –
// nur getCurrentUser() muss dann angepasst werden.
import { cookies } from "next/headers";
import { db } from "./db";
import { app } from "@/config/app.config";
import type { Anrede } from "@/config/texts";

export type Role = "business" | "senior" | "guest";

export type CurrentUser =
  | { role: "guest"; anrede: Anrede }
  | { role: "business"; id: string; name: string; anrede: Anrede }
  | { role: "senior"; id: string; name: string; anrede: Anrede };

export async function getCurrentUser(): Promise<CurrentUser> {
  const c = await cookies();
  const role = c.get("role")?.value as Role | undefined;
  const uid = c.get("uid")?.value;
  const cookieAnrede = c.get("anrede")?.value as Anrede | undefined;
  if (role === "business" && uid) {
    const b = await db.business.findUnique({ where: { id: uid } });
    if (b) return { role: "business", id: b.id, name: b.name, anrede: app.defaultAnrede };
  }
  if (role === "senior" && uid) {
    const s = await db.seniorProfile.findUnique({ where: { id: uid } });
    if (s) return { role: "senior", id: s.id, name: s.vorname, anrede: s.anrede as Anrede };
  }
  return { role: "guest", anrede: cookieAnrede ?? app.defaultAnrede };
}
