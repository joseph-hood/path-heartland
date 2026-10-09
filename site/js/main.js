import { createMap } from "./map.js";
import { esc, badge, linkPills, initials, dateParts, dateRange, isPast } from "./util.js";

const load = (name) => fetch(`data/${name}.json`).then((r) => {
  if (!r.ok) throw new Error(`${name}.json: ${r.status}`);
  return r.json();
});

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

  document.getElementById("footer-members").innerHTML = orgs
    .map((o) => `<li><a href="${esc(o.website)}" target="_blank" rel="noopener">${esc(o.name)}</a></li>`)
    .join("");
}

function renderSpeakers(speakers) {
  const grid = document.getElementById("speaker-grid");
  if (!speakers.length) {
    grid.innerHTML = `<div class="empty"><strong>Speaker profiles are on the way</strong>
      We’re building a roster of speakers from across the region. Check back soon.</div>`;
    return;
  }
  grid.innerHTML = speakers.map((s) => `
    <article class="speaker-card">
      ${badge({ logo: s.photo, label: initials(s.name), alt: s.name })}
      <div>
        <h3>${esc(s.name)}</h3>
        <p class="speaker-role">${esc([s.role, s.org].filter(Boolean).join(" · "))}</p>
        <p class="speaker-bio">${esc(s.bio)}</p>
        ${s.topics?.length ? `<ul class="topics">${s.topics.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        ${s.location || s.formats ? `<p class="speaker-meta">${esc([s.location, s.formats].filter(Boolean).join(" · "))}</p>` : ""}
        <div class="link-row">${linkPills(s.links)}</div>
      </div>
    </article>`).join("");
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
  ["speakers", renderSpeakers],
  ["announcements", renderNews],
];
for (const [name, render] of sections) {
  load(name).then(render).catch((err) => console.error(err));
}
