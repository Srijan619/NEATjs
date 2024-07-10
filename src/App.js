import AddTodoComponent from "./components/AddTodoComponent.js";
import TodoListComponent from "./components/TodoListComponent.js";

import { reactive } from "../NEAT.js";

let todos$ = reactive([
    { completed: false, text: "Todo1" },
    { completed: true, text: "Todo2" }
]);

const renderApp = () => {
    const r =
        div(
            h1("To-Do App"),
            AddTodoComponent(todos$),
            TodoListComponent(todos$))

    console.dir(r)
    app.replaceChildren(r ? r : document.createElement('div'));
}

renderApp();

todos$.watchAll(() => {
    // Whenever todos$ changes, re-render the entire application
    renderApp();
});