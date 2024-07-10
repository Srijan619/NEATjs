import { reactive, inputRange, for$, tag } from '../../NEAT.js'; // Assuming tag is used for creating buttons
const audioMap = new Map();
const notes = reactive([
    { id: 'C', name: 'Pa', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_C.mp3', playing: false },
    { id: 'D', name: 'Sa', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_D.mp3', playing: false },
    { id: 'E', name: 'Ma', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_E.mp3', playing: false }
    // Add more notes as needed
]);

// Reactive state for managing current note, pitch, and tempo
const tanpuraStateRec$ = reactive({
    currentNote: null,
    pitch: 440, // default pitch in Hz
    tempo: 60 // default tempo in BPM
});

const tanpuraState$ = tanpuraStateRec$.value;

// Function to play a Tanpura note
const playNote = (note) => {
    // Stop currently playing note if any
    stopNote();

    const audio = new Audio(note.audioSrc);
    audioMap.set(note.id, audio);
    audio.play();
    note.playing = true;
    tanpuraState$.currentNote = note.id;
};

// Function to stop playing the current note
const stopNote = () => {
    const currentNote = tanpuraState$.currentNote;
    if (currentNote) {
        const note = notes.value.find(note => note.id === currentNote);
        if (note) {
            note.playing = false;
            const audio = audioMap.get(currentNote);
            if (audio) {
                audio.pause();
                audio.currentTime = 0; // Reset to the beginning
                audioMap.delete(currentNote);
            }
        }
        tanpuraState$.currentNote = null;
        TanpuraApp(); // Re-render the app to update the UI
    }
};

// Component for displaying note buttons
const NoteButtons = () => {
    const handleTogglePlay = (note) => {
        if (!note.playing) {
            playNote(note);
        } else {
            stopNote();
        }
    };

    const NoteButtonFragments = (note) => {
        const buttonStyle = {
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: note.playing ? '#dc3545' : '#28a745',
            color: '#fff',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
        };
        if (!note) return;
        return tag("div",
            tag("button", note.playing ? `Stop ${note.id}` : `Play ${note.id}`).att$('style', buttonStyle)
                .onclick$(() => handleTogglePlay(note))
        ).att$('style', { marginBottom: '5px' });

    };

    return for$(notes, (note) => NoteButtonFragments(note));
};

// Component for adjusting pitch and tempo
const SettingsPanel = () => {
    const handlePitchChange = (event) => {
        tanpuraState$.pitch = parseFloat(event.target.value);
    };

    const handleTempoChange = (event) => {
        tanpuraState$.tempo = parseFloat(event.target.value);
    };

    return (
        tag("div",
            tag("label", "Pitch:"),
            inputRange(400, 480, tanpuraState$.pitch).oninput$(handlePitchChange),
            tag("label", "Tempo:"),
            inputRange(40, 120, tanpuraState$.tempo).oninput$(handleTempoChange)
        )
    );
};

// Main application component
const TanpuraApp = () => {
    const r = tag("div", NoteButtons(), SettingsPanel());
    app.replaceChildren(r ? r : document.createElement('div'));
};

TanpuraApp();

tanpuraStateRec$.watchAll(() => {
    // Whenever state changes, re-render the entire application
    TanpuraApp();
});
