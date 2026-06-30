import { renderFooter, renderHeader } from "./components.js";
import { LocalScoreAdapter } from "./score-adapter.js";

// Resolve from this module instead of the domain root so localhost and a
// repository subpath (for example GitHub Pages) load the same files.
const siteRootUrl = new URL("../", import.meta.url);
const siteUrl = (path) => new URL(path.replace(/^\//, ""), siteRootUrl).href;
const fetchFresh = (url) => fetch(url, { cache: "no-store" });
const weeksIndexUrl = siteUrl("data/weeks/index.json");
const teamsUrl = siteUrl("data/teams.json");
const scoreAdapter = new LocalScoreAdapter(siteUrl("data/nfl-scores-test.json"));

function parseCsv(csv) {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

function formatGameDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York"
  }).format(new Date(value));
}

function weekHref(weekId) {
  const url = new URL("weekly-pool/", siteRootUrl);
  url.searchParams.set("week", weekId);
  return url.href;
}

function renderWeekSwitcher(target, weeks, activeIndex) {
  const activeWeek = weeks[activeIndex];
  const previousWeek = weeks[activeIndex - 1];
  const nextWeek = weeks[activeIndex + 1];

  const navControl = (week, direction, label) => week
    ? `<a class="week-switcher__arrow" href="${weekHref(week.id)}" aria-label="${label}: Week ${week.week} vs. ${week.opponent}">${direction}</a>`
    : `<span class="week-switcher__arrow week-switcher__arrow--disabled" aria-hidden="true">${direction}</span>`;

  target.innerHTML = `
    ${navControl(previousWeek, "←", "Previous pool")}
    <label class="week-switcher__select">
      <span>Browse pool archive</span>
      <select aria-label="Select a weekly pool">
        ${weeks.map((week) => `<option value="${week.id}"${week.id === activeWeek.id ? " selected" : ""}>${week.season} · Week ${week.week} vs. ${week.opponent}</option>`).join("")}
      </select>
    </label>
    ${navControl(nextWeek, "→", "Next pool")}`;

  target.querySelector("select").addEventListener("change", (event) => {
    window.location.assign(weekHref(event.target.value));
  });
}

function renderOpponentMark(target, team) {
  target.style.setProperty("--opponent-color", team.primary_color);
  target.innerHTML = `<img src="${siteUrl(team.logo)}" alt="${team.name} logo" />`;
  target.removeAttribute("aria-hidden");
}

function getWinner(week, score, squares) {
  if (!score || score.status.toLowerCase() !== "final") return null;

  const eaglesLastDigit = Math.abs(score.eagles_score) % 10;
  const opponentLastDigit = Math.abs(score.opponent_score) % 10;

  // The LEFT axis is always Eagles and the TOP axis is always the opponent.
  // Find the grid positions holding those score digits; never reverse the axes.
  const rowIndex = week.eagles_digits.indexOf(eaglesLastDigit);
  const columnIndex = week.opponent_digits.indexOf(opponentLastDigit);
  const square = squares.find(
    (item) => Number(item.row_index) === rowIndex && Number(item.column_index) === columnIndex
  );

  return { eaglesLastDigit, opponentLastDigit, rowIndex, columnIndex, square };
}

function renderScore(target, score, winner, opponentShort) {
  if (!score) {
    target.innerHTML = `<span class="status-pill">Score unavailable</span>`;
    return;
  }

  const final = score.status.toLowerCase() === "final";
  if (!final) {
    target.innerHTML = `
      <div class="score-strip__game">
        <span class="status-pill status-pill--upcoming">This week's game</span>
        <strong>Eagles</strong>
        <span>vs.</span>
        <strong>${opponentShort}</strong>
      </div>
      <div class="winner-callout winner-callout--pregame">
        <span>Board status</span>
        <strong>All 100 squares assigned · Digits locked</strong>
      </div>`;
    return;
  }

  target.innerHTML = `
    <div class="score-strip__game">
      <span class="status-pill${final ? " status-pill--final" : ""}">${score.status}</span>
      <strong>Eagles <em>${score.eagles_score}</em></strong>
      <span>—</span>
      <strong>${opponentShort} <em>${score.opponent_score}</em></strong>
    </div>
    ${winner ? `<div class="winner-callout"><span>Winning square</span><strong>${winner.eaglesLastDigit} / ${winner.opponentLastDigit} · ${winner.square?.participant_name ?? "Unassigned"}</strong></div>` : ""}`;
}

function renderGrid(target, week, squares, winner) {
  const squareLookup = new Map(squares.map((square) => [`${square.row_index}-${square.column_index}`, square]));

  const rows = week.eagles_digits.map((eaglesDigit, rowIndex) => {
    const cells = week.opponent_digits.map((opponentDigit, columnIndex) => {
      const square = squareLookup.get(`${rowIndex}-${columnIndex}`);
      const isWinner = winner?.rowIndex === rowIndex && winner?.columnIndex === columnIndex;
      return `<td class="pool-square${isWinner ? " pool-square--winner" : ""}" data-row="${eaglesDigit}" data-column="${opponentDigit}">
        <span>${square?.participant_name ?? "Available"}</span>
        ${isWinner ? '<small aria-label="Winning square">Winner</small>' : ""}
      </td>`;
    }).join("");

    return `<tr>
      ${rowIndex === 0 ? '<th class="axis-title axis-title--side" rowspan="10" scope="rowgroup"><span>Philadelphia Eagles</span></th>' : ""}
      <th class="digit digit--side" scope="row">${eaglesDigit}</th>
      ${cells}
    </tr>`;
  }).join("");

  target.id = "pool-board";
  target.innerHTML = `
    <thead>
      <tr><th class="corner" colspan="2"></th><th class="axis-title axis-title--top" colspan="10" scope="colgroup">${week.opponent}</th></tr>
      <tr><th class="corner" colspan="2"></th>${week.opponent_digits.map((digit) => `<th class="digit digit--top" scope="col">${digit}</th>`).join("")}</tr>
    </thead>
    <tbody>${rows}</tbody>`;
}

async function initialize() {
  renderHeader(document.querySelector("[data-site-header]"));
  renderFooter(document.querySelector("[data-site-footer]"));

  try {
    const [catalogResponse, teamsResponse] = await Promise.all([
      fetchFresh(weeksIndexUrl),
      fetchFresh(teamsUrl)
    ]);
    if (!catalogResponse.ok) throw new Error("Week archive could not be loaded.");
    if (!teamsResponse.ok) throw new Error("Team data could not be loaded.");

    const catalog = await catalogResponse.json();
    const teams = await teamsResponse.json();
    const weeks = [...catalog.weeks].sort((first, second) => new Date(first.game_date) - new Date(second.game_date));
    if (!weeks.length) throw new Error("No weekly pools are available yet.");

    const requestedWeekId = new URLSearchParams(window.location.search).get("week");
    const requestedIndex = weeks.findIndex((week) => week.id === requestedWeekId);
    // With no week in the URL, always open the newest game in the archive.
    const activeIndex = requestedWeekId && requestedIndex >= 0 ? requestedIndex : weeks.length - 1;
    const activeWeek = weeks[activeIndex];
    renderWeekSwitcher(document.querySelector("[data-week-switcher]"), weeks, activeIndex);

    const weekResponse = await fetchFresh(siteUrl(activeWeek.file));
    if (!weekResponse.ok) throw new Error("Week data could not be loaded.");
    const savedWeek = await weekResponse.json();
    const opponent = teams[savedWeek.opponent_abbreviation]
      ?? Object.values(teams).find((team) => (
        team.name === savedWeek.opponent || team.short_name === savedWeek.opponent_short
      ));
    if (!opponent) {
      throw new Error(`Unknown opponent: ${savedWeek.opponent_abbreviation ?? savedWeek.opponent}.`);
    }

    // The week stores only the opponent abbreviation as its team reference.
    // Display names, colors, and logo paths always come from teams.json.
    const week = {
      ...savedWeek,
      opponent: opponent.name,
      opponent_short: opponent.short_name
    };
    renderOpponentMark(document.querySelector("[data-opponent-mark]"), opponent);

    const [poolResponse, score] = await Promise.all([
      fetchFresh(siteUrl(week.pool_file)),
      scoreAdapter.getGameById(week.score_source_id)
    ]);
    if (!poolResponse.ok) throw new Error("Pool data could not be loaded.");

    const squares = parseCsv(await poolResponse.text());
    if (squares.length !== 100) throw new Error(`Expected 100 squares; found ${squares.length}.`);

    const winner = getWinner(week, score, squares);
    document.querySelector("#page-title").textContent = `Week ${week.week} – Eagles vs. ${week.opponent_short}`;
    const gameDateLabel = week.date_tbd ? "Date and time TBD" : formatGameDate(week.game_date);
    document.querySelector("[data-game-meta]").textContent = `${gameDateLabel} · ${week.location}`;
    renderScore(document.querySelector("[data-score-strip]"), score, winner, week.opponent_short);
    renderGrid(document.querySelector("[data-pool-grid]"), week, squares, winner);
  } catch (error) {
    document.querySelector("[data-score-strip]").innerHTML = `<div class="error-message"><strong>The pool could not be loaded.</strong><span>${error.message}</span></div>`;
  }
}

initialize();
