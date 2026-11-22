# Full Newcastle United page

`newcastle.en.yaml` / `newcastle.sv.yaml` add a season-record line and a news list on top of the cards. They need these from the Marketplace or HACS:

Home Assistant 2026.11 or later (Marketplace). Older versions work with HACS instead.

Install from **Settings → Marketplace**:

| Add-on | Type | Used for |
|---|---|---|
| Team Tracker (`vasqued2/ha-teamtracker`) | Integration | The Premier League season record line |
| Feedparser (`custom-components/feedparser`) | Integration | News |
| RSS Accordion (`timmaurice/lovelace-rss-accordion`) | Card | The news list |

Restart Home Assistant after installing the integrations.

Then set them up:

### 1. Add Team Tracker

**Settings → Devices & services → Add integration → Team Tracker**

- Sport: `soccer-intl`
- League: `EPL`
- Team: search for `Newcastle` (ESPN id 361)
- Name: `Newcastle United`

This creates `sensor.newcastle_united`.

### 2. Add the news feeds

**Add integration → Feedparser**, twice:

| Name | Feed URL |
|---|---|
| `NUFC BBC` | `https://feeds.bbci.co.uk/sport/football/teams/newcastle-united/rss.xml` |
| `NUFC Chronicle` | `https://www.chroniclelive.co.uk/all-about/newcastle-united-fc?service=rss` |

Suggested settings: date format `%a, %d %b %Y %H:%M:%S %Z`, local time on, refresh every 30 minutes, at most 10 entries, and the fields `title, link, summary, published, image`.

This creates `sensor.nufc_bbc` and `sensor.nufc_chronicle`.

### 3. Create the page

1. **Settings → Dashboards → Add dashboard → New dashboard from scratch**, named "Newcastle United".
2. Open it, tap the pencil, then **⋮ → Raw configuration editor**.
3. Replace everything with the contents of `newcastle.en.yaml` (English) or `newcastle.sv.yaml` (Swedish) and save.
4. Reload the page fully. In the app you may need to close and reopen it so the new cards load.

Background image: "St James Park Newcastle south west corner", photo by yellow book ltd, CC BY 2.0, Wikimedia Commons. Keep the credit if you share the page.
