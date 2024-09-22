import { CanvasBaseComponent } from "../canvas.js";
import Vector from "./Vector.js";

export class Wall extends CanvasBaseComponent {
    start: Vector;
    end: Vector;

    testHit(event: MouseEvent, canvasOffsetX: number, canvasOffsetY: number): boolean {
        throw new Error("Method not implemented.");
    }
    constructor(canvasElement: HTMLCanvasElement, x1: number, y1: number, x2: number, y2: number) {
        super(canvasElement, 0, 0, new Vector(0, 0), 0);
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        this.draw();
    }

    draw(): void {
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(this.start.x, this.start.y);
        this.canvasContext.lineTo(this.end.x, this.end.y);
        this.canvasContext.strokeStyle = "white";
        this.canvasContext.lineWidth = 10;
        this.canvasContext.stroke();
    }

    wallUnit() {
        return this.end.subtract(this.start).unit();
    }
}