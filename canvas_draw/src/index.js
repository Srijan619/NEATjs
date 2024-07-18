"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MainCanvas_instances, _MainCanvas_initMainCanvas;
var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["Rect"] = 0] = "Rect";
    ComponentType[ComponentType["Circle"] = 1] = "Circle";
    ComponentType[ComponentType["Line"] = 2] = "Line"; // Add more as needed
})(ComponentType || (ComponentType = {}));
class MainCanvas {
    constructor(canvasElement) {
        _MainCanvas_instances.add(this);
        this.components = [];
        this.scale = 1;
        this.dragTarget = null;
        this.canvasElement = canvasElement;
        const res = canvasElement.getContext('2d');
        if (res) {
            this.canvasContext = res;
        }
        __classPrivateFieldGet(this, _MainCanvas_instances, "m", _MainCanvas_initMainCanvas).call(this);
        this.initEventListeners();
    }
    addComponent(component) {
        this.components.push(component);
    }
    setScale(newScale) {
        this.scale = newScale;
        this.components.forEach(component => component.setScale(newScale));
        this.updateCanvas();
    }
    updateCanvas() {
        this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasContext.save();
        this.canvasContext.scale(this.scale, this.scale);
        this.components.forEach(component => component.updateCanvas());
        this.canvasContext.restore();
    }
    initEventListeners() {
        this.canvasElement.addEventListener('wheel', (event) => this.handleZoom(event));
        this.canvasElement.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        this.canvasElement.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvasElement.addEventListener('mouseup', () => this.handleMouseUp());
    }
    handleZoom(event) {
        event.preventDefault();
        const zoomIntensity = 0.1;
        const { offsetX, offsetY, deltaY } = event;
        const scaleFactor = deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
        // Calculate the new scale
        const newScale = this.scale * scaleFactor;
        // Update the scale
        this.setScale(newScale);
    }
    handleMouseDown(event) {
        console.log("Mouse down...", event);
        for (const component of this.components) {
            if (component.testHit(event)) {
                console.log("Mouse hit compone..", component);
                this.dragTarget = component;
                break;
            }
        }
    }
    handleMouseMove(event) {
        if (!this.dragTarget)
            return;
        const cursorMousePosition = this.dragTarget.getCursorPosition(event);
        this.dragTarget.setPosition(cursorMousePosition.x, cursorMousePosition.y);
        this.updateCanvas();
    }
    handleMouseUp() {
        this.dragTarget = null;
    }
}
_MainCanvas_instances = new WeakSet(), _MainCanvas_initMainCanvas = function _MainCanvas_initMainCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth * ratio;
    const height = window.innerHeight * ratio;
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.canvasContext.fillStyle = "#f0f0f0";
    this.canvasContext.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
};
class CanvasBaseComponent {
    constructor(canvasElement, posX, posY, width, height, color, lineWidth, scale) {
        this.selected = false;
        this.canvasElement = canvasElement;
        const res = canvasElement.getContext('2d');
        if (res) {
            this.canvasContext = res;
        }
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.color = color;
        this.radius = this.width / 2;
        this.lineWidth = lineWidth || .1;
        this.scale = scale || 1;
    }
    setScale(newScale) {
        this.scale = newScale;
    }
    setPosition(x, y) {
        this.posX = x;
        this.posY = y;
    }
    getCursorPosition(event) {
        var rect = this.canvasElement.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * this.canvasElement.width,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * this.canvasElement.height
        };
    }
}
class Rectangle extends CanvasBaseComponent {
    constructor(canvasElement, posX, posY, width, height, color) {
        super(canvasElement, posX, posY, width, height, color);
    }
    draw() {
        console.log("Drawing..", this.posX, this.selected);
        this.canvasContext.fillStyle = this.color;
        this.canvasContext.fillRect(this.posX, this.posY, this.width, this.height);
        // Toggle select too and continue if it was selected
        if (this.selected)
            return this.select('black', this.lineWidth);
    }
    updateCanvas() {
        this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
        this.draw();
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
        this.canvasContext.strokeRect(this.posX, this.posY, this.width, this.height);
        this.selected = true;
    }
    unselect() {
        this.clearStrokeArea();
        this.draw();
        this.selected = false;
    }
    clearStrokeArea() {
        const buffer = this.lineWidth * 1.5; // Extra buffer to ensure complete clearing
        this.canvasContext.clearRect(this.posX - buffer, this.posY - buffer, this.width + buffer * 2, this.height + buffer * 2);
    }
    testHit(event) {
        const mousePosition = this.getCursorPosition(event);
        return (this.posX <= mousePosition.x && mousePosition.x <= this.posX + this.width) &&
            (this.posY <= mousePosition.y && mousePosition.y <= this.posY + this.height);
    }
}
class Circle extends CanvasBaseComponent {
    constructor(canvasElement, posX, posY, width, height, color, radius) {
        super(canvasElement, posX, posY, width, height, color);
        this.radius = radius;
    }
    draw() {
        this.canvasContext.fillStyle = this.color;
        this.canvasContext.beginPath();
        this.canvasContext.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        this.canvasContext.fill();
    }
    updateCanvas() {
        this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
        this.draw();
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
    testHit(event) {
        const mousePosition = this.getCursorPosition(event);
        return Math.pow(this.posX - mousePosition.x, 2) + Math.pow(this.posY - mousePosition.y, 2) <= Math.pow(this.radius, 2);
    }
}
const mainCanvasElement = document.getElementById('canvas');
const mainCanvas = new MainCanvas(mainCanvasElement);
// const components = [] as CanvasBaseComponent[];
// Example usage
let rectComponentYellow = new Rectangle(mainCanvasElement, 50, 50, 500, 250, 'yellow');
mainCanvas.addComponent(rectComponentYellow);
mainCanvas.updateCanvas();
//const circleComponent = new Circle(mainCanvas, 50, 50, 100, 50, 'yellow', 25);
//rectComponentYellow.draw();
//circleComponent.draw();
//components.push(rectComponentYellow, circleComponent);
