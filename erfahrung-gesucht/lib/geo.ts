// Geo-Helfer. Senior:innen-Standorte werden nur verfremdet gespeichert.

export function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const GRID_LAT = 0.009; // ≈ 1 km
const GRID_LNG = 0.0135; // ≈ 1 km bei 48° N

/**
 * Verfremdet eine Position: zufälliger Versatz (bis ~700 m), dann Rasterung auf ~1 km.
 * Das Ergebnis ist die einzige gespeicherte Position; Eingabe wird nicht persistiert.
 */
export function fuzzPosition(lat: number, lng: number, rand: () => number = Math.random): [number, number] {
  const angle = rand() * 2 * Math.PI;
  const dist = 0.2 + rand() * 0.5; // km
  const jLat = lat + (Math.sin(angle) * dist) / 111;
  const jLng = lng + (Math.cos(angle) * dist) / (111 * Math.cos((lat * Math.PI) / 180));
  return [
    Math.round(jLat / GRID_LAT) * GRID_LAT,
    Math.round(jLng / GRID_LNG) * GRID_LNG,
  ];
}
