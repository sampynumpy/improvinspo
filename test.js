<object id="fretboard" type="image/svg+xml" data="static/assets/fretboard.svg"></object>
const fretboardObj = document.getElementById("fretboard");

fretboardObj.onload = () => {
  const svgDoc = fretboardObj.contentDocument;
  const notes = svgDoc.querySelectorAll(".fret-note");

  notes.forEach(noteEl => {
    noteEl.addEventListener("click", () => {
      handleNoteClick(noteEl);
    });
  });
};
let selectedNotes = [];

function handleNoteClick(el) {
  const note = el.dataset.note;

  el.classList.toggle("selected");

  if (selectedNotes.includes(note)) {
    selectedNotes = selectedNotes.filter(n => n !== note);
  } else {
    selectedNotes.push(note);
  }
}
function checkRecall(expectedNotes) {
  const correct =
    expectedNotes.every(n => selectedNotes.includes(n)) &&
    selectedNotes.every(n => expectedNotes.includes(n));

  return correct;
}
