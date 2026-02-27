# CLAUDE.md — Studieplan Stijn

## Project Overview

Interactief studieplan + trainer-apps voor **Stijn** (VWO 1, Trevianum) ter voorbereiding op zijn proefwerkweek van **12-18 maart 2026**. Het project draait als statische site op **GitHub Pages** — geen build-stap, geen framework, geen server.

## Tech Stack

- **HTML + CSS + JavaScript** (plain)
- **React 18 via CDN** (niet via npm — geen build!)
- **Babel Standalone** voor JSX-in-browser (`<script type="text/babel">`)
- **GitHub Pages** hosting (push = deploy)
- **localStorage** voor progress tracking

> ⚠️ GEEN npm, geen webpack, geen vite, geen package.json. Alles is plain HTML met CDN scripts. Dit is bewust zo gekozen voor simpele deploy.

## File Structure

```
/
├── CLAUDE.md              ← dit bestand
├── README.md              ← technische docs
├── index.html             ← landing page met links naar alle trainers
├── dashboard.html         ← 21-daags studieplan met checkboxen per taak
├── shared/
│   └── progress.js        ← gedeelde progress tracking API (localStorage)
└── trainers/
    ├── wiskunde-h6/
    │   └── index.html     ← ✅ Wiskunde H6 trainer (6 secties, multiple choice)
    ├── nederlands-1.3/
    │   └── index.html     ← ✅ Nederlands 1.3 trainer
    ├── frans/
    │   └── index.html     ← ✅ Frans Chapitre 1/2/3 trainer (6 secties)
    ├── engels/
    │   └── index.html     ← ✅ Engels Unit 2+3 trainer (5 secties, TYPE-modus)
    ├── geschiedenis/
    │   └── index.html     ← ❌ NOG TE BOUWEN
    ├── biologie/
    │   └── index.html     ← ❌ NOG TE BOUWEN
    ├── aardrijkskunde/
    │   └── index.html     ← ❌ NOG TE BOUWEN
    └── tekenen-hv/
        └── index.html     ← ❌ NOG TE BOUWEN
```

## Conventions & Patterns

### Trainer Apps

Elke trainer is een **single HTML file** met:
- React 18 via CDN (`https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js`)
- ReactDOM via CDN
- Babel Standalone voor in-browser JSX
- `React.createElement()` calls (GEEN JSX — Babel in production mode ondersteunt het niet altijd betrouwbaar)
- Gedeelde progress API via `../../shared/progress.js`

### Trainer Structuur (per vak)

Elke trainer heeft:
1. **Home screen** — overzicht van alle secties met progress bars
2. **Theory mode** — stapsgewijze uitleg met interactive checks
3. **Practice mode** — oefenvragen (multiple choice OF type-modus)
4. **Results screen** — score + optie om opnieuw te doen

### Design System

- **Dark theme**: background `linear-gradient(160deg, #0a0e1a, #111830 50%, #0c1020)`
- **Font**: Nunito (Google Fonts CDN)
- **Border**: `rgba(255,255,255,0.06)`
- **Card bg**: `rgba(255,255,255,0.04)`
- **Kleuren per vak:**
  - Wiskunde: `#3498DB` (blauw)
  - Nederlands: `#E67E22` (oranje)
  - Frans: `#9B59B6` (paars)
  - Geschiedenis: `#E74C3C` (rood)
  - Engels: `#E74C3C` (rood) — let op: zelfde als Geschiedenis, mag aangepast
  - Biologie: `#27AE60` (groen)
  - Aardrijkskunde: `#F1C40F` (geel)
  - Tekenen/HV: `#1ABC9C` (teal)

### Progress API (`shared/progress.js`)

```javascript
// Initialisatie in elke trainer:
const progress = new TrainerProgress("trainer_id", "Display Name", {
  subject: "Wiskunde",  // voor dashboard integratie
  color: "#3498DB",
  icon: "📐"
});

// Gebruik:
progress.recordAnswer("section_id", true/false);  // registreer antwoord
progress.getSection("section_id");     // → { correct, total, theoryDone }
progress.isMastered("section_id");     // → true als ≥5 antwoorden EN ≥70% correct
progress.getOverallStats();            // → { mastered, total, masteryPct, accuracy }
progress.markTheoryDone("section_id"); // markeer theorie als gelezen
progress.reset();                      // wis alle progress
```

localStorage key format: `{trainer_id}` met JSON object per sectie.

### Mastery Criteria

Een sectie is "mastered" wanneer:
- Minimaal **5 vragen** beantwoord
- Minimaal **70% correct**

## Proefwerkweek Schema

| Datum | Dag | Proefwerk |
|-------|-----|-----------|
| Do 12 mrt | Donderdag | Wiskunde + Nederlands |
| Vr 13 mrt | Vrijdag | Frans + Geschiedenis |
| Ma 16 mrt | Maandag | **Engels** (09:25-10:15) |
| Di 17 mrt | Dinsdag | Biologie |
| Wo 18 mrt | Woensdag | Aardrijkskunde + Tekenen/HV |

## Stof per Vak

### ✅ Wiskunde (trainer klaar)
- H5 + H6
- 6 secties: 6.1-6.6

### ✅ Nederlands (trainer klaar)
- Paragraaf 1.3, 2.3, 3.3, 4.3, 5.3

### ✅ Frans (trainer klaar)
- Chapitre 1/2/3
- Werkwoorden NL→FR (25 verbs)
- Être + Avoir vervoegen
- Bezittelijk voornaamwoord (mon/ma/mes etc.)
- Vocabulaire pg 131
- D-toets oefenen

### ✅ Engels (trainer klaar — TYPE-modus)
- Vocab Unit 2+3 (WB blz. 138-139): 52 + 64 woorden
- Grammar: Past Simple "be" (was/were)
- Grammar: Past Simple regular verbs (-ed spellingregels)
- WB blz. 112-118 & 125-126
- **Let op: Engels trainer gebruikt TYPEN, geen multiple choice**

### ❌ Geschiedenis (nog te bouwen)
- Blz 10-11, par 4.1, 4.2, 4.3
- 8 vaardigheden
- Materiaal: nog niet ontvangen van gebruiker

### ❌ Biologie (nog te bouwen)
- Thema 3: basisstof 1-6, extra stof 7-8
- Materiaal: nog niet ontvangen

### ❌ Aardrijkskunde (nog te bouwen)
- H4 par 1-5 + basisboeknummers
- Materiaal: nog niet ontvangen

### ❌ Tekenen/HV (nog te bouwen)
- Tekenen H3 + H6
- HV H7 architectuur
- Materiaal: nog niet ontvangen

## Dashboard Details

`dashboard.html` bevat:
- **21 dagen** planning (do 26 feb – wo 18 mrt)
- **5 fases**: Leren → Herhalen → Intensief → Laatste check → PW-week
- **74 studietaken** van 20 minuten elk, met checkboxen
- **Sportschema**: week 1 za+zo, week 2 di+za, daarna di+do+za (squash)
- **8 vakken** inclusief Engels
- Tabs: Plan, Vakken, PW, Info
- localStorage key: `stijn_studieplan_v4`

## Sportschema Stijn

- Week 1 (26 feb – 1 mrt): za 28 feb + zo 1 mrt (squash)
- Week 2 (2 – 8 mrt): di 3 mrt + za 7 mrt
- Vanaf 9 mrt: di + do + za (normaal schema)
- Sportdagen = 2 studieblokken, andere dagen = 3 studieblokken

## Landing Page (index.html)

Toont cards voor alle 8 vakken met:
- Actieve links naar bestaande trainers
- "NIEUW" badge voor recent toegevoegde trainers
- "BINNENKORT" badge (grayed out) voor nog te bouwen trainers
- Link naar dashboard

## Wanneer een nieuwe trainer wordt toegevoegd:

1. Maak `trainers/{vaknaam}/index.html`
2. Update `index.html` — zet de card van "BINNENKORT" naar actief met "NIEUW" badge
3. Controleer dat het vak al in `dashboard.html` staat (EXAMS array, subjects array, studietaken)
4. Test dat `../../shared/progress.js` correct gelinkt is
5. Commit + push → GitHub Pages deployt automatisch

## Belangrijke Notities

- De gebruiker (Ralph) levert foto's/screenshots van lesmateriaal aan — daaruit worden woordenlijsten en oefenvragen geëxtraheerd
- Stijn is de student, VWO 1 niveau
- Alle UI-teksten mogen in het Nederlands, behalve bij de Engels trainer
- De Engels trainer gebruikt bewust TYPEN in plaats van multiple choice — dit is een expliciete keuze van de gebruiker
- Mobile-first design (max-width 640px container)
- Geen externe dependencies behalve Google Fonts en React/Babel CDN
