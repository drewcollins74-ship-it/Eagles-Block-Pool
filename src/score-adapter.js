/**
 * Local score adapter. The UI only depends on getGameById(), so a live API can
 * replace this module later without changing the pool or winner code.
 */
export class LocalScoreAdapter {
  constructor(sourceUrl = new URL("../data/nfl-scores-test.json", import.meta.url).href) {
    this.sourceUrl = sourceUrl;
  }

  async getGameById(scoreSourceId) {
    const response = await fetch(this.sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Score data could not be loaded.");

    const data = await response.json();
    return data.games.find((game) => game.id === scoreSourceId) ?? null;
  }
}
