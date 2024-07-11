import { reactive } from '../../NEAT.js';

const FlashcardComponent = (flashcard, index) => {
    const toggleAnswer = (flashcard) => {
        flashcard.showAnswer = !flashcard.showAnswer;
    };

    const cardStyle = {
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '300px',
        marginBottom: '20px',
        padding: '20px',
        textAlign: 'center',
        transition: 'transform 0.3s ease',
        userSelect: 'none'
    };

    const buttonStyle = {
        marginTop: '10px',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer'
    };

    return div(
        h3(`Flashcard ${index + 1}`),
        p(`Question: ${flashcard.question}`),
        button(flashcard.showAnswer ? 'Hide Answer' : 'Show Answer').att$('style', buttonStyle).onclick$(() => toggleAnswer(flashcard)),
        p(`Answer: ${flashcard.showAnswer ? flashcard.answer : '???'}`)
    ).att$('id', `flashcard-${flashcard.id}`).att$('style', cardStyle);
};

export default FlashcardComponent;