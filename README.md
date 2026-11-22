# Football Team Cards for Home Assistant

Dashboard cards for following one football team: next match with live score, line-ups, fixtures, league table and squad. Pick your team and league in the visual editor and the cards do the rest. No API keys and no integrations needed.

A Swedish version of this guide is in `README.sv.md`.

## The cards

| Card | Shows |
|---|---|
| `custom:team-next-card` | Next match in any competition: logos, countdown, live score and clock, goal scorers and cards, match stats, venue, Swedish TV channel, weather at the ground, recent form and head-to-head |
| `custom:team-lineup-card` | Starting XIs, substitutes and managers (about an hour before kick-off), plus the referee for Premier League matches |
| `custom:team-fixtures-card` | Upcoming matches and latest results, each labelled with its competition |
| `custom:team-table-card` | League table with your team highlighted, European and relegation places marked |
| `custom:team-squad-card` | Squad by position, manager, top scorers and assists; Premier League squads get photos and a pop-up with each player's season stats |

## Leagues

Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, Primeira Liga, Scottish Premiership, Allsvenskan, Eliteserien, Superliga and MLS. Domestic cups (where ESPN has them) and the three UEFA club competitions are included automatically.

Premier League teams get extra data from the Premier League's own site: referees, player photos, player stats and the correct manager. Other leagues use ESPN for everything.

## Installation

**Via the Marketplace (HA 2026.11+) or HACS:** **Settings → Marketplace → ⋮ → Add from link**, paste this repository's address and choose type **Dashboard**. Install "Football Team Cards". The resource is registered for you.

**Manually:** copy `football-team-cards.js` to `config/www/`, then add it under **Settings → Dashboards → ⋮ → Resources** as `/local/football-team-cards.js`, type JavaScript module.

Refresh the browser (or reset the frontend cache in the app) after installing or updating.

## Usage

Edit a dashboard, **Add card**, search for "Football Team", pick a card and choose league and team in the editor. Or in YAML:

```yaml
type: custom:team-next-card
team: Arsenal
league: eng.1
```

Ready-made pages are in `examples/`: `any-team.yaml` for any club, and `newcastle.en.yaml` / `newcastle.sv.yaml` for a full Newcastle page with news and season record.

## Options

All cards:

| Option | Default | |
|---|---|---|
| `team` | `Newcastle United` | Team name as ESPN writes it; the editor lists the teams in the league |
| `league` | `eng.1` | `eng.1`, `esp.1`, `ita.1`, `ger.1`, `fra.1`, `ned.1`, `por.1`, `sco.1`, `swe.1`, `nor.1`, `den.1`, `usa.1` |
| `team_id` | (looked up) | ESPN team id, if you want to skip the name lookup |
| `language` | `auto` | `auto` (follows your HA language), `en` or `sv` |
| `tv` | `se` | `se` shows the Swedish broadcaster, `none` hides it |
| `title` | (default) | Card heading; `''` hides it |
| `competitions` | (per league) | List of ESPN competition codes to include |
| `refresh_minutes` | varies | How often data is fetched |
| `tap_action` | – | `{action: navigate, navigation_path: /my-page}` makes the whole card a link |

Card-specific: `weather` (next card, default `true`), `upcoming` and `results` (fixtures card, default 8 and 3), `show_photos` (squad card, default `true`), `zones` (table card, e.g. `[4, 3]` for 4 European and 3 relegation places), `pl_team_id` (Premier League's own id, looked up automatically).

## Upgrading from NUFC Cards v1

The old names `custom:nufc-*-card` still work, with Newcastle United as the default team. To get the visual editor, change `nufc-` to `team-` in your dashboard.

## Notes

- Data comes from ESPN's public site API, the Premier League's API and Open-Meteo, fetched by your browser or app. These APIs are unofficial and could change.
- The Swedish TV channel is based on who holds the rights in the 2026/27 season (Premier League: Viaplay/Prime Video, Champions League: Viaplay, Europa and Conference League: Disney+, La Liga: Disney+, Serie A and Allsvenskan: TV4 Play). It is not a per-match TV guide.
- Kick-off times are shown in Swedish time (`Europe/Stockholm`); change `NUFC_TZ` at the top of the file for another time zone.
- Not affiliated with any club, league or broadcaster.
