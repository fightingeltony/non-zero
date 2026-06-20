# BACKLOG — non-zero

> Beobachtungen und Aufgaben, eine nach der anderen. Reihenfolge = grobe Priorität.
> Regel: erst spielen, dann die nächste Änderung. Nach jeder Balancing-Änderung mehrere
> Durchläufe testen, bevor der nächste Punkt drankommt (GAME_DESIGN §9).

---

## #1 — Gärtank ist ein No-Brainer (Fixkostenfalle deaktiviert) · ✅ HEBEL 1 UMGESETZT (2026-06-20)

**Status:** Bug behoben + Hebel 1 angewandt. Hebel 2 bewusst zurückgestellt (siehe unten).
Testkriterium noch durch mehrere Durchläufe zu bestätigen.

**Was umgesetzt wurde:**
- *Bug:* `fixedCost()` las `fixPerQ` nie aus — jetzt werden die `fixPerQ` aller gebauten
  Gebäude aufsummiert (`for (id of S.buildings) f += B.buildings.find(...).fixPerQ`).
- *Werte (Hebel 1, wie vorgeschlagen):* Gärtank `1500`, Abfüllstraße `2200`, Halle2 `3500`.
- *Transparenz:* Die laufenden Fixkosten stehen jetzt in der Gebäude-Beschreibung im UI.
- *Verifiziert:* Tank-Bau hebt Fixkosten 2'100 → 4'200/Q (+2'100 marginal). Leerer Tank
  blutet −2'100/Q; bei voller Auslastung (Lager, DB 150) Amortisation ~3,5 Q. Energie-Upgrade
  (×0.85) greift korrekt auf die Gesamtsumme inkl. Gebäude.

**Bewusst NICHT gemacht — Hebel 2 (`perCapacityHl` 15→28):** zurückgestellt, um „eine Änderung,
dann testen" einzuhalten. Hebel 2 verschärft das ganze Frühspiel (Start-Fix 2'100→2'880/Q), nicht
nur den Tank-No-Brainer — eine separate Stellschraube. Erst greifen, falls der Tank nach
Durchläufen WEITERHIN immer sofort gebaut wird.

**Nächster Schritt:** 2–3 Durchläufe auf „Standard" + „Hart". Prüfen: Gibt es Situationen, in
denen „Gärtank noch NICHT bauen" richtig ist? Falls Tank weiter risikolos → Hebel 2 nachlegen.

---

**Problem (durch Spielen entdeckt, mit Zahlen bestätigt):**
Der erste Ausbau wird immer sofort gebaut, sobald Geld da ist — also ist es keine
Entscheidung, sondern ein verzögerter Startwert. Das verletzt das Leitprinzip „jeder Franken
nur einmal" und deaktiviert die zentrale Fixkostenfalle, die das Herz des Spiels sein soll.

**Warum (Belegrechnung mit aktuellen Werten in `B`):**
- Fixkosten laufen NUR über `fixedCosts.perCapacityHl × capacity` (=15/hl) plus Overhead.
- Alle Gebäude haben `fixPerQ: 0` — das Feld existiert, wird aber in `fixedCost()` gar nicht
  verrechnet.
- Gärtank: +40 hl für CHF 14'000. Einzige laufende Mehrlast: 40×15 = **600/Q**.
- Deckungsbeitrag der neuen 40 hl schon bei halber Auslastung (schwächstes Bier, DB ~150/hl):
  20×150 = **3'000/Q** gegen 600/Q Mehrkosten. Amortisation ~3 Q sogar bei voller Auslastung.
- Fazit: Leerstand tut nicht weh, „bauen, bevor Nachfrage da ist" ist risikolos.

**Fix — Hebel 1 + 2 kombinieren (beide in `B`, eine kleine Logik-Ergänzung):**

*Hebel 1 — `fixPerQ` tatsächlich nutzen.*
- Werte setzen (Startvorschlag): Gärtank `fixPerQ: 1500`, Abfüllstraße `~2200`, Halle2 `~3500`.
- **Logik-Ergänzung nötig:** In `fixedCost()` die `fixPerQ` aller gebauten Gebäude
  aufsummieren — aktuell wird das Feld gelesen, aber nicht verrechnet. Pseudocode:
  `for (id of S.buildings) f += B.buildings.find(b=>b.id===id).fixPerQ;`
- Wirkung: Ein leerer Tank blutet. „Bauen, bevor die Nachfrage da ist" wird zur echten Wette.

*Hebel 2 — `perCapacityHl` anheben.*
- Von 15 auf ~28 (Startvorschlag). Ungenutzte hl bluten spürbar, trifft jede Ausbaustufe gleich.

**Zielbild (GAME_DESIGN §9):** Eine Ausbaustufe soll sich erst nach **2–3 Quartalen guter
Auslastung** amortisieren — nicht risikolos sofort. Nach der Änderung: prüfen, ob zu früher
Ausbau jetzt wirklich bestrafen kann (Liquiditätsklemme + Fixkostendruck).

**Testkriterium:** Gibt es Situationen, in denen „Gärtank noch NICHT bauen" die richtige Wahl
ist? Wenn ja, ist die Fixkostenfalle scharf. Wenn der Tank weiterhin immer sofort gebaut wird,
Werte nachschärfen.

**Vorsicht beim Tarieren:** Vorsichtig anfangen (Werte oben), 2–3 Durchläufe auf „Standard"
und „Hart" spielen. Nicht überdrehen — Ausbau muss attraktiv BLEIBEN, nur nicht risikolos.

---

## #2 — `balance.json` vs. `const B` konsolidieren · PRIORITÄT MITTEL

Es gibt zwei Quellen für Zahlen: das frühe `balance.json` und das gelebte `const B` in
`index.html`. Doppelte Wahrheit ist eine Fehlerquelle. Entscheiden:
- Entweder `B` bleibt die Quelle und `balance.json` wird gelöscht/archiviert, ODER
- `index.html` lädt `balance.json` zur Laufzeit (mehr Aufwand, sauberer für späteres Wachstum).
Für die schlanke Einzeldatei-Phase ist Variante 1 (nur `B`) wahrscheinlich richtig.

---

## #3 — Weitere Balancing-Fragen (aus GAME_DESIGN §9, durch Spielen zu klären)

- Ist eine Investitionsstrategie immer optimal? Personal/Upgrades/F&E gegeneinander prüfen.
- Wächst die Marktgröße so, dass Expansion sich lohnt, aber Überexpansion bestraft wird?
- Killt die Zinslast bei Vollverschuldung das Spiel zu hart oder zu lasch?
- F&E: Lohnt sich der mehrquartalige Einsatz gegenüber direktem Kapazitätsausbau?

---

## Geparkt (nicht im aktuellen Aufbau — siehe GAME_DESIGN §7b/§8)

- Kooperations-Achse / Shared Infrastructure (kommt erst, wenn der Game-A-Kern trägt).
- Andere Brauereien als Entscheidungspartner (an die Kooperations-Achse gekoppelt).
- Desktop-Tiefe als spätere Ausbaustufe über der schlanken Mobilversion.
