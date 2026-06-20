# BACKLOG — non-zero

> Beobachtungen und Aufgaben, eine nach der anderen. Reihenfolge = grobe Priorität.
> Regel: erst spielen, dann die nächste Änderung. Nach jeder Balancing-Änderung mehrere
> Durchläufe testen, bevor der nächste Punkt drankommt (GAME_DESIGN §9).

---

## #1 — Gärtank ist ein No-Brainer (Fixkostenfalle deaktiviert) · ✅ HEBEL 1 UMGESETZT

**Status (2026-06-20):** Bug behoben + Hebel 1 angewandt. `fixedCost()` summiert jetzt die
`fixPerQ` aller gebauten Gebäude (war read-but-never-charged). Werte: Gärtank 1500, Abfüll 2200,
Halle2 3500. Verifiziert: leerer Tank blutet −2'100/Q, voll ausgelastet Amortisation ~3,5 Q.
**Update (2. Runde):** Sim (`tools/sim.mjs`, Naiv- vs. Skill-Bot) zeigte: „alles ausbauen"
blieb sicherer Sieg (0% Pleiten/Hart) — Ursache fette Margen + frei wachsender Markt. **Hebel 2
jetzt angewandt: `perCapacityHl` 15→22** (moderat; Start-Fix 2'100→2'520, lebensfähig) → leere
Kapazität blutet. **Offen: menschliches Playtest** — das genaue „naiv riskant / Skill gewinnt"-Band
ist per Bot nicht fixierbar (Bots binär 0%/100%), nur per Spielgefühl. Werte nachjustieren.

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

## #2 — Ausbaupfad zu kurz, Kapazität als Sackgasse · ✅ TEIL A + B UMGESETZT

**Status (2026-06-20):**
- *Teil A — wiederholbarer Ausbau:* Nach „Zweite Halle" gibt es einen kaufbaren „Weiterer
  Gärtank" (+40 hl), jeder teurer (×1.4) und mit höheren Fixkosten (×1.4) als der vorige.
  `B.expansion` + `buyExtraTank()` + `extraTankFixTotal()`. Es gibt jetzt IMMER eine nächste,
  zunehmend riskantere Ausbau-Entscheidung. Verifiziert: Kosten 16k/22.4k/31.4k, Fix 1500/2100/2940.
- *Teil B — Markt als Bremse:* `B.market.max` 600→1000. Nachfrage skaliert mit `marketSize`.
- *Teil B+ — Markt-Sättigung (2. Runde):* `B.saturation` {sweet:0.82, steep:2.2, floor:0.5}.
  Verkauf über 82% des Marktes drückt den Durchschnittspreis (bis Boden 50%). Im UI sichtbar
  (Produktionsplan: „Marktauslastung X%") und im Log nach der Abrechnung. So bestraft Fluten
  (mehr produzieren als der genährte Markt will) sich selbst — sinkende Grenzerträge statt
  hl-Wand. Verifiziert: bei 163% Auslastung Preis → 50%, Quartal kippt ins Minus.
- *Teil C:* erfüllt durch #1 (Fixkosten scharf).
- **Offen:** 2–3 Durchläufe auf Standard/Hart spielen. Prüfen, ob der Markt mit Verkäufer zu
  leicht ans Maximum kommt (ggf. `repGrowthFactor` oder `max` senken) und ob „nicht weiter
  ausbauen" sich je richtig anfühlt.

**Problem (durch Spielen entdeckt, mit Zahlen bestätigt):**
Man kommt schnell an die Maximalkapazität und lässt dann nur noch durchlaufen — die zweite
Spielhälfte hat keine Ausbau-Entscheidung mehr. Das tötet die zentrale Spannung („worin
investiere ich als Nächstes") für den Rest der Partie.

**Warum (Belegrechnung mit aktuellen Werten in `B`):**
- Nur 3 Ausbaustufen: 60 → 100 → 160 → 280 hl. Danach ist `S.capacity` hart gedeckelt.
- Spieldauer 7 Jahre = 28 Quartale, aber Ausbaupfad nach 3 Käufen erschöpft.
- `B.market.max` = 600 hl: Der Markt kann auf 600 wachsen, die Produktion bleibt bei 280 —
  Kapazität wird zur harten Wand ohne Ausweg, statt zu einer Wette.
- Verzahnt mit #1: Weil Ausbau billig/risikolos ist, ist man auch noch SCHNELL oben.
  → #1 und #2 zusammen umsetzen, sie betreffen dieselbe Mechanik von zwei Seiten.

**Fix — drei Teile:**

*Teil A — Ausbaupfad verlängern & öffnen.*
- Entweder 5–6 feste Stufen statt 3, ODER (eleganter) ein **wiederholbarer Ausbau** am Ende:
  ab der letzten festen Stufe weitere Gärtanks kaufbar, jeder teurer und mit mehr `fixPerQ`
  als der vorige (z. B. Kosten ×1.4, fixPerQ ×1.4 pro Wiederholung).
- Wirkung: Es gibt IMMER eine nächste Ausbau-Entscheidung — aber zunehmend riskanter.

*Teil B — Markt als Bremse statt Kapazität als Wand.*
- Die eigentliche Grenze soll die NACHFRAGE sein, nicht eine harte hl-Wand. Ausbau über den
  Marktbedarf hinaus bringt nichts ein, kostet aber Fixkosten.
- Dann ist das Gefühl nicht „ich stoße an die Wand", sondern „lohnt sich der nächste Ausbau
  für den Markt, den ich habe / wachsen lassen kann?" — genau die Wette aus GAME_DESIGN §7.
- Ggf. `B.market.max` anheben oder dynamisch an Ruf/Präsenz koppeln, damit Wachstum sich lohnt.

*Teil C — gemeinsam mit #1 (Fixkosten scharf).*
- Erst mit echten Ausbau-Fixkosten (#1) wird „weiter ausbauen?" eine ehrliche Frage statt
  Automatismus. A + B + #1 ergeben zusammen: langsamer hochkommen, immer eine nächste
  Entscheidung, und Überexpansion wird bestraft.

**Testkriterium:** Gibt es in der zweiten Spielhälfte (Quartal 14+) noch echte
Investitions-Entscheidungen? Fühlt sich „nicht weiter ausbauen" je als richtige Wahl an?
Wenn man weiterhin nur durchlaufen lässt, Werte nachschärfen.

**Vorsicht:** Nicht ins Gegenteil kippen — Ausbau muss erreichbar und lohnend BLEIBEN, nur
nicht endlich/risikolos. Nach Änderung 2–3 Durchläufe auf Standard und Hart.

---

## #3 — Event-System: kontextgetriggert statt rein zufällig · PRIORITÄT MITTEL-HOCH

**Problem:** Es braucht viel mehr Entscheidungsfragen. Aktuell ~10 handgeschriebene Events,
rein zufällig gezogen — dasselbe Event kann in Quartal 2 und Quartal 25 kommen, obwohl die
Spielsituation völlig anders ist. Nach wenigen Partien sind alle bekannt.

**Verworfene Alternative — rein generisch/prozedural.** Aus Bausteinen zusammengewürfelte
Events („[Akteur] bietet [Ware] zu [Bedingung]") sind praktisch unendlich, fühlen sich aber
generisch an, haben keine Pointe und erzeugen oft unsinnige/triviale Kombinationen. Quantität
auf Kosten von Bedeutung — das Gegenteil dessen, was wir wollen. NICHT diesen Weg gehen.

**Gewählter Ansatz — kontextgetriggerte handgeschriebene Events.** Events bleiben handgemacht
(Charakter, gute Texte, durchdachte Trade-offs), werden aber NICHT rein zufällig gezogen,
sondern an Spielzustände geknüpft. Drei Bausteine:

1. **`condition`-Feld pro Event** (Funktion, die den Spielzustand prüft): Spielphase/Jahr,
   Auslastung, Schuldenstand, Ruf, Kapazität, ob Konkurrent existiert. Die Engine zieht nur
   aus dem Pool gerade GÜLTIGER Events. Wirkung: Dasselbe Spiel sieht je nach Spielstil andere
   Events — die Welt reagiert auf dich. Deckt sich mit GAME_DESIGN §6 (Events testen frühere
   Entscheidungen, brechen nicht zufällig herein).
2. **Wertskalierung:** Hülle handgeschrieben, Zahlen (Mengen, Preise) skalieren mit der
   aktuellen Spielgrösse, damit ein Event in Quartal 25 nicht trivial wird. Kontrollierte
   Generik — Variation in den Werten, Bedeutung in der Struktur.
3. **Mehr Events:** Ziel ~25–30 statt 10, damit eine Partie (28 Q) nicht alle sieht.

**Struktur:** Passt zur `B`/Daten-Logik-Trennung. Event = Daten-Objekt mit `condition`-Funktion.
Neues Event = ein Listeneintrag mit Bedingung. Engine filtert Pool, dann Zufallszug aus dem
gefilterten Pool (weiterhin „lastEvent nicht wiederholen").

**Arbeitsteilung (festgehalten):**
- Event-TEXTE & Trade-offs: kreative Substanz, im Dialog mit Claude (Ton, Balance, welche
  Spannung jedes Event testet). Ein erster Satz von ~6–8 Muster-Events dient als Vorlage.
- Trigger-SYSTEM & Integration (`condition`-Felder, Pool-Filter, Wertskalierung): Code-Arbeit
  in Claude Code, dort testen und spielen.

**Reihenfolge-Hinweis:** ERST #1 und #2 austarieren (Fixkosten, Ausbaupfad). Solange der
Kern-Loop nicht sitzt, ist unklar, wie sich die Spielphasen anfühlen, an die Events getriggert
werden — 30 Events vorher zu schreiben wäre Inhalt vor Fundament. Muster-Events können schon
existieren; die volle Menge kommt, wenn der Kern steht.

---

## #4 — `balance.json` vs. `const B` konsolidieren · PRIORITÄT MITTEL

Es gibt zwei Quellen für Zahlen: das frühe `balance.json` und das gelebte `const B` in
`index.html`. Doppelte Wahrheit ist eine Fehlerquelle. Entscheiden:
- Entweder `B` bleibt die Quelle und `balance.json` wird gelöscht/archiviert, ODER
- `index.html` lädt `balance.json` zur Laufzeit (mehr Aufwand, sauberer für späteres Wachstum).
Für die schlanke Einzeldatei-Phase ist Variante 1 (nur `B`) wahrscheinlich richtig.

---

## #5 — Weitere Balancing-Fragen (aus GAME_DESIGN §9, durch Spielen zu klären)

- Ist eine Investitionsstrategie immer optimal? Personal/Upgrades/F&E gegeneinander prüfen.
- Wächst die Marktgröße so, dass Expansion sich lohnt, aber Überexpansion bestraft wird?
- Killt die Zinslast bei Vollverschuldung das Spiel zu hart oder zu lasch?
- F&E: Lohnt sich der mehrquartalige Einsatz gegenüber direktem Kapazitätsausbau?

---

## #6 — Produktionskette als spätere Desktop-Tiefe (von Beer Factory gelernt) · GEPARKT

Vergleichsobjekt: *Beer Factory* (Steam, MyceliumGames, 2024) — 3D-Fabriksimulator,
Rohstoff → Brauen → Abfüllen → Liefern, Mitarbeiter-Aufgabenzuteilung, „realistische"
Wirtschaft mit Steuern/Transport.

**Wichtigste Lektion (Warnung, nicht Vorbild):** Trotz voller Ausstattung und kommerziellem
Studio nur **41% positiv (Mixed, 1'401 Reviews)**. → Tiefe und Realismus allein machen kein
gutes Spiel. Bestätigt unseren Kurs: Spannung aus Design, nicht aus Systemmenge. Der Markt
generischer „verwalte-eine-X-Fabrik"-Simulatoren ist gesättigt und mittelmäßig bewertet.

**Was übernehmenswert ist (nur als spätere DESKTOP-Ausbaustufe, NICHT mobil):**
- Mehrstufige Produktionskette als Tiefenquelle: aktuell ist Produktion eine Zahl (hl).
  Eine 2–3-stufige Kette (z. B. Rohstoff → Sud → Abfüllung) mit einem Engpass dazwischen
  könnte echte neue Knappheit schaffen.

**Was bewusst NICHT übernehmen:** 3D, First-Person, Logistik-Mikromanagement, „so realistisch
wie möglich". Für mobile-first zu schwer; und 41% zeigen, dass es selbst gut gemacht nicht
trägt. Unser Vorteil ist der *Standpunkt* (Wachstum vs. Kooperation), den ein generischer
Fabriksimulator nicht hat — das ist das Differenzierungsmerkmal, nicht der Realismus.

---

## Geparkt (nicht im aktuellen Aufbau — siehe GAME_DESIGN §7b/§8)

- Kooperations-Achse / Shared Infrastructure (kommt erst, wenn der Game-A-Kern trägt).
- Andere Brauereien als Entscheidungspartner (an die Kooperations-Achse gekoppelt).
- Desktop-Tiefe als spätere Ausbaustufe über der schlanken Mobilversion.
