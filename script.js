/* ==========================================================
   Samadhi ♡ — script.js
   1 helpers  2 scenes/reveal/parallax  3 particles  4 letter
   5 music  6 games  7 secret  8 final
   ========================================================== */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const HEART = '<svg viewBox="0 0 24 22"><use href="#heart"/></svg>';

/* ---------- 2 · SCENES, REVEAL, PARALLAX ---------- */
const sceneIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  document.body.dataset.scene = e.target.dataset.scene;
  $$(".dock a").forEach(a => a.classList.toggle("on", a.dataset.n === e.target.dataset.nav));
}), { rootMargin: "-50% 0px -50% 0px" });
$$("[data-scene]").forEach(s => sceneIO.observe(s));

const revIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); revIO.unobserve(e.target); }
}), { threshold: 0.25 });
$$(".reveal").forEach(el => revIO.observe(el));

const par = $$("[data-speed]");
let ticking = false;
function parallax() {
  ticking = false;
  if (reduce) return;
  par.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    const off = (r.top + r.height / 2 - innerHeight / 2) * el.dataset.speed;
    el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
  });
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
parallax();

/* ---------- 3 · PARTICLES (hearts, petals, sparkles) ---------- */
const fx = $("#fx"), cx = fx.getContext("2d");
let W, H, parts = [];
function fit() {
  const d = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  fx.width = W * d; fx.height = H * d;
  cx.setTransform(d, 0, 0, d, 0, 0);
}
addEventListener("resize", fit); fit();
const MAX = reduce ? 10 : (W < 600 ? 26 : 48);
function mk(o = {}) {
  const dark = document.body.dataset.scene === "6";
  const kind = o.kind ?? [0, 0, 1, 2, 3][Math.floor(rand(0, 5))];
  return Object.assign({
    kind, x: rand(0, W), y: H + 20, s: rand(6, 16), vy: -rand(.25, .9), vx: rand(-.2, .2),
    r: rand(0, 6), vr: rand(-.02, .02), a: rand(.35, .8), life: 1, t: rand(0, 6),
    c: dark ? ["255,220,240", "255,235,190", "255,255,255"][kind % 3] : ["229,143,174", "249,201,218", "233,198,128", "220,205,243"][Math.floor(rand(0, 4))]
  }, o);
}
function draw(p) {
  cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
  cx.globalAlpha = p.a * Math.min(1, p.life); cx.fillStyle = `rgb(${p.c})`; cx.shadowColor = `rgb(${p.c})`; cx.shadowBlur = 10;
  const s = p.s;
  if (p.kind === 0) { // heart
    cx.beginPath(); cx.moveTo(0, s * .35);
    cx.bezierCurveTo(-s, -s * .4, -s * .5, -s, 0, -s * .35);
    cx.bezierCurveTo(s * .5, -s, s, -s * .4, 0, s * .35); cx.fill();
  } else if (p.kind === 1) { // petal
    cx.beginPath(); cx.ellipse(0, 0, s * .45, s * .8, 0, 0, 6.3); cx.fill();
  } else if (p.kind === 2) { // sparkle
    cx.beginPath(); cx.moveTo(0, -s); cx.quadraticCurveTo(0, 0, s, 0); cx.quadraticCurveTo(0, 0, 0, s);
    cx.quadraticCurveTo(0, 0, -s, 0); cx.quadraticCurveTo(0, 0, 0, -s); cx.fill();
  } else { cx.beginPath(); cx.arc(0, 0, s * .28, 0, 6.3); cx.fill(); }
  cx.restore();
}
function loop() {
  cx.clearRect(0, 0, W, H);
  if (parts.length < MAX && Math.random() < .12) parts.push(mk());
  parts = parts.filter(p => p.y > -30 && p.life > 0);
  parts.forEach(p => {
    p.t += .02; p.x += p.vx + Math.sin(p.t) * .35; p.y += p.vy; p.r += p.vr;
    if (p.burst) { p.vy += .05; p.life -= .014; }
    draw(p);
  });
  requestAnimationFrame(loop);
}
loop();
function burst(x, y, n = 14) { // heart explosion at x,y
  for (let i = 0; i < n; i++) {
    const a = rand(0, 6.3), v = rand(1.5, 4.5);
    parts.push(mk({ kind: i % 3 ? 0 : 2, x, y, s: rand(6, 13), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, a: 1, burst: true }));
  }
}

/* ---------- 4 · LETTER ---------- */
let wi = 0;
$$(".write").forEach(p => {
  p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span style="--d:${wi++ * 170}">${w}</span>`).join(" ");
});
$("#paper").style.setProperty("--sd", (wi * 170 + 1500) + "ms");
for (let i = 0; i < 9; i++) {
  const s = document.createElement("i"); s.className = "petal";
  s.style.cssText = `left:${rand(-4, 100)}%;top:${rand(-4, 100)}%;animation-delay:${-rand(0, 7)}s;transform:scale(${rand(.6, 1.2)})`;
  $("#petals").appendChild(s);
}
// ripple + hearts on glass buttons
document.addEventListener("pointerdown", e => {
  const b = e.target.closest(".ripple, .btn"); if (!b) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
  const s = document.createElement("span"); s.className = "rp";
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  b.classList.add("ripple"); b.appendChild(s); setTimeout(() => s.remove(), 700);
  burst(e.clientX, e.clientY, 10);
});
$("#open").addEventListener("click", () => setTimeout(() => $("#us").scrollIntoView({ behavior: "smooth" }), 350));

/* ---------- 5 · MUSIC ---------- */
// Edit song names here (files: music/s1.mp3 … s6.mp3, art: images/photo1-6.jpeg)
const TITLES = ["Song 1", "Song 2", "Song 3", "Song 4", "Song 5", "Song 6"];
const GLOWS = ["229,143,174", "220,160,220", "233,198,128", "190,170,240", "244,150,180", "240,170,150"];
const audio = new Audio(); audio.preload = "metadata"; audio.volume = .8;
const player = $("#player"); let cur = 0;
const fmt = t => isFinite(t) ? Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0") : "0:00";
TITLES.forEach((t, i) => {
  const b = document.createElement("button"); b.textContent = "♡ " + t; b.dataset.i = i;
  b.onclick = () => load(i, true); $("#songs").appendChild(b);
});
function load(i, play) {
  cur = (i + 6) % 6;
  audio.src = `./music/s${cur + 1}.mp3`;
  $("#songName").textContent = TITLES[cur];
  $("#art").src = `./images/photo${cur + 1}.jpeg`;
  document.documentElement.style.setProperty("--glow", GLOWS[cur]);
  $$("#songs button").forEach((b, k) => b.classList.toggle("on", k === cur));
  $("#seek").value = 0; $("#cur").textContent = "0:00"; $("#dur").textContent = "0:00";
  if (play) audio.play().catch(() => {});
}
load(0, false);
$("#play").onclick = () => audio.paused ? audio.play().catch(() => {}) : audio.pause();
$("#prev").onclick = () => load(cur - 1, true);
$("#next").onclick = () => load(cur + 1, true);
$("#vol").oninput = e => audio.volume = e.target.value;
$("#seek").oninput = e => { if (audio.duration) audio.currentTime = e.target.value / 1000 * audio.duration; };
audio.onplay = audio.onpause = () => {
  player.classList.toggle("playing", !audio.paused);
  $("#play").textContent = audio.paused ? "▶" : "❚❚";
};
audio.ontimeupdate = () => {
  if (audio.duration) $("#seek").value = audio.currentTime / audio.duration * 1000;
  $("#cur").textContent = fmt(audio.currentTime);
};
audio.onloadedmetadata = () => $("#dur").textContent = fmt(audio.duration);
audio.onended = () => load(cur + 1, true);
setInterval(() => { // floating notes + hearts while playing
  if (audio.paused) return;
  const n = document.createElement("span"); n.className = "note";
  n.textContent = ["♪", "♫", "♡"][Math.floor(rand(0, 3))]; n.style.left = rand(8, 90) + "%";
  player.appendChild(n); setTimeout(() => n.remove(), 3300);
}, 700);

/* ---------- 6 · GAMES ---------- */
function openGame(id) {
  $("#gamegrid").classList.add("hide");
  $$(".stage").forEach(s => s.classList.toggle("open", s.id === "g-" + id));
  if (id === "draw") initDraw(); if (id === "catch") startCatch(); if (id === "memory") buildDeck();
  $("#g-" + id).scrollIntoView({ behavior: "smooth", block: "center" });
}
function closeGames() {
  stopCatch(); $$(".stage").forEach(s => s.classList.remove("open"));
  $("#gamegrid").classList.remove("hide"); $("#games").scrollIntoView({ behavior: "smooth" });
}
$$(".gcard").forEach(c => {
  c.onclick = () => openGame(c.dataset.game);
  c.onpointermove = e => { // 3D tilt
    const r = c.getBoundingClientRect();
    c.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 14 + "deg");
    c.style.setProperty("--rx", -((e.clientY - r.top) / r.height - .5) * 14 + "deg");
  };
  c.onpointerleave = () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); };
});
$$("[data-back]").forEach(b => b.onclick = closeGames);

/* --- Drawing --- */
const pad = $("#pad"), pc = pad.getContext("2d");
let tool = "pen", color = "#b04a76", drawing = false, undoStack = [], strokes = 0;
const COLORS = ["#b04a76", "#e58fae", "#8e6bc7", "#d9a441", "#6a2b4a", "#3f9d8a"];
COLORS.forEach((c, i) => {
  const b = document.createElement("button"); b.style.background = c; b.setAttribute("aria-label", "colour " + (i + 1));
  if (!i) b.className = "on";
  b.onclick = () => { color = c; tool = "pen"; sync(); $$("#swatches button").forEach(x => x.classList.toggle("on", x === b)); };
  $("#swatches").appendChild(b);
});
function sync() { $$("[data-tool]").forEach(b => b.classList.toggle("on", b.dataset.tool === tool)); }
$$("[data-tool]").forEach(b => b.onclick = () => { tool = b.dataset.tool; sync(); });
function initDraw() { // size the canvas to its visible box (crisp on phones)
  const r = pad.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
  if (pad.width === Math.round(r.width * d)) return;
  pad.width = r.width * d; pad.height = r.height * d;
  pc.setTransform(d, 0, 0, d, 0, 0); pc.lineCap = pc.lineJoin = "round"; undoStack = [];
}
const pt = e => { const r = pad.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
pad.addEventListener("pointerdown", e => {
  e.preventDefault(); pad.setPointerCapture(e.pointerId); drawing = true;
  undoStack.push(pc.getImageData(0, 0, pad.width, pad.height)); if (undoStack.length > 25) undoStack.shift();
  pc.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
  pc.strokeStyle = color; pc.lineWidth = tool === "eraser" ? 26 : 5;
  const [x, y] = pt(e); pc.beginPath(); pc.moveTo(x, y); pc.lineTo(x + .01, y); pc.stroke();
});
pad.addEventListener("pointermove", e => {
  if (!drawing) return; e.preventDefault();
  const [x, y] = pt(e); pc.lineTo(x, y); pc.stroke(); pc.beginPath(); pc.moveTo(x, y);
});
["pointerup", "pointercancel"].forEach(ev => pad.addEventListener(ev, () => {
  if (!drawing) return; drawing = false;
  if (++strokes === 3) $("#drawMsg").textContent = "මේක මටද? 🥹❤️";
}));
$("#undo").onclick = () => { const s = undoStack.pop(); if (s) pc.putImageData(s, 0, 0); };
$("#clear").onclick = () => {
  undoStack.push(pc.getImageData(0, 0, pad.width, pad.height));
  pc.save(); pc.setTransform(1, 0, 0, 1, 0, 0); pc.clearRect(0, 0, pad.width, pad.height); pc.restore();
};
$("#save").onclick = () => {
  const o = document.createElement("canvas"); o.width = pad.width; o.height = pad.height;
  const c = o.getContext("2d"); c.fillStyle = "#fffdfb"; c.fillRect(0, 0, o.width, o.height); c.drawImage(pad, 0, 0);
  const a = document.createElement("a"); a.download = "for-you.png"; a.href = o.toDataURL("image/png"); a.click();
};

/* --- Catch my hearts --- */
const arena = $("#arena"), toast = $("#toast");
const MSGS = ["Samadhi ❤️", "මගේ favorite person", "මගේ happiness එක", "මට ඔයාව ගොඩක් වටිනවා"];
const GOAL = 12; let caught = 0, spawnN = 0, msgI = 0, cTimer = null;
function startCatch() {
  stopCatch(); caught = spawnN = msgI = 0; $("#score").textContent = `0 / ${GOAL}`;
  $("#catchEnd").hidden = true; toast.classList.remove("on"); $$(".fh", arena).forEach(h => h.remove());
  cTimer = setInterval(spawnHeart, 650);
}
function stopCatch() { clearInterval(cTimer); cTimer = null; }
function spawnHeart() {
  const h = document.createElement("button"), special = ++spawnN % 4 === 0 && msgI < MSGS.length;
  h.className = "fh" + (special ? " gold" : ""); h.innerHTML = HEART; h.setAttribute("aria-label", "heart");
  h.style.cssText = `--s:${special ? 52 : rand(28, 60)}px;left:${rand(2, 88)}%;animation-duration:${rand(4, 7)}s`;
  h.onpointerdown = e => {
    e.preventDefault(); h.classList.add("gone"); setTimeout(() => h.remove(), 400);
    burst(e.clientX, e.clientY, special ? 18 : 7);
    $("#score").textContent = `${++caught} / ${GOAL}`;
    if (special) { toast.textContent = MSGS[msgI++]; toast.classList.add("on"); setTimeout(() => toast.classList.remove("on"), 2200); }
    if (caught >= GOAL) { stopCatch(); setTimeout(() => { $$(".fh", arena).forEach(x => x.remove()); $("#catchEnd").hidden = false; }, 900); }
  };
  h.onanimationend = () => h.remove(); arena.appendChild(h);
}
$("#again").onclick = startCatch;

/* --- Love memory (edit SYMBOLS to change cards; {img} = photo) --- */
const SYMBOLS = [{ img: "photo2" }, { img: "photo4" }, { img: "photo6" }, "♥", "✿", "★", "☾", "♪"];
let open = [], lock = false, matched = 0, moves = 0;
function buildDeck() {
  const deck = $("#deck"); deck.innerHTML = ""; open = []; matched = moves = 0; lock = false;
  $("#memEnd").hidden = true; $("#moves").textContent = "";
  [...SYMBOLS, ...SYMBOLS].map(v => ({ v, k: Math.random() })).sort((a, b) => a.k - b.k).forEach(({ v }) => {
    const c = document.createElement("button"); c.className = "card";
    c.dataset.key = v.img || v;
    c.innerHTML = `<div class="f">${HEART.replace("<svg", '<svg width="34" height="31"')}</div><div class="b">${v.img ? `<img src="./images/${v.img}.jpeg" alt="">` : v}</div>`;
    c.onclick = () => flip(c); deck.appendChild(c);
  });
}
function flip(c) {
  if (lock || c.classList.contains("flip")) return;
  c.classList.add("flip"); open.push(c); if (open.length < 2) return;
  $("#moves").textContent = `· ${++moves} moves`; lock = true;
  const [a, b] = open;
  if (a.dataset.key === b.dataset.key) {
    a.classList.add("done"); b.classList.add("done"); open = []; lock = false;
    const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 12);
    if (++matched === SYMBOLS.length) setTimeout(() => { $("#memEnd").hidden = false; burst(innerWidth / 2, innerHeight / 2, 40); }, 700);
  } else setTimeout(() => { a.classList.remove("flip"); b.classList.remove("flip"); open = []; lock = false; }, 850);
}
$("#memAgain").onclick = buildDeck;

/* ---------- 7 · SECRET HEART ---------- */
$("#secret").onclick = e => {
  const r = e.currentTarget.getBoundingClientRect(); burst(r.left, r.top, 24);
  $("#modal").hidden = false; $("#m2").classList.remove("on");
  setTimeout(() => $("#m2").classList.add("on"), 2200);
};
$("#mClose").onclick = () => $("#modal").hidden = true;

/* ---------- 8 · FINAL CINEMATIC SEQUENCE ---------- */
let played = false;
new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting || played) return; played = true;
  [0, 2600, 5600, 8600, 11800].forEach((t, i) => setTimeout(() => $$(".fl")[i].classList.add("on"), t));
}), { threshold: 0.35 }).observe($(".lines"));
