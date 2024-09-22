import { CanvasBaseComponent } from '../canvas.js';
export default class TextComponent extends CanvasBaseComponent {
    constructor(canvasElement, text, maxWidth, pos, font = '16px Arial', color = 'black') {
        super(canvasElement, 0, 0, pos);
        this.text = text;
        this.font = font;
        this.color = color;
        this.maxWidth = maxWidth;
    }
    draw() {
        this.applyOrClearShadow();
        this.canvasContext.font = this.font;
        this.canvasContext.fillStyle = this.color;
        this.wrapText(this.text, this.pos.x, this.pos.y, this.maxWidth);
    }
    updateCanvas() {
        this.clear();
        this.draw();
    }
    clear() {
        // Clear the canvas area where the text is drawn
        const textHeight = parseInt(this.font, 10); // Assuming the font size is in px
        //this.canvasContext.clearRect(this.pos.x, this.pos.y - textHeight, this.maxWidth, this.calculateTextHeight(this.text, this.maxWidth));
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
