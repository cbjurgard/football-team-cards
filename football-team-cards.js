// Football Team Cards for Home Assistant (v2.0)
// Cards: custom:team-next-card, custom:team-lineup-card, custom:team-fixtures-card, custom:team-table-card, custom:team-squad-card
// (the v1 names custom:nufc-*-card still work).
// Options on every card:
//   team      team name, e.g. "Newcastle United", "Arsenal", "Real Madrid", "Malmö FF" (or team_id: ESPN team id)
//   league    "eng.1" (default), "esp.1", "ita.1", "ger.1", "fra.1", "ned.1", "por.1", "sco.1", "swe.1", "nor.1", "den.1", "usa.1"
//   language  "auto" (default, follows the Home Assistant user language), "sv" or "en"
//   tv        "se" (default, Swedish broadcasters) or "none" (hide the TV channel)
// Data from ESPN's public site API; Premier League extras (referees, squad photos, player stats, manager)
// from the Premier League's own API; weather from Open-Meteo. All fetched in the browser, no keys needed.
const NUFC_API = "https://site.api.espn.com/apis";
// Premier League's own data API (used for match officials, which ESPN does not publish for the PL).
const NUFC_PL_API = "https://sdp-prem-prod.premier-league-prod.pulselive.com/api";
const NUFC_TZ = "Europe/Stockholm";
const NUFC_COMPS = {
  "eng.1": { color: "#3d195b" }, "eng.league_cup": { color: "#00a650" }, "eng.fa": { color: "#c8102e" },
  "esp.1": { color: "#ee8707" }, "esp.copa_del_rey": { color: "#a50034" },
  "ita.1": { color: "#008fd7" }, "ita.coppa_italia": { color: "#0b6e3f" },
  "ger.1": { color: "#d20515" }, "ger.dfb_pokal": { color: "#1c3f94" },
  "fra.1": { color: "#091c3e" }, "fra.coupe_de_france": { color: "#002395" },
  "ned.1": { color: "#ff6200" }, "por.1": { color: "#00a34f" }, "sco.1": { color: "#311b6e" },
  "swe.1": { color: "#005aa0" }, "nor.1": { color: "#ba0c2f" }, "den.1": { color: "#c60c30" }, "usa.1": { color: "#001f5b" },
  "uefa.champions": { color: "#0a2a6b" }, "uefa.europa": { color: "#f68e00" }, "uefa.europa.conf": { color: "#2db200" },
};
// Competitions to follow for a team in each league: the league, its domestic cups and European cups.
const NUFC_EURO = ["uefa.champions", "uefa.europa", "uefa.europa.conf"];
const NUFC_LEAGUE_COMPS = {
  "eng.1": ["eng.1", "eng.league_cup", "eng.fa"], "esp.1": ["esp.1", "esp.copa_del_rey"], "ita.1": ["ita.1", "ita.coppa_italia"],
  "ger.1": ["ger.1", "ger.dfb_pokal"], "fra.1": ["fra.1", "fra.coupe_de_france"],
};
const nufcCompsFor = league => [...(NUFC_LEAGUE_COMPS[league] || [league]), ...NUFC_EURO];
// Table zones: [European places marked blue, relegation places marked red]. Override with the card option zones.
const NUFC_ZONES = { "eng.1": [4, 3], "esp.1": [4, 3], "ita.1": [4, 3], "ger.1": [4, 2], "fra.1": [3, 2], "ned.1": [2, 2], "por.1": [2, 2], "sco.1": [2, 1], "swe.1": [1, 2], "nor.1": [1, 2], "den.1": [1, 2] };

const NUFC_I18N = {
  sv: {
    locale: "sv-SE",
    comp: { "eng.1": ["Premier League", "PL"], "eng.league_cup": ["Ligacupen", "Ligacupen"], "eng.fa": ["FA-cupen", "FA-cupen"], "esp.1": ["La Liga", "La Liga"], "esp.copa_del_rey": ["Copa del Rey", "Copa"], "ita.1": ["Serie A", "Serie A"], "ita.coppa_italia": ["Coppa Italia", "Coppa"], "ger.1": ["Bundesliga", "BL"], "ger.dfb_pokal": ["DFB-Pokal", "Pokal"], "fra.1": ["Ligue 1", "L1"], "fra.coupe_de_france": ["Franska cupen", "Cupen"], "ned.1": ["Eredivisie", "Ered."], "por.1": ["Primeira Liga", "Liga"], "sco.1": ["Premiership", "SPFL"], "swe.1": ["Allsvenskan", "Allsv."], "nor.1": ["Eliteserien", "Elite."], "den.1": ["Superligaen", "SL"], "usa.1": ["MLS", "MLS"], "uefa.champions": ["Champions League", "CL"], "uefa.europa": ["Europa League", "EL"], "uefa.europa.conf": ["Conference League", "ECL"] },
    loading: "Hämtar…", loadingNext: "Hämtar nästa match…", loadingMatches: "Hämtar matcher…", loadingTable: "Hämtar tabellen…",
    errMatches: "Kunde inte hämta matcher just nu.", errNext: "Kunde inte hämta nästa match just nu.", errLineups: "Kunde inte hämta laguppställningar just nu.", errTable: "Kunde inte hämta tabellen just nu.",
    noNext: "Ingen kommande match hittades.", noUpcoming: "Inga kommande matcher.",
    lineupsTitle: "Startelvor", matchesTitle: "Matcher", tableTitle: "Tabell",
    lineupsLater: (opp, when) => `Startelvorna mot ${opp} släpps ungefär en timme före avspark (runt ${when}).`,
    refPending: "Domare: inte utsedd än", ref: "Domare:",
    roles: { ar: "assisterande domare", fourth: "fjärdedomare", var: "VAR", avar: "assisterande VAR" }, formation: "Formation", subs: n => `Avbytare (${n})`,
    inD: (d, h) => `om ${d} d ${h} h`, inH: (h, m) => `om ${h} h ${m} min`, inM: m => `om ${m} min`,
    recent: "Senaste resultat", res: { W: "V", D: "O", L: "F" },
    prob: "trol.", tvNote: "📺 Svensk sändare enligt rättigheterna 2026/27, inte en tv-tablå per match.",
    pen: "str", og: "sj",
    stats: { possessionPct: "Bollinnehav", totalShots: "Skott", shotsOnTarget: "Skott på mål", wonCorners: "Hörnor", foulsCommitted: "Frisparkar mot", offsides: "Offside", saves: "Räddningar" },
    squadTitle: "Truppen", coach: "Huvudtränare", loadingSquad: "Hämtar truppen…", errSquad: "Kunde inte hämta truppen just nu.",
    pos: { G: "🧤 Målvakter", D: "🛡️ Försvarare", M: "⚙️ Mittfältare", F: "⚽ Anfallare" },
    h2h: "Inbördes möten", noH2h: "Inga möten de senaste säsongerna.", topScorers: "Skytteliga", topAssists: "Flest assist", goalsShort: "mål", assistsShort: "assist",
    wxKick: "Väder vid avspark", wxNow: "Väder nu", wind: "vind", rain: "regnrisk",
    wx: { 0: "Klart", 1: "Mest klart", 2: "Halvklart", 3: "Mulet", 45: "Dimma", 48: "Dimma", 51: "Duggregn", 53: "Duggregn", 55: "Duggregn", 56: "Underkylt duggregn", 57: "Underkylt duggregn", 61: "Lätt regn", 63: "Regn", 65: "Kraftigt regn", 66: "Underkylt regn", 67: "Underkylt regn", 71: "Lätt snöfall", 73: "Snöfall", 75: "Kraftigt snöfall", 77: "Snökorn", 80: "Regnskurar", 81: "Regnskurar", 82: "Kraftiga skurar", 85: "Snöbyar", 86: "Snöbyar", 95: "Åska", 96: "Åska med hagel", 99: "Åska med hagel" },
    posOne: { G: "Målvakt", D: "Försvarare", M: "Mittfältare", F: "Anfallare" },
    pstats: { appearances: "Matcher", starts: "Från start", timePlayed: "Minuter", goals: "Mål", goalAssists: "Assist", totalShots: "Skott", shotsOnTargetIncGoals: "Skott på mål", expectedGoals: "xG", expectedAssists: "xA", keyPassesAttemptAssists: "Nyckelpassningar", totalPasses: "Passningar", totalTackles: "Tacklingar", interceptions: "Brytningar", totalClearances: "Rensningar", cleanSheets: "Hållna nollor", goalsConceded: "Insläppta mål", saves: "Räddningar", yellowCards: "Gula kort", totalRedCards: "Röda kort" },
    seasonStats: "Säsongen i Premier League", noStats: "Ingen statistik i Premier League den här säsongen än.", loadingStats: "Hämtar statistik…", age: n => `${n} år`, close: "Stäng",
    th: ["#", "Lag", "S", "V", "O", "F", "+/-", "P"], tableNote: "Blå linje: Europacupplatser. Röd: nedflyttning.",
  },
  en: {
    locale: "en-GB",
    comp: { "eng.1": ["Premier League", "PL"], "eng.league_cup": ["League Cup", "League Cup"], "eng.fa": ["FA Cup", "FA Cup"], "esp.1": ["La Liga", "La Liga"], "esp.copa_del_rey": ["Copa del Rey", "Copa"], "ita.1": ["Serie A", "Serie A"], "ita.coppa_italia": ["Coppa Italia", "Coppa"], "ger.1": ["Bundesliga", "BL"], "ger.dfb_pokal": ["DFB-Pokal", "Pokal"], "fra.1": ["Ligue 1", "L1"], "fra.coupe_de_france": ["Coupe de France", "Coupe"], "ned.1": ["Eredivisie", "Ered."], "por.1": ["Primeira Liga", "Liga"], "sco.1": ["Premiership", "SPFL"], "swe.1": ["Allsvenskan", "Allsv."], "nor.1": ["Eliteserien", "Elite."], "den.1": ["Superliga", "SL"], "usa.1": ["MLS", "MLS"], "uefa.champions": ["Champions League", "CL"], "uefa.europa": ["Europa League", "EL"], "uefa.europa.conf": ["Conference League", "ECL"] },
    loading: "Loading…", loadingNext: "Loading next match…", loadingMatches: "Loading matches…", loadingTable: "Loading table…",
    errMatches: "Couldn't load matches right now.", errNext: "Couldn't load the next match right now.", errLineups: "Couldn't load line-ups right now.", errTable: "Couldn't load the table right now.",
    noNext: "No upcoming match found.", noUpcoming: "No upcoming matches.",
    lineupsTitle: "Line-ups", matchesTitle: "Matches", tableTitle: "Table",
    lineupsLater: (opp, when) => `Line-ups against ${opp} are released about an hour before kick-off (around ${when}).`,
    refPending: "Referee: not appointed yet", ref: "Referee:",
    roles: { ar: "assistant referee", fourth: "fourth official", var: "VAR", avar: "assistant VAR" }, formation: "Formation", subs: n => `Substitutes (${n})`,
    inD: (d, h) => `in ${d} d ${h} h`, inH: (h, m) => `in ${h} h ${m} min`, inM: m => `in ${m} min`,
    recent: "Recent results", res: { W: "W", D: "D", L: "L" },
    prob: "prob.", tvNote: "📺 Swedish broadcaster based on the 2026/27 rights, not a per-match TV listing.",
    pen: "pen", og: "og",
    stats: { possessionPct: "Possession", totalShots: "Shots", shotsOnTarget: "Shots on target", wonCorners: "Corners", foulsCommitted: "Fouls", offsides: "Offsides", saves: "Saves" },
    squadTitle: "Squad", coach: "Head coach", loadingSquad: "Loading squad…", errSquad: "Couldn't load the squad right now.",
    pos: { G: "🧤 Goalkeepers", D: "🛡️ Defenders", M: "⚙️ Midfielders", F: "⚽ Forwards" },
    h2h: "Head to head", noH2h: "No meetings in recent seasons.", topScorers: "Top scorers", topAssists: "Most assists", goalsShort: "goals", assistsShort: "assists",
    wxKick: "Weather at kick-off", wxNow: "Weather now", wind: "wind", rain: "rain chance",
    wx: { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle", 56: "Freezing drizzle", 57: "Freezing drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 66: "Freezing rain", 67: "Freezing rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains", 80: "Showers", 81: "Showers", 82: "Heavy showers", 85: "Snow showers", 86: "Snow showers", 95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail" },
    posOne: { G: "Goalkeeper", D: "Defender", M: "Midfielder", F: "Forward" },
    pstats: { appearances: "Appearances", starts: "Starts", timePlayed: "Minutes", goals: "Goals", goalAssists: "Assists", totalShots: "Shots", shotsOnTargetIncGoals: "Shots on target", expectedGoals: "xG", expectedAssists: "xA", keyPassesAttemptAssists: "Key passes", totalPasses: "Passes", totalTackles: "Tackles", interceptions: "Interceptions", totalClearances: "Clearances", cleanSheets: "Clean sheets", goalsConceded: "Goals conceded", saves: "Saves", yellowCards: "Yellow cards", totalRedCards: "Red cards" },
    seasonStats: "Premier League season", noStats: "No Premier League stats this season yet.", loadingStats: "Loading stats…", age: n => `age ${n}`, close: "Close",
    th: ["#", "Team", "P", "W", "D", "L", "GD", "Pts"], tableNote: "Blue line: European places. Red: relegation.",
  },
};

const nufcEsc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function nufcLocalParts(iso, locale = "sv-SE") {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat(locale, { timeZone: NUFC_TZ, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
  const p = Object.fromEntries(f.formatToParts(d).map(x => [x.type, x.value]));
  const hm = new Intl.DateTimeFormat("en-GB", { timeZone: NUFC_TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  const wd = new Intl.DateTimeFormat("en-GB", { timeZone: NUFC_TZ, weekday: "short" }).format(d);
  return { label: `${p.weekday} ${p.day} ${p.month} ${p.hour}:${p.minute}`, wd, hm };
}

// Broadcaster in Sweden, by competition. Premier League: Prime Video has ~38 matches, mostly Saturday 13:30;
// everything else is Viaplay. This is a rule of thumb, not a per-match TV listing.
function nufcTvSe(comp, iso, L) {
  const t = nufcLocalParts(iso);
  if (comp === "eng.1") return (t.wd === "Sat" && t.hm === "13:30") ? `Prime Video (${L.prob})` : "Viaplay";
  const map = { "eng.league_cup": "Viaplay", "uefa.champions": "Viaplay", "uefa.europa": "Disney+", "uefa.europa.conf": "Disney+",
    "esp.1": "Disney+", "ita.1": "TV4 Play", "swe.1": "TV4 Play" };
  return map[comp] || "";
}

async function nufcGet(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Shared, cached schedule across all competitions (used by matches, next-match and line-up cards).
const NUFC_SCHED = {};
function nufcSchedule(teamId, comps, maxAgeMs = 10 * 60000) {
  const key = teamId + "|" + comps.join(",");
  const c = NUFC_SCHED[key];
  if (c && Date.now() - c.t < maxAgeMs) return c.p;
  const p = (async () => {
    const calls = [];
    for (const comp of comps) {
      calls.push(nufcGet(`${NUFC_API}/site/v2/sports/soccer/${comp}/teams/${teamId}/schedule?fixture=true`).then(d => ({ comp, d })).catch(() => null));
      calls.push(nufcGet(`${NUFC_API}/site/v2/sports/soccer/${comp}/teams/${teamId}/schedule`).then(d => ({ comp, d })).catch(() => null));
    }
    const res = (await Promise.all(calls)).filter(Boolean);
    if (!res.length) throw new Error("No response from ESPN");
    const seen = new Map();
    for (const { comp, d } of res) for (const e of (d.events || [])) if (!seen.has(e.id)) seen.set(e.id, Object.assign({ _comp: comp }, e));
    return [...seen.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  })();
  NUFC_SCHED[key] = { t: Date.now(), p };
  p.catch(() => { delete NUFC_SCHED[key]; });
  return p;
}
const nufcDone = e => !!((((e.competitions || [])[0] || {}).status || {}).type || {}).completed;
// Next match = first not-completed match that started less than 3 h ago, in any competition.
function nufcPickNext(evs) {
  const cut = Date.now() - 3 * 3600000;
  return evs.find(e => !nufcDone(e) && Date.parse(e.date) > cut) || null;
}
const nufcLogo = t => (t && (t.logo || (t.logos && t.logos[0] && t.logos[0].href))) || "";
const nufcScore = x => { const s = x.score; return s == null ? "" : (typeof s === "object" ? (s.displayValue != null ? s.displayValue : s.value) : s); };

// Goals and cards for a match, from ESPN's scoreboard (cached 60 s). Each item: {kind, minute, teamId, name, pen, og}.
const NUFC_DETAILS = {};
function nufcMatchDetails(ev) {
  const c = NUFC_DETAILS[ev.id];
  if (c && Date.now() - c.t < 60000) return c.p;
  const ymd = new Date(ev.date).toISOString().slice(0, 10).replace(/-/g, "");
  const p = nufcGet(`${NUFC_API}/site/v2/sports/soccer/${ev._comp}/scoreboard?dates=${ymd}`).then(d => {
    const e = (d.events || []).find(x => String(x.id) === String(ev.id));
    const det = (((e || {}).competitions || [])[0] || {}).details || [];
    return det.map(x => ({
      kind: x.scoringPlay ? "goal" : (x.redCard ? "red" : (x.yellowCard ? "yellow" : "")),
      minute: (x.clock || {}).displayValue || "",
      teamId: String((x.team || {}).id || ""),
      name: ((x.athletesInvolved || [])[0] || {}).displayName || "",
      pen: !!x.penaltyKick, og: !!x.ownGoal,
    })).filter(x => x.kind);
  });
  NUFC_DETAILS[ev.id] = { t: Date.now(), p };
  p.catch(() => { delete NUFC_DETAILS[ev.id]; });
  return p;
}
const NUFC_ICON = { goal: "⚽", yellow: "🟨", red: "🟥" };

// Find the Premier League's own match id for an ESPN league match, by team and date. The matchweek is
// estimated from the number of league games played before it.
const NUFC_PL_IDS = {};
async function nufcPlMatchId(espnEvent, evs, plTeamId, espnTeamId) {
  if (NUFC_PL_IDS[espnEvent.id]) return NUFC_PL_IDS[espnEvent.id];
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(espnEvent.date));
  const season = nufcPlSeason(espnEvent.date);
  const played = evs.filter(e => e._comp === "eng.1" && nufcDone(e) && Date.parse(e.date) < Date.parse(espnEvent.date)).length;
  const myName = ((((espnEvent.competitions || [])[0] || {}).competitors || []).map(c => c.team || {}).find(t => String(t.id) === String(espnTeamId)) || {}).displayName || "";
  const isMe = t => t && (String(t.id) === String(plTeamId) || (myName && String(t.name || "").toLowerCase() === myName.toLowerCase()));
  for (const mw of [played + 1, played + 2, played, played + 3, played - 1].filter(n => n >= 1 && n <= 38)) {
    const r = await nufcGet(`${NUFC_PL_API}/v1/competitions/8/seasons/${season}/matchweeks/${mw}/matches`).catch(() => null);
    const list = (r && (r.data || r)) || [];
    const hit = (Array.isArray(list) ? list : []).find(m => [m.homeTeam, m.awayTeam].some(isMe) && String(m.kickoff || "").slice(0, 10) === day);
    if (hit) return (NUFC_PL_IDS[espnEvent.id] = hit.matchId);
  }
  return null;
}
function nufcPlSeason(iso) { const d = iso ? new Date(iso) : new Date(); return d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1; }

// Result letter (W/D/L) for a team in a finished ESPN event.
function nufcResult(e, teamId) {
  const cs = ((e.competitions || [])[0] || {}).competitors || [];
  const me = cs.find(x => String((x.team || {}).id) === String(teamId));
  if (!me) return "";
  if (me.winner === true) return "W";
  return cs.some(x => x.winner === true) ? "L" : "D";
}
// Last five finished matches (any competition) for a team, oldest first.
async function nufcForm(teamId, comps) {
  const evs = await nufcSchedule(teamId, comps, 30 * 60000);
  return evs.filter(nufcDone).slice(-5).map(e => nufcResult(e, teamId));
}
// Earlier meetings between two teams, from this and the three previous seasons' schedules (newest first).
const NUFC_H2H = {};
function nufcH2H(teamId, oppId, comps) {
  const key = teamId + "|" + oppId;
  if (NUFC_H2H[key]) return NUFC_H2H[key];
  const p = (async () => {
    const now = new Date(), y = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
    const calls = [];
    for (const comp of comps) for (const season of [y, y - 1, y - 2, y - 3])
      calls.push(nufcGet(`${NUFC_API}/site/v2/sports/soccer/${comp}/teams/${teamId}/schedule?season=${season}`).then(d => d.events || []).catch(() => []));
    const seen = new Map();
    for (const list of await Promise.all(calls)) for (const e of list) {
      const cs = ((e.competitions || [])[0] || {}).competitors || [];
      if (nufcDone(e) && cs.some(x => String((x.team || {}).id) === String(oppId)) && !seen.has(e.id)) seen.set(e.id, e);
    }
    return [...seen.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 5);
  })();
  NUFC_H2H[key] = p;
  p.catch(() => { delete NUFC_H2H[key]; });
  return p;
}

// Weather at the venue, from Open-Meteo (free, no key). The venue's city is geocoded; the forecast hour
// nearest kick-off is used before the match and the current weather during it. Cached 30 minutes.
const NUFC_WX = {};
const NUFC_WX_ICON = c => c === 0 ? "☀️" : c <= 2 ? "⛅" : c === 3 ? "☁️" : c <= 48 ? "🌫️" : c <= 67 ? "🌧️" : c <= 77 ? "🌨️" : c <= 82 ? "🌦️" : c <= 86 ? "🌨️" : "⛈️";
function nufcWeather(ev, live) {
  const key = ev.id + (live ? "L" : "");
  const c = NUFC_WX[key];
  if (c && Date.now() - c.t < 30 * 60000) return c.p;
  const p = (async () => {
    let venue = (((ev.competitions || [])[0] || {}).venue) || {};
    if (!(venue.address || {}).city) {
      // The schedule often leaves out the venue's address; the match summary has it.
      const sm = await nufcGet(`${NUFC_API}/site/v2/sports/soccer/${ev._comp}/summary?event=${ev.id}`).catch(() => null);
      venue = ((sm && sm.gameInfo && sm.gameInfo.venue) || venue);
    }
    const addr = venue.address || {};
    const city = String(addr.city || venue.fullName || "").replace(/-/g, " ").split(",")[0].trim();
    if (!city) return null;
    const g = await nufcGet(`https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&name=${encodeURIComponent(city)}${["England", "Scotland", "Wales"].includes(addr.country) ? "&countryCode=GB" : ""}`);
    const loc = (g.results || [])[0];
    if (!loc) return null;
    const base = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&wind_speed_unit=ms&timezone=UTC`;
    if (live) {
      const w = await nufcGet(`${base}&current=temperature_2m,weather_code,wind_speed_10m`);
      const cur = w.current || {};
      return { temp: cur.temperature_2m, code: cur.weather_code, wind: cur.wind_speed_10m, rain: null, city: loc.name };
    }
    const w = await nufcGet(`${base}&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability&forecast_days=16`);
    const h = w.hourly || {};
    const target = Date.parse(ev.date);
    let best = -1, diff = Infinity;
    (h.time || []).forEach((t, i) => { const d = Math.abs(Date.parse(t + "Z") - target); if (d < diff) { diff = d; best = i; } });
    if (best < 0 || diff > 2 * 3600000) return null;
    return { temp: h.temperature_2m[best], code: h.weather_code[best], wind: h.wind_speed_10m[best], rain: (h.precipitation_probability || [])[best], city: loc.name };
  })();
  NUFC_WX[key] = { t: Date.now(), p };
  p.catch(() => { delete NUFC_WX[key]; });
  return p;
}

// Officials for a Premier League match, from the Premier League's own API.
const NUFC_PL_CACHE = {};
async function nufcPlOfficials(espnEvent, evs, plTeamId, espnTeamId) {
  if (NUFC_PL_CACHE[espnEvent.id]) return NUFC_PL_CACHE[espnEvent.id];
  const matchId = await nufcPlMatchId(espnEvent, evs, plTeamId, espnTeamId);
  if (!matchId) return [];
  const o = await nufcGet(`${NUFC_PL_API}/v1/matches/${matchId}/officials`);
  const list = (o.matchOfficials || []).map(x => ({ name: (x.official || {}).name || [((x.official || {}).firstName), ((x.official || {}).lastName)].filter(Boolean).join(" "), type: x.type || "" }));
  if (list.length) NUFC_PL_CACHE[espnEvent.id] = list;
  return list;
}

// Player photo from the Premier League's image server, with the older address as a fallback, then initials.
function nufcPlPhoto(id, name) {
  const ini = String(name || "").split(/\s+/).map(x => x[0] || "").slice(0, 2).join("");
  const a = `https://resources.premierleague.com/premierleague25/photos/players/110x140/${id}.png`;
  const b = `https://resources.premierleague.com/premierleague/photos/players/110x140/p${id}.png`;
  return `<img src="${a}" alt="" loading="lazy" data-b="${b}" data-i="${nufcEsc(ini)}" onerror="if(this.dataset.b){this.src=this.dataset.b;this.dataset.b='';}else{const d=document.createElement('div');d.className='ph';d.textContent=this.dataset.i;this.replaceWith(d);}">`;
}

// All teams in a league, from the standings (the endpoint the table already uses, which browsers may fetch).
async function nufcLeagueTeams(league) {
  const d = await nufcGet(`${NUFC_API}/v2/sports/soccer/${league}/standings`);
  const groups = (d.children && d.children.length) ? d.children : [d];
  return [].concat(...groups.map(g => ((g.standings || {}).entries || []).map(e => e.team || {}))).filter(t => t.id);
}
// Look up a team's ESPN id from its name in a league's team list.
const nufcNorm = s => String(s || "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/&/g, " and ").replace(/\b(afc|fc|cf|sc|if|ff|bk|ik)\b/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
const NUFC_TEAMS = {};
async function nufcResolveTeam(league, name) {
  const key = league + "|" + name;
  if (!NUFC_TEAMS[key]) NUFC_TEAMS[key] = (async () => {
    const teams = await nufcLeagueTeams(league);
    const want = nufcNorm(name);
    const fields = t => [t.displayName, t.shortDisplayName, t.name, t.location, t.abbreviation, t.nickname].map(nufcNorm).filter(Boolean);
    let hit = teams.find(t => fields(t).includes(want));
    if (!hit) hit = teams.find(t => fields(t).some(f => f.includes(want) || want.includes(f)));
    if (!hit) throw new Error(`Team "${name}" not found in ${league}`);
    return { id: String(hit.id), name: hit.displayName || name };
  })();
  NUFC_TEAMS[key].catch(() => { delete NUFC_TEAMS[key]; });
  return NUFC_TEAMS[key];
}
// The Premier League's own id for a team, found by name among the clubs in matchweek 1 of the season.
const NUFC_PL_TEAM = {};
function nufcPlTeamId(name) {
  if (!NUFC_PL_TEAM[name]) NUFC_PL_TEAM[name] = (async () => {
    const r = await nufcGet(`${NUFC_PL_API}/v1/competitions/8/seasons/${nufcPlSeason()}/matchweeks/1/matches`);
    const list = (r && (r.data || r)) || [];
    const want = nufcNorm(name);
    const clubs = [].concat(...list.map(m => [m.homeTeam, m.awayTeam])).filter(Boolean);
    const hit = clubs.find(t => nufcNorm(t.name) === want) || clubs.find(t => { const n = nufcNorm(t.name); return n.includes(want) || want.includes(n); })
      || clubs.find(t => nufcNorm(t.shortName) === want);
    return hit ? String(hit.id) : null;
  })();
  NUFC_PL_TEAM[name].catch(() => { delete NUFC_PL_TEAM[name]; });
  return NUFC_PL_TEAM[name];
}

const NUFC_BASE_CSS = `
  ha-card { padding: 16px; }
  h2 { margin: 0 0 12px; font-size: 1.2em; font-weight: 500; }
  .muted { color: var(--secondary-text-color); font-size: 0.9em; }
  ul { list-style: none; margin: 0; padding: 0; }
  .pill { display: inline-block; padding: 1px 7px; border-radius: 10px; font-size: 0.75em; color: #fff; white-space: nowrap; }
`;

class NufcBase extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({ team: "Newcastle United", league: "eng.1", refresh_minutes: 30, language: "auto", tv: "se" }, this.defaults(), config);
    if (!this._config.competitions) this._config.competitions = nufcCompsFor(this._config.league);
    if (this._config.team_id) this._config.team_id = String(this._config.team_id);
    this._last = 0;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    // Optional tap_action: { action: "navigate", navigation_path: "/..." }
    const ta = this._config.tap_action;
    this.style.cursor = ta && ta.action === "navigate" ? "pointer" : "";
    if (!this._tapBound) {
      this._tapBound = true;
      this.addEventListener("click", ev => {
        const t = this._config.tap_action;
        if (!t || t.action !== "navigate" || !t.navigation_path) return;
        if (ev.composedPath().some(el => el.tagName === "A" || el.tagName === "SUMMARY")) return;
        history.pushState(null, "", t.navigation_path);
        window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
      });
    }
  }
  defaults() { return {}; }
  interval() { return this._config.refresh_minutes * 60000; }
  // Resolve the team's ESPN id (and, for the Premier League, its PL id) before loading.
  async ensureTeam() {
    if (!this._config.team_id) {
      const t = await nufcResolveTeam(this._config.league, this._config.team);
      this._config.team_id = t.id; this._teamName = t.name;
    }
  }
  async ensurePl() {
    if (this._config.league !== "eng.1") return null;
    if (!this._config.pl_team_id) this._config.pl_team_id = await nufcPlTeamId(this._teamName || this._config.team).catch(() => null);
    return this._config.pl_team_id;
  }
  get L() {
    let lang = String(this._config.language || "auto").toLowerCase();
    if (lang === "auto") {
      const h = this._hass || {};
      lang = String((h.locale && h.locale.language) || h.language || "en").toLowerCase();
    }
    return NUFC_I18N[lang.slice(0, 2)] || NUFC_I18N.en;
  }
  title(def) { return this._config.title != null ? this._config.title : this.L[def]; }
  comp(c) { return (this.L.comp[c] || [c, c]); }
  tv(c, iso) { return this._config.tv === "se" ? nufcTvSe(c, iso, this.L) : ""; }
  set hass(hass) {
    const langChanged = this._hass && ((this._hass.locale || {}).language !== (hass.locale || {}).language);
    this._hass = hass;
    const now = Date.now();
    const key = this.fetchKey ? this.fetchKey() : "";
    if (key !== this._key || now - this._last > this.interval()) {
      this._key = key;
      this._last = now;
      this.ensureTeam().then(() => this.load()).then(() => { this._error = null; this._loaded = true; this.render(); }).catch(e => {
        this._error = String(e.message || e);
        if (this._error.startsWith("Team ")) this.shell("", `<p class="muted">⚠️ ${nufcEsc(this._error)}</p>`); else this.render();
      });
    }
    if (!this._rendered || langChanged) { this._rendered = true; this.render(); }
  }
  shell(title, body, css = "") {
    this.shadowRoot.innerHTML = `<style>${NUFC_BASE_CSS}${css}</style><ha-card>${title ? `<h2>${nufcEsc(title)}</h2>` : ""}${body}${this._error && !this._loaded && !this._error.startsWith("Team ") ? `<p class="muted" style="font-size:0.75em;opacity:0.7">(${nufcEsc(this._error)})</p>` : ""}</ha-card>`;
  }
  getCardSize() { return 6; }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
}

// ---------- Line-ups + referee ----------
class NufcLineupCard extends NufcBase {
  defaults() { return { refresh_minutes: 3 }; }
  interval() {
    const m = this._next;
    if (!m) return 10 * 60000;
    const mins = (Date.parse(m.date) - Date.now()) / 60000;
    return (mins < 120 && mins > -180) ? this._config.refresh_minutes * 60000 : 30 * 60000;
  }
  async load() {
    const evs = await nufcSchedule(this._config.team_id, this._config.competitions);
    this._next = nufcPickNext(evs);
    this._data = this._next ? await nufcGet(`${NUFC_API}/site/v2/sports/soccer/${this._next._comp}/summary?event=${this._next.id}`) : null;
    // Officials: ESPN when it has them, otherwise the Premier League's own API for league matches.
    const espnOffs = ((this._data && this._data.gameInfo && this._data.gameInfo.officials) || []).slice().sort((a, b) => (a.order || 99) - (b.order || 99))
      .map(o => ({ name: o.displayName || o.fullName || "", type: (o.position || {}).displayName || (o.position || {}).name || "" }));
    let offs = espnOffs;
    if (!offs.length && this._next && this._next._comp === "eng.1") {
      try { const pl = await this.ensurePl(); offs = pl ? await nufcPlOfficials(this._next, evs, pl, this._config.team_id) : []; } catch (e) { offs = []; }
    }
    this._officials = offs;
    const st = this._next ? Date.parse(this._next.date) <= Date.now() : false;
    this._details = st ? await nufcMatchDetails(this._next).catch(() => []) : [];
  }
  _teamBlock(r) {
    const L = this.L;
    const team = r.team || {};
    const players = r.roster || [];
    const starters = players.filter(p => p.starter).sort((a, b) => parseInt(a.formationPlace || 99) - parseInt(b.formationPlace || 99));
    const subs = players.filter(p => !p.starter);
    const row = p => {
      const a = p.athlete || {};
      const pos = (p.position && (p.position.abbreviation || p.position.name)) || "";
      const nm = String(a.displayName || "").toLowerCase();
      const ev = (this._details || []).filter(x => x.name && x.name.toLowerCase() === nm);
      const marks = ev.map(x => NUFC_ICON[x.kind] + (x.og ? `(${this.L.og})` : "")).join("");
      const flags = (marks ? " " + marks : "") + (p.subbedOut ? " ⬇️" : "") + (p.subbedIn ? " ⬆️" : "");
      return `<li><span class="nr">${nufcEsc(p.jersey || "")}</span><span class="name">${nufcEsc(a.displayName || a.shortName || "")}${flags}</span><span class="pos">${nufcEsc(pos)}</span></li>`;
    };
    const logo = nufcLogo(team);
    return `<div class="team"><div class="head">${logo ? `<img src="${nufcEsc(logo)}" alt="">` : ""}<div><div class="tname">${nufcEsc(team.displayName || team.name || "")}</div><div class="muted">${r.formation ? L.formation + " " + nufcEsc(r.formation) : ""}</div></div></div>
      <ul>${starters.map(row).join("")}</ul>
      ${subs.length ? `<details><summary>${nufcEsc(L.subs(subs.length))}</summary><ul>${subs.map(row).join("")}</ul></details>` : ""}</div>`;
  }
  _role(type) {
    const R = this.L.roles, t = String(type).toLowerCase();
    if (/assistant var|avar/.test(t)) return R.avar;
    if (/video|^var/.test(t)) return R.var;
    if (/fourth/.test(t)) return R.fourth;
    if (/assistant/.test(t)) return R.ar;
    return type;
  }
  _referee() {
    const L = this.L;
    const offs = this._officials || [];
    if (!offs.length) return `<p class="ref muted">${nufcEsc(L.refPending)}</p>`;
    const isMain = o => /referee/i.test(o.type) && !/assist|fourth|var|video/i.test(o.type);
    const main = offs.find(isMain) || offs[0];
    const others = offs.filter(o => o !== main).map(o => `${nufcEsc(o.name)} (${nufcEsc(this._role(o.type))})`);
    return `<p class="ref">🟨 <b>${nufcEsc(L.ref)}</b> ${nufcEsc(main.name)}${others.length ? `<br><span class="muted">${others.join(" · ")}</span>` : ""}</p>`;
  }
  render() {
    const L = this.L;
    const m = this._next;
    let body;
    if (!m) body = `<p class="muted">${nufcEsc(this._error ? L.errMatches : (this._loaded ? L.noNext : L.loading))}</p>`;
    else {
      const rosters = (this._data && this._data.rosters) || [];
      const has = rosters.some(r => (r.roster || []).some(p => p.starter));
      const tid = String(this._config.team_id);
      if (has) {
        rosters.sort((a, b) => (String((a.team || {}).id) === tid ? -1 : String((b.team || {}).id) === tid ? 1 : 0));
        body = `<div class="grid">${rosters.map(r => this._teamBlock(r)).join("")}</div>`;
      } else {
        const cs = ((m.competitions || [])[0] || {}).competitors || [];
        const opp = cs.find(x => String((x.team || {}).id) !== tid) || {};
        const when = nufcLocalParts(new Date(Date.parse(m.date) - 3600000).toISOString(), L.locale).label;
        body = `<p class="muted">${nufcEsc(this._error ? L.errLineups : L.lineupsLater((opp.team || {}).displayName || (opp.team || {}).shortDisplayName || "", when))}</p>`;
      }
      if ((this._officials || []).length || Date.parse(m.date) > Date.now()) body = this._referee() + body;
    }
    this.shell(this.title("lineupsTitle"), body, `
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
      .head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .head img { width: 36px; height: 36px; object-fit: contain; }
      .tname { font-weight: 600; }
      li { display: flex; gap: 8px; padding: 4px 0; border-bottom: 1px solid var(--divider-color); align-items: baseline; }
      .nr { width: 2em; text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
      .name { flex: 1; } .pos { color: var(--secondary-text-color); font-size: 0.85em; }
      details { margin-top: 8px; } summary { cursor: pointer; color: var(--secondary-text-color); }
      .ref { margin: 0 0 12px; }`);
  }
}

// ---------- Next match (any competition), with live score ----------
class NufcNextCard extends NufcBase {
  defaults() { return { title: "", weather: true }; }
  interval() {
    const m = this._next;
    if (!m) return 10 * 60000;
    const mins = (Date.parse(m.date) - Date.now()) / 60000;
    return (mins < 10 && mins > -180) ? 60000 : 10 * 60000;
  }
  async load() {
    const evs = await nufcSchedule(this._config.team_id, this._config.competitions, this.interval());
    this._next = nufcPickNext(evs);
    this._live = null;
    const m = this._next;
    if (m && Date.parse(m.date) - Date.now() < 10 * 60000) {
      const d = await nufcGet(`${NUFC_API}/site/v2/sports/soccer/${m._comp}/summary?event=${m.id}`);
      this._live = ((d.header || {}).competitions || [])[0] || null;
      this._box = d.boxscore || null;
      const st = ((((this._live || {}).status || {}).type || {}).state) || "pre";
      this._details = st === "pre" ? [] : await nufcMatchDetails(m).catch(() => []);
    } else this._details = [];
    const state = ((((this._live || {}).status || {}).type || {}).state) || "pre";
    if (m) {
      const cs = ((m.competitions || [])[0] || {}).competitors || [];
      const opp = cs.find(x => String((x.team || {}).id) !== String(this._config.team_id));
      const oppId = opp && String((opp.team || {}).id);
      const comps = this._config.competitions;
      this._form = {};
      const [mine, theirs, h2h] = await Promise.all([
        nufcForm(this._config.team_id, comps).catch(() => []),
        oppId ? nufcForm(oppId, comps).catch(() => []) : [],
        oppId ? nufcH2H(this._config.team_id, oppId, comps).catch(() => []) : [],
      ]);
      this._form[String(this._config.team_id)] = mine;
      if (oppId) this._form[oppId] = theirs;
      this._h2h = h2h;
    }
    this._wxLive = state === "in";
    this._wx = (m && this._config.weather && state !== "post") ? await nufcWeather(m, this._wxLive).catch(() => null) : null;
  }
  render() {
    const L = this.L;
    const m = this._next;
    if (!m) { this.shell(this._config.title, `<p class="muted">${nufcEsc(this._error ? L.errNext : (this._loaded ? L.noNext : L.loadingNext))}</p>`); return; }
    const comp = (m.competitions || [])[0] || {};
    const live = this._live;
    const cs = (live && live.competitors) || comp.competitors || [];
    const home = cs.find(x => x.homeAway === "home") || cs[0] || {};
    const away = cs.find(x => x.homeAway === "away") || cs[1] || {};
    const color = (NUFC_COMPS[m._comp] || { color: "#555" }).color;
    const t = nufcLocalParts(m.date, L.locale);
    const status = ((live && live.status) || comp.status || {}).type || {};
    const state = status.state || "pre";
    const venue = ((comp.venue || {}).fullName) || "";
    const tv = this.tv(m._comp, m.date);
    let middle;
    if (state === "pre") {
      const ms = Date.parse(m.date) - Date.now();
      const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, min = Math.max(0, Math.floor(ms / 60000) % 60);
      const left = d > 0 ? L.inD(d, h) : (h > 0 ? L.inH(h, min) : L.inM(min));
      middle = `<div class="vs">–</div><div class="muted">${nufcEsc(left)}</div>`;
    } else {
      middle = `<div class="score">${nufcEsc(nufcScore(home))} – ${nufcEsc(nufcScore(away))}</div><div class="${state === "in" ? "live" : "muted"}">${state === "in" ? "● " : ""}${nufcEsc(status.shortDetail || status.detail || "")}</div>`;
    }
    const formOf = x => ((this._form || {})[String((x.team || {}).id)] || []).map(r => `<span class="fb f${r}">${nufcEsc(L.res[r] || "")}</span>`).join("");
    const side = x => `<div class="side"><img src="${nufcEsc(nufcLogo(x.team))}" alt=""><div class="tn">${nufcEsc(((x.team || {}).shortDisplayName) || ((x.team || {}).displayName) || "")}</div><div class="form">${formOf(x)}</div></div>`;
    const body = `
      <div class="toprow"><span class="pill" style="background:${color}">${nufcEsc(this.comp(m._comp)[0])}</span></div>
      <div class="row">${side(home)}<div class="mid">${middle}</div>${side(away)}</div>
      ${this._eventsBlock(home, away)}
      ${state === "pre" ? "" : this._statsBlock(home, away)}
      <div class="info">🗓️ ${nufcEsc(t.label)}${venue ? ` · 🏟️ ${nufcEsc(venue)}` : ""}${tv ? ` · 📺 ${nufcEsc(tv)}` : ""}</div>
      ${this._wxBlock()}
      ${this._h2hBlock()}`;
    this.shell(this._config.title, body, `
      .toprow { text-align: center; margin-bottom: 8px; }
      .row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .side { flex: 1; text-align: center; }
      .side img { width: 100px; height: 100px; object-fit: contain; filter: drop-shadow(0 0 0.25rem rgba(255,255,255,0.9)) drop-shadow(0 4px 6px rgba(0,0,0,0.45)); }
      @media (max-width: 420px) { .side img { width: 80px; height: 80px; } }
      .tn { font-weight: 600; margin-top: 4px; }
      .mid { flex: 1; text-align: center; }
      .score { font-size: 2em; font-weight: 700; font-variant-numeric: tabular-nums; }
      .vs { font-size: 1.6em; color: var(--secondary-text-color); }
      .live { color: #e53935; font-weight: 600; }
      .info { text-align: center; margin-top: 10px; color: var(--secondary-text-color); font-size: 0.9em; }
      .wx { text-align: center; margin-top: 6px; font-size: 0.9em; }
      .form { margin-top: 4px; display: flex; gap: 3px; justify-content: center; }
      .fb { display: inline-block; min-width: 18px; height: 18px; line-height: 18px; border-radius: 9px; font-size: 0.7em; font-weight: 700; color: #fff; text-align: center; padding: 0 3px; }
      .fW { background: #2e7d32; } .fD { background: #757575; } .fL { background: #c62828; }
      .h2h { margin-top: 10px; font-size: 0.9em; }
      .h2h summary { cursor: pointer; color: var(--secondary-text-color); text-align: center; }
      .h2h li { padding: 3px 0; } .h2h .min { color: var(--secondary-text-color); font-size: 0.85em; }
      .events { display: flex; gap: 12px; margin-top: 10px; font-size: 0.9em; }
      .events ul { flex: 1; } .events li { padding: 2px 0; }
      .events .h { text-align: right; } .events .a { text-align: left; }
      .events .min { color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
      .stats { margin-top: 14px; font-size: 0.85em; }
      .stat { margin: 6px 0; }
      .stat .lbl { display: flex; justify-content: space-between; font-variant-numeric: tabular-nums; }
      .stat .lbl span:nth-child(2) { color: var(--secondary-text-color); }
      .bar { display: flex; height: 5px; border-radius: 3px; overflow: hidden; background: var(--divider-color); margin-top: 2px; }
      .bar .bh { background: var(--primary-text-color); } .bar .ba { background: var(--secondary-text-color); opacity: 0.6; margin-left: auto; }`);
  }
  _h2hBlock() {
    const L = this.L, list = this._h2h;
    if (!list) return "";
    const rows = list.map(e => {
      const cs = ((e.competitions || [])[0] || {}).competitors || [];
      const h = cs.find(x => x.homeAway === "home") || cs[0] || {}, a = cs.find(x => x.homeAway === "away") || cs[1] || {};
      const r = nufcResult(e, this._config.team_id);
      const d = new Intl.DateTimeFormat(L.locale, { timeZone: NUFC_TZ, day: "numeric", month: "short", year: "numeric" }).format(new Date(e.date));
      const nm = x => nufcEsc(((x.team || {}).shortDisplayName) || ((x.team || {}).displayName) || "");
      return `<li><span class="fb f${r}">${nufcEsc(L.res[r] || "")}</span> ${nm(h)} <b>${nufcEsc(nufcScore(h))}–${nufcEsc(nufcScore(a))}</b> ${nm(a)} <span class="min">${nufcEsc(d)}</span></li>`;
    }).join("");
    return `<details class="h2h"><summary>${nufcEsc(L.h2h)}</summary>${rows ? `<ul>${rows}</ul>` : `<p class="muted">${nufcEsc(L.noH2h)}</p>`}</details>`;
  }
  _wxBlock() {
    const L = this.L, w = this._wx;
    if (!w || w.temp == null) return "";
    const parts = [`${Math.round(w.temp)} °C`, L.wx[w.code] || "", w.wind != null ? `${L.wind} ${Math.round(w.wind)} m/s` : "", w.rain != null ? `${L.rain} ${w.rain} %` : ""].filter(Boolean);
    return `<div class="wx">${NUFC_WX_ICON(w.code)} <b>${nufcEsc(this._wxLive ? L.wxNow : L.wxKick)}:</b> ${nufcEsc(parts.join(" · "))}</div>`;
  }
  _statsBlock(home, away) {
    const L = this.L;
    const teams = (this._box && this._box.teams) || [];
    const find = t => teams.find(x => String((x.team || {}).id) === String((t.team || {}).id)) || {};
    const hs = find(home).statistics || [], as = find(away).statistics || [];
    if (!hs.length || !as.length) return "";
    const val = (arr, n) => { const x = arr.find(y => y.name === n); return x ? (x.displayValue != null ? x.displayValue : x.value) : null; };
    const rows = Object.keys(L.stats).map(n => {
      const h = val(hs, n), a = val(as, n);
      if (h == null || a == null) return "";
      const hn = parseFloat(h) || 0, an = parseFloat(a) || 0, tot = hn + an;
      const hp = tot ? Math.round(100 * hn / tot) : 50, ap = tot ? 100 - hp : 50;
      const unit = n === "possessionPct" ? "%" : "";
      return `<div class="stat"><div class="lbl"><span>${nufcEsc(h)}${unit}</span><span>${nufcEsc(L.stats[n])}</span><span>${nufcEsc(a)}${unit}</span></div><div class="bar"><div class="bh" style="width:${hp}%"></div><div class="ba" style="width:${ap}%"></div></div></div>`;
    }).join("");
    return rows ? `<div class="stats">${rows}</div>` : "";
  }
  _eventsBlock(home, away) {
    const L = this.L;
    const det = this._details || [];
    if (!det.length) return "";
    const hid = String((home.team || {}).id), aid = String((away.team || {}).id);
    const item = (x, side) => {
      const extra = x.pen ? ` (${L.pen})` : (x.og ? ` (${L.og})` : "");
      const txt = `${nufcEsc(x.name)}${nufcEsc(extra)} <span class="min">${nufcEsc(x.minute)}</span>`;
      return `<li>${side === "h" ? `${txt} ${NUFC_ICON[x.kind]}` : `${NUFC_ICON[x.kind]} ${txt}`}</li>`;
    };
    // ESPN credits each goal (own goals too) to the team whose score it adds to.
    const sideOf = x => x.teamId === hid ? "h" : (x.teamId === aid ? "a" : "");
    const h = det.filter(x => sideOf(x) === "h").map(x => item(x, "h")).join("");
    const a = det.filter(x => sideOf(x) === "a").map(x => item(x, "a")).join("");
    return `<div class="events"><ul class="h">${h}</ul><ul class="a">${a}</ul></div>`;
  }
}

// ---------- Fixtures & results, all competitions ----------
class NufcFixturesCard extends NufcBase {
  defaults() { return { upcoming: 8, results: 3 }; }
  async load() { this._events = await nufcSchedule(this._config.team_id, this._config.competitions); }
  _row(e, done) {
    const L = this.L;
    const comp = (e.competitions || [])[0] || {};
    const cs = comp.competitors || [];
    const home = cs.find(x => x.homeAway === "home") || cs[0] || {};
    const away = cs.find(x => x.homeAway === "away") || cs[1] || {};
    const nm = x => nufcEsc(((x.team || {}).shortDisplayName) || ((x.team || {}).displayName) || "");
    const color = (NUFC_COMPS[e._comp] || { color: "#555" }).color;
    const t = nufcLocalParts(e.date, L.locale);
    let mid = "–";
    let res = "";
    if (done) {
      mid = `${nufcEsc(nufcScore(home))}–${nufcEsc(nufcScore(away))}`;
      const me = cs.find(x => String((x.team || {}).id) === String(this._config.team_id)) || {};
      res = me.winner === true ? "W" : (cs.some(x => x.winner === true) ? "L" : "D");
    }
    const tv = done ? "" : this.tv(e._comp, e.date);
    return `<li class="${done ? "done" : ""}">
      <div class="top"><span class="pill" style="background:${color}">${nufcEsc(this.comp(e._comp)[1])}</span><span class="when">${nufcEsc(t.label)}</span>${tv ? `<span class="tv">📺 ${nufcEsc(tv)}</span>` : ""}${res ? `<span class="res r${res}">${nufcEsc(L.res[res])}</span>` : ""}</div>
      <div class="match">${nm(home)} <b>${mid}</b> ${nm(away)}</div></li>`;
  }
  render() {
    const L = this.L;
    const evs = (this._events || []).slice().sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const cut = Date.now() - 3 * 3600000;
    const up = evs.filter(e => !nufcDone(e) && Date.parse(e.date) > cut).slice(0, this._config.upcoming);
    const past = evs.filter(nufcDone).slice(-this._config.results).reverse();
    let body = "";
    if (!this._events) body = `<p class="muted">${nufcEsc(this._error ? L.errMatches : L.loadingMatches)}</p>`;
    else {
      body = `<ul>${up.map(e => this._row(e, false)).join("") || `<li class="muted">${nufcEsc(L.noUpcoming)}</li>`}</ul>`;
      if (past.length) body += `<h3>${nufcEsc(L.recent)}</h3><ul>${past.map(e => this._row(e, true)).join("")}</ul>`;
      if (this._config.tv === "se") body += `<p class="muted note">${nufcEsc(L.tvNote)}</p>`;
    }
    this.shell(this.title("matchesTitle"), body, `
      li { padding: 8px 0; border-bottom: 1px solid var(--divider-color); }
      .top { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 0.85em; color: var(--secondary-text-color); }
      .tv { margin-left: auto; }
      .match { margin-top: 2px; }
      h3 { margin: 16px 0 4px; font-size: 1em; font-weight: 500; }
      .res { margin-left: auto; font-weight: 700; padding: 0 6px; border-radius: 4px; color: #fff; }
      .rW { background: #2e7d32; } .rD { background: #757575; } .rL { background: #c62828; }
      .note { margin: 10px 0 0; font-size: 0.8em; }`);
  }
}

// ---------- Squad: Premier League's own squad list (with photos and manager), ESPN roster as fallback ----------
class NufcSquadCard extends NufcBase {
  defaults() { return { refresh_minutes: 720, show_photos: true }; }
  async load() {
    this._players = null; this._coach = "";
    const pl = await this.ensurePl();
    if (pl) try {
      const sq = await nufcGet(`${NUFC_PL_API}/v2/competitions/8/seasons/${nufcPlSeason()}/teams/${this._config.pl_team_id}/squad`);
      const list = sq.players || [];
      if (list.length) this._players = list.map(x => ({ id: x.id, name: (x.name || {}).display || "", short: [((x.name || {}).first || "")[0], (x.name || {}).last].filter(Boolean).join(". "), jersey: x.shirtNum, pos: String(x.position || "")[0], pl: true,
        country: (x.country || {}).country || "", birth: (x.dates || {}).birth || "", height: x.height || "", foot: x.preferredFoot || "" }));
    } catch (e) { /* fall back to ESPN */ }
    if (!this._players) {
      const r = await nufcGet(`${NUFC_API}/site/v2/sports/soccer/${this._config.league}/teams/${this._config.team_id}/roster`);
      this._players = (r.athletes || []).map(a => ({ name: a.displayName, short: a.shortName || a.displayName, jersey: a.jersey, pos: String(((a.position || {}).abbreviation) || ((a.position || {}).name) || "")[0], img: (a.headshot || {}).href }));
      const c = !pl && (r.coach || [])[0];
      if (c) this._coach = [c.firstName, c.lastName].filter(Boolean).join(" ");
    }
    // Season stats for every player (also used by the player pop-up), for the top-scorer lists.
    if (this._players.some(p => p.pl)) {
      this._statCache = this._statCache || {};
      await Promise.all(this._players.filter(p => p.pl && !this._statCache[p.id]).map(p =>
        nufcGet(`${NUFC_PL_API}/v2/competitions/8/seasons/${nufcPlSeason()}/players/${p.id}/stats`).then(r => { this._statCache[p.id] = r.stats || {}; }).catch(() => {})));
    }
    // Manager: from the line-ups of the latest league match on the Premier League's site.
    if (pl) try {
      const evs = await nufcSchedule(this._config.team_id, this._config.competitions);
      const last = evs.filter(e => e._comp === "eng.1" && nufcDone(e)).pop();
      const mid = last && await nufcPlMatchId(last, evs, this._config.pl_team_id, this._config.team_id);
      if (mid) {
        const lu = await nufcGet(`${NUFC_PL_API}/v3/matches/${mid}/lineups`);
        const side = [lu.home_team, lu.away_team].find(t => t && String(t.teamId || t.id || "") === String(this._config.pl_team_id)) || [lu.home_team, lu.away_team].find(t => t && (t.players || []).some(p => this._players.some(q => String(q.id) === String(p.id))));
        const m = side && (side.managers || [])[0];
        if (m) this._coach = [m.firstName, m.lastName].filter(Boolean).join(" ");
      }
    } catch (e) { /* no manager shown */ }
  }
  render() {
    const L = this.L;
    const ath = this._players || [];
    if (!ath.length) { this.shell(this.title("squadTitle"), `<p class="muted">${nufcEsc(this._error ? L.errSquad : L.loadingSquad)}</p>`); return; }
    const initials = n => String(n || "").split(/\s+/).map(x => x[0] || "").slice(0, 2).join("");
    const card = a => {
      let pic = "";
      if (this._config.show_photos) pic = a.pl ? nufcPlPhoto(a.id, a.name) : (a.img ? `<img src="${nufcEsc(a.img)}" alt="" loading="lazy">` : `<div class="ph">${nufcEsc(initials(a.name))}</div>`);
      return `<div class="pl${a.pl ? " click" : ""}" data-id="${nufcEsc(a.id || "")}">${pic}<div class="nr">${nufcEsc(a.jersey || "")}</div><div class="nm">${nufcEsc(a.short || a.name)}</div></div>`;
    };
    if (!this._clickBound) {
      this._clickBound = true;
      this.shadowRoot.addEventListener("click", ev => {
        const path = ev.composedPath();
        const has = c => path.some(el => el.classList && el.classList.contains(c));
        if (has("x") || (has("backdrop") && !has("sheet"))) { this._closeModal(); return; }
        const tile = path.find(el => el.classList && el.classList.contains("pl") && el.classList.contains("click"));
        if (tile) this._openPlayer(tile.dataset.id);
      });
    }
    const top = (key, unit) => {
      const list = ath.filter(a => a.pl && ((this._statCache || {})[a.id] || {})[key] > 0)
        .map(a => ({ a, n: Math.round(this._statCache[a.id][key]) })).sort((x, y) => y.n - x.n).slice(0, 5);
      return list.map((x, i) => `<li><span class="rk">${i + 1}</span><span class="tnm">${nufcEsc(x.a.name)}</span><b>${x.n}</b></li>`).join("");
    };
    const g = top("goals"), as = top("goalAssists");
    const leaders = (g || as) ? `<div class="leaders">${g ? `<div><h3>⚽ ${nufcEsc(L.topScorers)}</h3><ol>${g}</ol></div>` : ""}${as ? `<div><h3>🎯 ${nufcEsc(L.topAssists)}</h3><ol>${as}</ol></div>` : ""}</div>` : "";
    const body = (this._coach ? `<p><b>${nufcEsc(L.coach)}:</b> ${nufcEsc(this._coach)}</p>` : "") + leaders + ["G", "D", "M", "F"].map(k => {
      const list = ath.filter(a => (("GDMF".includes(a.pos) ? a.pos : "M") === k)).sort((x, y) => (parseInt(x.jersey) || 999) - (parseInt(y.jersey) || 999));
      return list.length ? `<h3>${nufcEsc(L.pos[k])}</h3><div class="grid">${list.map(card).join("")}</div>` : "";
    }).join("");
    this.shell(this.title("squadTitle"), body, `
      h3 { margin: 14px 0 6px; font-size: 1em; font-weight: 500; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 10px; }
      .pl { text-align: center; font-size: 0.8em; }
      .pl img, .ph { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; object-position: top; background: var(--secondary-background-color, rgba(127,127,127,0.2)); display: block; margin: 0 auto; }
      .ph { line-height: 56px; font-weight: 600; color: var(--secondary-text-color); }
      .nr { font-weight: 700; margin-top: 3px; } .nm { line-height: 1.2; }
      .pl.click { cursor: pointer; }
      .leaders { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 6px; }
      .leaders ol { list-style: none; margin: 0; padding: 0; font-size: 0.9em; }
      .leaders li { display: flex; gap: 8px; padding: 3px 0; border-bottom: 1px solid var(--divider-color); }
      .leaders .rk { width: 1.2em; color: var(--secondary-text-color); } .leaders .tnm { flex: 1; }
      .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 16px; }
      .sheet { background: var(--card-background-color, var(--ha-card-background, #fff)); color: var(--primary-text-color); border-radius: 16px; width: 100%; max-width: 420px; max-height: 85vh; overflow: auto; padding: 18px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
      .x { position: absolute; top: 8px; right: 10px; background: none; border: 0; font-size: 1.6em; color: var(--secondary-text-color); cursor: pointer; line-height: 1; }
      .ptop { display: flex; gap: 14px; align-items: center; margin-bottom: 12px; }
      .ptop img, .ptop .ph { width: 84px; height: 84px; margin: 0; flex: none; }
      .ptop .ph { line-height: 84px; text-align: center; }
      .pname { font-size: 1.25em; font-weight: 700; }
      .pmeta { color: var(--secondary-text-color); font-size: 0.9em; margin-top: 2px; }
      .sgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
      .sbox { background: var(--secondary-background-color, rgba(127,127,127,0.12)); border-radius: 10px; padding: 8px 4px; text-align: center; }
      .sval { font-size: 1.3em; font-weight: 700; font-variant-numeric: tabular-nums; }
      .slbl { font-size: 0.75em; color: var(--secondary-text-color); }
      .sheet h4 { margin: 4px 0 0; font-weight: 500; }`);
  }
  _closeModal() { const m = this.shadowRoot.querySelector(".backdrop"); if (m) m.remove(); }
  async _openPlayer(id) {
    const L = this.L;
    const a = (this._players || []).find(p => String(p.id) === String(id));
    if (!a) return;
    this._closeModal();
    const wrap = document.createElement("div");
    wrap.className = "backdrop";
    const age = a.birth ? Math.floor((Date.now() - Date.parse(a.birth)) / (365.25 * 86400000)) : null;
    const meta = [L.posOne[a.pos] || "", a.country, age ? L.age(age) : "", a.height ? `${a.height} cm` : ""].filter(Boolean).join(" · ");
    const head = `<button class="x" aria-label="${nufcEsc(L.close)}">×</button><div class="ptop">${nufcPlPhoto(a.id, a.name)}<div><div class="pname">${a.jersey ? `<span class="muted">#${nufcEsc(a.jersey)}</span> ` : ""}${nufcEsc(a.name)}</div><div class="pmeta">${nufcEsc(meta)}</div></div></div><h4>${nufcEsc(L.seasonStats)}</h4>`;
    wrap.innerHTML = `<div class="sheet">${head}<p class="muted">${nufcEsc(L.loadingStats)}</p></div>`;
    this.shadowRoot.appendChild(wrap);
    let html;
    try {
      this._statCache = this._statCache || {};
      const st = this._statCache[id] || (this._statCache[id] = (await nufcGet(`${NUFC_PL_API}/v2/competitions/8/seasons/${nufcPlSeason()}/players/${id}/stats`)).stats || {});
      const keys = Object.keys(L.pstats).filter(k => st[k] != null && !(a.pos === "G" ? ["totalShots", "shotsOnTargetIncGoals", "expectedGoals", "expectedAssists", "keyPassesAttemptAssists", "goals", "goalAssists"] : ["cleanSheets", "goalsConceded", "saves"]).includes(k));
      const fmt = (k, v) => (k === "expectedGoals" || k === "expectedAssists") ? Number(v).toFixed(2) : String(Math.round(Number(v)));
      html = (st.appearances || st.gamesPlayed) && keys.length
        ? `<div class="sgrid">${keys.map(k => `<div class="sbox"><div class="sval">${nufcEsc(fmt(k, st[k]))}</div><div class="slbl">${nufcEsc(L.pstats[k])}</div></div>`).join("")}</div>`
        : `<p class="muted">${nufcEsc(L.noStats)}</p>`;
    } catch (e) { html = `<p class="muted">${nufcEsc(L.noStats)}</p>`; }
    if (wrap.isConnected) wrap.innerHTML = `<div class="sheet">${head}${html}</div>`;
  }
}

// ---------- League table ----------
class NufcTableCard extends NufcBase {
  defaults() { return {}; }
  async load() { this._data = await nufcGet(`${NUFC_API}/v2/sports/soccer/${this._config.league}/standings`); }
  render() {
    const L = this.L;
    const group = this._data && ((this._data.children || [])[0] || this._data);
    const entries = (group && group.standings && group.standings.entries) || [];
    if (!entries.length) { this.shell(this.title("tableTitle"), `<p class="muted">${nufcEsc(this._error ? L.errTable : L.loadingTable)}</p>`); return; }
    const stat = (e, n) => { const s = (e.stats || []).find(x => x.name === n || x.type === n); return s ? (s.displayValue != null ? s.displayValue : s.value) : ""; };
    const rows = entries.map(e => ({ e, rank: parseInt(stat(e, "rank")) || 99 })).sort((a, b) => a.rank - b.rank);
    const n = rows.length;
    const th = L.th.map((h, i) => `<th${i === 1 ? ' class="l"' : ""}>${nufcEsc(h)}</th>`).join("");
    const body = `<table><thead><tr>${th}</tr></thead><tbody>${rows.map(({ e, rank }) => {
      const t = e.team || {};
      const me = String(t.id) === String(this._config.team_id);
      const logo = nufcLogo(t);
      const [eu, rel] = this._config.zones || NUFC_ZONES[this._config.league] || [0, 0];
      const zone = rank <= eu ? "cl" : (rank > n - rel ? "rel" : "");
      return `<tr class="${me ? "me" : ""} ${zone}"><td>${rank}</td><td class="l">${logo ? `<img src="${nufcEsc(logo)}" alt="">` : ""}${nufcEsc(t.shortDisplayName || t.displayName || "")}</td><td>${nufcEsc(stat(e, "gamesPlayed"))}</td><td>${nufcEsc(stat(e, "wins"))}</td><td>${nufcEsc(stat(e, "ties"))}</td><td>${nufcEsc(stat(e, "losses"))}</td><td>${nufcEsc(stat(e, "pointDifferential"))}</td><td><b>${nufcEsc(stat(e, "points"))}</b></td></tr>`;
    }).join("")}</tbody></table><p class="muted note">${nufcEsc(L.tableNote)}</p>`;
    this.shell(this.title("tableTitle"), body, `
      table { width: 100%; border-collapse: collapse; font-size: 0.9em; font-variant-numeric: tabular-nums; }
      th, td { padding: 4px 3px; text-align: center; border-bottom: 1px solid var(--divider-color); }
      th { color: var(--secondary-text-color); font-weight: 500; }
      .l { text-align: left; } td.l { display: flex; align-items: center; gap: 6px; }
      td img { width: 18px; height: 18px; object-fit: contain; }
      tr.me td { background: rgba(255,255,255,0.12); font-weight: 600; }
      tr.cl td:first-child { box-shadow: inset 3px 0 0 #1e88e5; }
      tr.rel td:first-child { box-shadow: inset 3px 0 0 #e53935; }
      .note { margin: 8px 0 0; font-size: 0.8em; }`);
  }
}

// ---------- Visual editor ----------
const NUFC_LEAGUES = [
  ["eng.1", "Premier League (England)"], ["esp.1", "La Liga (Spain)"], ["ita.1", "Serie A (Italy)"], ["ger.1", "Bundesliga (Germany)"],
  ["fra.1", "Ligue 1 (France)"], ["ned.1", "Eredivisie (Netherlands)"], ["por.1", "Primeira Liga (Portugal)"], ["sco.1", "Scottish Premiership"],
  ["swe.1", "Allsvenskan (Sweden)"], ["nor.1", "Eliteserien (Norway)"], ["den.1", "Superliga (Denmark)"], ["usa.1", "MLS (USA)"],
];
const NUFC_TEAM_LISTS = {};
function nufcTeamList(league) {
  if (!NUFC_TEAM_LISTS[league]) NUFC_TEAM_LISTS[league] = nufcLeagueTeams(league)
    .then(ts => ts.map(t => t.displayName).filter(Boolean).sort())
    .catch(e => { delete NUFC_TEAM_LISTS[league]; return []; });
  return NUFC_TEAM_LISTS[league];
}
const NUFC_EDITOR_EXTRA = {
  "team-next-card": [{ name: "weather", selector: { boolean: {} } }],
  "team-fixtures-card": [{ name: "upcoming", selector: { number: { min: 0, max: 30, mode: "box" } } }, { name: "results", selector: { number: { min: 0, max: 30, mode: "box" } } }],
  "team-squad-card": [{ name: "show_photos", selector: { boolean: {} } }],
};
const NUFC_EDITOR_LABELS = {
  sv: { team: "Lag", league: "Liga", language: "Språk", tv: "Tv-kanal i Sverige", title: "Rubrik (tom = standard)", refresh_minutes: "Uppdatering (minuter)", weather: "Visa väder", upcoming: "Antal kommande matcher", results: "Antal resultat", show_photos: "Visa spelarbilder" },
  en: { team: "Team", league: "League", language: "Language", tv: "Swedish TV channel", title: "Title (empty = default)", refresh_minutes: "Refresh (minutes)", weather: "Show weather", upcoming: "Upcoming matches", results: "Results", show_photos: "Show player photos" },
};
class NufcCardEditor extends HTMLElement {
  setConfig(config) { this._config = Object.assign({}, config); this._render(); }
  set hass(h) { this._hass = h; if (this._form) this._form.hass = h; else this._render(); }
  async _render() {
    if (!this._config || !this._hass) return;
    const league = this._config.league || "eng.1";
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = s => { const lang = String((this._hass.locale || {}).language || this._hass.language || "en").startsWith("sv") ? "sv" : "en"; return NUFC_EDITOR_LABELS[lang][s.name] || s.name; };
      this._form.addEventListener("value-changed", ev => {
        const v = Object.assign({}, ev.detail.value);
        // Changing league or team: drop ids found for the old choice so they are looked up again.
        if (v.league !== this._config.league || v.team !== this._config.team) { delete v.team_id; delete v.pl_team_id; if (v.league !== this._config.league) delete v.competitions; }
        Object.keys(v).forEach(k => { if (v[k] === "" || v[k] == null) delete v[k]; });
        this._config = v;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: v }, bubbles: true, composed: true }));
        if (this._teamsFor !== v.league) this._render();
      });
      this.appendChild(this._form);
    }
    this._teamsFor = league;
    const teams = await nufcTeamList(league);
    const tag = String(this._config.type || "").replace("custom:", "").replace(/^nufc-/, "team-");
    this._form.hass = this._hass;
    this._form.data = Object.assign({ team: "Newcastle United", league: "eng.1", language: "auto", tv: "se" }, this._config);
    this._form.schema = [
      { name: "league", selector: { select: { mode: "dropdown", options: NUFC_LEAGUES.map(([value, label]) => ({ value, label })) } } },
      { name: "team", selector: teams.length ? { select: { mode: "dropdown", custom_value: true, options: teams } } : { text: {} } },
      { type: "grid", name: "", schema: [
        { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Auto" }, { value: "sv", label: "Svenska" }, { value: "en", label: "English" }] } } },
        { name: "tv", selector: { select: { mode: "dropdown", options: [{ value: "se", label: "Sverige / Sweden" }, { value: "none", label: "–" }] } } },
      ] },
      { name: "title", selector: { text: {} } },
      ...(NUFC_EDITOR_EXTRA[tag] || []),
      { name: "refresh_minutes", selector: { number: { min: 1, max: 1440, mode: "box" } } },
    ];
  }
}
if (!customElements.get("team-card-editor")) customElements.define("team-card-editor", NufcCardEditor);

// ---------- Registration ----------
const NUFC_CARDS = [
  ["next", NufcNextCard, "Next match", "Next match in any competition, live score, goals, cards, stats, form, head-to-head and weather"],
  ["lineup", NufcLineupCard, "Line-ups", "Starting XIs, substitutes, managers and referee"],
  ["fixtures", NufcFixturesCard, "Matches", "Upcoming matches and latest results with competition and Swedish TV"],
  ["table", NufcTableCard, "Table", "League table with your team highlighted"],
  ["squad", NufcSquadCard, "Squad", "Squad with photos, top scorers and player stats"],
];
window.customCards = window.customCards || [];
for (const [key, cls, name, description] of NUFC_CARDS) {
  const tag = `team-${key}-card`;
  // Main tag, with visual editor and a ready-made default config.
  const main = class extends cls {
    static getConfigElement() { return document.createElement("team-card-editor"); }
    static getStubConfig() { return { team: "Newcastle United", league: "eng.1" }; }
  };
  if (!customElements.get(tag)) customElements.define(tag, main);
  // v1 name, kept so existing dashboards keep working.
  if (!customElements.get(`nufc-${key}-card`)) customElements.define(`nufc-${key}-card`, class extends main {});
  if (!window.customCards.some(c => c.type === tag)) window.customCards.push({ type: tag, name: `Football Team: ${name}`, description , preview: true });
}
console.info("%c FOOTBALL-TEAM-CARDS %c v2.0.0 ", "color:#fff;background:#241f20;font-weight:700", "color:#241f20;background:#fff");
