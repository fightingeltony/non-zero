# CLAUDE.md — Arbeitskontext für dieses Projekt

> Kurz-Einweisung für Claude Code. Was das Projekt ist, wie es gebaut wird, welche Regeln
> gelten — damit nicht jede Session bei null beginnt. Ausführliche Vision: `GAME_DESIGN.md`.
> Bei Konflikten gewinnt `GAME_DESIGN.md`.

## Was das ist

Browser-Wirtschaftsspiel um eine Mikrobrauerei, Arbeitstitel **non-zero**. Kern: knappes
Kapital, konkurrierende Investitionen, Fixkosten, die bei zu schnellem Wachstum zur Falle
werden. Langfristiges Thema (geparkt, §7b im Design): Monopol vs. Kooperation als zwei
gewinnbare, aber unterschiedlich tragfähige Wege.

**Stand:** Deployt auf Vercel. Spielbar. Eine `index.html` (HTML + CSS + JS in einer Datei),
mobile-first. Speichern via localStorage, kein Login/Server.

## Aktuelle Struktur (Realität, nicht die Anhang-Empfehlung)

Das Spiel ist derzeit bewusst EINE Datei — passt zur schlanken, verbreitbaren Mobilversion.
Die getrennte `engine/data/ui`-Struktur aus dem Design-Anhang ist ein *späteres* Ziel, falls
das Projekt wächst, nicht jetzt.

- `index.html` — das ganze Spiel. Enthält oben im `<script>` ein `const B = {...}` mit ALLEN
  Spielwerten. **Das ist das Balancing-Sheet.** Wer am Schwierigkeitsgrad dreht, ändert nur
  `B`, nie die Spiellogik.
- `GAME_DESIGN.md` — Vision, Prinzipien, Kooperations-Achse, offene Fragen. Quelle der Wahrheit.
- `BACKLOG.md` — Beobachtungen & Aufgaben, eine nach der anderen.
- `balance.json` — frühes Schema; die *gelebten* Werte stehen inzwischen in `B` in index.html.
  Bei Bedarf konsolidieren (siehe BACKLOG).

> Hinweis: `stadtbraeu.html` / `stadtbraeu2.html` sind ältere Prototypen. `index.html` ist
> die aktuelle Version.

## Leitplanken (aus GAME_DESIGN.md)

- **Mobile-first.** Eine Entscheidung pro Bildschirm, dicke antippbare Flächen. Reichweite
  vor Tiefe.
- **Entscheidungen statt Würfel.** Spannung aus Knappheit und Timing, nie aus Zufall. Der
  Spieler verliert durch Fehlkalkulation, nie durch Pech.
- **Jeder Franken nur einmal.** Jede Investition muss mit anderen konkurrieren. Eine Option,
  die offensichtlich immer richtig ist, ist ein Balancing-FEHLER (siehe BACKLOG #1).
- **Keine Option darf dominieren.** Eine Mechanik ist erst gut austariert, wenn keine
  Einstellung offensichtlich gewinnt.
- **Erst nutzen, dann erweitern.** Schlanken Kern fertigstellen und spielen, bevor die
  nächste Mechanik dazukommt. Neue Ideen → BACKLOG.md, nicht sofort in Code.

## Arbeitsweise

- **Schritt für Schritt, Plan vor Code.** Erst besprechen, was geändert wird, dann umsetzen.
- **Entscheidungen in Dateien, nicht im Kopf.** Balancing-Erkenntnisse → BACKLOG.md.
  Design-Entscheidungen → GAME_DESIGN.md.
- **Balancing passiert in Daten (`B`), nicht in Logik.**
- **Nach Balancing-Änderungen: mehrere Durchläufe spielen**, bevor die nächste Änderung kommt.

## Wo nachschauen

- Vision, Prinzipien, Kooperations-Achse, offene Fragen → `GAME_DESIGN.md`
- Was als Nächstes ansteht → `BACKLOG.md`
- Konkrete Spielwerte → `const B` in `index.html`
