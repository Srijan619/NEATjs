import Vector from "./components/Vector.js";
import { Wall } from "./components/Wall.js";
import Circle from "./components/circle.js";

interface MousePosition {
    x: number;
    y: number
}

class MainCanvas {
    // TODO: Maybe have main canvas also draggable or not?
    private canvasElement: HTMLCanvasElement;
    private canvasContext!: CanvasRenderingContext2D;
    private components: CanvasBaseComponent[] = [];
    private scale: number = 1;
    private dragTarget: CanvasBaseComponent | null = null;
    private draggingMainCanvas: boolean = false;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private canvasOffsetX: number = 0;
    private canvasOffsetY: number = 0;
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
    addComponents(components: CanvasBaseComponent[]) {
        this.components.push(...components);
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
        this.canvasContext.translate(this.canvasOffsetX, this.canvasOffsetY);
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
        const { deltaY } = event;

        const scaleFactor = deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);

        // Calculate the new scale
        const newScale = this.scale * scaleFactor;

        // Update the scale
        this.setScale(newScale);
    }

    private handleMouseDown(event: MouseEvent) {
        this.draggingMainCanvas = true;
        for (const component of this.components) {
            if (component.testHit(event, this.canvasOffsetX, this.canvasOffsetY) && component.isDraggable) {
                // console.log("Component hit...", component)
                this.dragTarget = component;
                this.draggingMainCanvas = false;
                const cursorPosition = component.getCursorPosition(event);
                this.offsetX = cursorPosition.x - (component.pos.x * this.scale + this.canvasOffsetX);
                this.offsetY = cursorPosition.y - (component.pos.y * this.scale + this.canvasOffsetY);
                return;
            }
        }
        if (this.draggingMainCanvas) {
            // console.log("Component not hit...", event)
            const cursorPosition = this.getCursorPosition(event);
            this.offsetX = cursorPosition.x / this.scale;
            this.offsetY = cursorPosition.y / this.scale;
        }
    }

    private handleMouseMove(event: MouseEvent) {
        const cursorPosition = this.getCursorPosition(event);
        const dx = (cursorPosition.x - this.lastMouseX) / this.scale;
        const dy = (cursorPosition.y - this.lastMouseY) / this.scale;

        if (this.dragTarget) {
            // console.log("Dragging target...", this.dragTarget)
            const newPos = new Vector(
                (cursorPosition.x - this.offsetX - this.canvasOffsetX) / this.scale,
                (cursorPosition.y - this.offsetY - this.canvasOffsetY) / this.scale)
            this.dragTarget.setPosition(newPos);
        } else if (this.draggingMainCanvas) {
            console.log("Dragging canvas...", this.draggingMainCanvas)
            this.canvasOffsetX += dx;
            this.canvasOffsetY += dy;
        }

        this.lastMouseX = cursorPosition.x;
        this.lastMouseY = cursorPosition.y;
        this.updateCanvas();
    }

    private handleMouseUp() {
        this.dragTarget = null;
        this.draggingMainCanvas = false;
    }

    getCursorPosition(event: MouseEvent) {
        // For main canvas
        var rect = this.canvasElement.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * this.canvasElement.width,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * this.canvasElement.height
        };
    }

    // Main canvas animate
    animate(balls: Circle[], floors: Wall[]) {
        // Clear the previous position of the note
        this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        this.updateCanvas();

        balls = balls.filter(ball => {
            if (!ball.isAlive) return false; // Remove dead balls from the array
            ball.draw(); // Draw only alive balls
            return true; // Keep alive balls in the array
        });
        balls.forEach((ball, index) => {
            //each ball object iterates through each wall object
            floors.forEach((floor) => {
                if (this.collisionDetectBallToFloor(balls[index], floor)) {
                    balls[index].bounce();
                    this.penetrationResolutionBallToFloor(balls[index], floor);
                    this.collisionDetectBallToFloor(balls[index], floor);
                }
            })
            // Calls the collision detection for each ball pair
            for (let i = index + 1; i < balls.length; i++) {
                if (this.collisionDetectBallToBall(balls[index], balls[i])) {
                    balls[i].updateColorAfterCollision('red');
                    balls[index].updateColorAfterCollision('red');
                    // balls[index].kill();
                    // balls[i].kill();
                    this.penetrationResolutionBallToBall(balls[index], balls[i]);
                    this.collisionResolutionBallToBall(balls[index], balls[i]);
                }
            }
            ball.reposition();
            // Update the position of the ball
        });

        // Request the next animation frame
        requestAnimationFrame(() => this.animate(balls, floors));
    }

    // Collision detections between ball and floor
    closestPointInTheLineBallToFloor(ball: Circle, floor: Wall): Vector {
        const ballToFloorStart = floor.start.subtract(ball.pos);
        if (Vector.dot(floor.wallUnit(), ballToFloorStart) > 0) {
            return floor.start;
        }

        const floorEndToBall = ball.pos.subtract(floor.end);
        if (Vector.dot(floor.wallUnit(), floorEndToBall) > 0) {
            return floor.end;
        }

        const closestDistance = Vector.dot(floor.wallUnit(), ballToFloorStart);
        const closestVector = floor.wallUnit().multiply(closestDistance);
        return floor.start.subtract(closestVector);
    }

    collisionDetect(ball: Circle, floor: Wall) {
        //this.closestPointInTheLineBallToFloor(ball, floor).subtract(ball.pos).drawVec(this.canvasContext, ball.pos.x, ball.pos.y, 1, 'red'); // DEBUG LINE
        if (this.collisionDetectBallToFloor(ball, floor)) {
            this.penetrationResolutionBallToFloor(ball, floor);
        }
    }

    collisionDetectBallToFloor(ball: Circle, floor: Wall) {
        let ballToClosest = this.closestPointInTheLineBallToFloor(ball, floor).subtract(ball.pos);
        if (ballToClosest.magnitude() < ball.radius) {
            return true;
        }
    }

    penetrationResolutionBallToFloor(ball: Circle, floor: Wall) {
        let penVector = ball.pos.subtract(this.closestPointInTheLineBallToFloor(ball, floor));
        ball.pos = ball.pos.add(penVector.unit().multiply(ball.radius - penVector.magnitude()));
    }

    //TODO: Maybe all ball related logic should go somewhere else... Collision detections between balls
    collisionDetectBallToBall(b1: Circle, b2: Circle) {
        if (b1.radius + b2.radius >= b2.pos.subtract(b1.pos).magnitude()) {
            return true;
        } else {
            return false;
        }
    }
    //penetration resolution
    //repositions the balls based on the penetration depth and the collision normal
    penetrationResolutionBallToBall(b1: Circle, b2: Circle) {
        let dist = b1.pos.subtract(b2.pos);
        let pen_depth = b1.radius + b2.radius - dist.magnitude();
        let pen_res = dist.unit().multiply(pen_depth / 2);
        b1.pos = b1.pos.add(pen_res);
        b2.pos = b2.pos.add(pen_res.multiply(-1));
    }

    //collision resolution
    //calculates the balls new velocity vectors after the collision
    collisionResolutionBallToBall(b1: Circle, b2: Circle) {
        let normal = b1.pos.subtract(b2.pos).unit();
        let relVel = b1.vel.subtract(b2.vel);
        let sepVel = Vector.dot(relVel, normal);
        let new_sepVel = -sepVel * Math.min(b1.elasticity, b2.elasticity);

        //the difference between the new and the original sep.velocity value
        let vsep_diff = new_sepVel - sepVel;

        //dividing the impulse value in the ration of the inverse masses
        //and adding the impulse vector to the original vel. vectors
        //according to their inverse mass
        let impulse = vsep_diff / (b1.inv_mass + b2.inv_mass);
        let impulseVec = normal.multiply(impulse);

        b1.vel = b1.vel.add(impulseVec.multiply(b1.inv_mass));
        b2.vel = b2.vel.add(impulseVec.multiply(-b2.inv_mass));
    }

}

abstract class CanvasBaseComponent {
    selected: boolean = false;
    canvasElement: HTMLCanvasElement;
    canvasContext!: CanvasRenderingContext2D;
    pos: Vector;
    width: number;
    height: number;
    lineWidth: number;
    scale: number;
    protected imgSrc: string | null = null;
    protected image: HTMLImageElement | null = null;
    // Shadow
    private shadowColor?: string;
    private shadowBlur?: number;
    private shadowOffsetX?: number;
    private shadowOffsetY?: number;
    isDraggable: boolean = false;
    constructor(
        canvasElement: HTMLCanvasElement,
        width: number,
        height: number,
        pos: Vector,
        lineWidth?: number,
        scale?: number
    ) {
        this.canvasElement = canvasElement;
        const res = canvasElement.getContext('2d');
        if (res) {
            this.canvasContext = res;
        }
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.lineWidth = lineWidth || .1;
        this.scale = scale || 1;
    }

    // Abstract method to be implemented by subclasses
    abstract draw(): void;
    abstract testHit(event: MouseEvent, canvasOffsetX: number, canvasOffsetY: number): boolean;

    setScale(newScale: number) {
        this.scale = newScale;
    }

    setDraggable(draggable: boolean) {
        this.isDraggable = draggable;
    }

    setPosition(newPos: Vector) {
        this.pos = newPos;
    }

    adjustPosition(deltaX: number, deltaY: number) {
        this.pos.x += deltaX;
        this.pos.y += deltaY;
    }

    getCursorPosition(event: MouseEvent): MousePosition {
        var rect = this.canvasElement.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * this.canvasElement.width,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * this.canvasElement.height
        };
    }

    preloadImage(imgSrc: string) {
        this.imgSrc = imgSrc;
        this.image = new Image();
        this.image.src = imgSrc;
    }

    drawImage() {
        if (this.image && this.image.complete) {
            this.canvasContext.drawImage(this.image, this.pos.x, this.pos.y, this.width, this.height);
        }
    }

    preloadImageAndDraw(imgSrc: string) {
        this.preloadImage(imgSrc);
        this.drawImage();
    }

    updateCanvas() {
        this.draw();
        this.drawImage();
    }

    setShadow(...shadowProps: (string | number)[]) {
        debugger
        const [shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY] = shadowProps;
        this.shadowColor = shadowColor as string;
        this.shadowBlur = shadowBlur as number;
        this.shadowOffsetX = shadowOffsetX as number;
        this.shadowOffsetY = shadowOffsetY as number;
    }

    applyShadow() {
        if (this.shadowColor) {
            this.canvasContext.shadowColor = this.shadowColor;
            this.canvasContext.shadowBlur = this.shadowBlur!;
            this.canvasContext.shadowOffsetX = this.shadowOffsetX!;
            this.canvasContext.shadowOffsetY = this.shadowOffsetY!;
        }
    }

    clearShadow() {
        this.canvasContext.shadowColor = 'transparent';
        this.canvasContext.shadowBlur = 0;
        this.canvasContext.shadowOffsetX = 0;
        this.canvasContext.shadowOffsetY = 0;
    }

    applyOrClearShadow() {
        if (this.shadowColor) return this.applyShadow();
        return this.clearShadow();
    }
}


export { MainCanvas, CanvasBaseComponent };