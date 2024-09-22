// import Rectangle from './rectangle.js';
// import Vector from './Vector.js';

// class Pin {
//     public position: Vector;
//     constructor(x: number, y: number) {
//         this.position = new Vector(x, y);
//     }
// }

// export default class Note extends Rectangle {
//     public rotation: number;
//     public pins: Pin[];
//     public velocity: Vector;
//     public angularVelocity: number;
//     public gravity: number;
//     public damping: number;
//     time: number;

//     constructor(
//         canvasElement: HTMLCanvasElement,
//         width: number,
//         height: number,
//         color: string,
//         posX?: number,
//         posY?: number,
//     ) {
//         super(canvasElement, width, height, color, posX, posY);
//         if (this.imgSrc) {
//             this.preloadImage(this.imgSrc);
//         }
//         this.rotation = 0;
//         // this.pins = [
//         //     new Pin(this.posX, this.posY),
//         //     new Pin(this.posX + this.width, this.posY),
//         //     new Pin(this.posX, this.posY + this.height),
//         //     new Pin(this.posX + this.width, this.posY + this.height)
//         // ];
//         this.pins = [];
//         this.velocity = new Vector(0, 0);
//         this.angularVelocity = 0;
//         this.gravity = 9.81;
//         this.damping = 0.5;
//         this.time = 0; // Initialize time for oscillation
//         this.animate = this.animate.bind(this);
//         this.removeOnePin = this.removeOnePin.bind(this);

//         this.animate();
//         return this;
//     }

//     draw() {
//         this.applyOrClearShadow();
//         this.canvasContext.save();
//         this.canvasContext.translate(this.posX, this.posY);
//         this.canvasContext.rotate(this.rotation);
//         this.canvasContext.fillStyle = this.color;
//         this.canvasContext.fillRect(500, 500, this.width, this.height);
//         this.canvasContext.restore();
//         //this.drawPins();
//     }

//     drawPins() {
//         this.canvasContext.fillStyle = "red";
//         this.pins.forEach(pin => {
//             this.canvasContext.beginPath();
//             this.canvasContext.arc(pin.position.x, pin.position.y, 5, 0, 2 * Math.PI);
//             this.canvasContext.fill();
//         });
//     }

//     update(deltaTime: number) {
//         if (this.pins.length === 0) {
//             this.velocity.y += this.gravity * deltaTime;
//             this.posY += this.velocity.y * deltaTime;
//             this.posX += this.velocity.x * deltaTime;


//             // Clamp falling speed to prevent it from becoming too high
//             if (this.velocity.y > 20) {
//                 this.velocity.y = 20;
//             }
//         }

//         if (this.pins.length < 4) {
//             this.angularVelocity += this.gravity * (4 - this.pins.length) * deltaTime * 0.1;
//             console.log("Rotation", this.rotation)
//             this.rotation += this.angularVelocity * deltaTime;
//             this.angularVelocity *= this.damping;

//             // Clamp rotation to prevent extreme values

//             // Reset rotation when it reaches middle?

//             if (this.rotation > 0.5) {
//                 console.log("Angular velocity", this.angularVelocity)
//                 this.rotation += deltaTime * this.angularVelocity;
//                 console.log("initial y", this.posY)
//                 this.posY = this.posY + (this.damping * this.velocity.y * this.gravity);
//                 console.log("later y", this.posY)
//             }



//         }

//         this.velocity.x *= this.damping;
//         this.velocity.y *= this.damping;
//     }

//     removePin(index: number) {
//         if (index >= 0 && index < this.pins.length) {
//             this.pins.splice(index, 1);
//         }
//     }

//     clearPreviousPosition() {
//         // Adjust this margin as needed to ensure the entire note is cleared
//         const margin = 10;

//         this.canvasContext.clearRect(
//             this.posX - this.width / 2 - margin,
//             this.posY - this.height / 2 - margin,
//             this.width + 2 * margin,
//             this.height + 2 * margin
//         );
//     }
//     animate() {
//         // Clear the previous position of the note
//         //this.clearPreviousPosition();
//         this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
//         // Update the note's position based on physics
//         const deltaTime = 0.016; // ~60 frames per second
//         this.update(deltaTime);
//         this.draw();
//         requestAnimationFrame(this.animate);
//     }

//     removeOnePin() {
//         if (this.pins.length > 0) {
//             this.pins.pop();
//         }
//     }
// }