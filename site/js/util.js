const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

export const load = (name) => fetch(`data/${name}.json`).then((r) => {
  if (!r.ok) throw new Error(`${name}.json: ${r.status}`);
  return r.json();
});

export function renderFooterMembers(orgs) {
  document.getElementById("footer-members").innerHTML = orgs
    .map((o) => `<li><a href="${esc(o.website)}" target="_blank" rel="noopener">${esc(o.name)}</a></li>`)
    .join("");
}

export const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

// Logo when we have one, otherwise a coloured monogram.
export function badge({ logo, label, color, alt = "" }) {
  if (logo) return `<span class="badge has-logo"><img src="${esc(logo)}" alt="${esc(alt)}" loading="lazy"></span>`;
  const style = `--chars:${label.length}` + (color ? `;--c:${esc(color)}` : "");
  return `<span class="badge" style="${style}" aria-hidden="true">${esc(label)}</span>`;
}

export function linkPills(links = []) {
  return links
    .map((l) => `<a class="pill-link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
    .join("");
}

const parseDate = (s) => new Date(s + "T00:00:00Z");
const fmt = (opts) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts });

export function dateParts(s) {
  const d = parseDate(s);
  return { m: fmt({ month: "short" }).format(d), d: d.getUTCDate(), y: d.getUTCFullYear() };
}

export function dateRange(start, end) {
  const a = parseDate(start);
  if (!end) return fmt({ month: "long", day: "numeric", year: "numeric" }).format(a);
  return fmt({ month: "long", day: "numeric", year: "numeric" }).formatRange(a, parseDate(end));
}

export const isPast = (item, today = new Date()) =>
  parseDate(item.endDate || item.date) < new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
