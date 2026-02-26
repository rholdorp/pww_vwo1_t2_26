# 📚 Studieplan Stijn – Proefwerkweek maart 2026

Interactief studieplan en trainer-apps voor de proefwerkweek.

## 🚀 Live site
Na deployment op GitHub Pages:
`https://USERNAME.github.io/studieplan-stijn/`

## 📁 Projectstructuur

```
studieplan-stijn/
├── index.html                      # Startpagina met links
├── dashboard.html                  # Studieplan dashboard (21 dagen)
├── shared/
│   └── progress.js                 # Shared progress API (localStorage)
├── trainers/
│   ├── wiskunde-h6/
│   │   └── index.html              # Wiskunde H6 trainer
│   ├── nederlands-1.3/
│   │   └── index.html              # Nederlands par 1.3 trainer
│   ├── frans/                      # (binnenkort)
│   ├── geschiedenis/               # (binnenkort)
│   ├── biologie/                   # (binnenkort)
│   ├── aardrijkskunde/             # (binnenkort)
│   └── tekenen-hv/                 # (binnenkort)
└── README.md
```

## 🔧 Technisch

- **Geen build stap nodig** – alles is vanilla HTML + React via CDN
- **localStorage** voor voortgang – werkt offline, per device
- **Shared Progress API** (`shared/progress.js`) – standaard format voor alle trainers
- **GitHub Pages** voor hosting – gratis, simpel

## 📊 Progress API

Elke trainer gebruikt `TrainerProgress` class:
```javascript
const progress = new TrainerProgress("vak_sectie", "Display Name", {
  subject: "Vaknaam", color: "#hex", icon: "emoji"
});
progress.recordAnswer("sectie_id", true/false);
progress.markTheoryDone("sectie_id");
progress.isMastered("sectie_id"); // ≥5 antwoorden, ≥70% correct
```

Dashboard leest alle `trainer_*` keys uit localStorage automatisch.

## 📅 Proefwerken
| # | Vak | Datum | Stof |
|---|-----|-------|------|
| 1 | Wiskunde | Do 12 mrt | H5 en H6 |
| 2 | Nederlands | Do 12 mrt | Par 1.3, 2.3, 3.3, 4.3, 5.3 |
| 3 | Frans | Vr 13 mrt | Voc pg 131, gramm, pg 126-128 |
| 4 | Geschiedenis | Vr 13 mrt | Par 4.1-4.3, 8 vaardigheden |
| 5 | Biologie | Di 17 mrt | Thema 3 Ordening |
| 6 | Aardrijkskunde | Wo 18 mrt | H4 par 1-5 |
| 7 | Tekenen/HV | Wo 18 mrt | Tek H3+H6, HV H7 |

## ➕ Nieuwe trainer toevoegen

1. Maak folder `trainers/vaknaam/`
2. Maak `index.html` met React + `../../shared/progress.js`
3. Gebruik `new TrainerProgress("vaknaam_sectie", "Naam", {...})`
4. Voeg link toe aan `index.html`
5. Push naar GitHub → automatisch live
