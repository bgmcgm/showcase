// Regionen. Aktive Region: Umgebungsvariable REGION (Standard: moedling).
// Neue Region = neuer Eintrag hier + REGION setzen. Whitelabel: eigene Instanz mit eigener .env.

export type Ort = { name: string; lat: number; lng: number; ortsteile?: string[] };
export type Region = {
  key: string;
  name: string;
  bundesland: string;
  center: [number, number];
  zoom: number;
  orte: Ort[];
};

export const regions: Record<string, Region> = {
  moedling: {
    key: "moedling",
    name: "Bezirk Mödling",
    bundesland: "Niederösterreich",
    center: [48.09, 16.29],
    zoom: 12,
    orte: [
      { name: "Mödling", lat: 48.0858, lng: 16.2836, ortsteile: ["Zentrum", "Kalksburger Straße", "Neudorf"] },
      { name: "Perchtoldsdorf", lat: 48.1186, lng: 16.2647, ortsteile: ["Zentrum", "Plättenwald"] },
      { name: "Brunn am Gebirge", lat: 48.1074, lng: 16.3106, ortsteile: ["Zentrum", "Industriezone"] },
      { name: "Maria Enzersdorf", lat: 48.0941, lng: 16.2861, ortsteile: ["Zentrum", "Südstadt"] },
      { name: "Gumpoldskirchen", lat: 48.0433, lng: 16.2887, ortsteile: ["Zentrum", "Weinberge"] },
      { name: "Guntramsdorf", lat: 48.0459, lng: 16.3178, ortsteile: ["Zentrum", "Siedlung"] },
      { name: "Wiener Neudorf", lat: 48.0745, lng: 16.3247, ortsteile: ["Zentrum"] },
      { name: "Hinterbrühl", lat: 48.0721, lng: 16.2502, ortsteile: ["Zentrum", "Seegrotte"] },
      { name: "Laxenburg", lat: 48.0685, lng: 16.3592, ortsteile: ["Zentrum"] },
      { name: "Biedermannsdorf", lat: 48.0810, lng: 16.3542, ortsteile: ["Zentrum"] },
    ],
  },
};

export const region: Region = regions[process.env.REGION ?? "moedling"] ?? regions.moedling;
