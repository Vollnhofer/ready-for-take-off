// Reise-Vokabeln Unit 3: Buchseite "Word File / More Words and Phrases"
// plus Patricks Vokabelheft (Deutsch zu den Word-File-Ausdrücken).
// Level 1 = leicht, Level 2 = mittel, Level 3 = schwer – je 19 Vokabeln.
const VOKABELN = [
  // Level 1 – Check-in
  { en: "to land", de: "landen", level: 1 },
  { en: "flight", de: "Flug", level: 1 },
  { en: "thirsty", de: "durstig", level: 1 },
  { en: "awake", de: "wach", level: 1 },
  { en: "to sail", de: "segeln", level: 1 },
  { en: "hut", de: "Hütte", level: 1 },
  { en: "journey", de: "Reise", level: 1 },
  { en: "on foot", de: "zu Fuß", level: 1 },
  { en: "to become", de: "werden", level: 1 },
  { en: "impossible", de: "unmöglich", level: 1 },
  { en: "to rent (a car)", de: "(ein Auto) mieten", level: 1 },
  { en: "to fly (back)", de: "zurückfliegen", level: 1 },
  { en: "to drive (home)", de: "(heim)fahren", level: 1 },
  { en: "to sleep in a tent", de: "zelten", level: 1 },
  { en: "to promise", de: "versprechen", level: 1 },
  { en: "lonely", de: "einsam", level: 1 },
  { en: "painful", de: "schmerzhaft", level: 1 },
  { en: "unfortunately", de: "leider", level: 1 },
  { en: "traveller", de: "Reisender/Reisende", level: 1 },

  // Level 2 – Boarding
  { en: "to take off", de: "abheben", level: 2 },
  { en: "to get on (a plane)", de: "(in ein Flugzeug) einsteigen", level: 2 },
  { en: "to get off (the plane)", de: "(aus einem Flugzeug) aussteigen", level: 2 },
  { en: "to get into (a car)", de: "(in ein Auto) einsteigen", level: 2 },
  { en: "to get out of (the car)", de: "(aus einem Auto) aussteigen", level: 2 },
  { en: "it takes (an hour)", de: "es dauert (eine Stunde)", level: 2 },
  { en: "to cross (a river)", de: "(einen Fluss) überqueren", level: 2 },
  { en: "to get lost", de: "sich verirren", level: 2 },
  { en: "curious", de: "neugierig", level: 2 },
  { en: "decision", de: "Entscheidung", level: 2 },
  { en: "experience", de: "Erfahrung", level: 2 },
  { en: "to explore", de: "erkunden, erforschen", level: 2 },
  { en: "explorer", de: "Entdecker/Entdeckerin", level: 2 },
  { en: "departure", de: "Abflug; Abfahrt", level: 2 },
  { en: "wilderness", de: "Wildnis", level: 2 },
  { en: "to recommend", de: "empfehlen", level: 2 },
  { en: "to reach", de: "(er-)reichen", level: 2 },
  { en: "the midday heat", de: "die Mittagshitze", level: 2 },
  { en: "to make a reservation", de: "eine Reservierung vornehmen", level: 2 },

  // Level 3 – Take-off
  { en: "to get to (the airport)", de: "(zum Flughafen) gelangen", level: 3 },
  { en: "to suffer from altitude sickness", de: "(an Höhenkrankheit) leiden", level: 3 },
  { en: "altitude sickness", de: "Höhenkrankheit", level: 3 },
  { en: "to escape (the midday heat)", de: "ausbrechen; fliehen", level: 3 },
  { en: "to set off (for work)", de: "sich (zur Arbeit) auf den Weg machen", level: 3 },
  { en: "to work on (a blog)", de: "an etw. arbeiten", level: 3 },
  { en: "to get close to (nature)", de: "näher kommen", level: 3 },
  { en: "to meet up with (people)", de: "jemanden treffen", level: 3 },
  { en: "to get to know sb./sth.", de: "jdn./etw. näher kennenlernen", level: 3 },
  { en: "to turn out", de: "sich herausstellen", level: 3 },
  { en: "even though", de: "obwohl", level: 3 },
  { en: "all in all", de: "alles in allem", level: 3 },
  { en: "pretty", de: "ziemlich", level: 3 },
  { en: "recently", de: "vor Kurzem, letztens", level: 3 },
  { en: "to note", de: "beachten, feststellen", level: 3 },
  { en: "to fix sth.", de: "etw. beheben, reparieren", level: 3 },
  { en: "to criticise", de: "kritisieren", level: 3 },
  { en: "to behave", de: "verhalten", level: 3 },
  { en: "travelling", de: "Reisen", level: 3 },
];

const LEVELS = [
  { nr: 1, name: "Check-in", hint: "Zum Aufwärmen – die leichten Wörter." },
  { nr: 2, name: "Boarding", hint: "Jetzt wird's kniffliger: einsteigen, aussteigen, verirren …" },
  { nr: 3, name: "Take-off", hint: "Die Profi-Runde. Konzentration!" },
];

// Rang am Ende: Punkte = 57 minus 2 je Fehler. "ab" = Mindestpunkte.
const RAENGE = [
  {
    ab: 51,
    titel: "Profi-Tourist",
    bild: "img/rang-5.svg",
    text: "Hängematte, Palmen, null Stress. Sogar das Kamel trägt Sonnenbrille, nur um so cool zu sein wie du!",
  },
  {
    ab: 41,
    titel: "Weltenbummler",
    bild: "img/rang-4.svg",
    text: "Du segelst locker durch die Welt. Nur die Möwe will noch an deine Pommes.",
  },
  {
    ab: 27,
    titel: "Urlaubs-Entdecker",
    bild: "img/rang-3.svg",
    text: "Du kommst an – meistens sogar am richtigen Ort. Die Ziege auf deinem Selfie war aber nicht geplant.",
  },
  {
    ab: 11,
    titel: "Reise-Neuling",
    bild: "img/rang-2.svg",
    text: "Du hast eine Karte dabei – leider verkehrt herum. Sogar die Schnecke überholt dich gerade.",
  },
  {
    ab: -Infinity,
    titel: "Reise-Chaot",
    bild: "img/rang-1.svg",
    text: "Flieger weg, Koffer explodiert, die Taube klaut dein Sandwich. Aber jeder Profi hat mal so angefangen!",
  },
];
