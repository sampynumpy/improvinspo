# only for major scale chords
import random
notes =["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"]
random_note = random.choice(notes)
index = notes.index(random_note)
chords =[random_note + " major",
         notes[(index + 2)%len(notes)] + " minor",
         notes[(index + 4)%len(notes)] + " minor",
         notes[(index + 5)%len(notes)] + " major",
         notes[(index + 7)%len(notes)] + " major",
         notes[(index + 9)%len(notes)] + " minor",
         notes[(index + 11)%len(notes)] + " dim"]   
random_chords = random.sample(chords,k=4)
print("play this key and these chords - each two bars strum, two bars improv on root note of chord")
print("key: ",random_note,"major /",notes[(index - 3)%len(notes)],"minor")
print("chords: ",random_chords)

# build a chord
major_chord_notes = [random_note,
         notes[(index + 4)%len(notes)],
         notes[(index + 7)%len(notes)]]

minor_chord_notes = [random_note,
         notes[(index + 3)%len(notes)],
         notes[(index + 7)%len(notes)]]
print(" ")
print("build this key's chord across the fretboard")
print("major notes: ", major_chord_notes)
print("minor notes: ", minor_chord_notes)