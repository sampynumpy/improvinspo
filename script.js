/* ---------- GLOBALS ---------- */
const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

let selectedKey = null;
let currentProgression = null;
let savedProgressions =
  JSON.parse(localStorage.getItem("progressions")) || [];

let selectedNotes = [];
let expectedNotes = [];

/* ---------- AUDIO ---------- */
let tempo = 100;
let metroInterval = null;
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playChord(pitches, duration = 0.8) {
  const now = audioCtx.currentTime;
  pitches.forEach(freq => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
  });
}

function freqFromNote(note) {
  const idx = notes.indexOf(note);
  return 440 * Math.pow(2, (idx - 9) / 12);
}

/* ---------- METRONOME ---------- */
function updateTempo(val) {
  tempo = Number(val);
  document.getElementById("tempoValue").innerText = tempo;
}

function toggleMetronome() {
  if (metroInterval) {
    clearInterval(metroInterval);
    metroInterval = null;
    return;
  }
  metroInterval = setInterval(() => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 1000;
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }, (60 / tempo) * 1000);
}

/* ---------- KEY ---------- */
function selectKey(key) {
  selectedKey = key.replace("♭","A#"); // simple flat handling
}

/* ---------- GENERATE ---------- */
function generateChords() {
  if (!selectedKey) return alert("Select a key first.");

  resetUI();

  const root = selectedKey;
  const idx = notes.indexOf(root);

  const scaleChords = [
    `${root} major`,
    `${notes[(idx+2)%12]} minor`,
    `${notes[(idx+4)%12]} minor`,
    `${notes[(idx+5)%12]} major`,
    `${notes[(idx+7)%12]} major`,
    `${notes[(idx+9)%12]} minor`,
    `${notes[(idx+11)%12]} dim`
  ];

  const progression = [];
  while (progression.length < 4) {
    const c = scaleChords[Math.floor(Math.random() * scaleChords.length)];
    if (!progression.includes(c)) progression.push(c);
  }

  currentProgression = {
    name: "Untitled",
    root,
    key: `${root} major`,
    chords: progression,
    notes: ""
  };

  document.getElementById("output").innerText =
`Key: ${currentProgression.key}

Chords:
${progression.join(", ")}`;

  showRecall();
}

/* ---------- BUILD ---------- */
function buildChord() {
  if (!currentProgression) return;

  const root = currentProgression.root;
  const idx = notes.indexOf(root);

  document.getElementById("output").innerText =
`Build chords in ${root}

Major: ${root}, ${notes[(idx+4)%12]}, ${notes[(idx+7)%12]}
Minor: ${root}, ${notes[(idx+3)%12]}, ${notes[(idx+7)%12]}`;
}

/* ---------- RECALL ---------- */
function showRecall() {
  const recallSection = document.getElementById("recallSection");
  recallSection.style.display = "block";
  document.getElementById("recallHint").innerText =
    `Find all ${currentProgression.root} notes on the fretboard`;

  const notesEls = document.querySelectorAll("#fretboard .fret-note");
  selectedNotes = [];

  // Remove old click listeners by cloning nodes
  notesEls.forEach(el => el.replaceWith(el.cloneNode(true)));

  const freshNotesEls = document.querySelectorAll("#fretboard .fret-note");

  freshNotesEls.forEach(el => {
    el.addEventListener("click", () => {
      const note = el.dataset.note;

      // toggle visual selection
      el.classList.toggle("selected");

      // track selected notes
      if (selectedNotes.includes(note)) {
        selectedNotes = selectedNotes.filter(n => n !== note);
      } else {
        selectedNotes.push(note);
      }

      console.log("Selected notes:", selectedNotes);
    });
  });

  // Only root note is required
  expectedNotes = [currentProgression.root];
}

/* ---------- CHECK RECALL ---------- */
function checkRecall() {
  if (!currentProgression) {
    alert("Generate chords first.");
    return;
  }

  const selectedSet = new Set(selectedNotes);
  const root = currentProgression.root;

  if (selectedSet.has(root)) {
    document.getElementById("recallFeedback").innerText =
      "✅ Correct — chords unlocked";
    unlockChords();
  } else {
    document.getElementById("recallFeedback").innerText =
      "❌ Not quite — look for the pattern";
  }
}

/* ---------- UNLOCK CHORDS ---------- */
function unlockChords() {
  const container = document.getElementById("chordDiagrams");
  const diagramContainer = document.getElementById("diagramContainer");

  container.style.display = "block";
  diagramContainer.innerHTML = ""; // clear old diagrams

  currentProgression.chords.forEach(chord => {
    // Create wrapper div with background
    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-block";
    wrapper.style.background = "#808080"; // slight greyish background
    wrapper.style.padding = "10px";
    wrapper.style.borderRadius = "8px";
    wrapper.style.margin = "5px";

    const img = document.createElement("img");
    const fileName = chord.replace(/\s+/g, "_").replace("#", "%23");
    img.src = `/${fileName}.svg`;
    img.style.width = "120px";
    img.alt = chord;

    wrapper.appendChild(img);
    diagramContainer.appendChild(wrapper);
  });
}

/* ---------- SAVE ---------- */
function saveProgression() {
  if (!currentProgression) return;

  const name = prompt("Name this progression:");
  if (!name) return;

  currentProgression.name = name;
  currentProgression.notes = prompt("Practice notes:","");

  savedProgressions.push({...currentProgression});
  localStorage.setItem("progressions", JSON.stringify(savedProgressions));
  renderSaved();
}

function renderSaved() {
  const list = document.getElementById("savedList");
  list.innerHTML = "";

  savedProgressions.forEach((p,i) => {
    const li = document.createElement("li");
    li.innerText = p.name;
    li.onclick = () => {
      currentProgression = p;
      document.getElementById("output").innerText =
`${p.name}
${p.key}

${p.chords.join(", ")}

Notes:
${p.notes || "—"}`;
    };

    const del = document.createElement("button");
    del.innerText = "🗑";
    del.onclick = e => {
      e.stopPropagation();
      savedProgressions.splice(i,1);
      localStorage.setItem("progressions", JSON.stringify(savedProgressions));
      renderSaved();
    };

    li.appendChild(del);
    list.appendChild(li);
  });
}

/* ---------- MIDI ---------- */
function exportMidi() {
  if (!currentProgression) return;

  const track = new MidiWriter.Track();
  track.setTempo(tempo);

  currentProgression.chords.forEach(chord => {
    const root = chord.split(" ")[0];
    const idx = notes.indexOf(root);

    const intervals =
      chord.includes("minor") ? [0,3,7] :
      chord.includes("dim") ? [0,3,6] :
      [0,4,7];

    const pitches = intervals.map(i => notes[(idx+i)%12] + "4");

    track.addEvent(new MidiWriter.NoteEvent({
      pitch: pitches,
      duration: "2"
    }));
  });

  const writer = new MidiWriter.Writer(track);
  const blob = new Blob([writer.buildFile()], { type: "audio/midi" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${currentProgression.name}.mid`;
  a.click();
}

/* ---------- UTILS ---------- */
function resetUI() {
  document.getElementById("recallSection").style.display = "none";
  document.getElementById("chordDiagrams").style.display = "none";
  document.getElementById("recallFeedback").innerText = "";
}
