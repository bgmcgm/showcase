import { getCurrentUser } from "@/lib/session";
import Onboarding from "@/components/Onboarding";
import { texts, tr } from "@/config/texts";

export const metadata = { title: "Ich biete" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const u = await getCurrentUser();
  return (<><h1>{tr(texts.onboarding.titel, u.anrede)}</h1><Onboarding anrede={u.anrede} /></>);
}
