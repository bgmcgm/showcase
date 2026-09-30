"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap } from "leaflet";

export type BizMarker = { id: string; lat: number; lng: number; name: string; ort: string; postings: { id: string; label: string }[] };
export type SeniorArea = { id: string; lat: number; lng: number; vorname: string; ort: string; tags: string };

type Props = {
  center: [number, number]; zoom: number; tileUrl: string; attribution: string;
  businesses: BizMarker[]; seniors: SeniorArea[];
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export default function MapView({ center, zoom, tileUrl, attribution, businesses, seniors }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      const m = L.map(el.current, { scrollWheelZoom: false }).setView(center, zoom);
      map.current = m;
      L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(m);

      const bounds: [number, number][] = [];
      for (const b of businesses) {
        const icon = L.divIcon({ className: "", html: '<div class="pin"></div>', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] });
        const links = b.postings.map((p) => `<li><a href="/gesuche/${p.id}">${esc(p.label)}</a></li>`).join("");
        L.marker([b.lat, b.lng], { icon, title: b.name, alt: b.name })
          .addTo(m)
          .bindPopup(`<strong>${esc(b.name)}</strong><br>${esc(b.ort)}<ul style="padding-left:1.1rem;margin:.4rem 0 0">${links}</ul>`);
        bounds.push([b.lat, b.lng]);
      }
      for (const s of seniors) {
        // ~1 km Kreis um die (bereits verfremdete) Position – keine exakte Adresse
        L.circle([s.lat, s.lng], { radius: 1000, color: "#1f5f3f", weight: 2, fillColor: "#1f5f3f", fillOpacity: 0.22 })
          .addTo(m)
          .bindPopup(`<strong>${esc(s.vorname)}</strong>, Raum ${esc(s.ort)}<br>${esc(s.tags.split(",").join(", "))}<br><a href="/profile/${s.id}">Profil ansehen</a>`);
        bounds.push([s.lat, s.lng]);
      }
      if (bounds.length > 1) m.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      m.on("click", () => m.scrollWheelZoom.enable());
    })();
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
  }, [center, zoom, tileUrl, attribution, businesses, seniors]);

  return <div id="map" ref={el} role="region" aria-label="Karte mit Betrieben und ungefähren Bereichen von Profilen. Alle Einträge stehen auch in der Listenansicht." />;
}
