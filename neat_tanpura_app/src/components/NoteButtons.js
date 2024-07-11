
import { for$ } from '../../../NEAT.js';

// Persistent audioMap outside the NoteButtons function
const audioMap = new Map();
// Component for displaying note buttons
const NoteButtons = (tanpuraState$, notes$) => {

    // Function to play a Tanpura note
    const playNote = (note) => {
        // Stop currently playing note if any
        stopNote();

        const audio = new Audio(note.audioSrc);
        audioMap.set(note.id, audio);
        audio.play();
        note.playing = true;
        tanpuraState$.currentNote = note;
    };

    // Function to stop playing the current note
    const stopNote = () => {
        const currentNote = tanpuraState$.currentNote;
        if (currentNote) {
            currentNote.playing = false;
            const audio = audioMap.get(currentNote.id);
            if (audio) {
                audio.pause();
                audio.currentTime = 0; // Reset to the beginning
                audioMap.delete(currentNote.id);
            }
            tanpuraState$.currentNote = null;
        }
    };
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
        return div(
            button(note.playing ? `${note.id}` : `${note.id}`).att$('style', buttonStyle)
                .onclick$(() => handleTogglePlay(note))
        ).att$('style', { margin: '.1rem' });

    };

    return for$(notes$, (note) => NoteButtonFragments(note));
};

export default NoteButtons;