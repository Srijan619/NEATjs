
import { inputRange } from '../../../NEAT.js';
// Component for adjusting pitch and tempo
const SettingsPanel = (tanpuraState$) => {
    const handlePitchChange = (event) => {
        tanpuraState$.pitch = parseFloat(event.target.value);
    };

    const handleTempoChange = (event) => {
        tanpuraState$.tempo = parseFloat(event.target.value);
    };

    return (
        div(
            label("Pitch:"),
            inputRange(400, 480, tanpuraState$.pitch).oninput$(handlePitchChange),
            label("Tempo:"),
            inputRange(40, 120, tanpuraState$.tempo).oninput$(handleTempoChange)
        )
    );
};


export default SettingsPanel;