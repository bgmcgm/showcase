// Konfiguration (aus config/*.ts erzeugt). Hier direkt editierbar: Titel, Region, Texte, Rechnerwerte.
window.EG_CONFIG = {
  "app": {
    "title": "Erfahrung gesucht",
    "claim": "Der Treffpunkt für Betriebe und Pensionist:innen in Ihrer Region",
    "defaultAnrede": "sie",
    "tiles": {
      "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>-Mitwirkende"
    }
  },
  "region": {
    "key": "moedling",
    "name": "Bezirk Mödling",
    "bundesland": "Niederösterreich",
    "center": [
      48.09,
      16.29
    ],
    "zoom": 12,
    "orte": [
      {
        "name": "Mödling",
        "lat": 48.0858,
        "lng": 16.2836,
        "ortsteile": [
          "Zentrum",
          "Kalksburger Straße",
          "Neudorf"
        ]
      },
      {
        "name": "Perchtoldsdorf",
        "lat": 48.1186,
        "lng": 16.2647,
        "ortsteile": [
          "Zentrum",
          "Plättenwald"
        ]
      },
      {
        "name": "Brunn am Gebirge",
        "lat": 48.1074,
        "lng": 16.3106,
        "ortsteile": [
          "Zentrum",
          "Industriezone"
        ]
      },
      {
        "name": "Maria Enzersdorf",
        "lat": 48.0941,
        "lng": 16.2861,
        "ortsteile": [
          "Zentrum",
          "Südstadt"
        ]
      },
      {
        "name": "Gumpoldskirchen",
        "lat": 48.0433,
        "lng": 16.2887,
        "ortsteile": [
          "Zentrum",
          "Weinberge"
        ]
      },
      {
        "name": "Guntramsdorf",
        "lat": 48.0459,
        "lng": 16.3178,
        "ortsteile": [
          "Zentrum",
          "Siedlung"
        ]
      },
      {
        "name": "Wiener Neudorf",
        "lat": 48.0745,
        "lng": 16.3247,
        "ortsteile": [
          "Zentrum"
        ]
      },
      {
        "name": "Hinterbrühl",
        "lat": 48.0721,
        "lng": 16.2502,
        "ortsteile": [
          "Zentrum",
          "Seegrotte"
        ]
      },
      {
        "name": "Laxenburg",
        "lat": 48.0685,
        "lng": 16.3592,
        "ortsteile": [
          "Zentrum"
        ]
      },
      {
        "name": "Biedermannsdorf",
        "lat": 48.081,
        "lng": 16.3542,
        "ortsteile": [
          "Zentrum"
        ]
      }
    ]
  },
  "taetigkeiten": {
    "service": "Service",
    "kueche": "Küchenhilfe",
    "kassa": "Kassa",
    "garten": "Gartenpflege",
    "boten": "Botendienste",
    "sonstiges": "Sonstiges"
  },
  "zeitraeume": {
    "wochenende": "Wochenende",
    "abend": "Abend",
    "saison": "Saison",
    "werktags": "Werktags"
  },
  "anstellungsarten": {
    "geringfuegig": "Geringfügig",
    "teilzeit": "Teilzeit",
    "offen": "Offen / nach Absprache"
  },
  "erfahrungTags": [
    "Gastronomie",
    "Buchhaltung",
    "Verkauf",
    "Garten",
    "Handwerk",
    "Kinderbetreuung",
    "Büro",
    "Kochen",
    "Fahren (Führerschein B)",
    "Landwirtschaft"
  ],
  "umkreise": [
    5,
    10,
    15,
    25
  ],
  "texts": {
    "nav": {
      "karte": "Karte",
      "ideen": "Ideen",
      "kontakte": "Meine Kontakte",
      "fuerBetriebe": "Für Betriebe"
    },
    "home": {
      "titel": "Erfahrung gesucht",
      "claim": "Der Treffpunkt für Betriebe und Pensionist:innen in Ihrer Region",
      "disclaimer": "Wir sind Treffpunkt und Ideengeber – kein Arbeitgeber und keine Vermittlung. Ein Dienstverhältnis kommt direkt zwischen Betrieb und Person zustande."
    },
    "onboarding": {
      "titel": {
        "sie": "Was können Sie anbieten?",
        "du": "Was kannst Du anbieten?"
      },
      "schritt1": {
        "sie": "Wer sind Sie?",
        "du": "Wer bist Du?"
      },
      "schritt2": {
        "sie": "Was haben Sie gemacht?",
        "du": "Was hast Du gemacht?"
      },
      "schritt3": {
        "sie": "Wann haben Sie Zeit?",
        "du": "Wann hast Du Zeit?"
      },
      "datenschutz": {
        "sie": "Ihre genaue Adresse speichern wir nie. Andere sehen nur einen ungefähren Bereich.",
        "du": "Deine genaue Adresse speichern wir nie. Andere sehen nur einen ungefähren Bereich."
      }
    },
    "interest": {
      "zeigen": "Interesse zeigen",
      "gezeigt": "Interesse gezeigt",
      "warten": "Warten auf Antwort",
      "match": "Gegenseitiges Interesse – Kontakt freigegeben",
      "erklaerung": "Kontaktdaten werden erst sichtbar, wenn beide Seiten Interesse gezeigt haben."
    },
    "ideenBetriebe": {
      "titel": "So beschäftigen Sie Pensionist:innen",
      "abschnitte": [
        {
          "h": "Anstellungsformen im Überblick",
          "p": "PLATZHALTER: Geringfügig, Teilzeit, freier Dienstvertrag – Vor- und Nachteile kurz erklärt."
        },
        {
          "h": "Anmeldung bei der Sozialversicherung",
          "p": "PLATZHALTER: Schritte zur Anmeldung, Fristen, Ansprechstellen (ÖGK, WKO)."
        },
        {
          "h": "Einsatzideen im Betrieb",
          "p": "PLATZHALTER: Wo Erfahrung besonders hilft – Heuriger, Küche, Gartenpflege, Botendienste."
        },
        {
          "h": "Kosten und Abgaben",
          "p": "PLATZHALTER: Dienstgeberbeiträge, Lohnnebenkosten, mögliche Förderungen."
        },
        {
          "h": "Gute Zusammenarbeit",
          "p": "PLATZHALTER: Einschulung, flexible Zeiten, Wertschätzung, Generationen-Mix im Team."
        }
      ]
    },
    "jobBeispiele": [
      {
        "taetigkeit": "service",
        "titel": "Ausschank im Heurigen",
        "umfang": "ca. 8–12 Std./Woche, Fr–So Abend",
        "beispiel": "z. B. Buschenschank in Gumpoldskirchen"
      },
      {
        "taetigkeit": "kueche",
        "titel": "Küchenhilfe für Gulasch & Co.",
        "umfang": "ca. 10 Std./Woche, vormittags",
        "beispiel": "z. B. Wirtshaus in Mödling"
      },
      {
        "taetigkeit": "kassa",
        "titel": "Kassa im Hofladen",
        "umfang": "ca. 6 Std./Woche, Sa Vormittag",
        "beispiel": "z. B. Hofladen in Brunn am Gebirge"
      },
      {
        "taetigkeit": "garten",
        "titel": "Gartenpflege für Heurigengarten",
        "umfang": "ca. 5–8 Std./Woche, saisonal",
        "beispiel": "z. B. Heuriger in Perchtoldsdorf"
      },
      {
        "taetigkeit": "boten",
        "titel": "Botendienste & Lieferfahrten",
        "umfang": "ca. 6 Std./Woche, flexibel",
        "beispiel": "z. B. Bäckerei in Guntramsdorf"
      }
    ],
    "rechtlich": {
      "impressum": "PLATZHALTER: Impressum (Medieninhaber, Anschrift, Kontakt, UID, Aufsichtsbehörde …)",
      "datenschutz": "PLATZHALTER: Datenschutzerklärung. Hinweise für die Ausarbeitung: keine Tracker/Cookies außer technisch notwendigen; Kartenkacheln werden von OpenStreetMap geladen (IP-Übermittlung) – für Echtbetrieb eigenen Tile-Server empfohlen; Standort von Senior:innen wird nur verfremdet gespeichert; Kontaktdaten erst nach beidseitigem Interesse sichtbar."
    }
  },
  "earnings": {
    "stand": "30.09.2026",
    "hinweis": "Stand: 30.09.2026 – Werte sind Platzhalter, bitte prüfen. Keine Rechts- oder Steuerberatung. Verbindliche Auskunft erteilt die Pensionsversicherung.",
    "geringfuegigkeitsgrenzeMonat": 551.1,
    "szenarien": {
      "regelpension": {
        "label": "Regelpension (ab Regelpensionsalter)",
        "beschreibung": "Beim Erreichen des Regelpensionsalters darf zur Pension unbegrenzt dazuverdient werden. Es fallen Sozialversicherung und Lohnsteuer nach den üblichen Regeln an.",
        "freibetragMonat": null,
        "pauschalSteuersatz": null,
        "svSatzDienstnehmer": 0,
        "voraussetzungen": [
          "Regelpensionsalter erreicht (PLATZHALTER: Alter prüfen)"
        ]
      },
      "aktivpension": {
        "label": "Aktivpension (ab 2027)",
        "beschreibung": "PLATZHALTER: Geplantes Modell ab 2027 zur Anreizsetzung für Arbeit in der Pension. Konkrete Ausgestaltung (Freibetrag, Steuersatz, Beiträge) bitte anhand der finalen Gesetzeslage eintragen.",
        "freibetragMonat": 0,
        "pauschalSteuersatz": 0.25,
        "svSatzDienstnehmer": 0,
        "voraussetzungen": [
          "Regelpensionsalter erreicht (PLATZHALTER)",
          "Gesetzlicher Start 2027 (PLATZHALTER)"
        ]
      },
      "fruehpension": {
        "label": "Früh-/Korridorpension",
        "beschreibung": "Bei vorzeitiger Alterspension gilt eine Zuverdienstgrenze; wird sie überschritten, kann die Pension ruhen. In der Regel ist nur eine geringfügige Beschäftigung unschädlich.",
        "freibetragMonat": 551.1,
        "pauschalSteuersatz": null,
        "svSatzDienstnehmer": 0,
        "voraussetzungen": [
          "Zuverdienst nur bis zur Geringfügigkeitsgrenze (PLATZHALTER)",
          "Über der Grenze: Ruhen der Pension möglich (PLATZHALTER)"
        ]
      }
    }
  }
};
