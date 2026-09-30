import { toggleInterest } from "@/app/actions";
import { texts } from "@/config/texts";
import type { MatchState } from "@/lib/interest";

// Zeigt Button "Interesse zeigen" bzw. Status. Kontaktdaten nur im Zustand "match".
export async function StatusBox({ state, back, postingId, seniorId, label, contact }: {
  state: MatchState; back: string; postingId: string; seniorId?: string; label?: string;
  contact?: { name: string; email: string; tel: string };
}) {
  return (
    <section className="card" aria-labelledby={`ib-${postingId}-${seniorId ?? "x"}`}>
      <h3 id={`ib-${postingId}-${seniorId ?? "x"}`}>{label ?? "Kontakt"}</h3>
      {state === "match" ? (
        <>
          <p className="notice ok"><strong>{texts.interest.match}</strong></p>
          {contact && (
            <table className="kv"><tbody>
              <tr><th>Name</th><td>{contact.name}</td></tr>
              <tr><th>E-Mail</th><td><a href={`mailto:${contact.email}`}>{contact.email}</a></td></tr>
              <tr><th>Telefon</th><td><a href={`tel:${contact.tel.replace(/\s/g, "")}`}>{contact.tel}</a></td></tr>
            </tbody></table>
          )}
          <p className="hint">Alles Weitere (Anstellung, Bedingungen) besprechen Sie direkt miteinander.</p>
        </>
      ) : (
        <>
          <p>{state === "theirs" ? "Die andere Seite hat bereits Interesse gezeigt. Zeigen Sie auch Interesse, um Kontaktdaten freizugeben." : texts.interest.erklaerung}</p>
        </>
      )}
      {state !== "match" && (
        <form action={toggleInterest}>
          <input type="hidden" name="postingId" value={postingId} />
          {seniorId && <input type="hidden" name="seniorId" value={seniorId} />}
          <input type="hidden" name="back" value={back} />
          <button className={`btn big ${state === "mine" ? "secondary" : ""}`}>
            {state === "mine" ? `${texts.interest.gezeigt} – zurücknehmen` : texts.interest.zeigen}
          </button>
          {state === "mine" && <p className="hint" role="status">{texts.interest.warten}</p>}
        </form>
      )}
    </section>
  );
}
