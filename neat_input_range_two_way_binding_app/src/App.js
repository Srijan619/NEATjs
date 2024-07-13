import { reactive, inputRange, inputNumber } from '../../NEAT.js';

const tempo = reactive(50);

const NumberInputComponent = () => {
    return inputNumber().tuneIn$(tempo);
}

const RangeInputComponent = () => {
    return inputRange(0, 100).tuneIn$(tempo);
}

// Main application component
const renderApp = () => {
    const r = div(NumberInputComponent(), RangeInputComponent());
    app.appendChild(r);
};

window.tempo = tempo
renderApp();
