import { reactive, input, inputRange } from '../../NEAT.js';

const tempo = reactive(50);

const NumberInputComponent = () => {
    return (
        div(
            input("number").tuneIn$(tempo)
        )
    );
}

const RangeInputComponent = () => {
    return div(inputRange(0, 100).tuneIn$(tempo));
}

// Main application component
const renderApp = () => {
    const r = div(NumberInputComponent(), RangeInputComponent());
    app.replaceChildren(r ? r : document.createElement('div'));
};

renderApp();
