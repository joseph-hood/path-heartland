import geo from "./map-geometry.js";
import { esc } from "./util.js";

const SVG_NS = "http://www.w3.org/2000/svg";
// On-screen marker diameter in CSS px, kept constant as the map scales.
const badgePx = (width) => (width < 520 ? 28 : 36);

const STATE_LABELS = [
  { name: "Kansas", lat: 38.55, lng: -98.6 },
  { name: "Oklahoma", lat: 35.45, lng: -97.6 },
  { name: "Missouri", lat: 38.2, lng: -92.2 },
  { name: "Arkansas", lat: 35.55, lng: -91.7 },
];

export function project(lat, lng) {
  const { minLon, maxLat, kx, scale, pad } = geo.projection;
  return [pad + (lng - minLon) * kx * scale, pad + (maxLat - lat) * scale];
}

// Push overlapping markers apart so co-located or nearby groups stay clickable.
function relax(points, r) {
  const min = r * 2.15;
  for (let iter = 0; iter < 200; iter++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d >= min) continue;
        if (d < 1e-3) {
          const ang = j * 2.39996;
          dx = Math.cos(ang); dy = Math.sin(ang); d = 1;
        }
        const push = (min - d) / 2;
        a.x -= (dx / d) * push; a.y -= (dy / d) * push;
        b.x += (dx / d) * push; b.y += (dy / d) * push;
        moved = true;
      }
    }
    for (const p of points) {
      p.x += (p.x0 - p.x) * 0.02;
      p.y += (p.y0 - p.y) * 0.02;
      p.x = Math.min(geo.width - r, Math.max(r, p.x));
      p.y = Math.min(geo.height - r, Math.max(r, p.y));
    }
    if (!moved) break;
  }
}

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

export function createMap(container, orgs, onSelect) {
  const svg = el("svg", { viewBox: `0 0 ${geo.width} ${geo.height}` });
  const land = el("g", {}, svg);
  for (const s of geo.states) el("path", { d: s.d, class: "state" }, land).appendChild(
    Object.assign(el("title"), { textContent: s.name })
  );
  for (const l of STATE_LABELS) {
    const [x, y] = project(l.lat, l.lng);
    el("text", { x, y, class: "state-label" }, land).textContent = l.name;
  }
  const overlay = el("g", {}, svg);
  container.appendChild(svg);

  const points = orgs.flatMap((org) =>
    org.locations.map((loc, li) => {
      const [x, y] = project(loc.lat, loc.lng);
      return { org, loc, li, x0: x, y0: y };
    })
  );

  let active = null; // { id, li }

  function render() {
    const width = svg.getBoundingClientRect().width || geo.width;
    const r = (badgePx(width) / 2) * (geo.width / width);
    for (const p of points) { p.x = p.x0; p.y = p.y0; }
    relax(points, r);

    overlay.replaceChildren();
    const leaders = el("g", {}, overlay);
    const markers = el("g", {}, overlay);
    for (const p of points) {
      if (Math.hypot(p.x - p.x0, p.y - p.y0) > r * 0.4) {
        el("line", { x1: p.x0, y1: p.y0, x2: p.x, y2: p.y, class: "leader" }, leaders);
        el("circle", { cx: p.x0, cy: p.y0, r: r * 0.16, class: "pin" }, leaders);
      }

      const { org, loc, li } = p;
      const g = el("g", {
        class: "marker",
        tabindex: 0,
        role: "button",
        "aria-label": `${org.name} — ${loc.name}`,
        "data-org": org.id,
        transform: `translate(${p.x} ${p.y})`,
      }, markers);
      el("title", {}, g).textContent = `${org.name} — ${loc.name}`;
      // Opaque base so a dimmed marker never shows leader lines through it.
      el("circle", { r, class: "marker-base" }, g);
      const body = el("g", { class: "marker-body" }, g);
      el("circle", { r, class: "marker-ring", style: `fill:${org.color}` }, body);
      if (org.logo) {
        const clipId = `clip-${org.id}-${li}`;
        el("circle", { r: r * 0.86 }, el("clipPath", { id: clipId }, body));
        el("circle", { r: r * 0.86, fill: "#fff" }, body);
        el("image", {
          href: org.logo, x: -r * 0.86, y: -r * 0.86, width: r * 1.72, height: r * 1.72,
          "clip-path": `url(#${clipId})`, preserveAspectRatio: "xMidYMid meet",
        }, body);
      } else {
        const size = Math.min(r * 0.7, (r * 1.45) / (org.short.length * 0.66));
        el("text", { class: "marker-text", "font-size": size }, body).textContent = org.short;
      }
      const pick = () => onSelect(org, li);
      g.addEventListener("click", pick);
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
      });
    }
    paintActive();
  }

  function paintActive() {
    for (const g of overlay.querySelectorAll(".marker")) {
      const on = active && g.dataset.org === active.id;
      g.classList.toggle("is-active", !!on);
      g.classList.toggle("is-dim", !!active && !on);
      if (on) g.parentNode.appendChild(g); // draw selected markers on top
    }
  }

  let frame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
  }).observe(container);
  render();

  return {
    setActive(id, li) { active = id ? { id, li } : null; paintActive(); },
  };
}
