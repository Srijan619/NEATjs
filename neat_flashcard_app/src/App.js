import { reactive, watcher } from '../../NEAT.js';
import FlashcardsListComponent from '../component/FlashcardListComponent.js';

const flashcards$ = reactive([
    { question: 'What is the capital of France?', answer: 'Paris', showAnswer: false },
    { question: 'What is 2 + 2?', answer: '4', showAnswer: false },
]);


const FlashcardsApp = () => {
    const appContainer = div(
        h1('Flashcards App'),
        FlashcardsListComponent(flashcards$)
    );
    app.replaceChildren(appContainer);
};


// Watcher function to update component state
watcher(() => {
    console.log(`Flashcards:`, JSON.stringify(flashcards$));
    FlashcardsApp();
});
window.flashcards$ = flashcards$;