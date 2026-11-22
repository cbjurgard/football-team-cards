# Football Team Cards för Home Assistant

Dashboardkort för att följa ett fotbollslag: nästa match med liveresultat, startelvor, matcher, tabell och trupp. Välj liga och lag i den visuella redigeraren, så sköter korten resten. Inga API-nycklar och inga integrationer behövs.

## Korten

| Kort | Visar |
|---|---|
| `custom:team-next-card` | Nästa match i alla turneringar: loggor, nedräkning, liveresultat och matchklocka, målskyttar och kort, matchstatistik, arena, svensk tv-kanal, väder vid arenan, form och inbördes möten |
| `custom:team-lineup-card` | Startelvor, avbytare och tränare (ungefär en timme före avspark), plus domare i Premier League |
| `custom:team-fixtures-card` | Kommande matcher och senaste resultat, märkta med turnering |
| `custom:team-table-card` | Ligatabell med ditt lag markerat, Europacup- och nedflyttningsplatser utmärkta |
| `custom:team-squad-card` | Truppen per position, tränare, skytte- och assistliga; Premier League-lag får spelarbilder och en ruta med säsongsstatistik per spelare |

## Ligor

Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, Primeira Liga, skotska Premiership, Allsvenskan, Eliteserien, Superligaen och MLS. Inhemska cuper (där ESPN har dem) och de tre Europacuperna kommer med automatiskt.

Premier League-lag får extra data från Premier Leagues egen sajt: domare, spelarbilder, spelarstatistik och rätt tränare. Övriga ligor använder ESPN för allt.

## Installation

**Via Marketplace (HA 2026.11+) eller HACS:** **Inställningar → Marketplace → ⋮ → Lägg till från länk**, klistra in repots adress och välj typen **Dashboard**. Installera "Football Team Cards". Resursen registreras automatiskt.

**Manuellt:** kopiera `football-team-cards.js` till `config/www/` och lägg till den under **Inställningar → Instrumentpaneler → ⋮ → Resurser** som `/local/football-team-cards.js`, typ JavaScript-modul.

Uppdatera webbläsaren (eller nollställ frontend-cachen i appen) efter installation eller uppdatering.

## Användning

Redigera en dashboard, **Lägg till kort**, sök på "Football Team", välj ett kort och välj liga och lag i redigeraren. Eller i YAML:

```yaml
type: custom:team-next-card
team: Malmö FF
league: swe.1
```

Färdiga sidor finns i `examples/`: `any-team.yaml` för valfritt lag, och `newcastle.sv.yaml` / `newcastle.en.yaml` för en komplett Newcastle-sida med nyheter och säsongsfacit.

## Inställningar

Alla kort:

| Inställning | Standard | |
|---|---|---|
| `team` | `Newcastle United` | Lagnamn som ESPN skriver det; redigeraren listar lagen i ligan |
| `league` | `eng.1` | `eng.1`, `esp.1`, `ita.1`, `ger.1`, `fra.1`, `ned.1`, `por.1`, `sco.1`, `swe.1`, `nor.1`, `den.1`, `usa.1` |
| `team_id` | (slås upp) | ESPN:s lag-id, om du vill hoppa över namnsökningen |
| `language` | `auto` | `auto` (följer HA-språket), `sv` eller `en` |
| `tv` | `se` | `se` visar svensk sändare, `none` döljer den |
| `title` | (standard) | Kortets rubrik; `''` döljer den |
| `competitions` | (per liga) | Lista med ESPN:s turneringskoder |
| `refresh_minutes` | varierar | Hur ofta data hämtas |
| `tap_action` | – | `{action: navigate, navigation_path: /min-sida}` gör hela kortet till en länk |

Per kort: `weather` (nästa match, standard `true`), `upcoming` och `results` (matcher, standard 8 och 3), `show_photos` (truppen, standard `true`), `zones` (tabellen, t.ex. `[4, 3]` för 4 Europacup- och 3 nedflyttningsplatser), `pl_team_id` (Premier Leagues eget id, slås upp automatiskt).

## Uppgradera från NUFC Cards v1

De gamla namnen `custom:nufc-*-card` fungerar fortfarande, med Newcastle United som standardlag. Byt `nufc-` mot `team-` i din dashboard för att få den visuella redigeraren.

## Bra att veta

- Data kommer från ESPN:s publika API, Premier Leagues API och Open-Meteo, och hämtas av din webbläsare eller app. API:erna är inofficiella och kan ändras.
- Den svenska tv-kanalen bygger på vem som har rättigheterna säsongen 2026/27 (Premier League: Viaplay/Prime Video, Champions League: Viaplay, Europa och Conference League: Disney+, La Liga: Disney+, Serie A och Allsvenskan: TV4 Play). Det är ingen tv-tablå per match.
- Avsparkstider visas i svensk tid (`Europe/Stockholm`); ändra `NUFC_TZ` överst i filen för en annan tidszon.
- Inte knutet till någon klubb, liga eller tv-bolag.
