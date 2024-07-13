
import { inputRange } from '../../../NEAT.js';
// Component for adjusting pitch and tempo
const SettingsPanel = (tanpuraState$) => {
    const handlePitchChange = (data) => {
        tanpuraState$.pitch = parseFloat(data.value);
    };

    const handleTempoChange = (data) => {
        tanpuraState$.tempo = parseFloat(data.value);
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