document.addEventListener("DOMContentLoaded", function () {
  const app = document.getElementById("app");
  // generate current date in format yyyy-mm-d
  const date = new Date(); // Current date
  // Get the time in milliseconds since Unix epoch and convert to days
  const absoluteDays = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const random = new RNG(absoluteDays);
  generatePractice(app, random);
});

const MAJOR_INTERVALS = [2, 2, 1, 2, 2, 2, 1];
const MINOR_INTERVALS = [2, 1, 2, 2, 1, 2, 2];

const INTERVAL_TYPES = {
  A2: 3,
  W: 2,
  H: 1,
};

const INTERVALS_TYPES_INVERSE = Object.entries(INTERVAL_TYPES).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

const intervalsToString = (intervals) => {
  return intervals.map((i) => INTERVALS_TYPES_INVERSE[i]).join(" - ");
};

const formatNote = (note) => {
  return note.replace("b", "♭").replace("#", "♯");
};

const SCALES = {
  Major: {
    shortcut: "Major",
    intervals: MAJOR_INTERVALS,
    startNote: "C",
    startKey: "C",
    description:
      'The <b>major scale</b> (or <a href="https://en.wikipedia.org/wiki/Ionian_mode" title="Ionian mode">Ionian mode</a>) is one of the most commonly used <a href="https://en.wikipedia.org/wiki/Scale_(music)" title="Scale (music)">musical scales</a>, especially in <a href="https://en.wikipedia.org/wiki/Western_culture#Music" title="Western culture">Western music</a>. It is one of the <a href="https://en.wikipedia.org/wiki/Diatonic_scale" title="Diatonic scale">diatonic scales</a>. Like many musical scales, it is made up of seven <a href="https://en.wikipedia.org/wiki/Musical_note" title="Musical note">notes</a>: the eighth duplicates the first at double its <a href="https://en.wikipedia.org/wiki/Frequency" title="Frequency">frequency</a> so that it is called a higher <a href="https://en.wikipedia.org/wiki/Octave" title="Octave">octave</a> of the same note (from Latin "octavus", the eighth).',
    url: "https://en.wikipedia.org/wiki/Major_scale",
  },
  Minor: {
    shortcut: "Minor",
    intervals: MINOR_INTERVALS,
    startNote: "C",
    startKey: "Eb",
    description:
      'The <b>Aeolian mode</b> is a <a href="https://en.wikipedia.org/wiki/Mode_(music)" title="Mode (music)">musical mode</a> or, in modern usage, a <a href="https://en.wikipedia.org/wiki/Diatonic_scale" title="Diatonic scale">diatonic scale</a> also called the <a href="https://en.wikipedia.org/wiki/Natural_minor_scale" class="mw-redirect" title="Natural minor scale">natural minor scale</a>. On the white piano keys, it is the scale that starts with A. Its ascending <a href="https://en.wikipedia.org/wiki/Musical_interval" class="mw-redirect" title="Musical interval">interval form</a> consists of a <i>key note, whole step, half step, whole step, whole step, half step, whole step, whole step.</i> That means that, in A aeolian (or A minor), you would play A, move up a whole step (two piano keys) to B, move up a half step (one piano key) to C, then up a whole step to D, a whole step to E, a half step to F, a whole step to G, and a final whole step to a high A.\n' +
      "</p>",
    url: "https://en.wikipedia.org/wiki/Minor_scale#Natural_minor_scale",
  },
};
const SCALES_ARRAY = Object.keys(SCALES);
const ALL_KEYS = {
  C: { root_index: 0, int_val: 0, accidentals: [] },
  Db: {
    root_index: 1,
    int_val: 1,
    accidentals: ["Bb", "Eb", "Ab", "Db", "Gb"],
    equivalent: "C#",
  },
  D: { root_index: 1, int_val: 2, accidentals: ["F#", "C#"] },
  Eb: { root_index: 2, int_val: 3, accidentals: ["Bb", "Eb", "Ab"], equivalent: "D#" },
  E: { root_index: 2, int_val: 4, accidentals: ["F#", "C#", "G#", "D#"] },
  F: { root_index: 3, int_val: 5, accidentals: ["Bb"] },
  "F#": {
    root_index: 3,
    int_val: 6,
    accidentals: ["F#", "C#", "G#", "D#", "A#", "E#"],
  },
  G: { root_index: 4, int_val: 7, accidentals: ["F#"] },
  Ab: { root_index: 5, int_val: 8, accidentals: ["Bb", "Eb", "Ab", "Db"], equivalent: "G#" },
  A: { root_index: 5, int_val: 9, accidentals: ["F#", "C#", "G#"] },
  Bb: { root_index: 6, int_val: 10, accidentals: ["Bb", "Eb"], equivalent: "A#" },
  B: {
    root_index: 6,
    int_val: 11,
    accidentals: ["F#", "C#", "G#", "D#", "A#"],
  },
};

const NOTES_NEXT = {
  Cbb: ["Cb", "Dbb", "Db"],
  Cb: ["Dbb", "Db", "D"],
  C: ["Db", "D", "D#"],
  "C#": ["D", "D#", "D##"],
  "C##": ["D#", "D##", "F"],

  Dbb: ["Db", "Ebb", "Eb"],
  Db: ["Ebb", "Eb", "E"],
  D: ["Eb", "E", "E#"],
  "D#": ["E", "E#", "E##"],
  "D##": ["E#", "E##", "F#"],

  Ebb: ["Eb", "Fb", "F"],
  Eb: ["Fb", "F", "F#"],
  E: ["F", "F#", "F##"],
  "E#": ["F#", "F##", "G#"],
  "E##": ["F##", "G#", "A"],

  Fbb: ["Fb", "F", "Gb"],
  Fb: ["Gbb", "Gb", "G"],
  F: ["Gb", "G", "G#"],
  "F#": ["G", "G#", "G##"],
  "F##": ["G#", "A", "A#"],

  Gbb: ["Gb", "Abb", "Ab"],
  Gb: ["Abb", "Ab", "A"],
  G: ["Ab", "A", "A#"],
  "G#": ["A", "A#", "A##"],
  "G##": ["A#", "B", "C"],

  Abb: ["Bbb", "Bb", "B"],
  Ab: ["Bbb", "Bb", "B"],
  A: ["Bb", "B", "B#"],
  "A#": ["B", "B#", "C#"],
  "A##": ["C", "C#", "D"],

  Bbb: ["Bb", "B", "C"],
  Bb: ["Cb", "C", "C#"],
  B: ["C", "C#", "C##"],
  "B#": ["C#", "C##", "D#"],
};

const ALL_KEYS_ARRAY = Object.keys(ALL_KEYS);

const isFlat = (note) => note.slice(1, 2) === "b";

const isSharp = (note) => note.slice(1, 2) === "#";

const generatePractice = (app, random) => {
  app.innerHTML = "";

  const keyIndex = random.nextRange(0, ALL_KEYS_ARRAY.length);
  const scale = random.nextFloat() > 0.2 ? "Major" : "Minor";
  console.log("keyIndex:", keyIndex, "scale:", scale);
  const h2Scale = document.createElement("h2");
  h2Scale.innerHTML = "Scale";
  app.appendChild(h2Scale);
  const scaleSheet = generateScaleSheet(scale, keyIndex);
  app.appendChild(scaleSheet);
};

const generateScaleSheet = (scale, index) => {
  const { shortcut, startNote, intervals, startKey } = SCALES[scale];
  const relativeIndex = ALL_KEYS[startKey].int_val + index;
  const key = getKey(relativeIndex);
  const { accidentals } = ALL_KEYS[key];
  let firstNote = safeArrayAccess(ALL_KEYS_ARRAY, index + ALL_KEYS[startNote].int_val);
  const octave = ALL_KEYS[firstNote].int_val > 4 ? 3 : 4;

  if (isFlat(firstNote) && accidentals.some(isSharp)) {
    firstNote = ALL_KEYS[firstNote].equivalent;
  }

  const musicSheetDiv = document.createElement("div");

  musicSheetDiv.classList.add("music-sheet");
  const renderer = new Renderer(musicSheetDiv, Renderer.Backends.SVG);
  const context = renderer.getContext();
  renderer.resize(600, 200);
  const stave = new Stave(0, 25, 600);
  stave.addClef("treble").addKeySignature(key).setContext(context).draw();
  const notes = generatesScale(firstNote, intervals, accidentals, octave);
  if (shortcut) {
    const title = document.createElement("div");
    title.innerHTML = `${formatNote(firstNote)} ${shortcut}`;
    title.style.position = "absolute";
    musicSheetDiv.insertBefore(title, musicSheetDiv.firstChild);
  }
  Formatter.FormatAndDraw(context, stave, notes);
  return musicSheetDiv;
};

const { Renderer, Stave, Stem, StaveNote, Accidental, Formatter, Voice } = Vex.Flow;

function parseNote(note) {
  return {
    noteLetter: note.slice(0, 1),
    accidental: note.slice(1),
  };
}

const generatesScale = (firstNote, intervals, accidentals, octave) => {
  let note = firstNote;
  const notes = [];
  for (let i = 0; i < 15; i++) {
    const { noteLetter, accidental } = parseNote(note);
    const staveNote = new StaveNote({
      keys: [`${noteLetter}/${octave}`],
      duration: "w",
    });
    if (!accidentals.includes(note)) {
      if (accidental) {
        staveNote.addModifier(new Accidental(accidental));
      } else {
        if (accidentals.includes(`${note}b`) || accidentals.includes(`${note}#`)) {
          staveNote.addModifier(new Accidental("n"));
        }
      }
    }
    notes.push(staveNote);

    const interval = safeArrayAccess(intervals, i);
    const nextNote = NOTES_NEXT[note][interval - 1];
    const nextNoteLetter = nextNote.slice(0, 1);
    if ((noteLetter === "B" || noteLetter === "A") && (nextNoteLetter === "C" || nextNoteLetter === "D")) {
      octave++;
    }
    note = nextNote;
  }
  return notes;
};

const mod = (input, n) => ((input % n) + n) % n;
const safeArrayAccess = (array, index) => array[mod(index, array.length)];
const getKey = (index) => safeArrayAccess(ALL_KEYS_ARRAY, index);

/**
 * RNG (Random Number Generator) class using a Linear Congruential Generator (LCG).
 */
class RNG {
  /**
   * Creates an instance of RNG.
   * @param {string|number} seed - The seed for the RNG. Can be a string or a number.
   */
  constructor(seed) {
    // LCG using GCC's constants
    this.m = 0x80000000; // 2**31
    this.a = 1103515245;
    this.c = 12345;

    if (typeof seed === "string") {
      this.state = this.hashString(seed) % this.m;
    } else {
      this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    }
  }

  /**
   * Hashes a string to produce a numeric seed.
   * @param {string} str - The input string to hash.
   * @returns {number} - A hashed numeric value.
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this.m;
    }
    return hash;
  }

  /**
   * Generates the next integer in the sequence.
   * @returns {number} - The next integer.
   */
  nextInt() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
  }

  /**
   * Generates the next float in the range [0, 1].
   * @returns {number} - A float between 0 and 1.
   */
  nextFloat() {
    return this.nextInt() / (this.m - 1);
  }

  /**
   * Generates a random integer in the specified range [start, end).
   * @param {number} start - The inclusive start of the range.
   * @param {number} end - The exclusive end of the range.
   * @returns {number} - A random integer within the range.
   */
  nextRange(start, end) {
    const rangeSize = end - start;
    const randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
  }

  /**
   * Chooses a random element from an array.
   * @param {Array} array - The array to choose from.
   * @returns {*} - A random element from the array.
   */
  choice(array) {
    return array[this.nextRange(0, array.length)];
  }
}
