const siteRootUrl = new URL("../", import.meta.url);
const weeklyPoolUrl = new URL("weekly-pool/", siteRootUrl);
weeklyPoolUrl.searchParams.set("v", Date.now().toString(36));
const teamLogoUrl = new URL("assets/team-mac-attack-logo.svg", siteRootUrl).href;

export function renderHeader(target) {
  target.innerHTML = `
    <a class="brand" href="${weeklyPoolUrl.href}" aria-label="Eagles Block Pool home">
      <img src="${teamLogoUrl}" alt="Team Mac Attack" />
      <span><b>Eagles</b> Block Pool</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav" aria-label="Main navigation">
      <a href="#pool-board">The Pool</a>
      <a href="#how-it-works">How It Works</a>
      <a class="site-nav__active" href="${weeklyPoolUrl.href}" aria-current="page">Weekly Pool</a>
      <a href="#support">Support the Cause</a>
      <a class="donate-button" href="#payment"><span aria-hidden="true">♥</span> Donate</a>
    </nav>`;

  const toggle = target.querySelector(".nav-toggle");
  const nav = target.querySelector(".site-nav");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("site-nav--open", !open);
  });
}

export function renderFooter(target) {
  target.innerHTML = `
    <div class="footer-brand">
      <img src="${teamLogoUrl}" alt="Team Mac Attack" />
      <span>All proceeds benefit the National MS Society.</span>
    </div>
    <div class="footer-links">
      <a href="#support">About the fundraiser</a>
      <a href="mailto:pooladmin@example.com">Contact</a>
    </div>`;
}
