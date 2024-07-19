var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MainCanvas_instances, _MainCanvas_initMainCanvas;
class MainCanvas {
    constructor(canvasElement) {
        _MainCanvas_instances.add(this);
        this.components = [];
        this.scale = 1;
        this.dragTarget = null;
        this.draggingMainCanvas = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
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
        this.canvasContext.translate(this.canvasOffsetX, this.canvasOffsetY);
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
        const { deltaY } = event;
        const scaleFactor = deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
        // Calculate the new scale
        const newScale = this.scale * scaleFactor;
        // Update the scale
        this.setScale(newScale);
    }
    handleMouseDown(event) {
        this.draggingMainCanvas = true;
        for (const component of this.components) {
            this.dragTarget = component.getHitTarget(event, this.canvasOffsetX, this.canvasOffsetY);
            console.log("Component hit...", this.dragTarget);
            this.draggingMainCanvas = false;
            const cursorPosition = component.getCursorPosition(event);
            this.offsetX = cursorPosition.x - (component.posX * this.scale + this.canvasOffsetX);
            this.offsetY = cursorPosition.y - (component.posY * this.scale + this.canvasOffsetY);
            return;
        }
        if (this.draggingMainCanvas) {
            console.log("Component not hit...", event);
            const cursorPosition = this.getCursorPosition(event);
            this.offsetX = cursorPosition.x / this.scale;
            this.offsetY = cursorPosition.y / this.scale;
        }
    }
    handleMouseMove(event) {
        const cursorPosition = this.getCursorPosition(event);
        const dx = (cursorPosition.x - this.lastMouseX) / this.scale;
        const dy = (cursorPosition.y - this.lastMouseY) / this.scale;
        if (this.dragTarget) {
            console.log("Dragging target...", this.dragTarget);
            this.dragTarget.setPosition((cursorPosition.x - this.offsetX - this.canvasOffsetX) / this.scale, (cursorPosition.y - this.offsetY - this.canvasOffsetY) / this.scale);
        }
        else if (this.draggingMainCanvas) {
            console.log("Dragging canvas...", this.draggingMainCanvas);
            this.canvasOffsetX += dx;
            this.canvasOffsetY += dy;
        }
        this.lastMouseX = cursorPosition.x;
        this.lastMouseY = cursorPosition.y;
        this.updateCanvas();
    }
    handleMouseUp() {
        this.dragTarget = null;
        this.draggingMainCanvas = false;
    }
    getCursorPosition(event) {
        // For main canvas
        var rect = this.canvasElement.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * this.canvasElement.width,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * this.canvasElement.height
        };
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
    constructor(canvasElement, width, height, posX, posY, lineWidth, scale) {
        this.selected = false;
        this.imgSrc = null;
        this.image = null;
        this.children = [];
        this.canvasElement = canvasElement;
        const res = canvasElement.getContext('2d');
        if (res) {
            this.canvasContext = res;
        }
        this.posX = posX || 0;
        this.posY = posY || 0;
        this.width = width;
        this.height = height;
        this.lineWidth = lineWidth || .1;
        this.scale = scale || 1;
    }
    setScale(newScale) {
        this.scale = newScale;
        this.children.forEach(child => child.setScale(newScale));
    }
    addComponent(component) {
        // TODO: Adjust position automatically in relative to current component?
        component.posX = this.posX + component.posX;
        component.posY = this.posY + component.posY;
        this.children.push(component);
    }
    setPosition(x, y) {
        const deltaX = x - this.posX;
        const deltaY = y - this.posY;
        this.children.forEach((child) => child.adjustPosition(deltaX, deltaY));
        this.posX = x;
        this.posY = y;
    }
    adjustPosition(deltaX, deltaY) {
        this.posX += deltaX;
        this.posY += deltaY;
        this.children.forEach((child) => child.adjustPosition(deltaX, deltaY));
    }
    getCursorPosition(event) {
        var rect = this.canvasElement.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * this.canvasElement.width,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * this.canvasElement.height
        };
    }
    preloadImage(imgSrc) {
        this.imgSrc = imgSrc;
        this.image = new Image();
        this.image.src = imgSrc;
    }
    drawImage() {
        if (this.image && this.image.complete) {
            this.canvasContext.drawImage(this.image, this.posX, this.posY, this.width, this.height);
        }
    }
    preloadImageAndDraw(imgSrc) {
        this.preloadImage(imgSrc);
        this.drawImage();
    }
    updateCanvas() {
        this.draw();
        this.drawImage();
    }
    getHitTarget(event, canvasOffsetX = 0, canvasOffsetY = 0) {
        console.log("Base component getting hit target...", this);
        const hitTarget = this.children.find(child => {
            if (child.testHit(event, this.posX + canvasOffsetX, this.posY + canvasOffsetY)) {
                console.log("Base component hit child", child);
                return true;
            }
            return false;
        });
        return hitTarget || null;
    }
    setShadow(...shadowProps) {
        const [shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY] = shadowProps;
        this.shadowColor = shadowColor;
        this.shadowBlur = shadowBlur;
        this.shadowOffsetX = shadowOffsetX;
        this.shadowOffsetY = shadowOffsetY;
    }
    applyShadow() {
        if (this.shadowColor) {
            this.canvasContext.shadowColor = this.shadowColor;
            this.canvasContext.shadowBlur = this.shadowBlur;
            this.canvasContext.shadowOffsetX = this.shadowOffsetX;
            this.canvasContext.shadowOffsetY = this.shadowOffsetY;
        }
    }
    clearShadow() {
        this.canvasContext.shadowColor = 'transparent';
        this.canvasContext.shadowBlur = 0;
        this.canvasContext.shadowOffsetX = 0;
        this.canvasContext.shadowOffsetY = 0;
    }
    applyOrClearShadow() {
        if (this.shadowColor)
            return this.applyShadow();
        return this.clearShadow();
    }
}
class Rectangle extends CanvasBaseComponent {
    constructor(canvasElement, width, height, color, posX, posY) {
        super(canvasElement, width, height, posX, posY);
        this.color = color;
        if (this.imgSrc) {
            this.preloadImage(this.imgSrc);
        }
        return this;
    }
    draw() {
        this.applyOrClearShadow();
        this.canvasContext.fillStyle = this.color;
        this.canvasContext.fillRect(this.posX, this.posY, this.width, this.height);
        this.children.forEach(child => child.draw());
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
    testHit(event, canvasOffsetX = 0, canvasOffsetY = 0) {
        console.log("Rectangle component testing hit...", this);
        this.children.forEach((child) => child.testHit(event, canvasOffsetX, canvasOffsetY));
        const mousePosition = this.getCursorPosition(event);
        // Take into account scale factor
        return (((this.posX + canvasOffsetX) * this.scale) <= mousePosition.x && mousePosition.x <= (this.posX + canvasOffsetX + this.width) * this.scale) &&
            ((this.posY + canvasOffsetY) * this.scale <= mousePosition.y && mousePosition.y <= (this.posY + canvasOffsetY + this.height) * this.scale);
    }
}
class Circle extends CanvasBaseComponent {
    constructor(canvasElement, radius, color, posX, posY) {
        super(canvasElement, 0, 0, posX, posY);
        this.radius = radius;
        this.color = color;
        if (this.imgSrc) {
            this.preloadImage(this.imgSrc);
        }
        return this;
    }
    draw() {
        this.applyOrClearShadow();
        this.canvasContext.fillStyle = this.color;
        this.canvasContext.beginPath();
        this.canvasContext.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        this.canvasContext.fill();
        this.children.forEach(child => child.draw());
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
        const isHit = Math.pow((this.posX + canvasOffsetX) * this.scale - mousePosition.x, 2) + Math.pow((this.posY + canvasOffsetY) * this.scale - mousePosition.y, 2) <= Math.pow(this.radius, 2);
        return isHit;
    }
}
class TextComponent extends CanvasBaseComponent {
    constructor(canvasElement, text, maxWidth, posX, posY, font = '16px Arial', color = 'black') {
        super(canvasElement, 0, 0, posX, posY);
        this.text = text;
        this.font = font;
        this.color = color;
        this.maxWidth = maxWidth;
    }
    draw() {
        this.applyOrClearShadow();
        this.canvasContext.font = this.font;
        this.canvasContext.fillStyle = this.color;
        this.wrapText(this.text, this.posX, this.posY, this.maxWidth);
    }
    updateCanvas() {
        this.clear();
        this.draw();
    }
    clear() {
        // Clear the canvas area where the text is drawn
        const textHeight = parseInt(this.font, 10); // Assuming the font size is in px
        this.canvasContext.clearRect(this.posX, this.posY - textHeight, this.maxWidth, this.calculateTextHeight(this.text, this.maxWidth));
    }
    setText(text) {
        this.text = text;
        this.updateCanvas();
    }
    wrapText(text, x, y, maxWidth) {
        const words = text.split(' ');
        let line = '';
        let lineHeight = parseInt(this.font, 10);
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = this.canvasContext.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this.canvasContext.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        this.canvasContext.fillText(line, x, y);
    }
    calculateTextHeight(text, maxWidth) {
        const words = text.split(' ');
        let line = '';
        let lineHeight = parseInt(this.font, 10);
        let height = lineHeight;
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = this.canvasContext.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                line = words[n] + ' ';
                height += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        return height;
    }
    testHit(event, canvasOffsetX = 0, canvasOffsetY = 0) {
        return false;
    }
}
export { MainCanvas, Rectangle, Circle, TextComponent };
