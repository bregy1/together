# Abgleich Brand Guide v1.0 mit der Spezifikation

Für die Besprechung Bregy und Romi · Stand 9. November 2026

Romis «Yaruno Brand Guide v1.0» ist in die Spezifikation übernommen: alles Visuelle (Wortmarke, Palette «Gletscher», Archivo, Bildsprache, UI-Bausteine, Tonalität) steht jetzt in `spec/design/direction.md` und `spec/design/tokens.md`, das PDF selbst in `spec/design/brand/`. Wo der Guide von bereits entschiedenem Verhalten abweicht, hat Bregy am 9. November entschieden. Dieses Dokument fasst die Entscheide und die Gründe zusammen und listet, was im Guide und in den Screens noch angepasst werden muss.

## Übernommen, wie es ist

- Name **Yaruno**, Schreibweise, Claim «Less scrolling. More living.» und die weiteren Botschaften
- Wortmarke, Kurzzeichen, App-Icon, Schutzzone, Don'ts
- Palette «Gletscher» mit allen Werten und den fünf Farbregeln; Tageslicht-Variante
- Archivo als einzige Schrift, Fraunces nur in der Wortmarke, Grössen-Skala
- Bildsprache inklusive Platzhalter-Regel
- UI-Bausteine (Buttons, Chips, Tags, Felder, Karten, Raster, Icons)
- Tonalität: immer Du, Schweizer Schreibweise, Microcopy («Plan erstellen», «Doch nicht», «Nichts dabei? Mach den ersten Schritt.» …)
- Store-Kategorie **Lifestyle**, Altersfreigabe 18+, Store-Grafiken
- Feed als **Kartenliste** (statt Reels-artiger Vollbild-Karten)
- **Drei Tabs**: Entdecken · Meine Pläne · Profil
- **Erinnerung** am Vortag («Morgen 05:30, Lea rechnet mit dir.») – neu in der App, standardmässig an, in den Einstellungen abschaltbar
- **Absagefenster 24 Stunden**: Absagen bis 24 h vor Beginn zählen nicht (vorher galten 48 h)
- Der Button heisst **«Bin dabei»** – er schickt aber eine Anfrage; die Gastgeberin oder der Gastgeber nimmt an oder lehnt ab, bis dahin steht «angefragt»

## Entscheide gegen den Guide – mit Begründung

| Thema | Guide | Entscheid | Warum |
|---|---|---|---|
| Depot / Geld | CHF 5–10 Depot gegen No-Shows; später Depot pro Treffen als Erlösmodell | **Kein Geld, nirgends.** Yaruno bleibt gratis, freiwillige Unterstützung («buy us a coffee») ist die einzige Einnahme. | Bregy: «Ich gehe definitiv ohne Geld.» Geld bringt Komplexität (Zahlungsanbieter, Rückerstattungen, Store-Regeln, Streitfälle) und macht alles schwerer. Verbindlichkeit läuft über die Verlässlichkeit, nicht über Geld. |
| Ausweis für Gastgeber | Ausweis-Check für alle, die Pläne erstellen | **Alle dürfen Pläne erstellen**, Telefon-Verifizierung reicht. Ausweis-Check ist als spätere Idee notiert. | Am Anfang eine grosse Hürde; kostet pro Prüfung Geld und heikle Daten. Missbrauch fangen Meldungen und Moderation auf. |
| Vertrauensstufen mit Rechten | Neu → Verlässlich → Stammgast, Rechte wachsen mit Treffen | **Keine Stufen mit Rechten.** | Ein Stufenmodell hat ein Startproblem (Neue dürfen nichts) und widerspricht «alle dürfen hosten». |
| Anzeige der Verlässlichkeit | «Verlässlich 100 %», «Noch 5 Treffen bis Stammgast», Zähler, Stammgast-Abzeichen | **Ein farbiger Balken ohne Zahl** mit vier festen Stufen: grau = neu, Mint = normal, Senf = gesunken, Koralle = tief; die Füllung variiert leicht, damit es lebendig wirkt; ein Info-Zeichen erklärt, wie der Balken entsteht. Keine Prozente, kein «noch X bis Stammgast», keine Zähler, keine Abzeichen. | Bregy: wenig Worte, KISS. Die Verlässlichkeit soll kein Punktesystem sein, für das man arbeitet; wer normal erscheint und sich anständig verhält, ist automatisch «normal». Sie soll vor allem wiederholtes schlechtes Verhalten sichtbar machen. |
| Gegenseitige Bewertung | Alle bewerten alle, blind, 48 h: «War da? Wieder treffen? Alles okay?» | **Nach dem Treffen wird nur bestätigt, wer da war.** | Bewertungen sollen «wirklich einfach und klein» bleiben. Wer sich daneben benimmt, wird gemeldet; die Meldung wird geprüft. |
| Sofortige Sperre | Dating-Absichten, Handel, Belästigung: sofort gesperrt | **Zuerst prüft die Moderation, dann wird entschieden**; die betroffene Person kann widersprechen. | Meldungen wirken erst, wenn sie geprüft sind – sonst kann jemand mit einer falschen Meldung andere sperren lassen. |
| Profil | Wohnort («Visp») und «dabei seit Okt 2026» sichtbar | **Beides wird nicht angezeigt.** | Die Region dient nur dem Feed; das Profil bleibt bewusst knapp. |
| Spielregel 1 | «Kein Flirten.» | **«Keine Dating-App.»** | Einvernehmliches Flirten ist okay – Yaruno ist nur keine Dating-Plattform. Die anderen fünf Regeln bleiben. |
| Dunkel als Standard | «Nacht als Standard, nicht als Option» | **Die App folgt der Einstellung des Handys** (dunkel oder hell). | Respektiert die Einstellung der Leute; dunkle Screens sind in der Sonne schlecht lesbar. |
| Plan-Screen | Treffpunkt «Talstation Blatten-Belalp, beim Kiosk» vor der Zusage sichtbar | **Vor der Annahme nur die grobe Region**; Ort und Treffpunkt erst nach der Annahme – das ist eine feste Datenschutz-Regel. | Sonst kann jeder dort auftauchen. |

## Was Romi im Guide / in den Screens anpassen müsste

- Seite 12: Button «Bin dabei · Depot CHF 5» → «Bin dabei»; kein Depot im Plan-Screen; Treffpunkt erst nach Annahme, vorher nur Region; Profil ohne «Visp · dabei seit …», ohne Prozent, ohne «Noch 5 Treffen bis Stammgast»
- Seite 13: Microcopy-Zeilen «Depot» und «Bewertung» streichen; Spielregel «Kein Flirten.» → «Keine Dating-App.»
- Seite 14: Produktprinzipien Depot, Ausweis für Gastgeber, gegenseitige Bewertung, Vertrauensstufen und Erlösmodell an die Entscheide anpassen; Absagen bis 24 h vorher bleibt
- Seite 15: Store-Screenshot «Depot statt Ghosting.» ersetzen; Stoffabzeichen «Stammgast» überdenken
- Freunde: kein eigener Tab, sie leben in «Meine Pläne»

## Kontrast – zwei Stellen fallen durch

Alle Kontrastwerte im Guide stimmen (nachgerechnet). Zwei Bauteile erreichen aber die 3 : 1 für Bedienelemente (WCAG 2.2, 1.4.11) nicht:

- Rand der Eingabefelder: Linie #2A3733 auf Nacht = **1.5 : 1** – das Feld ist nur am Rand erkennbar
- Schalter «an»: Mint-Knopf auf Eis-Schiene = **1.1 : 1**

## Noch offen – für Romi

- Farben für Eingabefelder und Linien in der Tageslicht-Variante
- Schatten / Ebenen und Animationen (Dauer, Kurven) sind nicht definiert
- Dateien ins Repo: Wortmarke SVG (vier Varianten) und PNG, Kurzzeichen SVG, App-Icons 1024 px (Nacht, Mint), Schriften, Klick-Prototyp v1, Recherche-Dokument (Liste in `spec/design/brand/README.md`)

## Für später in der Spezifikation (Input aus dem Guide)

- Gruppengrösse: max. 6 Personen, Gastgeber bis 8; «Neue starten mit mindestens drei» – was genau gemeint ist, klären wir bei den Plänen (PLAN)
- Region-Chip mit Distanz im Feed («Brig · 10 km») und Filter-Chips «Für dich», «Heute», «Outdoor» – klären wir beim Feed (FEED)
- Landingpage mit E-Mail-Warteliste: braucht die Datenschutzerklärung
- Markenschutz «Yaruno» bei Swissreg (Klassen 9, 38, 42, 45, ca. CHF 550), Domain yaruno.ch oder yaruno.app, Instagram @yaruno sichern

## Nachtrag 9. November – aus der Spezifikation der Pläne (PLAN)

| Thema | Guide | Entscheid | Warum |
|---|---|---|---|
| Gruppengrösse | Maximal 6 Personen, Gastgeber bis 8; «Neue starten mit mindestens drei» | **Mindestens 2** (Gastgeber plus eine Person), **Standard 5**, frei einstellbar **bis 12** | Bregy: Wir wollen Freiheit geben und nicht einschränken. |
| Ort auf der Karte | «Standort nur ungefähr», «der Punkt auf der Karte» | Der Ort wird **auf einer Karte** gewählt (Suche oder Pin); vor der Annahme sehen andere nur die Region, keinen Pin | Bregy: Ohne Karte teilen die Leute sowieso Google-Maps-Links im Chat. Welcher Kartendienst, wird noch technisch entschieden (Datenschutz). |
| Aktivitäten | Kategorie-Tags («WANDERN», «FEIERABEND») | **Interessen = allgemeine Aktivitäten** (z. B. Outdoor, Sport), **Pläne = allgemein oder spezifisch** (z. B. Wandern unter Outdoor) | Interessen sollen nicht überwältigen; Pläne dürfen konkret sein. |
