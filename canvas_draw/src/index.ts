enum ComponentType {
    Rect,
    Circle,
    Line // Add more as needed
}

interface MousePosition {
    x: number;
    y: number
}

class MainCanvas {
    private canvasElement: HTMLCanvasElement;
    private canvasContext!: CanvasRenderingContext2D;
    private components: CanvasBaseComponent[] = [];
    private scale: number = 1;
    private dragTarget: CanvasBaseComponent | null = null;
    constructor(canvasElement: HTMLCanvasElement) {
        this.canvasElement = canvasElement;
        const res = canvasElement.getContext('2d');
        if (res) {
            this.canvasContext = res;
        }
        this.#initMainCanvas();
        this.initEventListeners();
    }

    addComponent(component: CanvasBaseComponent) {
        this.components.push(component);
    }

    setScale(newScale: number) {
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

    #initMainCanvas() {
        const ratio = window.devicePixelRatio || 1;
        const width = window.innerWidth * ratio;
        const height = window.innerHeight * ratio;

        this.canvasElement.width = width;
        this.canvasElement.height = height;

        this.canvasContext.fillStyle = "#f0f0f0";
        this.canvasContext.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    private initEventListeners() {
        this.canvasElement.addEventListener('wheel', (event) => this.handleZoom(event));
        this.canvasElement.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        this.canvasElement.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvasElement.addEventListener('mouseup', () => this.handleMouseUp());
    }

    private handleZoom(event: WheelEvent) {
        event.preventDefault();
        const zoomIntensity = 0.1;
        const { offsetX, offsetY, deltaY } = event;

        const scaleFactor = deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);

        // Calculate the new scale
        const newScale = this.scale * scaleFactor;

        // Update the scale
        this.setScale(newScale);
    }

    private handleMouseDown(event: MouseEvent) {
        console.log("Mouse down...", event)
        for (const component of this.components) {
            if (component.testHit(event)) {
                console.log("Mouse hit compone..", component)
                this.dragTarget = component;
                break;
            }
        }
    }

    private handleMouseMove(event: MouseEvent) {
        if (!this.dragTarget) return;
        const cursorMousePosition = this.dragTarget.getCursorPosition(event)

        this.dragTarget.setPosition(cursorMousePosition.x, cursorMousePosition.y);
        this.updateCanvas();
    }

    private handleMouseUp() {
        this.dragTarget = null;
    }
}

abstract class CanvasBaseComponent {
    selected: boolean = false;
    canvasElement: HTMLCanvasElement;
    canvasContext!: CanvasRenderingContext2D;
    posX: number;
    posY: number;
    width: number;
    height: number;
    color: string;
    radius: number;
    lineWidth: number;
    scale: number;
    constructor(
        canvasElement: HTMLCanvasElement,
        posX: number,
        posY: number,
        width: number,
        height: number,
        color: string,
        lineWidth?: number,
        scale?: number
    ) {
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

    // Abstract method to be implemented by subclasses
    abstract draw(): void;
    abstract updateCanvas(): void;
    abstract testHit(event: MouseEvent): boolean;

    setScale(newScale: number) {
        this.scale = newScale;
    }

    setPosition(x: number, y: number) {
        this.posX = x;
        this.posY = y;
    }

    getCursorPosition(event: MouseEvent): MousePosition {
        var rect = this.canvasElement.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * this.canvasElement.width,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * this.canvasElement.height
        };
    }

}

class Rectangle extends CanvasBaseComponent {
    constructor(
        canvasElement: HTMLCanvasElement,
        posX: number,
        posY: number,
        width: number,
        height: number,
        color: string,
    ) {
        super(canvasElement, posX, posY, width, height, color);
    }
    draw() {
        console.log("Drawing..", this.posX, this.selected)
        this.canvasContext.fillStyle = this.color;
        this.canvasContext.fillRect(this.posX, this.posY, this.width, this.height);

        // Toggle select too and continue if it was selected
        if (this.selected) return this.select('black', this.lineWidth);
    }

    updateCanvas() {
        this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
        this.draw();
    }

    toggleSelect(strokeStyle: string, lineWidth?: number) {
        if (this.selected) return this.unselect();
        this.select(strokeStyle, lineWidth);
    }

    select(strokeStyle: string, lineWidth?: number) {
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
        this.canvasContext.clearRect(
            this.posX - buffer,
            this.posY - buffer,
            this.width + buffer * 2,
            this.height + buffer * 2
        );
    }

    testHit(event: MouseEvent): boolean {
        const mousePosition = this.getCursorPosition(event);
        return (this.posX <= mousePosition.x && mousePosition.x <= this.posX + this.width) &&
            (this.posY <= mousePosition.y && mousePosition.y <= this.posY + this.height);
    }

}
class Circle extends CanvasBaseComponent {
    constructor(
        canvasElement: HTMLCanvasElement,
        posX: number,
        posY: number,
        width: number,
        height: number,
        color: string,
        radius: number,
    ) {
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

    toggleSelect(strokeStyle: string, lineWidth?: number) {
        if (this.selected) return this.unselect();
        this.select(strokeStyle, lineWidth);
    }

    select(strokeStyle: string, lineWidth?: number) {
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
        this.select(this.color, this.lineWidth * 2)
    }

    testHit(event: MouseEvent): boolean {
        const mousePosition = this.getCursorPosition(event);
        return Math.pow(this.posX - mousePosition.x, 2) + Math.pow(this.posY - mousePosition.y, 2) <= Math.pow(this.radius, 2);
    }
}

const mainCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
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
