import { input } from "../../../NEAT.js";

const AddTodoComponent = (todos$) => {
    let inputText = "";

    // Styling for the input container
    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
    };

    // Styling for the input field
    const inputStyle = {
        flex: '1',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginRight: '10px',
        fontSize: '16px'
    };

    // Styling for the add button
    const buttonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease'
    };

    const handleInput = (event) => {
        inputText = event.target.value;
    };

    const addTodo = () => {
        if (inputText.trim() !== "") {
            // Retrieve the current value of todos$ using getValue()
            const currentTodos = todos$.getValue();

            // Update todos$ with the new value (using setValue to trigger reactivity)
            todos$.setValue([...currentTodos, { text: inputText, completed: false }]);

            // Clear the inputText
            inputText = "";
        }
    };

    return (
        div(
            input("text").att$('placeholder', 'Add a new todo').att$('style', inputStyle).oninput$(handleInput),
            button('Add').att$('style', buttonStyle).onclick$(addTodo)
        ).att$('style', containerStyle)
    );
};

export default AddTodoComponent;
