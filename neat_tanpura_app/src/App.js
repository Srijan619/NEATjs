import { reactive, watcher } from '../../NEAT.js';
import NoteButtons from './components/NoteButtons.js';
import SettingsPanel from './components/SettingsPanel.js';


// Reactive state for managing current note, pitch, and tempo
const tanpuraState$ = reactive({
    currentNote: null,
    pitch: 440, // default pitch in Hz
    tempo: 60 // default tempo in BPM
});


// TODO: Currently notes needs to be sent like this to child component as child component can not yet trigger parent to re-render. But this can be achieved easily I hope so..
const notes$ = reactive([
    { id: 'C', name: 'Pa', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_C.mp3', playing: false },
    { id: 'C#', name: 'Pa#', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_Csharp.mp3', playing: false },
    { id: 'D', name: 'Sa', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_D.mp3', playing: false },
    { id: 'D#', name: 'Sa#', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_Dsharp.mp3', playing: false },
    { id: 'E', name: 'Ma', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_E.mp3', playing: false },
    { id: 'F', name: 'Ma#', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_F.mp3', playing: false },
    { id: 'F#', name: 'Ni', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_Fsharp.mp3', playing: false },
    { id: 'G', name: 'Ni#', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_G.mp3', playing: false },
    { id: 'G#', name: 'Re', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_Gsharp.mp3', playing: false },
    { id: 'A', name: 'Re#', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_A.mp3', playing: false },
    { id: 'A#', name: 'Ga', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_Asharp.mp3', playing: false },
    { id: 'B', name: 'Ga#', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_B.mp3', playing: false },
    { id: 'C', name: 'Pa', audioSrc: 'https://kksongs.org/tanpura/tanpura_sounds/pa/tanpura_C.mp3', playing: false }
]);


// Main application component
const renderTanpuraApp = () => {
    const mainContainerStyle = {
        display: 'grid',
        gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
        gap: '2px',
        padding: '10px'
    };
    const r = div(div(NoteButtons(tanpuraState$, notes$)).att$("style", mainContainerStyle), (SettingsPanel(tanpuraState$)));
    app.replaceChildren(r ? r : document.createElement('div'));
};


watcher(() => {
    console.log("Tanpura state changing....", tanpuraState$)
    renderTanpuraApp();
});