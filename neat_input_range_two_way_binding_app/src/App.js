import { reactive, inputRange, inputNumber, select } from '../../NEAT.js';

const tempo = reactive(50);

const options = reactive([
    {
    "displayText":"Displayable text",
    "value":"display_text"
    }, 
    {
    "displayText":"Displayable text 2",
    "value":"display_text_2"
    }
  ]);

const defaultSelectedOption = reactive('display_text_2');

const NumberInputComponent = () => {
    return inputNumber().tuneIn$(tempo);
}

const RangeInputComponent = () => {
    return inputRange(0, 100).tuneIn$(tempo);
}

const DataLabelComponent = () => {
  const sayHello = label('Current tempo: ');
  const tempoLabel = label(tempo);

  return div(sayHello, tempoLabel);
}

const DropdownComponent = () => {
  const selectEl = select(options, defaultSelectedOption);
  const labelEl = label(defaultSelectedOption);
  return div(labelEl, selectEl);
}

// Main application component
const renderApp = () => {
   // const r = div(NumberInputComponent(), RangeInputComponent(), DataLabelComponent());
    const r = DropdownComponent();
    app.appendChild(r);
};

window.tempo = tempo
renderApp();
