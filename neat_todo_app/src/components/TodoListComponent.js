import { for$ } from "../../../NEAT.js";

const TodoListComponent = (todos$) => {
    // Styling for the todo item
    const todoStyle = (todo) => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        margin: '5px 0',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: todo.completed ? '#d4edda' : '#f8d7da',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
    })

    const textStyle = (todo) => ({
        flexGrow: '1',
        textDecoration: todo.completed ? 'line-through' : 'none',
        color: todo.completed ? '#6c757d' : '#212529',
        fontSize: '16px'
    })

    const buttonStyle = {
        marginLeft: '10px',
        padding: '5px 10px',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
    };

    const completeButtonStyle = (todo) => ({
        ...buttonStyle,
        backgroundColor: todo.completed ? '#ffc107' : '#28a745',
        color: '#fff'
    })


    const deleteButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#dc3545',
        color: '#fff'
    }

    // Mark todo as completed
    const markCompleted = (index) => {
        todos$[index].completed = !todos$[index].completed;
    };

    // Delete todo
    const deleteTodo = (index) => {
        todos$.splice(index, 1);
    };

    const TodoListComponentFragment = (todo, index) => {
        if (!todo) return;
        return div(
            div(`${todo.text}`).att$('style', textStyle(todo)),
            button(todo.completed ? 'Undo' : 'Complete').att$('style', completeButtonStyle(todo)).onclick$(() => markCompleted(index)),
            button('Delete').att$('style', deleteButtonStyle).onclick$(() => deleteTodo(index))
        ).att$('style', todoStyle(todo));
    }

    return for$(todos$, (todo, index) => TodoListComponentFragment(todo, index));
};

export default TodoListComponent;