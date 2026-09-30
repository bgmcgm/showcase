import { db } from "./db";

export type MatchState = "none" | "mine" | "theirs" | "match";

/** Status aus Sicht der Seite `me` für Paar (Gesuch, Profil). */
export async function matchState(postingId: string, seniorId: string, me: "business" | "senior"): Promise<MatchState> {
  const rows = await db.interest.findMany({ where: { postingId, seniorId } });
  const mine = rows.some((r) => r.von === me);
  const theirs = rows.some((r) => r.von !== me);
  return mine && theirs ? "match" : mine ? "mine" : theirs ? "theirs" : "none";
}
