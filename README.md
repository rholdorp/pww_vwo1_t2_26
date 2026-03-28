# Studieplan Stijn – Proefwerkweek maart 2026

Interactief studieplan en trainer-apps voor **Stijn** (VWO 1, Trevianum) ter voorbereiding op de proefwerkweek van 12-18 maart 2026.

> **Status: Afgerond** — De proefwerkweek is geweest. De database en het trainingsmateriaal zijn offline gehaald. De site toont een offline-melding.

## Overzicht

Het project bevatte een 21-daags studieplan met interactieve trainers voor 8 vakken, gebouwd als statische site op GitHub Pages — geen build-stap, geen framework, geen server.

### Trainers (alle afgerond)

| Vak | Stof | Type |
|-----|------|------|
| Wiskunde | H5 Lijnen en hoeken + H6 | Multiple choice |
| Nederlands | Par 1.3, 2.3, 3.3, 4.3, 5.3 | Multiple choice |
| Frans | Chapitre 1/2/3, werkwoorden, grammatica | Multiple choice |
| Engels | Unit 2+3 vocab + grammar | Type-modus |
| Geschiedenis | H4 Het Romeinse Rijk (par 4.1-4.3) | Multiple choice |
| Biologie | Thema 3 Ordening (basisstof 1-6, extra 7-8) | Multiple choice |
| Aardrijkskunde | H4 Natuurrampen Japan (par 1-5) | Multiple choice + diagnostische toetsen |
| Tekenen/HV | — | Niet gebouwd |

### Proefwerkweek

| Datum | Dag | Proefwerk |
|-------|-----|-----------|
| 12 mrt | Donderdag | Wiskunde + Nederlands |
| 13 mrt | Vrijdag | Frans + Geschiedenis |
| 16 mrt | Maandag | Engels |
| 17 mrt | Dinsdag | Biologie |
| 18 mrt | Woensdag | Aardrijkskunde + Tekenen/HV |

## Technisch

- **HTML + CSS + JavaScript** (plain, geen build)
- **React 18 + Babel Standalone** via CDN voor in-browser JSX
- **Firebase Realtime Database** voor sync tussen devices (nu offline)
- **localStorage** als fallback voor voortgang
- **GitHub Pages** hosting (push = deploy)
- **Nunito** font, dark theme design

### Projectstructuur

```
/
├── index.html                 ← Offline-melding (was: landing page)
├── dashboard.html             ← 21-daags studieplan met checkboxen
├── shared/
│   ├── progress.js            ← Gedeelde progress tracking API
│   ├── firebase-config.js     ← Firebase configuratie
│   └── camera.js              ← Camera-functie voor foto's bij training
└── trainers/
    ├── wiskunde-h5/            ← Wiskunde H5
    ├── wiskunde-h6/            ← Wiskunde H6
    ├── nederlands-1.3/          ← Nederlands
    ├── frans/                  ← Frans
    ├── engels/                 ← Engels (type-modus)
    ├── geschiedenis/           ← Geschiedenis
    ├── biologie/               ← Biologie
    └── aardrijkskunde/         ← Aardrijkskunde
```

## Features

- **Studieplan dashboard** — 21 dagen planning met 74 studietaken, sportschema, voortgangsoverzicht
- **Per-vak trainers** — Theorie + oefenvragen met mastery tracking (minimaal 5 vragen, minimaal 70% correct)
- **Firebase sync** — Voortgang gesynchroniseerd tussen devices
- **Camera-functie** — Foto bij start/einde training
- **Gebruiksoverzicht** — Frequentiegrafiek en activiteitenlijst op dashboard
- **Diagnostische toetsen** — Bij aardrijkskunde met illustraties uit lesmateriaal
