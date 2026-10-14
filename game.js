"use strict";

const PUNKTE_RICHTIG = 1;
const PUNKTE_FALSCH = -2;
const ROT_DAUER_MS = 700;
const MAX_PUNKTE = VOKABELN.length * PUNKTE_RICHTIG;

const el = (id) => document.getElementById(id);

const zustand = {
  levelIndex: 0,
  punkte: 0,
  fehler: 0,
  deutschReihe: [],
  aktuell: 0,
};

function mischen(liste) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

function vokabelnVonLevel(nr) {
  return VOKABELN.filter((v) => v.level === nr);
}

// ---------- Spielstart und Level ----------

function spielStarten() {
  zustand.levelIndex = 0;
  zustand.punkte = 0;
  zustand.fehler = 0;
  punkteZeigen();
  el("start").hidden = true;
  el("spiel").hidden = false;
  levelVorstellen();
}

function levelVorstellen() {
  const level = LEVELS[zustand.levelIndex];
  overlayZeigen(`
    <p class="klein">Level ${level.nr} von ${LEVELS.length}</p>
    <h2>${level.name} ✈️</h2>
    <p>${level.hint}</p>
    <p class="klein">${vokabelnVonLevel(level.nr).length} Wörter</p>
    <button class="knopf gross" data-aktion="level-los">Los!</button>
  `);
}

function levelAufbauen() {
  const level = LEVELS[zustand.levelIndex];
  const paare = vokabelnVonLevel(level.nr).map((v, i) => ({ ...v, id: `${level.nr}-${i}` }));
  zustand.deutschReihe = mischen(paare);
  zustand.aktuell = 0;

  el("level-nr").textContent = `Level ${level.nr}`;
  el("level-name").textContent = level.name;

  const deutsch = el("deutsch");
  deutsch.replaceChildren(
    ...zustand.deutschReihe.map((v) => {
      const li = document.createElement("li");
      li.className = "wort";
      li.dataset.id = v.id;
      li.textContent = v.de;
      return li;
    })
  );

  const englisch = el("englisch");
  englisch.replaceChildren(
    ...mischen(paare).map((v) => {
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "wort";
      knopf.dataset.id = v.id;
      knopf.textContent = v.en;
      return knopf;
    })
  );

  aktuellesMarkieren();
  window.scrollTo({ top: 0 });
}

function aktuellesMarkieren() {
  const gesucht = zustand.deutschReihe[zustand.aktuell];
  document.querySelectorAll("#deutsch .wort").forEach((li) => {
    li.classList.toggle("aktuell", gesucht !== undefined && li.dataset.id === gesucht.id);
  });
  el("gesucht").innerHTML = gesucht
    ? `<small>Was heißt auf Englisch …</small>${textSicher(gesucht.de)}`
    : "";
  const anteil = zustand.aktuell / zustand.deutschReihe.length;
  el("balken").style.width = `${Math.round(anteil * 100)}%`;
}

// ---------- Antworten ----------

function antwortGeklickt(knopf) {
  if (knopf.classList.contains("fertig")) return;
  const gesucht = zustand.deutschReihe[zustand.aktuell];
  if (!gesucht) return;

  if (knopf.dataset.id === gesucht.id) {
    richtig(knopf, gesucht);
  } else {
    falsch(knopf);
  }
}

function richtig(knopf, gesucht) {
  knopf.classList.remove("falsch");
  knopf.classList.add("fertig");
  knopf.disabled = true;
  document.querySelector(`#deutsch .wort[data-id="${gesucht.id}"]`).classList.add("fertig");
  punkteAendern(PUNKTE_RICHTIG, knopf);

  zustand.aktuell++;
  aktuellesMarkieren();
  if (zustand.aktuell === zustand.deutschReihe.length) {
    setTimeout(levelGeschafft, 500);
  }
}

function falsch(knopf) {
  zustand.fehler++;
  punkteAendern(PUNKTE_FALSCH, knopf);
  knopf.classList.remove("falsch");
  void knopf.offsetWidth; // Animation neu starten, wenn derselbe Knopf schnell zweimal getippt wird
  knopf.classList.add("falsch");
  clearTimeout(knopf._rotTimer);
  knopf._rotTimer = setTimeout(() => knopf.classList.remove("falsch"), ROT_DAUER_MS);
}

function punkteAendern(wert, quelle) {
  zustand.punkte += wert;
  punkteZeigen();

  const anzeige = el("punkte");
  const klasse = wert > 0 ? "hoch" : "runter";
  anzeige.classList.remove("hoch", "runter");
  void anzeige.offsetWidth;
  anzeige.classList.add(klasse);

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

// ---------- Level geschafft und Ende ----------

function levelGeschafft() {
  konfetti(60);
  const istLetztes = zustand.levelIndex === LEVELS.length - 1;
  if (istLetztes) {
    endeZeigen();
    return;
  }
  const naechstes = LEVELS[zustand.levelIndex + 1];
  overlayZeigen(`
    <h2>Level ${LEVELS[zustand.levelIndex].nr} geschafft! 🎉</h2>
    <p>Du hast gerade</p>
    <p class="gross-zahl">⭐ ${zustand.punkte}</p>
    <p>Punkte. Weiter zu <strong>${naechstes.name}</strong>?</p>
    <button class="knopf gross" data-aktion="weiter">Weiter ✈️</button>
  `);
}

function rangFuer(punkte) {
  return RAENGE.find((r) => punkte >= r.ab);
}

function endeZeigen() {
  const rang = rangFuer(zustand.punkte);
  const stufe = RAENGE.length - RAENGE.indexOf(rang);
  const besser = RAENGE[RAENGE.indexOf(rang) - 1];
  const sterne = RAENGE.map((_, i) => `<span class="${i < stufe ? "an" : ""}">✈️</span>`).join("");
  const fehlerText = zustand.fehler === 1 ? "1 Fehler" : `${zustand.fehler} Fehler`;
  const ansporn = besser
    ? `Mit ${besser.ab - zustand.punkte} Punkten mehr wärst du <strong>${besser.titel}</strong>. Schaffst du das?`
    : "Höchste Stufe! Besser geht's nicht. 🏆";

  overlayZeigen(`
    <p class="klein">Du bist …</p>
    <h2 class="rang-titel">${rang.titel}!</h2>
    <div class="stufen" aria-label="Stufe ${stufe} von ${RAENGE.length}">${sterne}</div>
    <img class="rang-bild" src="${rang.bild}" alt="Cartoon: ${rang.titel}" width="400" height="300">
    <p>${rang.text}</p>
    <p class="gross-zahl">⭐ ${zustand.punkte} <span class="klein">von ${MAX_PUNKTE}</span></p>
    <p class="klein">${fehlerText}</p>
    <p>${ansporn}</p>
    <button class="knopf gross" data-aktion="nochmal">Nochmal spielen 🔁</button>
  `);
}

// ---------- Overlay und Konfetti ----------

function overlayZeigen(html) {
  el("overlay-inhalt").innerHTML = html;
  el("overlay").hidden = false;
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

function textSicher(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Ereignisse ----------

el("los").addEventListener("click", spielStarten);

el("englisch").addEventListener("click", (e) => {
  const knopf = e.target.closest("button.wort");
  if (knopf) antwortGeklickt(knopf);
});

el("overlay").addEventListener("click", (e) => {
  const aktion = e.target.closest("[data-aktion]")?.dataset.aktion;
  if (aktion === "level-los") {
    overlaySchliessen();
    levelAufbauen();
  } else if (aktion === "weiter") {
    zustand.levelIndex++;
    levelVorstellen();
  } else if (aktion === "nochmal") {
    overlaySchliessen();
    spielStarten();
  }
});
