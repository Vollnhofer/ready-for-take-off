"use strict";

const PUNKTE_RICHTIG = 1;
const PUNKTE_FALSCH = -2;
const LOESUNG_DAUER_MS = 1500;
const MAX_PUNKTE = VOKABELN.length * PUNKTE_RICHTIG;
const ALLE = VOKABELN.map((v, i) => ({ ...v, id: String(i) }));

const el = (id) => document.getElementById(id);

const zustand = {
  runde: 0, // 0..2 = Level 1..3, 3 = 2. Chance
  punkte: 0,
  fehler: 0,
  reihe: [],
  aktuell: 0,
  verpasst: [],
  ersteRichtig: 0,
  zweiteRichtig: 0,
  sperre: false,
};

const istZweiteChance = () => zustand.runde === LEVELS.length;

function mischen(liste) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

function textSicher(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Ablauf: Start, Level, 2. Chance ----------

function spielStarten() {
  Object.assign(zustand, {
    runde: 0, punkte: 0, fehler: 0, verpasst: [], ersteRichtig: 0, zweiteRichtig: 0, sperre: false,
  });
  punkteZeigen();
  el("start").hidden = true;
  el("spiel").hidden = false;
  levelVorstellen();
}

function levelVorstellen() {
  const level = LEVELS[zustand.runde];
  overlayZeigen(`
    <p class="klein">Level ${level.nr} von ${LEVELS.length}</p>
    <h2>${level.name} ✈️</h2>
    <p>${level.hint}</p>
    <p class="klein">${ALLE.filter((v) => v.level === level.nr).length} Wörter</p>
    <button class="knopf gross" data-aktion="runde-los">Los!</button>
  `);
}

function rundeStarten() {
  if (istZweiteChance()) {
    rundeAufbauen(zustand.verpasst, "2. Chance", "Letzte Runde");
  } else {
    const level = LEVELS[zustand.runde];
    rundeAufbauen(ALLE.filter((v) => v.level === level.nr), `Level ${level.nr}`, level.name);
  }
}

function rundeAufbauen(vokabeln, titel, name) {
  zustand.reihe = mischen(vokabeln);
  zustand.aktuell = 0;
  el("level-nr").textContent = titel;
  el("level-name").textContent = name;
  el("englisch").replaceChildren(
    ...mischen(vokabeln).map((v) => {
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "wort";
      knopf.dataset.id = v.id;
      knopf.textContent = v.en;
      return knopf;
    })
  );
  gesuchtZeigen();
  window.scrollTo({ top: 0 });
}

function rundeGeschafft() {
  konfetti(60);
  const war = zustand.runde;
  zustand.runde++;

  if (zustand.runde < LEVELS.length) {
    overlayZeigen(`
      <h2>Level ${LEVELS[war].nr} geschafft! 🎉</h2>
      <p>Du hast gerade</p>
      <p class="gross-zahl">⭐ ${zustand.punkte}</p>
      <p>Punkte. Weiter zu <strong>${LEVELS[zustand.runde].name}</strong>?</p>
      <button class="knopf gross" data-aktion="weiter">Weiter ✈️</button>
    `);
  } else if (istZweiteChance() && zustand.verpasst.length > 0) {
    const anzahl = zustand.verpasst.length;
    overlayZeigen(`
      <h2>Level 3 geschafft! 🎉</h2>
      <p class="gross-zahl">⭐ ${zustand.punkte}</p>
      <p>Jetzt kommt deine <strong>2. Chance</strong>: ${anzahl === 1 ? "das Wort" : `die ${anzahl} Wörter`}, ${anzahl === 1 ? "das" : "die"} vorhin nicht geklappt ${anzahl === 1 ? "hat" : "haben"}.</p>
      <p class="klein">Richtig +1, falsch −2 – danach ist Schluss.</p>
      <button class="knopf gross" data-aktion="runde-los">Los!</button>
    `);
  } else {
    endeZeigen();
  }
}

// ---------- Fragen und Antworten ----------

function gesuchtZeigen() {
  const gesucht = zustand.reihe[zustand.aktuell];
  const box = el("gesucht");
  box.classList.remove("zeigt-loesung");
  box.innerHTML = gesucht ? `<small>Was heißt auf Englisch …</small>${textSicher(gesucht.de)}` : "";
  const anteil = zustand.aktuell / zustand.reihe.length;
  el("balken").style.width = `${Math.round(anteil * 100)}%`;
}

function knopfFuer(id) {
  return el("englisch").querySelector(`.wort[data-id="${id}"]`);
}

function antwortGeklickt(knopf) {
  if (zustand.sperre || knopf.disabled) return;
  const gesucht = zustand.reihe[zustand.aktuell];
  if (!gesucht) return;
  if (knopf.dataset.id === gesucht.id) {
    richtig(knopf);
  } else {
    falsch(knopf, gesucht);
  }
}

function richtig(knopf) {
  knopf.classList.add("fertig");
  knopf.disabled = true;
  punkteAendern(PUNKTE_RICHTIG, knopf);
  if (istZweiteChance()) zustand.zweiteRichtig++;
  else zustand.ersteRichtig++;
  naechstes();
}

// Falsch: angetippt wackelt rot, die Lösung leuchtet auf und wird danach rot gesperrt.
function falsch(knopf, gesucht) {
  zustand.fehler++;
  if (!istZweiteChance()) zustand.verpasst.push(gesucht);
  punkteAendern(PUNKTE_FALSCH, knopf);
  zustand.sperre = true;

  knopf.classList.add("falsch");
  const loesung = knopfFuer(gesucht.id);
  loesung.classList.add("loesung");
  loesung.disabled = true;
  loesung.scrollIntoView({ block: "nearest", behavior: "smooth" });

  const box = el("gesucht");
  box.classList.add("zeigt-loesung");
  box.innerHTML = `<small>Richtig wäre …</small>${textSicher(gesucht.de)} = ${textSicher(gesucht.en)}`;

  setTimeout(() => {
    knopf.classList.remove("falsch");
    loesung.classList.remove("loesung");
    loesung.classList.add("verpasst");
    zustand.sperre = false;
    naechstes();
  }, LOESUNG_DAUER_MS);
}

function naechstes() {
  zustand.aktuell++;
  gesuchtZeigen();
  if (zustand.aktuell === zustand.reihe.length) {
    setTimeout(rundeGeschafft, 600);
  }
}

function punkteAendern(wert, quelle) {
  zustand.punkte += wert;
  punkteZeigen();

  const anzeige = el("punkte");
  anzeige.classList.remove("hoch", "runter");
  void anzeige.offsetWidth; // Animation neu starten
  anzeige.classList.add(wert > 0 ? "hoch" : "runter");

  const rect = quelle.getBoundingClientRect();
  const schwebe = document.createElement("div");
  schwebe.className = `schwebe ${wert > 0 ? "gut" : "schlecht"}`;
  schwebe.textContent = wert > 0 ? `+${wert}` : `−${Math.abs(wert)}`;
  schwebe.style.left = `${rect.left + rect.width / 2}px`;
  schwebe.style.top = `${rect.top - 10}px`;
  document.body.appendChild(schwebe);
  schwebe.addEventListener("animationend", () => schwebe.remove());
}

function punkteZeigen() {
  el("punkte-zahl").textContent = zustand.punkte;
}

// ---------- Ende ----------

function rangFuer(punkte) {
  return RAENGE.find((r) => punkte >= r.ab);
}

function endeZeigen() {
  const rang = rangFuer(zustand.punkte);
  const index = RAENGE.indexOf(rang);
  const stufe = RAENGE.length - index;
  const besser = RAENGE[index - 1];
  const flieger = RAENGE.map((_, i) => `<span class="${i < stufe ? "an" : ""}">✈️</span>`).join("");
  const zweite = zustand.verpasst.length
    ? `<br>In der 2. Chance: ${zustand.zweiteRichtig} von ${zustand.verpasst.length}`
    : "";
  const ansporn = besser
    ? `Mit ${besser.ab - zustand.punkte} Punkten mehr wärst du <strong>${besser.titel}</strong>. Schaffst du das?`
    : "Höchste Stufe! Besser geht's nicht. 🏆";

  overlayZeigen(`
    <p class="klein du-bist">Du bist …</p>
    <h2 class="rang-titel">${rang.titel}!</h2>
    <div class="stufen" aria-label="Stufe ${stufe} von ${RAENGE.length}">${flieger}</div>
    <img class="rang-bild" src="${rang.bild}" alt="Cartoon: ${rang.titel}" width="400" height="300">
    <p>${rang.text}</p>
    <p class="gross-zahl">⭐ ${zustand.punkte} <span class="klein">von ${MAX_PUNKTE}</span></p>
    <p class="klein">Auf Anhieb richtig: ${zustand.ersteRichtig} von ${ALLE.length}${zweite}</p>
    <p>${ansporn}</p>
    <button class="knopf gross" data-aktion="nochmal">Nochmal spielen 🔁</button>
  `, "ende");
}

// ---------- Overlay und Konfetti ----------

function overlayZeigen(html, art = "") {
  el("overlay-inhalt").className = `karte overlay-karte ${art}`;
  el("overlay-inhalt").innerHTML = html;
  el("overlay").hidden = false;
  el("overlay").scrollTop = 0;
  el("overlay-inhalt").querySelector("button")?.focus({ preventScroll: true });
}

function overlaySchliessen() {
  el("overlay").hidden = true;
}

function konfetti(anzahl) {
  const farben = ["#e8457a", "#ffb300", "#40c057", "#339af0", "#be4bdb"];
  const box = el("konfetti");
  for (let i = 0; i < anzahl; i++) {
    const stueck = document.createElement("i");
    stueck.style.left = `${Math.random() * 100}vw`;
    stueck.style.background = farben[i % farben.length];
    stueck.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
    stueck.style.animationDelay = `${Math.random() * 0.4}s`;
    stueck.addEventListener("animationend", () => stueck.remove());
    box.appendChild(stueck);
  }
}

// ---------- Ereignisse ----------

el("los").addEventListener("click", spielStarten);

el("englisch").addEventListener("click", (e) => {
  const knopf = e.target.closest("button.wort");
  if (knopf) antwortGeklickt(knopf);
});

el("overlay").addEventListener("click", (e) => {
  const aktion = e.target.closest("[data-aktion]")?.dataset.aktion;
  if (aktion === "runde-los") {
    overlaySchliessen();
    rundeStarten();
  } else if (aktion === "weiter") {
    levelVorstellen();
  } else if (aktion === "nochmal") {
    overlaySchliessen();
    spielStarten();
  }
});
