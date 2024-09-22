import { MainCanvas } from "../canvas/canvas.js";
import Rectangle from "../canvas/components/rectangle.js";
import Circle from "../canvas/components/circle.js";
import TextComponent from "../canvas/components/textComponent.js";
// import Note from './canvas/components/Note.js';
import { Wall } from "../canvas/components/Wall.js";
import Vector from "../canvas/components/Vector.js";

export default function drawMainBoard() {
    const mainCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const mainCanvas = new MainCanvas(mainCanvasElement);
    // Example usage

    // Basic shadow
    const basicShadowProps = () => [
        'rgba(0, 0, 0, 0.5)',
        10,
        5,
        5
    ];
    const MAIN_BOARD_POSITION = 50;
    const MAIN_BOARD_WIDTH = mainCanvasElement.width - 100;
    const MAIN_BOARD_HEIGHT = mainCanvasElement.height - 100;


    // Board 1
    const board1 = new Rectangle(mainCanvasElement, MAIN_BOARD_WIDTH, MAIN_BOARD_HEIGHT, '#1A5653', new Vector(MAIN_BOARD_POSITION, MAIN_BOARD_POSITION)); // Forest green
    const note = new Rectangle(mainCanvasElement, 400, 200, '#ECF87F', new Vector(MAIN_BOARD_POSITION + 10, MAIN_BOARD_POSITION + 10));

    const floor = new Wall(mainCanvasElement, MAIN_BOARD_POSITION + 10, MAIN_BOARD_HEIGHT - 50, MAIN_BOARD_WIDTH + MAIN_BOARD_POSITION, MAIN_BOARD_HEIGHT - 50);
    //const floor = new Wall(mainCanvasElement, MAIN_BOARD_POSITION + 10, MAIN_BOARD_HEIGHT - 50, MAIN_BOARD_WIDTH - 500, MAIN_BOARD_HEIGHT - 50);

    // const pinItem1 = new Circle(mainCanvasElement, 15, 1, 'red', new Vector(MAIN_BOARD_POSITION + 410, MAIN_BOARD_POSITION + 10));
    // const pinItem2 = new Circle(mainCanvasElement, 15, 1, 'red', new Vector(MAIN_BOARD_POSITION + 10, MAIN_BOARD_POSITION + 10));
    // const pinItem3 = new Circle(mainCanvasElement, 15, 1, 'red', new Vector(MAIN_BOARD_POSITION + 10, MAIN_BOARD_POSITION + 210));
    // const pinItem4 = new Circle(mainCanvasElement, 15, 1, 'red', new Vector(MAIN_BOARD_POSITION + 410, MAIN_BOARD_POSITION + 210));
    const pinItem1 = new Circle(mainCanvasElement, 15, 1, 'red', new Vector(MAIN_BOARD_POSITION + 610, MAIN_BOARD_POSITION + 10));
    const pinItem2 = new Circle(mainCanvasElement, 15, 1, 'red', new Vector(MAIN_BOARD_POSITION + 610, MAIN_BOARD_POSITION + 50));
    const pinItem3 = new Circle(mainCanvasElement, 15, 1, 'red', new Vector(MAIN_BOARD_POSITION + 610, MAIN_BOARD_POSITION + 90));
    const pinItem4 = new Circle(mainCanvasElement, 15, 1, 'red', new Vector(MAIN_BOARD_POSITION + 610, MAIN_BOARD_POSITION + 130));
    const sheldonSays = "Scissors cuts paper, paper covers rock, rock crushes lizard, lizard poisons Spock, Spock smashes scissors, scissors decapitates lizard, lizard eats paper, paper disproves Spock, Spock vaporizes rock, and as it always has, rock crushes scissors."
    const noteText = new TextComponent(mainCanvasElement, sheldonSays, 300, new Vector(MAIN_BOARD_POSITION + 20, MAIN_BOARD_POSITION + 40));
    note.setShadow(...basicShadowProps());


    // const note2 = new Rectangle(mainCanvasElement, 400, 200, '#ECF87F', new Vector(MAIN_BOARD_POSITION + 200 + 10, MAIN_BOARD_POSITION + 400 + 10));
    // const sheldonSays2 = "Scissors cuts paper, paper covers rock, rock crushes lizard, lizard poisons Spock, Spock smashes scissors, scissors decapitates lizard, lizard eats paper, paper disproves Spock, Spock vaporizes rock, and as it always has, rock crushes scissors."
    // const noteText2 = new TextComponent(mainCanvasElement, sheldonSays2, 300, new Vector(MAIN_BOARD_POSITION + 200 + 20, MAIN_BOARD_POSITION + 400 + 40));
    // note2.setShadow(...basicShadowProps());

    // Main canvas
    const objects = [];
    objects.push(note, pinItem1, pinItem2, pinItem3, pinItem4, floor, noteText);
    pinItem1.setDraggable(true);
    pinItem2.setDraggable(true);
    pinItem3.setDraggable(true);
    pinItem4.setDraggable(true);
    mainCanvas.addComponent(board1);
    mainCanvas.addComponents(objects);

    mainCanvas.updateCanvas();
}