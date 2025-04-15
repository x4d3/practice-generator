import { RNG } from "./rng.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");
  const dayIndex = dateToIndex(new Date());
  await new PracticeGenerator(app, dayIndex).generate();
});

const DAY_OFFSET = 20000;
const DAY_IN_SECONDS = 1000 * 60 * 60 * 24;
const dateToIndex = (date) => {
  return Math.floor(date.getTime() / DAY_IN_SECONDS) - DAY_OFFSET;
};

const indexToDate = (index) => {
  return new Date(index + DAY_OFFSET) * DAY_IN_SECONDS;
};

const STORAGE_KEY = "practice-generator-progress-v1";

class Progress {
  constructor() {
    this.progress = {};
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized) {
      for (const item of serialized.split(",")) {
        const [key, value] = item.split(":").map((v) => parseInt(v, 10));
        this.progress[key] = value;
      }
    }
  }

  isDone(dayIndex, exerciseIndex) {
    const mask = 1 << exerciseIndex;
    return (this.progress[dayIndex] & mask) !== 0;
  }

  markDone(dayIndex, exerciseIndex, done) {
    const mask = 1 << exerciseIndex;
    if (done) {
      this.progress[dayIndex] |= mask;
    } else {
      this.progress[dayIndex] &= ~mask;
    }
    this.saveProgress();
  }

  saveProgress() {
    const serialized = Object.entries(this.progress)
      .map(([key, value]) => `${key}:${value}`)
      .join(",");
    localStorage.setItem(STORAGE_KEY, serialized);
  }
}

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

class IndexIterator {
  constructor() {
    this.index = 0;
  }

  next() {
    return this.index++;
  }
}

class PracticeGenerator {
  constructor(container, dayIndex) {
    this.container = container;
    this.dayIndex = dayIndex;
    this.random = new RNG(dayIndex);
    this.progress = new Progress();
    this.indexIterator = new IndexIterator();
  }

  async generate() {
    this.container.innerHTML = "";
    this.addButton("🎲 Randomize", async () => await this.generate());
    this.addSimpleButBeautiful();
    this.addScale();
    await this.addExcerpt();
  }

  addSimpleButBeautiful() {
    this.addTitle("Simple but Beautiful");
    const keyIndex = this.random.nextRange(0, ALL_KEYS_ARRAY.length);
    this.container.appendChild(generateSimpleButBeautiful(keyIndex));
    this.addProgressCheckbox();
  }

  addScale() {
    const keyIndex = this.random.nextRange(0, ALL_KEYS_ARRAY.length);
    const scale = this.random.nextFloat() > 0.2 ? "Major" : "Minor";
    this.addTitle("Scale");
    this.container.appendChild(generateScaleSheet(scale, keyIndex));
    this.addProgressCheckbox();
  }

  async addExcerpt() {
    this.addTitle("Excerpt");
    this.addProgressCheckbox();
    const div = document.createElement("div");
    div.innerHTML = `
        <div class="loading">
          <span class="loader"></span>
        </div>
  `;
    this.container.appendChild(div);
    await generateExcerpt(div, this.random);
  }

  addTitle(title) {
    const h2 = document.createElement("h2");
    h2.textContent = title;
    this.container.appendChild(h2);
  }

  addProgressCheckbox() {
    const { container, indexIterator, dayIndex, progress } = this;
    const exerciseIndex = indexIterator.next();

    const checkbox = document.createElement("input");
    checkbox.style.float = "right";
    checkbox.type = "checkbox";
    checkbox.checked = progress.isDone(dayIndex, exerciseIndex);
    checkbox.onclick = () => {
      progress.markDone(dayIndex, exerciseIndex, checkbox.checked);
    };
    container.appendChild(checkbox);
  }

  addButton(title, callback) {
    const button = document.createElement("button");
    button.textContent = title;
    button.onclick = callback;
    this.container.appendChild(button);
  }
}

const generateSimpleButBeautiful = (index) => {
  const { shortcut, startNote, startKey } = SCALES.Major;
  const relativeIndex = ALL_KEYS[startKey].int_val + index;
  const key = getKey(relativeIndex);
  const firstNote = safeArrayAccess(ALL_KEYS_ARRAY, index + ALL_KEYS[startNote].int_val);

  let shift = ALL_KEYS[getKey(index)].root_index;
  if (shift > 4) {
    shift -= 7;
  }
  const indexes = [0, -1, -2, -1, 0, 1, 2, 3, 4, 3, 2, 1, 0, -1, -2, -1, 0].map((i) => shift + i);

  const notes = indexes.map((index) => {
    const octave = Math.floor(index / 7) + 4;
    const noteLetter = safeArrayAccess(NOTES, index);
    return new StaveNote({
      keys: [`${noteLetter}/${octave}`],
      duration: "8",
    });
  });
  const beams = [new Beam(notes)];
  const annotation = `${formatNote(firstNote)} ${shortcut}`;
  return drawNotes({ key, annotation, notes, beams });
};

const NOTES = ["C", "D", "E", "F", "G", "A", "B"];

const generateScaleSheet = (scale, index) => {
  const { shortcut, startNote, intervals, startKey } = SCALES[scale];
  const relativeIndex = ALL_KEYS[startKey].int_val + index;
  const key = getKey(relativeIndex);
  const { accidentals } = ALL_KEYS[key];
  let firstNote = safeArrayAccess(ALL_KEYS_ARRAY, index + ALL_KEYS[startNote].int_val);
  const octave = 3;

  if (isFlat(firstNote) && accidentals.some(isSharp)) {
    firstNote = ALL_KEYS[firstNote].equivalent;
  }
  const notes = generatesScale(firstNote, intervals, accidentals, octave);
  const annotation = `${formatNote(firstNote)} ${shortcut}`;
  return drawNotes({ key, annotation, notes });
};

function drawNotes({ key, annotation, notes, beams = [] } = {}) {
  const musicSheetDiv = document.createElement("div");
  musicSheetDiv.classList.add("music-sheet");
  const renderer = new Renderer(musicSheetDiv, Renderer.Backends.SVG);
  const context = renderer.getContext();
  renderer.resize(600, 200);
  const stave = new Stave(0, 25, 600);
  stave.addClef("treble").addKeySignature(key).setContext(context).draw();
  if (annotation) {
    const title = document.createElement("div");
    title.textContent = annotation;
    title.style.position = "absolute";
    musicSheetDiv.insertBefore(title, musicSheetDiv.firstChild);
  }

  Formatter.FormatAndDraw(context, stave, notes);
  beams.forEach((beam) => beam.setContext(context).draw());
  return musicSheetDiv;
}

const { Renderer, Stave, StaveNote, Beam, Accidental, Formatter } = Vex.Flow;

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

const EXCERPTS = {
  "Beethoven: Sonata, Op. 17": "https://xade.eu/music-library/horn-excerpts/Beethoven_-_Sonata_Op17_Horn.pdf",
  "Cherubini: Sonata No. 2": "https://xade.eu/music-library/horn-excerpts/Cherubini-2_Sonatas_horn.pdf",
  "Mozart: Concerto No. 1 in D, K. 412":
    "https://xade.eu/music-library/horn-excerpts/Mozart-Horn_Concerto_No.1_horn_part.pdf",
  "Mozart: Concerto No. 2 in E-flat, K. 417":
    "https://xade.eu/music-library/horn-excerpts/Mozart-Horn_Concerto_No.2_horn_part.pdf",
  "Mozart: Concerto No. 3 in E-flat, K 447":
    "https://xade.eu/music-library/horn-excerpts/Mozart-Horn_Concerto_No.3_horn_part.pdf",
  "Mozart: Concerto No. 4 in E-flat, K. 495":
    "https://xade.eu/music-library/horn-excerpts/Mozart-Horn_Concerto_No.4_horn_part.pdf",
  "Saint-Saens: Morceau de Concert":
    "https://xade.eu/music-library/horn-excerpts/Saint-saens-Morceau_De_Concert_orig_horn.pdf",
  "Schumann: Adagio and Allegro, Op. 70":
    "https://xade.eu/music-library/horn-excerpts/Schumann_Adagio_and_Allegro_Op.70_parts.pdf",
  "Schumann: Konzertstuck for four horns and orchestra":
    "https://xade.eu/music-library/horn-excerpts/Schumann_Concertpiece_for_4_Horns_Op.86_horns.pdf",
  "Strauss, F.: Nocturno, Op. 7": "https://xade.eu/music-library/horn-excerpts/Strauss-F-Nocturno-Op-7-horn.pdf",
  "Strauss, F.: Concerto, Op. 8": "https://xade.eu/music-library/horn-excerpts/Strauss-F-Concerto-Op-8-horn.pdf",
  "Strauss, R.: Concerto No. 1, Op. 11":
    "https://xade.eu/music-library/horn-excerpts/Strauss-R-Concerto-Op-11-horn.pdf",
  "Weber: Concertino in E": "https://xade.eu/music-library/horn-excerpts/Weber-Concertino__Op.45-Horn_Part.pdf",
};

const generateExcerpt = async (div, random) => {
  const [title, url] = random.choice(Object.entries(EXCERPTS));

  const { pdfjsLib } = globalThis;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://xade.eu/practice-generator/pdf.worker.js";
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  div.innerHTML = "";
  const h3 = document.createElement("h3");
  h3.textContent = title;
  div.appendChild(h3);

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const scale = 2;
    var viewport = page.getViewport({ scale: scale });

    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.width = "100%";
    // Render PDF page into canvas context
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    const renderTask = page.render(renderContext);
    await renderTask.promise;
    div.appendChild(canvas);
  }
};

const mod = (input, n) => ((input % n) + n) % n;
const safeArrayAccess = (array, index) => array[mod(index, array.length)];
const getKey = (index) => safeArrayAccess(ALL_KEYS_ARRAY, index);
