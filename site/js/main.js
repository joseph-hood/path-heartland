import { createMap } from "./map.js";
import { esc, badge, linkPills, dateParts, dateRange, isPast, load, renderFooterMembers } from "./util.js";

const orgBadge = (org, logo = org.logo) =>
  badge({ logo, label: org.short, color: org.color, alt: `${org.name} logo` });
const orgPlaces = (org) => org.area ?? org.locations.map((l) => l.name).join(" · ");

function renderPanel(panel, org, li) {
  const loc = org.locations[li] ?? org.locations[0];
  const others = org.locations.length > 1
    ? `<ul>${org.locations.map((l) => `<li>${esc(l.name)}</li>`).join("")}</ul>`
    : "";
  panel.innerHTML = `
    ${orgBadge(org, loc.logo ?? org.logo)}
    <h3>${esc(org.name)}</h3>
    <p class="org-where">${esc(loc.name)}</p>
    <p class="org-desc"><span class="chip">${esc(org.type)}</span><br>${esc(org.description)}</p>
    ${others}
    <div class="link-row">
      <a class="btn btn-primary btn-sm" href="${esc(org.website)}" target="_blank" rel="noopener">Visit website</a>
      ${linkPills(org.links)}
    </div>`;
}

function renderMembers(orgs) {
  const panel = document.getElementById("org-panel");
  const mapEl = document.getElementById("map");
  const map = createMap(mapEl, orgs, (org, li) => {
    map.setActive(org.id, li);
    renderPanel(panel, org, li);
  });

  const grid = document.getElementById("org-grid");
  grid.innerHTML = orgs.map((org) => `
    <article class="org-card">
      <header>
        ${orgBadge(org)}
        <div>
          <h3>${esc(org.name)}</h3>
          <p class="org-where">${esc(orgPlaces(org))}</p>
        </div>
      </header>
      <p>${esc(org.description)}</p>
      <div class="card-actions">
        <a class="pill-link" href="${esc(org.website)}" target="_blank" rel="noopener">Website</a>
        <button class="text-btn" type="button" data-org="${esc(org.id)}">Show on map</button>
      </div>
    </article>`).join("");

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-org]");
    if (!btn) return;
    const org = orgs.find((o) => o.id === btn.dataset.org);
    map.setActive(org.id, 0);
    renderPanel(panel, org, 0);
    mapEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderFooterMembers(orgs);
}

function renderNews(items) {
  const list = document.getElementById("news-list");
  const upcoming = items.filter((i) => !isPast(i))
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.date.localeCompare(b.date));
  const past = items.filter((i) => isPast(i)).sort((a, b) => b.date.localeCompare(a.date));
  list.innerHTML = [...upcoming, ...past].map((item) => {
    const { m, d, y } = dateParts(item.date);
    const pastItem = isPast(item);
    const featured = item.featured && !pastItem;
    return `
      <article class="news-item${pastItem ? " is-past" : ""}${featured ? " is-featured" : ""}">
        <div class="news-date" aria-hidden="true"><span class="m">${m}</span><span class="d">${d}</span><span class="y">${y}</span></div>
        <div>
          <span class="chip">${esc(pastItem ? "Past" : item.tag)}</span>
          <h3>${item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)}</a>` : esc(item.title)}</h3>
          <p class="when">${esc([dateRange(item.date, item.endDate), item.location].filter(Boolean).join(" · "))}</p>
          <p>${esc(item.summary)}</p>
          ${item.links?.length ? `<div class="link-row">${linkPills(item.links)}</div>` : ""}
        </div>
      </article>`;
  }).join("") || `<div class="empty"><strong>Nothing posted yet</strong>Check back soon.</div>`;
}

const sections = [
  ["orgs", renderMembers],
  ["announcements", renderNews],
];
for (const [name, render] of sections) {
  load(name).then(render).catch((err) => console.error(err));
}
