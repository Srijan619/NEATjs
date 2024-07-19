import { MainCanvas, Rectangle, Circle, TextComponent } from "./canvas.js";
const mainCanvasElement = document.getElementById('canvas');
const mainCanvas = new MainCanvas(mainCanvasElement);
// const components = [] as CanvasBaseComponent[];
// Example usage
// Basic shadow
const basicShadowProps = () => [
    'rgba(0, 0, 0, 0.5)',
    10,
    5,
    5
];
// Board 1
const board1 = new Rectangle(mainCanvasElement, 1000, 500, '#1A5653', 50, 50); // Forest green
const note = new Rectangle(mainCanvasElement, 400, 200, '#ECF87F', 10, 10);
const pinItem1 = new Circle(mainCanvasElement, 7, 'red', 410, 10);
const pinItem2 = new Circle(mainCanvasElement, 7, 'red', 10, 10);
const pinItem3 = new Circle(mainCanvasElement, 7, 'red', 10, 210);
const pinItem4 = new Circle(mainCanvasElement, 7, 'red', 410, 210);
const sheldonSays = "Scissors cuts paper, paper covers rock, rock crushes lizard, lizard poisons Spock, Spock smashes scissors, scissors decapitates lizard, lizard eats paper, paper disproves Spock, Spock vaporizes rock, and as it always has, rock crushes scissors.";
const noteText = new TextComponent(mainCanvasElement, sheldonSays, 300, 20, 20);
note.setShadow(...basicShadowProps());
board1.addComponent(note);
board1.addComponent(pinItem1);
// board1.addComponent(pinItem2);
// board1.addComponent(pinItem3);
// board1.addComponent(pinItem4);
note.addComponent(noteText);
// Board 2
// const board2 = new Rectangle(mainCanvasElement, 1000, 500, '#1A5653', 1060, 550); // Forest green
// const note2 = new Rectangle(mainCanvasElement, 600, 400, '#ECF87F', 10, 10);
// const pinItem2 = new Circle(mainCanvasElement, 7, 'red', 610, 10);
// const sheldonSays2 = "Sheldon: Thank you, Dr. Fowler. I have a very long and somewhat self-centered speech here. But I'd like to set it aside. Penny: Yeah!Howard: Way to go! Sheldon: Because this honor doesn't just belong to me. I wouldn't be up here if it weren't for some very important people in my life. Beginning with my mother, father, meemaw, brother and sister. And my other family, who I'm so happy to have here with us. Is that Buffy the Vampire Slayer? I was under a misapprehension that my accomplishments were mine alone. Nothing could be further from the truth. I have been encouraged, sustained, inspired and tolerated not only by my wife, but by the greatest group of friends anyone ever had. I'd like to ask them to stand. Dr. Rajesh Koothrappali. Dr. Bernadette Rostenkowski-Wolowitz. Astronaut Howard Wolowitz. And my two dearest friends in the world, Penny Hofstadter and Dr. Leonard Hofstadter. I was there the moment Leonard and Penny met. He said to me that their babies would be smart and beautiful. And now that they're expecting, I have no doubt that that will be the case.Penny: Thanks, Sheldon. I-I haven't told my parents yet, but thanks.Sheldon: Oh. I'm sorry. Don't tell anyone that last thing. That's a secret.Howard, Bernadette, Raj, Penny, Leonard, I apologize if I haven't been the friend you deserve. But I want you to know in my way, I love you all. And I love you. Thank you."
// const noteText2 = new TextComponent(mainCanvasElement, sheldonSays2, 500, 20, 20);
// note2.setShadow(...basicShadowProps());
// board2.addComponent(note2);
// board2.addComponent(pinItem2);
// note2.addComponent(noteText2);
// Main canvas
mainCanvas.addComponent(board1);
// mainCanvas.addComponent(board2);
mainCanvas.updateCanvas();
//rectComponentYellow.draw();
// for (let i = 0; i < 2; i++) {
//     const randomX = rand(10, (window.innerWidth - 10));
//     const randomY = rand(10, (window.innerHeight - 10));
//     const randomWidth = rand(10, 500);
//     const randomHeight = rand(10, 250);
//     //const rect = 
//     const rect = new Rectangle(mainCanvasElement, randomX, randomY, randomWidth, randomHeight, get_random_color());
//     mainCanvas.addComponent(rect);
//     // mainCanvas.addComponent(new Circle(mainCanvasElement, randomX, randomY, randomWidth, randomHeight, get_random_color()));
// }
// mainCanvas.updateCanvas();
// function rand(min: number, max: number) {
//     return min + Math.random() * (max - min);
// }
// function get_random_color() {
//     var h = rand(1, 360);
//     var s = rand(0, 100);
//     var l = rand(0, 100);
//     return 'hsl(' + h + ',' + s + '%,' + l + '%)';
// }
//circleComponent.draw();
//components.push(rectComponentYellow, circleComponent);
