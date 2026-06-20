# Stadtbräu — Game Design

> Aufbau- und Wirtschaftssimulation. Du führst eine Schweizer Mikrobrauerei von der
> Garagen-Anlage zur etablierten Marke. Der Reiz liegt nicht im Glück, sondern in
> **knappem Kapital, konkurrierenden Investitionen und Fixkosten, die dich einholen,
> wenn du zu schnell wächst.**

Dieses Dokument ist die Quelle der Wahrheit für das Design. Code richtet sich danach,
nicht umgekehrt. Bei Konflikten zwischen Code und Dokument gewinnt das Dokument — oder
das Dokument wird bewusst geändert und der Grund festgehalten.

> **Wichtig zur Lesart:** Das Dokument beschreibt das *volle* Spiel. Gebaut wird aber
> gestaffelt — zuerst eine schlanke, mobile, verbreitbare Version (§0b), dann die Tiefe
> obendrauf. Der erste Wurf ist bewusst kleiner als das, was hier sonst steht.

---

## 0. Setting & warum gerade Brauerei

Das Setting ist bewusst gewählt, nicht beliebig.

**Für den Wirtschafts-Kern** ist Brauerei ideal: physische Kapazität (Tanks, Hallen),
klare Saisonalität, greifbares Produkt, anschauliche Expansion. Zahlen fühlen sich nach
etwas an, statt abstrakt zu bleiben.

**Für die spätere Kooperations-Achse (§7b) ist das Setting bewusst *ungünstig* — und
genau das ist der Punkt.** Bier ist ein rivalisierendes Gut: jeder verkaufte Hektoliter
ist einem anderen weggetrunken. Das Setting flüstert Game-A-Logik. Ein Setting mit
eingebauter Allmende (Energiegenossenschaft, Wissens-Commons) würde Kooperation leicht
machen — und damit die Pointe wegdesignen. Wenn Kooperation sich auf *feindlichem* Boden
behauptet, gegen ein Produkt, dessen Natur Verdrängung nahelegt, ist das der härtere und
überzeugendere Beweis. Das ist im Geist des Fuller-Axioms: nicht eine geschützte Nische
bauen, in der Teilen leicht ist, sondern sich im selben Spielfeld wie die rivalisierende
Logik behaupten.

**Die Verpflichtung, die daraus folgt:** Damit dieser Beweis zählt, muss der Game-A-Pfad
*wirklich stark* sein — Verdrängung, Aufkauf des Nachbarn, Preiskampf müssen verlockend
funktionieren und ein gangbarer Weg zum Sieg sein. Wird der rivalisierende Pfad geschwächt,
damit Kooperation glänzt, entsteht wieder Predigt statt Beweis. Das ungünstige Setting
*verpflichtet* zu einem harten, ehrlichen Game-A-Kern. Schöner Nebeneffekt: Das ist genau
der Kern, der ohnehin zuerst gebaut wird. Der harte Game-A-Kern ist nicht Vorstufe zum
Game-B-Experiment — er ist die Bedingung dafür, dass es etwas aussagt.

> Offene Frage an den Designer (nicht jetzt zu entscheiden): Falls sich beim Bauen zeigt,
> dass Bier die Kooperations-Achse zu stark erstickt, bleibt der Wechsel zu einem
> Allmende-näheren Setting eine Option. Bewusst offengehalten.

---

## 0b. Plattform, Zielgruppe & Bau-Reihenfolge

**Ziel: Verbreitung.** Das Spiel soll geteilt und von vielen beiläufig angetippt werden —
nicht primär ein tiefes Nischen-Tüftelspiel für wenige. Diese Entscheidung prägt alles
Weitere: Zuschnitt, Plattform, Reihenfolge.

**Konsequenz: Mobile-first.** Reichweite entscheidet sich in den ersten 30 Sekunden auf
einem Handy. Darum:
- Eine Entscheidung pro Bildschirm, dicke antippbare Flächen statt feiner Regler.
- Der Kern wird radikal vereinfacht: möglichst *eine* zentrale Spannung
  (zu schnell wachsen → Fixkostenfalle), nicht die volle Sorten-/Preis-/F&E-Matrix.
- In zwei Minuten verständlich, ohne Anleitung.

**Die Kooperations-Pointe rückt nach vorne.** Für eine *These* (Monopol vs. Kooperation,
§7b) ist ein schlankes, verbreitbares Spiel das bessere Vehikel als eine tiefe Sim. Wenn
etwas gesagt werden soll, braucht es Reichweite, nicht Tiefe. Die teilbare Aussage gehört
deshalb näher an den Anfang als in eine späte Ausbaustufe.

**Bau-Reihenfolge: schlank-mobil zuerst, Tiefe später obendrauf.** Erweitern (Schichten
auf einen funktionierenden Kern legen) ist ungleich leichter als Vereinfachen (aus einem
verwobenen tiefen System Dinge herausreissen, ohne dass anderes bricht). Außerdem bricht
ein Desktop-Layout auf dem Handy, während ein Mobil-Layout auf dem Desktop höchstens leer
wirkt. Daher:
1. **Schlanke Mobilversion** mit der einen Spannung + Kooperations-Pointe. Klein genug,
   um wirklich fertig zu werden und zu verbreiten. (Das IST der „nackte Kern" aus dem
   Anhang — jetzt zusätzlich mobile-first.)
2. **Desktop-Tiefe später** als Erweiterung obendrauf: Sorten, Preise, F&E, das volle
   Investitions-Menü (§4–§7). Ersetzt die Mobilversion nicht, sondern baut an.

> Hinweis: Das tiefe Design in §4–§7 bleibt gültig — aber als *Ausbaustufe*, nicht als
> erster Wurf. Der erste Wurf ist bewusst kleiner, als dieses Dokument sonst klingt.

---

## 1. Leitprinzipien

Diese vier Sätze sind der Maßstab für jede künftige Mechanik. Bevor etwas eingebaut
wird, muss es an ihnen gemessen werden.

1. **Entscheidungen statt Würfel.** Spannung entsteht aus Knappheit und Timing, nicht
   aus Zufallsereignissen. Der Spieler verliert nie durch Pech, sondern durch eine
   Fehlkalkulation, die er im Rückblick nachvollziehen kann.

2. **Zufall ist Würze, nie Motor.** Es darf Streuung geben — im *Ausmaß* eines
   Ergebnisses, nie im *Ob* einer Existenzfrage. Eine gute Sorte kann etwas besser oder
   schlechter geraten; eine Investition kann sich etwas schneller oder langsamer
   amortisieren. Aber kein Würfel entscheidet über Pleite oder Erfolg.

3. **Jeder Franken nur einmal.** Der Kern des Spiels ist die konkurrierende Investition:
   Tank *oder* Personal *oder* Schuldentilgung *oder* F&E. Das bleibt interessant, auch
   wenn der Spieler die Absatzzahlen genau kennt, weil die Frage nie „wie viel produziere
   ich" ist, sondern „worin investiere ich als Nächstes".

4. **Wachstum ist eine Wette, kein Automatismus.** Kapazität, die leer steht, ruiniert
   durch Fixkosten. Expandieren heißt, auf zukünftige Nachfrage zu setzen, die man durch
   Ruf und Präsenz selbst mitschafft. Zu schnelles Wachstum ist die häufigste
   Niederlage-Ursache — und das ist Absicht.

---

## 2. Der Kern-Loop

Jede Runde = ein Quartal. Vier Quartale = ein Jahr. Saison beeinflusst Nachfrage.

Pro Quartal trifft der Spieler in dieser Reihenfolge Entscheidungen:

1. **Investieren** — freies Budget auf konkurrierende Posten verteilen (Ausbau, Personal,
   Upgrades, F&E, Schuldentilgung). Das ist das Herz.
2. **Produzieren** — innerhalb der vorhandenen Kapazität die Sorten und Mengen festlegen.
3. **Bepreisen** — Preis pro Sorte (Marge gegen Absatz).
4. **Abrechnen** — Nachfrage trifft auf Angebot, Fixkosten und Schulden werden fällig,
   Bilanz wird sichtbar.

Optional pro Quartal, falls vorhanden: eine **Gelegenheit** (siehe §6) annehmen oder
ablehnen. Keine erzwungenen Schicksalsevents.

### Siegbedingung
Über eine feste Zahl Jahre (Vorschlag: 6–8) profitabel wachsen. Endbewertung nach
Eigenkapital, Kapazitätsauslastung und Ruf.

### Niederlage
Zahlungsunfähigkeit: Bargeld unter einer Schwelle, ohne Kreditwürdigkeit, um sie zu
decken. Fast immer Folge von Überexpansion (Fixkosten > Deckungsbeitrag) — nie von Pech.

---

## 3. Ressourcen

| Ressource          | Rolle                                                                 |
|--------------------|-----------------------------------------------------------------------|
| **Bargeld**        | Knappste Ressource. Treibstoff für alle Investitionen. Kann negativ kippen → Pleite. |
| **Kapazität (hl)** | Obergrenze der Produktion pro Quartal. Wird durch Ausbau erhöht. Leere Kapazität kostet trotzdem Fixkosten. |
| **Auslastung**     | Verhältnis Produktion zu Kapazität. Niedrige Auslastung = Fixkosten fressen die Marge. Die zentrale Spannungs-Kennzahl. |
| **Ruf**            | Treibt die Grund-Nachfrage und ihr Wachstum. Steigt durch Qualität, Präsenz, faire Preise; sinkt durch Überproduktion, Wucher, Lieferversagen. |
| **Marktgröße**     | Die absorbierbare Gesamtnachfrage. Wächst langsam mit Ruf und Präsenz. Macht Expansion zur selbsterfüllenden Wette — aber nur, wenn man sie nährt. |
| **Schulden**       | Hebel und Risiko. Ermöglichen schnelleres Wachstum gegen Zinslast. Aktiv tilgbar. |

---

## 4. Investitions-Systeme (der Kern)

Alle Ausbauten teilen dasselbe Muster: **einmalige Anschaffung + dauerhafte Fixkosten +
Wirkung, die sich erst bei Auslastung rechnet.** Das ist der Hebel hinter Prinzip 4.

### 4.1 Kapazität (Gebäude/Anlagen)
Gestufter Ausbaupfad. Jede Stufe: hohe Anschaffung, spürbare laufende Fixkosten, mehr hl.

- Garagen-Anlage (Start) → Gärtank-Erweiterung → Abfüllstraße → zweite Halle → …
- Faustregel fürs Balancing: Eine neue Stufe muss **mindestens 2–3 Quartale gut
  ausgelastet** laufen, bevor sie sich amortisiert. Wer leer ausbaut, blutet.

### 4.2 Personal
Feste Anstellungen statt Zufallsevent. Jede Rolle: Quartalslohn + konkreter, dauerhafter
Effekt.

- **Braumeister** — hebt Qualität (Nachfrage- und Ruf-Faktor).
- **Verkäufer** — erschließt Marktgröße schneller / öffnet Vertragskanäle.
- **Aushilfen** — senken Stückkosten bei hoher Auslastung (Skaleneffekt).

Personal lohnt sich nur bei Auslastung — derselbe Knappheits-Hebel wie bei Kapazität.

### 4.3 Effizienz-Upgrades
Investitionen, die **nicht** Kapazität bringen, sondern Kosten senken oder Qualität
heben. Das schafft die Wahl „größer vs. besser".

- Energie-Rückgewinnung (senkt Fixkosten je hl)
- Eigene Mälzerei (senkt Braukosten, hohe Anschaffung)
- Laborausstattung (verbessert F&E-Ergebnisse, siehe §5)

### 4.4 Schulden-Management
Kredit aufnehmen ist eine *aktive* Investitionsentscheidung, kein Event. Aktiv tilgbar.
Zins als laufende Last. Hebel für Spieler, die schneller wachsen wollen — mit dem Risiko,
dass die Zinslast bei schwacher Auslastung zur Falle wird.

---

## 5. F&E statt Roulette (der Endorphin-Faktor, gezähmt)

Das frühere Rezept-Roulette war reines Glücksspiel — ein Fremdkörper. Es wird zu einer
**mehrquartaligen Investition** umgebaut, die das Sammeln und das „Neu freigeschaltet!"-
Hochgefühl behält, aber verdient statt erwürfelt ist.

- Der Spieler startet ein **Entwicklungsprojekt** und wählt die **Richtung**
  (z. B. margenstark / saisonal / Kult-Potenzial).
- Es kostet Kapital **und Zeit** (mehrere Quartale) und konkurriert dadurch mit Tank,
  Personal, Tilgung um knappes Geld.
- Am Ende wird eine neue Sorte **freigeschaltet** — das Sammel-Element bleibt.
- **Das einzige verbliebene Glück:** eine kleine Streuung in der *Qualität* des
  Ergebnisses (gut / sehr gut), nie im *Ob*. Mit Laborausstattung (§4.3) wird die
  Streuung enger und das Ergebnis besser — Investition verbessert Glück.

So bleibt der Funke erhalten, ohne Prinzip 1 und 2 zu verletzen.

---

## 6. Events → Gelegenheiten (Würze statt Motor)

Events werden vom Treibstoff zur Resonanz entmachtet. Regeln:

- **Keine erzwungenen Schicksalsschläge.** Gestrichen: „Maschine kaputt, zahl oder leide".
- **Gelegenheiten statt Zufall.** Stattdessen: „Ein Lokal bietet einen Liefervertrag —
  *wenn* du die Kapazität hast." Das Event **testet** frühere Aufbau-Entscheidungen,
  überschreibt sie nicht. Wer expandiert hat, kann zugreifen; wer knapp kalkulierte,
  schaut zu. So werden vergangene Entscheidungen rückwirkend bedeutsam.
- **Planbar, nicht überfallartig.** Schwankungen (Saison, Konjunktur) kündigen sich an.
  Der Spieler weiß, *dass* etwas kommt, nur nicht die exakte Höhe — kalkuliertes Risiko
  statt Würfel ins Gesicht.
- **Selten und optional.** Höchstens gelegentlich, immer annehmbar oder ablehnbar, nie
  existenzbedrohend allein durch ihren Ausgang.

---

## 7. Nachfrage-Modell

Damit das Spiel *nicht* trivial ausrechenbar wird (das Problem der jetzigen Version),
darf Nachfrage **nicht** eine fixe Zahl sein, gegen die man nur die Produktion optimiert.
Stattdessen:

- Es gibt eine **Marktgröße**, die langsam wächst — getrieben von Ruf, Präsenz,
  Vertragskanälen. Der Spieler *schafft* seinen Markt mit.
- Nachfrage pro Sorte = Funktion aus Marktgröße × Saison × Ruf × Preis-Elastizität ×
  Sorten-Eigenschaften. Prognostizierbar in der *Tendenz*, aber die strategische Frage
  bleibt „investiere ich jetzt in Kapazität für einen Markt, der erst entsteht?"
- Die Spannung verlagert sich von „wie viel produziere ich" (lösbar) zu „wie schnell
  baue ich aus, relativ zu einem Markt, den ich selbst wachsen lasse" (echte Wette).

---

## 7b. Spätere Achse: Kooperation (geparkt — NICHT im ersten Aufbau)

> Status: **Idee, bewusst zurückgestellt.** Kommt frühestens, wenn der Game-A-Kern
> (Knappheit, Fixkosten, Investition) wirklich trägt und durchgespielt ist. Hier nur
> dokumentiert, damit sie nicht verloren geht und den Kern nicht überwuchert.

### Der Gedanke
Eine zusätzliche strategische Achse neben dem rivalisierenden Wirtschaften: Statt einen
schwächelnden Nachbarn (KI) aufzukaufen, könnte man **Infrastruktur teilen** — beide
senken Fixkosten, ohne zu fusionieren. Hintergrund ist ein Interesse an „Game B" /
Kooperations-Ökonomie: die These, dass High-Trust-Netzwerke geringere Kontrollkosten
haben und dadurch wirtschaftlich überlegen sein *können*.

### Das eiserne Designgesetz für diese Achse
Damit es ein Spiel bleibt und keine Predigt wird:

> **Kooperation muss möglich, lohnend und verletzlich sein — nie garantiert.**

Konkret heißt das, gegen die Versuchung, Kooperation „gewinnen zu lassen":

- **Keine Gewinnknopf-Mechanik.** Kooperation darf NICHT mathematisch immer siegen. Wenn
  eine Strategie immer gewinnt, ist das Spiel kaputt (vgl. Leitprinzip in §9: keine Option
  darf dominieren). Eine vorbestimmte Lektion ist kein Spiel.
- **Defektion muss echt verlocken.** Der kurzfristige Vorteil von Ausbeutung/Aufkauf muss
  spürbar sein, sonst gibt es keine Spannung. Die Einsicht „Vertrauen trägt" ist nur etwas
  wert, wenn der Spieler sie *gegen* eine reale Versuchung errungen hat.
- **Kooperation kostet und kann scheitern.** Geteilte Infrastruktur bindet an einen Partner,
  dessen Pleite oder Defektion einen mitreißen kann. Das ist der Preis, der die Wette echt
  macht.
- **Das Spiel als Prüfstand, nicht als Beweis.** Offen lassen, ob Kooperation sich durchsetzt.
  Wenn sie nur gewinnt, weil ein Multiplikator es so erzwingt, ist nichts gezeigt. Wenn sie
  gewinnt, obwohl Defektion verlockend bleibt, hat man etwas in der Hand. Diese Offenheit
  ist Absicht — sie spiegelt die ehrliche, unentschiedene Frage, ob das Modell trägt.

### Erster ehrlicher Andockpunkt
**Shared Infrastructure** als *eine* Option mit Vorteil UND Preis: zwei Akteure teilen z. B.
die Abfüllstraße, beide senken Fixkosten, beide binden sich aneinander. Dockt direkt an die
Fixkosten-Falle (§4) an. Kein neues Metriken-System nötig, keine zweite Spielebene — nur
eine zusätzliche Entscheidung im bestehenden Investitions-Loop.

### Wann andere Brauereien / Konkurrenz ins Spiel kommen
Bewusste Staffelung: **Der Kern braucht KEINE Konkurrenz.** Die Spannung kommt aus Knappheit
gegen sich selbst, die Fixkosten und die Zeit — wie in vielen guten Aufbausims, deren Gegner
das System ist, nicht ein Rivale. Das hält den Kern schlank und leicht balancierbar.

Andere Akteure kommen **genau dann und nur dann**, wenn die Kooperations-Achse kommt — denn
sie sind deren Voraussetzung. Ohne ein Gegenüber gibt es kein Aufkaufen-vs-Teilen, kein
Gefangenendilemma, kein ehrliches Game-B-Experiment. Die Nachbar-Brauerei taucht also nicht
als generischer „KI-Gegner" auf, sondern als **Entscheidungspartner**: jemand in der
Fixkosten-Falle, den man aufkaufen (Game A) oder mit dem man Infrastruktur teilen kann
(Game B). Sie braucht womöglich nicht einmal ausgefeilte KI — halb-skriptete Situationen,
die die Haltung des Spielers testen, könnten reichen. So bleibt Konkurrenz an die eine
Mechanik gekoppelt, für die sie nötig ist, statt überall verstreut zu sein.

### Der Endzustand — das eigentliche Herz des Spiels
Der reine Game-A-Pfad führt zum **Monopol**: alle aufkaufen, Existenzen verdrängen, Preis
und Qualität diktieren. Das **muss ein gewinnbarer Sieg bleiben** — sonst ist die Versuchung
nicht echt, und ohne echte Versuchung kein Beweis. Aber der Sieg soll mechanisch (nicht
moralisch, kein Zeigefinger) einen Beigeschmack tragen:

- Das Monopol macht **fragiler**, nicht stärker: keine Partner mehr, die Schocks abfedern.
- Verdrängte Konkurrenz schrumpft die **Marktgröße** (weniger Brauereien = weniger regionale
  Bierkultur = kleinerer Gesamtmarkt). Der Monopolist diktiert Preise an einen Markt, der
  unter ihm wegerodiert. Das ist keine Strafe, sondern die systemische These von Game B,
  *mechanisch gezeigt statt gepredigt*: Extraktion frisst die eigene Grundlage.

Die Alternative ist nicht „sei nett", sondern: Ein Netz eigenständiger Partner ist
**resilienter** und lässt den Gesamtmarkt **wachsen** — langfristig tragfähiger als
Herrschaft über einen schrumpfenden Markt. Beide Wege gewinnbar: Der Monopolist gewinnt
schnell und steht dann allein auf brüchigem Grund; der Kooperateur wächst langsamer, aber
auf tragendem. Welcher „besser" ist, hängt davon ab, was der Spieler unter Sieg versteht.
**Diese Frage zurückzugeben — statt sie zu beantworten — ist der Kern des Spiels.** Es ist
ein Denkwerkzeug für eine offene Frage, nicht der Beweis einer fertigen Antwort.

### Was NICHT übernommen wird (aus dem Brainstorm verworfen)
- Eine parallele „Vertrauens-Währung", die das ganze Modell überlagert — zu viel zweite Ebene
  für ein Spiel, dessen Kern noch nicht steht.
- Garantierte Überlegenheit kooperativer Akteure gegenüber KI — verletzt das Designgesetz oben.
- „Mission"-Rahmung des Projekts — es bleibt ein Spiel, das eine offene Frage durchspielt,
  keine These, die es zu beweisen gilt.

---

## 8. Was bewusst NICHT ins Spiel kommt (vorerst)

Um Fokus zu halten — diese Dinge sind reizvoll, aber nicht im ersten Aufbau:

- Echtzeit-Multiplayer (bräuchte Server).
- Detaillierte Brau-Mini-Spiele (lenkt vom Wirtschafts-Kern ab).
- Zufalls-Events als Hauptmechanik (siehe Prinzip 1 & 2).
- Mehr als ein Standort, bis der Ein-Standort-Loop wirklich trägt.

---

## 9. Offene Balancing-Fragen (durch Spielen zu beantworten)

Diese Werte lassen sich nicht am Schreibtisch festlegen — nur durch Spielen. Sie gehören
in `balance` (§Schema) an *einen* Ort, damit man an einer Stelle dreht.

- Wie lang muss eine Ausbaustufe ausgelastet laufen, bis sie sich amortisiert?
  (Ziel: 2–3 Quartale — fühlt sich das wie eine echte Wette an?)
- Ist eine Investitionsstrategie immer optimal? Falls ja, ist sie unterbalanciert.
  Keine Option darf dominieren.
- Wächst die Marktgröße so, dass Expansion sich lohnt, aber Überexpansion bestraft wird?
- Killt die Zinslast bei Vollverschuldung das Spiel zu hart oder zu lasch?

> **Test für jede neue Mechanik:** Erst spielbar machen und mehrere Durchläufe spielen,
> bevor die nächste Mechanik dazukommt. Eine Mechanik ist erst dann gut austariert, wenn
> keine Einstellung offensichtlich gewinnt. (Dasselbe Prinzip wie „erst nutzen, dann
> erweitern".)

---

## Anhang: Projektstruktur-Empfehlung für Claude Code

Trennung von Daten, Logik und Darstellung — damit Balancing an einem Ort passiert und
Systeme sich nicht gegenseitig kaputt-balancieren.

```
stadtbraeu/
├── GAME_DESIGN.md          # dieses Dokument — Quelle der Wahrheit
├── BACKLOG.md              # Feature-Ideen, eine nach der anderen
├── balance.json            # ALLE Zahlen an einem Ort (siehe Schema)
├── src/
│   ├── engine/             # Spiellogik, kennt keine Zahlen direkt
│   │   ├── economy.js      # Abrechnung: Nachfrage, Kosten, Bilanz
│   │   ├── market.js       # Marktgröße & Wachstum
│   │   └── progression.js  # Sieg/Niederlage, Jahre, Saisons
│   ├── data/               # reine Daten, aus balance.json gespeist
│   │   ├── buildings.js    # Ausbaustufen
│   │   ├── staff.js        # Personalrollen
│   │   ├── upgrades.js     # Effizienz-Upgrades
│   │   └── recipes.js      # Basissorten + F&E-Ergebnisse
│   └── ui/                 # Darstellung, ruft engine auf
└── index.html
```

Leitsatz, der bei Spaarli und den Lectios schon trägt: **Entscheidungen in Dateien
dokumentieren, nicht im Kopf behalten.** `GAME_DESIGN.md` ist das Gedächtnis des Projekts.
