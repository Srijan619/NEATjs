
import { CanvasBaseComponent } from '../canvas.js'
import Vector from './Vector.js';

export default class Rectangle extends CanvasBaseComponent {
    color: string;
    constructor(
        canvasElement: HTMLCanvasElement,
        width: number,
        height: number,
        color: string,
        pos: Vector
    ) {
        super(canvasElement, width, height, pos);
        this.color = color;
        if (this.imgSrc) {
            this.preloadImage(this.imgSrc);
        }
        return this;
    }
    draw() {
        this.applyOrClearShadow();
        this.canvasContext.fillStyle = this.color;
        this.canvasContext.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }

    toggleSelect(strokeStyle: string, lineWidth?: number) {
        if (this.selected) return this.unselect();
        this.select(strokeStyle, lineWidth);
    }

    select(strokeStyle: string, lineWidth?: number) {
        this.lineWidth = lineWidth ? lineWidth : this.lineWidth;
        this.canvasContext.strokeStyle = strokeStyle;
        this.canvasContext.lineWidth = this.lineWidth;
        this.canvasContext.strokeRect(this.pos.x, this.pos.y, this.width, this.height);
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
            this.pos.x - buffer,
            this.pos.y - buffer,
            this.width + buffer * 2,
            this.height + buffer * 2
        );
    }

    testHit(event: MouseEvent, canvasOffsetX: number = 0, canvasOffsetY: number = 0): boolean {
        const mousePosition = this.getCursorPosition(event);
        // Take into account scale factor
        return (((this.pos.x + canvasOffsetX) * this.scale) <= mousePosition.x && mousePosition.x <= (this.pos.x + canvasOffsetX + this.width) * this.scale) &&
            ((this.pos.y + canvasOffsetY) * this.scale <= mousePosition.y && mousePosition.y <= (this.pos.y + canvasOffsetY + this.height) * this.scale);
    }
}

