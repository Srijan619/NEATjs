import FlashcardComponent from "./FlashcardComponent.js";
import { for$ } from '../../NEAT.js';

const FlashcardsListComponent = (flashcards$) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '20px'
    };

    return div(
        flashcards$.length === 0 ? p('No more flashcards!') : for$(flashcards$, (flashcard, index) => FlashcardComponent(flashcard, index))
    ).att$('style', containerStyle);
};

export default FlashcardsListComponent;