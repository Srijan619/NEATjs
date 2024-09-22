var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Circle_instances, _Circle_draw;
import { CanvasBaseComponent } from '../canvas.js';
import Vector from './Vector.js';
let LEFT = false, UP = false, RIGHT = false, DOWN = false;
//velocity gets multiplied by (1-friction)
const FRICTION = 0.01;
const GRAVITY = 9.81; // Gravity constant
class Circle extends CanvasBaseComponent {
    constructor(canvasElement, radius, mass, color, pos) {
        super(canvasElement, 0, 0, pos);
        _Circle_instances.add(this);
        this.radius = radius;
        this.color = color;
        if (this.imgSrc) {
            this.preloadImage(this.imgSrc);
        }
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.mass = mass;
        if (this.mass === 0) {
            this.inv_mass = 0;
        }
        else {
            this.inv_mass = 1 / this.mass;
        }
        this.elasticity = 1;
        this.acceleration = 1;
        this.isPlayer = false;
        this.lastChangeTime = performance.now();
        this.targetAccelerationX = 0;
        this.targetAccelerationY = 0;
        this.isAlive = true;
        this.animate = this.animate.bind(this);
        this.setupEventListeners();
        requestAnimationFrame(this.animate);
        return this;
    }
    setIsPlayer(isPlayer) {
        this.isPlayer = isPlayer;
    }
    draw() {
        __classPrivateFieldGet(this, _Circle_instances, "m", _Circle_draw).call(this, this.color);
    }
    updateColorAfterCollision(color) {
        __classPrivateFieldGet(this, _Circle_instances, "m", _Circle_draw).call(this, color);
    }
    setColor(color) {
        this.color = color;
    }
    kill() {
        this.isAlive = false;
    }
    bounce() {
        if (Math.abs(this.vel.y) < 0.4) {
            this.vel.y = 0;
        }
        else {
            // Reverse and reduce velocity to simulate a bounce
            this.vel.y *= -0.7;
        }
    }
    reposition() {
        this.acc = this.acc.unit().multiply(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.multiply(1 - FRICTION);
        this.pos = this.pos.add(this.vel);
    }
    addText(text) {
        this.canvasContext.font = "30px Arial";
        this.canvasContext.fillText(text, this.pos.x, this.pos.y);
    }
    toggleSelect(strokeStyle, lineWidth) {
        if (this.selected)
            return this.unselect();
        this.select(strokeStyle, lineWidth);
    }
    select(strokeStyle, lineWidth) {
        this.lineWidth = lineWidth ? lineWidth : this.lineWidth;
        this.canvasContext.strokeStyle = strokeStyle;
        this.canvasContext.lineWidth = this.lineWidth;
        this.canvasContext.stroke();
        this.selected = true;
    }
    unselect() {
        this.clearStrokeArea();
        this.selected = false;
    }
    clearStrokeArea() {
        this.select(this.color, this.lineWidth * 2);
    }
    testHit(event, canvasOffsetX = 0, canvasOffsetY = 0) {
        // Take into account scale factor
        const mousePosition = this.getCursorPosition(event);
        return Math.pow((this.pos.x + canvasOffsetX) * this.scale - mousePosition.x, 2) + Math.pow((this.pos.y + canvasOffsetY) * this.scale - mousePosition.y, 2) <= Math.pow(this.radius, 2);
    }
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') {
                LEFT = true;
            }
            if (e.code === 'ArrowUp') {
                UP = true;
            }
            if (e.code === 'ArrowRight') {
                RIGHT = true;
            }
            if (e.code === 'ArrowDown') {
                DOWN = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft') {
                LEFT = false;
            }
            if (e.code === 'ArrowUp') {
                UP = false;
            }
            if (e.code === 'ArrowRight') {
                RIGHT = false;
            }
            if (e.code === 'ArrowDown') {
                DOWN = false;
            }
        });
    }
    // Controls
    keyControl() {
        if (!this.isPlayer)
            return;
        // Update acceleration based on key states
        if (LEFT) {
            console.log("Left key pressed");
            this.acc.x = -this.acceleration;
        }
        if (UP) {
            this.acc.y = -this.acceleration;
        }
        if (RIGHT) {
            this.acc.x = this.acceleration;
        }
        if (DOWN) {
            this.acc.y = this.acceleration;
        }
        if (!LEFT && !RIGHT) {
            this.acc.x = 0;
        }
        if (!UP && !DOWN) {
            this.acc.y = 0;
        }
    }
    simulateRandomMovement(deltaTime) {
        if (this.isPlayer)
            return;
        if (this.vel.y > 0.3)
            return;
        // Generate random acceleration values for x and y over time
        const changeInterval = 1; // Change direction every second
        if (!this.lastChangeTime || (performance.now() - this.lastChangeTime) > changeInterval * 1000) {
            this.targetAccelerationX = (Math.random() - 0.5) * this.acceleration * 200; // Range: [-acceleration, acceleration]
            this.targetAccelerationY = (Math.random() - 0.5) * this.acceleration * 200; // Range: [-acceleration, acceleration]
            this.lastChangeTime = performance.now();
        }
        // Gradually move towards the target acceleration
        this.acc.x += (this.targetAccelerationX - this.acc.x) * FRICTION;
        this.acc.y += (this.targetAccelerationY - this.acc.y) * FRICTION;
        // Apply gravity to the ball
        this.acc.y += GRAVITY * deltaTime;
        // Update the ball's velocity based on the acceleration
        this.vel.x += this.acc.x * deltaTime;
        this.vel.y += this.acc.y * deltaTime;
        // Apply friction to the velocity
        this.vel.x *= 1 - FRICTION;
        this.vel.y *= 1 - FRICTION;
        // Update the ball's position based on the velocity
        this.pos.x += this.vel.x * deltaTime;
        this.pos.y += this.vel.y * deltaTime;
        // Reset acceleration for the next frame
        this.acc.x = 0;
        this.acc.y = 0;
        // Request the next animation frame
        requestAnimationFrame(() => this.simulateRandomMovement(deltaTime));
    }
    update(deltaTime) {
        // Apply gravity to the ball
        this.acc.y += GRAVITY * deltaTime;
        // Update the ball's velocity based on the acceleration
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        // Apply friction to the velocity
        this.vel.x *= 1 - FRICTION;
        this.vel.y *= 1 - FRICTION;
        // Update the ball's position based on the velocity
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        // Reset acceleration for the next frame
        this.acc.x = 0;
        this.acc.y = 0;
    }
    animate() {
        const deltaTime = 0.016; // ~60 frames per second
        this.update(deltaTime);
        this.simulateRandomMovement(deltaTime); // RADNOM SIMULATOON
        this.canvasContext.clearRect(0, 0, this.canvasElement.clientWidth, this.canvasElement.clientHeight);
        this.keyControl();
        this.draw();
        requestAnimationFrame(this.animate);
    }
}
_Circle_instances = new WeakSet(), _Circle_draw = function _Circle_draw(color) {
    if (!this.isAlive)
        return;
    this.applyOrClearShadow();
    this.canvasContext.fillStyle = color;
    this.canvasContext.beginPath();
    this.canvasContext.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    this.canvasContext.fill();
};
export default Circle;
