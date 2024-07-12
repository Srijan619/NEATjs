import AddTodoComponent from "./components/AddTodoComponent.js";
import TodoListComponent from "./components/TodoListComponent.js";

import { reactive, watcher } from "../../NEAT.js";

let todos$ = reactive([
    { completed: false, text: "Todo1" },
    { completed: true, text: "Todo2" }
]);

const renderTodoApp = () => {
    const r =
        div(
            AddTodoComponent(todos$),
            TodoListComponent(todos$))
    app.replaceChildren(r ? r : document.createElement('div'));
}

watcher(() => {
    // Whenever todos$ changes, re-render the entire application
    renderTodoApp();
});
window.todos$ = todos$