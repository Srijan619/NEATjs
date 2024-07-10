import { for$ } from "../../NEAT.js";

const TodoListComponent = (todos$, todo, index) => {
    console.log("Rendering TodoListComponent for:", todos$);

    const toggleTodo = (index) => {
        todos$[index].completed = !todos$[index].completed;
    }

    const filteredTodos = () => {
        console.log(todos$)
        if (completedFilter === "completed") {
            return todos$.filter(todo => todo.completed);
        } else if (completedFilter === "incomplete") {
            return todos$.filter(todo => !todo.completed);
        }
    }
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
        todos$.value[index].completed = !todos$.value[index].completed;
    };

    // Delete todo
    const deleteTodo = (index) => {
        todos$.value.splice(index, 1);
    };

    const TodoListComponentFragment = (todo, index) => {
        if (!todo) return;
        return div(
            div(`${todo.text}`).att$('style', textStyle(todo)),
            button(todo.completed ? 'Undo' : 'Complete').att$('style', completeButtonStyle(todo)).onclick$(() => markCompleted(index)),
            button('Delete').att$('style', deleteButtonStyle).onclick$(deleteTodo)
        ).att$('style', todoStyle(todo));
    }

    return for$(todos$, (todo, index) => TodoListComponentFragment(todo, index));
};

export default TodoListComponent;