# BACKLOG — non-zero

> Beobachtungen und Aufgaben, eine nach der anderen. Reihenfolge = grobe Priorität.
> Regel: erst spielen, dann die nächste Änderung. Nach jeder Balancing-Änderung mehrere
> Durchläufe testen, bevor der nächste Punkt drankommt (GAME_DESIGN §9).

---

## STATUS (Stand letzte Session)

- **#1 Fixkostenfalle / Hebel 2:** teilweise erledigt — `perCapacityHl` 15→22, Start-Fix
  angepasst. Eingebaut, aber noch zu mild (siehe #0).
- **#2 Ausbaupfad / Markt als Bremse:** erledigt — wiederholbarer Tank (×1.4 Kosten & Fix),
  `market.max` 600→1000, Markt-Sättigung (Haircut ab ~82% Marktauslastung) eingebaut.
- **Simulator (Diagnose-Werkzeug):** committet. Naiv-Greedy + Skill-Bot + Sättigungs-Harness.
  Wichtigster Befund: Bots liefern BINÄRE Ergebnisse (0% oder 100% Pleite), kein 20–40%-Band —
  das Band ist eine Eigenschaft *menschlichen* Spiels und kann nur durch Spielen gesetzt werden.
  Sättigung allein heilt die Dominanz NICHT (bestraft nur Fluten, nicht Leerbauen).
- **Trotzdem weiterhin zu leicht** → Hauptbefund #0 (Elastizität, inzwischen gefixt: Faktor 3.0
  + Floor 0.15, Hochpreis-Exploit tot, Skill-Preis-Spiel belohnt).
- **DIAGNOSE-UMKEHR (wichtig):** Nach #0-Fix immer noch unbefriedigend — aber beim Spielen
  zeigte sich: das Problem ist NICHT „zu leicht", sondern **GLEICHFÖRMIGKEIT**. Jede Runde
  verlangt dasselbe. Das erklärt auch „zu leicht" (ein Loop einmal gelöst, dann wiederholt).
  → Front gewechselt: von *Balance* zu *Varianz/Content*. Siehe neuen Top-Eintrag #K.

---

## #K — KOOPERATIONS-ACHSE aktivieren (Antwort auf Gleichförmigkeit) · 🟡 SCHRITT 1 UMGESETZT — Playtest entscheidet

**Status (2026-06-21):** Erster Wendepunkt „Der wankende Nachbar" gebaut + im Spiel verifiziert.
- **Gating:** einmal pro Partie, ab Jahr 4 + Ruf ≥ 45 (Werte in `B.cooperation`). Hat Vorrang vor
  dem Zufalls-Event-Pool (`pickCoopEvent()` in `pickEvent`) — Saat des #3-Bedingungssystems.
- **Drei Wege (alle Zahlen in `B.cooperation`, per Spielen justierbar):**
  - *Aufkaufen (Game A / Defektion):* +40 hl für CHF 9'000 (225/hl, billiger als jeder Gärtank +
    keine Fixkosten → echte Versuchung). Preis: Markt −15%, Ruf −6. Extraktion frisst die
    Grundlage, mechanisch (Ledger-Markt sinkt sichtbar).
  - *Infrastruktur teilen (Game B):* CHF 4'000 + dauerhaft Fixkosten −15% (`fixedCost`-Mult wie
    Energie), Markt +5%. VERLETZLICH: Folge-Ereignis „Stägehof wankt erneut" (ab Jahr 6) —
    aushelfen (CHF 5'000, Bindung trägt) oder Partnerschaft platzt (Vorteil weg, Ruf −4).
  - *Ablehnen:* Nachbar geht unter, Markt −5%. Hält die Wahl ehrlich (man darf ihn fallen lassen).
- **Designgesetz erfüllt:** möglich/lohnend/verletzlich, kein Gewinnknopf, Defektion verlockt,
  beide Wege gewinnbar. (Persistenz: `S.neighbor`, `S.shared`; alte Saves bleiben kompatibel.)
- **Offen — der eigentliche Test (#K Schritt 2):** Zündet DER MOMENT? Fühlt es sich anders an als
  „Mengen einstellen, Quartal starten"? Per Spielen entscheiden. Zündet er → ausbauen (mehrere
  Akteure, wiederkehrende Beziehungen, Monopol-vs-Netzwerk-Endzustand §7c). Zündet er nicht →
  wenig investiert, viel gelernt. Balance der `B.cooperation`-Werte (lohnt Teilen vs. Aufkaufen?)
  ebenfalls Playtest-Sache.
- **Hinweis:** Das im Backlog erwähnte `sample-events.js` existierte nicht — Event frisch im
  `EVENTS`-Umfeld (`makeCoopEvent`/`makeCoopFollowup`) gebaut.

> Richtungsentscheidung dieser Session. Widerspricht bewusst dem früheren „erst Kern, dann
> Kooperation" — weil sich die Lage geändert hat (Kern trägt jetzt; Problem ist Monotonie,
> nicht Schwäche). Vollständige Begründung in GAME_DESIGN §7c (Status-Block).

**Befund:** Das Spiel ist gleichförmig — kein Gegenspieler, keine zweite Spielhälfte, man
optimiert gegen ein totes System. Kein Balance-Fix behebt das; selbst perfekt austariert bliebe
jede Runde gleich. Die Kooperations-Achse (Monopol vs. Netzwerk) ist nicht nur „Content", sie
ist das eigentliche Thema UND die fehlende zweite Hälfte, die dem Wachstum etwas entgegensetzt.

**Nebeneffekt auf „zu leicht":** Andere Akteure, die um denselben Markt konkurrieren und
*reagieren*, erzeugen Schwierigkeit, die kein Zahlendreh herstellt. Wachstum wird vom einsamen
Optimieren zum Ringen um einen geteilten Pool.

**Vorgehen — klein anfangen, NICHT die volle Game-B-Maschine:**
1. **EIN Wendepunkt zuerst: „der wankende Nachbar"** (Muster liegt schon in `sample-events.js`).
   Eine benannte Brauerei gerät in die Fixkostenfalle. Wahl: aufkaufen (Kapazität billig, aber
   regionaler Markt schrumpft + Ruf leidet) ODER Infrastruktur teilen (beide senken Fixkosten,
   Markt bleibt lebendig). Irgendwo in der Spielmitte (z. B. Jahr 4+, Ruf-Schwelle).
2. **Test:** Fühlt sich DER MOMENT anders an als „Mengen einstellen, Quartal starten"? Ist zum
   ersten Mal jemand da, der reagiert, und eine Entscheidung, die kein Zahlenoptimierungs-Schritt
   ist? Zündet er → ausbauen (mehrere Akteure, wiederkehrende Beziehungen, Monopol-vs-Netzwerk-
   Endzustand, §7c). Zündet er nicht → wenig investiert, viel gelernt.

**Eisernes Designgesetz (gilt ab dem ersten Moment, GAME_DESIGN §7c):**
Kooperation muss möglich, lohnend und VERLETZLICH sein — nie garantiert. Kein Gewinnknopf.
Defektion (Aufkaufen) muss echt verlocken. Beide Wege gewinnbar, unterschiedlich tragfähig.

**Reihenfolge vs. andere offene Punkte:** #K ist jetzt die Hauptrichtung. #0c (Forecast
entschärfen + Lager-Anzeige als DARSTELLUNG, nicht im Log — vom Nutzer ausdrücklich gewünscht)
bleibt parallel sinnvoll, weil es die Mengenentscheidung ebenfalls aus der Trivialität holt.
Reine Balance-Feinarbeit (#1 Hebel 2 nachschärfen etc.) tritt hinter #K zurück.

---

## #0 — WURZEL: Preis-Elastizität zu schwach · PRIORITÄT HÖCHSTE

**Befund (durch Spielen + Rechnung bestätigt):**
Auf „Hart" lässt sich bei **maximalem Preis (+30%) trotzdem alles gut verkaufen**. Das ist
ein dritter Schleichweg, den Sättigung und Hebel 2 NICHT abdecken — und er erklärt, warum das
Spiel trotz aller bisherigen Fixes zu leicht bleibt. Der Greedy-Bot der Simulation hat den
Preis-Slider nie aufgedreht, deshalb tauchte dieser Pfad in der Sim nicht auf.

**Mechanismus (Rechnung):**
- Elastizität aktuell: `elas = clamp(1 - (priceMod-1)*1.4, 0.40, 1.50)`.
- Bei +30% Preis fällt die Nachfrage nur auf 58% — der reine Gewinn pro Quartal ist fast
  identisch zu Normalpreis (≈19'700 vs. 22'000 im Rechenbeispiel).
- ABER: Hochpreis verkauft 58 statt 100 hl → braucht **weniger Kapazität, weniger Produktion,
  weniger Braukosten, weniger Kapital** für fast denselben Gewinn.
- Damit ist „Preis hoch + wenig produzieren" die **kapitaleffizienteste** Strategie und umgeht
  genau die Kapazitäts-/Fixkosten-Klemme, die wir mit #1/#2 erzwingen wollten.

**Tiefere Wurzel:** Die Marge pro hl ist so fett, dass der Spieler frei wählen kann, ob er über
*Menge* oder über *Preis* gewinnt — und Preis ist der bequemere Weg. Solange das so ist,
dominiert Hochpreis alle Mengen-Mechaniken.

**Fix-Richtung — Elastizität deutlich aggressiver:**
- Faktor `1.4` → eher `2.5–3.0`, sodass Hochpreis spürbar mehr Menge kostet, als er an Marge
  bringt. Ziel: bei +30% Preis bricht die Nachfrage so stark ein, dass der Gewinn klar UNTER
  Normalpreis liegt — Hochpreis wird zur Nischenwahl (knappe Kapazität), nicht zur Dauerlösung.

**WICHTIG — nicht raten, simulieren (Lehre aus der Messerschneide):**
- Preis-/Margen-Zahlen sind Messerschneiden (Sim hat gezeigt: 50%→40% Marge = 0%→100% Pleite).
- Daher: **Skill-Bot erweitern, sodass er den Preis-Hebel nutzt** (Preis aufdrehen, bis Grenz-
  gewinn kippt). Dann aggressive Elastizität gegen diesen preisbewussten Bot testen.
- Zielzustand: Hochpreis-Wenigproduzieren ist KEINE freie Gewinnstrategie mehr; der Bot muss
  echte Trade-offs zwischen Preis und Menge eingehen. Start muss lebensfähig bleiben.
- Erst danach Werte ins echte Spiel, dann von Hand auf „Hart" nachschärfen.

---

## #0b — Lagerbestand anzeigen (Information) · ✅ UMGESETZT inkl. Nutzer-Korrektur (2026-06-21)

**Status:** Lager wird **pro Sorte** im Produktionsplan angezeigt (gold: „Lager X hl" je
Brew-Zeile, plus Gesamt im Footer). Stock ist jetzt **pro Sorte** modelliert (`b.stock` statt
globalem `S.stock`). NUTZER-KORREKTUR umgesetzt: keine Log-Meldungen mehr — die Konsequenz ist
als Darstellung beim Planen präsent und schlägt übers Quartalsergebnis durch. Verifiziert.

**Problem:** Bei Überproduktion sieht der Spieler den entstehenden Lagerbestand aktuell NICHT
(die hl-Kennzahl fehlt im Plan). Damit kann man nicht lernen, klüger zu planen — und die
Überproduktions-Kosten bleiben unsichtbar.

**Task:** Aktuellen Lagerbestand (unverkaufte hl) sichtbar machen — als **visuelle DARSTELLUNG**
im Produktionsplan und/oder in der Ledger-Leiste, idealerweise **pro Sorte**. Reine Anzeige,
keine neue Mechanik. Niedriger Aufwand, hoher Diagnose-Nutzen (man sieht, was liegenbleibt).

> NUTZER-KORREKTUR: NICHT im Geschäftsbuch/Log anzeigen, sondern als eigene Darstellung
> (Kennzahl/Balken/pro-Sorte-Zeile). Der Lagerbestand soll beim PLANEN präsent sein, nicht
> nachträglich im Log auftauchen.

**Bewusst NUR Anzeige.** Lagerverwaltung/Rampenverkäufe als *Mechanik* → geparkt (siehe unten),
NICHT jetzt: Eine neue Optimierungsmechanik auf einen noch dominierten Kern zu setzen wäre
„Inhalt vor Fundament". Lagerverwaltung wird erst interessant, wenn Überproduktion (via #0/#1)
echte Kosten hat.

---

## #0c — Forecast entschärfen + Lager mit Konsequenz · ✅ UMGESETZT (2026-06-21) — Hart-Playtest offen

**Status:** Teil 1 (Forecast entschärft: nur Preis/Saison/Tendenz, keine „~X hl · passend"-Antwort)
+ Teil 2 (Lager-Konsequenz: Notverkauf/Schwund über `B.stock`). **Korrektur diese Session:** Die
Konsequenz war im Log — auf Nutzerwunsch raus, jetzt pro-Sorte-Darstellung (siehe #0b). Mechanik
(Schwund/Notverkauf) bleibt, nur die Sichtbarkeit ist jetzt Anzeige statt Log. Offen: Hart-Playtest,
ob die Lager-Strafe scharf genug ist (`B.stock` justierbar).

> Hinweis: #0/#0b sind bereits in Arbeit. Das hier ist eine ERGÄNZUNG, kein Umsturz —
> dieselbe Baustelle, eine Ebene tiefer gedacht. Verschiebt die Lagermechanik bewusst aus
> „geparkt" in den Kern (siehe Begründung).

**Designeinsicht (durch Spielen entdeckt):** Perfekte Information tötet die Entscheidung.
Der aktuelle Hinweis „erwartet ~X hl · passend/Überproduktion" rechnet dem Spieler die Antwort
VOR — man zieht einfach auf „passend" hoch und denkt nicht nach. Das ist dieselbe Krankheit wie
der dominante Ausbau, nur auf der Informationsebene: eine Entscheidung mit verratener Lösung ist
keine Entscheidung. (Symmetrisch zum früheren „zu berechenbar"-Problem mit dem Forecast — jetzt
von der anderen Seite gesehen.)

**Warum das Kern ist, nicht Erweiterung:** Es geht NICHT darum, eine Optimierungsmechanik
draufzusetzen. Es geht darum, dem Spieler die vorgekaute Antwort WEGZUNEHMEN. Lager +
unvollständige Information machen die Mengenentscheidung überhaupt erst zu einer Entscheidung
(abwägen statt ablesen). Das ist der eigentliche Grund, warum „Lagerverwaltung" sich richtig
anfühlt — nicht „mehr Mechanik ist cool", sondern: sie stellt die fehlende Spannung her.

**Zwei Teile:**

1. **Forecast entschärfen (Reduktion, kein neues System).** Statt der fertigen Antwort nur die
   *Rohdaten zum Schätzen* zeigen: letzte Saison verkauft, aktueller Lagerbestand, grobe Tendenz
   (z. B. „Sommer · Lager gefragt"). Die Synthese — wie viel produziere ich jetzt — bleibt beim
   Spieler. NICHT mehr „~80 hl, passend" ausgeben. Das ist fast der ganze Effekt und ist eine
   Vereinfachung, kein Mehraufwand.

2. **Lager muss Konsequenz haben.** Sonst ist Überproduktion folgenlos und die Abwägung wieder
   leer. Unverkauftes Bier altert/verfällt, bindet Kapital, muss ggf. unter Wert raus. Erst dann
   hat „zu viel produziert" Kosten, gegen die man plant. (Wert/Verfallsrate in `B`, durch
   Spielen justieren.)

**Verzahnung mit #0 (Elastizität):** Wenn Überproduktion wehtut UND Hochpreis weniger verkauft,
wird die Mengen-Preis-Entscheidung zu einer echten GEMEINSAMEN Abwägung — statt zweier Slider,
die man unabhängig hochzieht. Die zwei Wurzeln (Elastizität, perfekte Information) verstärken
sich gegenseitig in die richtige Richtung.

**Reihenfolge:** Teil 1 (Forecast entschärfen) kann sofort mit der laufenden #0b-Arbeit
mitgehen — es ist dieselbe UI-Stelle. Teil 2 (Lager mit Konsequenz) zusammen mit #0
(Elastizität), weil beide „Überproduktion soll wehtun" bedienen. Danach von Hand auf „Hart"
prüfen: Muss ich jetzt wirklich überlegen, wie viel ich produziere?

---

## #1 — Gärtank ist ein No-Brainer (Fixkostenfalle deaktiviert) · PRIORITÄT HOCH

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

## #2 — Ausbaupfad zu kurz, Kapazität als Sackgasse · PRIORITÄT HOCH (mit #1 zusammen)

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

- **Erweiterte Lagermechanik / Rampenverkäufe** (über #0c hinaus). Der Kern-Teil — Lager mit
  Konsequenz + entschärfter Forecast — ist nach #0c in den Kern gewandert (perfekte Information
  tötet die Entscheidung). Hier bleibt nur das WEITERGEHENDE geparkt: gezielte Lagerhaltung für
  antizipierte Nachfragespitzen, Notverkaufs-Kanäle, Mehrlager-Logik. Erst wenn #0c steht und
  trägt.

- Kooperations-Achse / Shared Infrastructure (kommt erst, wenn der Game-A-Kern trägt).
- Andere Brauereien als Entscheidungspartner (an die Kooperations-Achse gekoppelt).
- Desktop-Tiefe als spätere Ausbaustufe über der schlanken Mobilversion.
