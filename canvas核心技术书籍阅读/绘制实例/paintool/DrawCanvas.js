import ToolCanvas from "./ToolCanvas.js";
const DRAWINGCOLOR = "green"; //鼠标移动过程中线条的颜色

export default class DrawCanvas {
    #ImageData;
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        // 默认线条颜色
        this.context.strokeStyle = "cornflowerblue";
        this.tool = new ToolCanvas(canvas);
        this.tool.grid(0, 0, this.canvas.width, this.canvas.height, 10);
        this.#ImageData = null;
        
    }
    /* 方便调用属性 */
    get strokeColor() {
        return this.context.strokeStyle;
    }
    set strokeColor(value) {
        this.context.strokeStyle = value;
    }
    saveImageData() {
        this.#ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    restoreCanvas() {
        this.context.putImageData(this.#ImageData, 0, 0);
    }
    // 画直线(半像素问题，如果是水平或垂直线，在lineWidth是基数时会出现，原因就是画的线是以起始坐标为中心，向两端扩张造成)
    line(x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }
}
