import { esc, badge, linkPills, initials, load, renderFooterMembers } from "./util.js";

// Sort by last name: "sortName" if given, otherwise the last word of the name.
const sortKey = (s) => (s.sortName ?? s.name.trim().split(/\s+/).at(-1)).toLocaleLowerCase();
const byLastName = (a, b) =>
  sortKey(a).localeCompare(sortKey(b)) || a.name.localeCompare(b.name);

// Everything the search box looks through, lowercased once.
const haystack = (s) => [s.name, s.credentials, s.role, s.org, s.location, s.formats, s.bio, ...(s.topics ?? [])]
  .filter(Boolean).join(" ").toLocaleLowerCase();

const card = (s) => `
  <article class="speaker-card">
    ${badge({ logo: s.photo, label: initials(s.name), alt: s.name })}
    <div>
      <h3>${esc(s.name)}${s.credentials ? `<span class="speaker-creds">, ${esc(s.credentials)}</span>` : ""}</h3>
      <p class="speaker-role">${esc([s.role, s.org].filter(Boolean).join(" · "))}</p>
      ${s.bio ? `<p class="speaker-bio">${esc(s.bio)}</p>` : ""}
      ${s.topics?.length ? `<ul class="topics">${s.topics.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${s.location || s.formats ? `<p class="speaker-meta">${esc([s.location, s.formats].filter(Boolean).join(" · "))}</p>` : ""}
      ${s.links?.length ? `<div class="link-row">${linkPills(s.links)}</div>` : ""}
    </div>
  </article>`;

function renderSpeakers(all) {
  const list = document.getElementById("speaker-list");
  const input = document.getElementById("speaker-search");
  const count = document.getElementById("speaker-count");

  if (!all.length) {
    input.disabled = true;
    list.innerHTML = `<div class="empty"><strong>Speaker profiles are on the way</strong>
      We’re building a roster of speakers from across the region. Check back soon.</div>`;
    return;
  }

  const speakers = all.map((s) => ({ s, text: haystack(s), letter: sortKey(s)[0].toUpperCase() }))
    .sort((a, b) => byLastName(a.s, b.s));

  const show = () => {
    // Every word typed must appear somewhere in the speaker's entry.
    const words = input.value.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const hits = speakers.filter(({ text }) => words.every((w) => text.includes(w)));

    const total = `${speakers.length} speaker${speakers.length === 1 ? "" : "s"}`;
    count.textContent = words.length ? `${hits.length} of ${total} match` : total;

    if (!hits.length) {
      list.innerHTML = `<div class="empty"><strong>No speakers match “${esc(input.value.trim())}”</strong>
        Try a different name, topic, or city.</div>`;
      return;
    }

    let html = "";
    let letter = "";
    for (const hit of hits) {
      if (hit.letter !== letter) {
        if (letter) html += `</div></section>`;
        letter = hit.letter;
        html += `<section class="letter-group"><h2 class="letter">${esc(letter)}</h2><div class="speaker-rows">`;
      }
      html += card(hit.s);
    }
    list.innerHTML = html + `</div></section>`;
  };

  // Let people link straight to a search, e.g. speakers.html?q=harm+reduction
  input.value = new URLSearchParams(location.search).get("q") ?? "";
  input.addEventListener("input", show);
  show();
}

load("speakers").then(renderSpeakers).catch((err) => console.error(err));
load("orgs").then(renderFooterMembers).catch((err) => console.error(err));
