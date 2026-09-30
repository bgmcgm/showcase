"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { fuzzPosition } from "@/lib/geo";
import { region } from "@/config/regions.config";
import { taetigkeiten, anstellungsarten } from "@/config/app.config";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const list = (f: FormData, k: string) => f.getAll(k).map(String).join(",");
const safeBack = (p: string) => (p.startsWith("/") && !p.startsWith("//") ? p : "/");

// --- Simulierte Auth ---
export async function switchIdentity(f: FormData) {
  const [role, id] = str(f, "who").split(":");
  const c = await cookies();
  if (role === "business" || role === "senior") {
    c.set("role", role, { path: "/", sameSite: "lax" });
    c.set("uid", id, { path: "/", sameSite: "lax" });
  } else {
    c.delete("role");
    c.delete("uid");
  }
  redirect(safeBack(str(f, "back")));
}

export async function setAnrede(f: FormData) {
  const c = await cookies();
  c.set("anrede", str(f, "anrede") === "du" ? "du" : "sie", { path: "/", sameSite: "lax" });
  redirect(safeBack(str(f, "back")));
}

// --- Double-Opt-in ---
export async function toggleInterest(f: FormData) {
  const u = await getCurrentUser();
  const postingId = str(f, "postingId");
  const back = safeBack(str(f, "back"));
  if (u.role === "guest") redirect("/?hinweis=rolle");
  let seniorId: string;
  if (u.role === "senior") {
    seniorId = u.id;
  } else {
    seniorId = str(f, "seniorId");
    const p = await db.jobPosting.findUnique({ where: { id: postingId } });
    if (!p || p.businessId !== u.id) redirect(back); // nur eigene Gesuche
  }
  const key = { postingId, seniorId, von: u.role };
  const existing = await db.interest.findUnique({ where: { postingId_seniorId_von: key } });
  if (existing) await db.interest.delete({ where: { id: existing.id } });
  else await db.interest.create({ data: key });
  revalidatePath("/", "layout");
  redirect(back);
}

// --- Gesuch anlegen (Rolle Betrieb) ---
export async function createPosting(f: FormData) {
  const u = await getCurrentUser();
  if (u.role !== "business") redirect("/");
  const t = str(f, "taetigkeit");
  const a = str(f, "anstellungsart");
  if (!(t in taetigkeiten) || !(a in anstellungsarten)) redirect("/gesuche/neu");
  const p = await db.jobPosting.create({
    data: {
      businessId: u.id, taetigkeit: t, zeitraum: list(f, "zeitraum"), tage: str(f, "tage"),
      stundenProWoche: Math.max(1, Math.min(40, Number(str(f, "stunden")) || 5)),
      beschreibung: str(f, "beschreibung").slice(0, 1500), anstellungsart: a,
    },
  });
  revalidatePath("/", "layout");
  redirect(`/gesuche/${p.id}`);
}

// --- Seniorenprofil (Onboarding) ---
export async function createProfile(f: FormData) {
  const ortName = str(f, "ort");
  const ort = region.orte.find((o) => o.name === ortName) ?? region.orte[0];
  // Nur ungefähre Position: Ortsmittelpunkt + Versatz, auf ~1-km-Raster gerundet.
  const [fuzzyLat, fuzzyLng] = fuzzPosition(ort.lat, ort.lng);
  const anrede = str(f, "anrede") === "du" ? "du" : "sie";
  const s = await db.seniorProfile.create({
    data: {
      region: region.key, vorname: str(f, "vorname").slice(0, 40) || "Vorname",
      ort: ort.name, ortsteil: str(f, "ortsteil") || null, fuzzyLat, fuzzyLng,
      radiusKm: Number(str(f, "radius")) || 10,
      erfahrung: str(f, "erfahrung").slice(0, 1000), tags: list(f, "tags"),
      verfuegbarkeit: list(f, "verfuegbarkeit"), anrede,
      kontaktEmail: str(f, "email").slice(0, 120), kontaktTel: str(f, "tel").slice(0, 40),
    },
  });
  const c = await cookies();
  c.set("role", "senior", { path: "/", sameSite: "lax" });
  c.set("uid", s.id, { path: "/", sameSite: "lax" });
  c.set("anrede", anrede, { path: "/", sameSite: "lax" });
  redirect(`/profile/${s.id}?neu=1`);
}
