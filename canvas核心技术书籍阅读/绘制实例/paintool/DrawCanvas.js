import ToolCanvas from "./ToolCanvas.js";
const DRAWINGCOLOR = "green"; //鼠标移动过程中线条的颜色

export default class DrawCanvas {
    #ImageData;
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.strokeStyle = "cornflowerblue"; // 默认线条颜色
        this.context.fillStyle = "rgba(253, 203, 110,0.6)"; // 默认填充颜色
        this.tool = new ToolCanvas(canvas);
        this.tool.grid(0, 0, this.canvas.width, this.canvas.height, 10);
        this.curveBall = null;
        this.#ImageData = null;
    }
    /* 方便调用属性 */
    get strokeColor() {
        return this.context.strokeStyle;
    }
    set strokeColor(value) {
        this.context.strokeStyle = value;
    }
    get fillColor() {
        return this.context.strokeStyle;
    }
    set fillColor(value) {
        this.context.fillStyle = value;
    }
    saveImageData() {
        this.#ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    restoreCanvas() {
        this.context.putImageData(this.#ImageData, 0, 0);
    }
    // 总的绘制方法入口
    draw(type, params) {
        this[type].apply(this, params);
    }
    // 画直线(半像素问题，如果是水平或垂直线，在lineWidth是基数时会出现，原因就是画的线是以起始坐标为中心，向两端扩张造成)
    line(x1, y1, x2, y2) {
        console.log(x1, y1, x2, y2);
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
        console.log(this.context.strokeStyle, 11);
    }
    rect(x1, y1, x2, y2, isFill) {
        this.context.beginPath();
        this.context.strokeRect(x1, y1, x2 - x1, y2 - y1);
        if (isFill) {
            this.context.fillRect(x1, y1, x2 - x1, y2 - y1);
        }
    }
    circle(x1, y1, x2, y2, isFill) {
        this.context.beginPath();
        let r = this.twoPointDistance(x1, y1, x2, y2);
        this.context.arc(x1, y1, r, 0, Math.PI * 2);
        this.context.stroke();
        if (isFill) {
            this.context.fill();
        }
    }
    linePath(pathArr, isFill) {
        this.context.beginPath();
        if (isFill) {
            this.context.closePath();
            this.context.fill();
        }
        pathArr.forEach((item) => this.context.lineTo(...item));
        this.context.stroke();
    }
    /**
     * curve 方法总共有四个步骤，首次move和up，出现调整球，然后对调整球进行move和up
     * @param step {String} - [step = "move" ] 当前步骤
     */
    curve(x1, y1, x2, y2, step = "move") {
        if (step === "move" || step === "up") {
            this.line.call(this, x1, y1, x2, y2);
            if (step === "up") {
                const ballR = 20
                let cx = (x1 + x2) / 2;
                let cy = (y1 + y2) / 2;
                /* 为了配合前面的画圆方法，再造一个圆上的点位。画圆更合适的是直接传半径。这里是专门适应这个例子的实现 */
                let cx2 = cx+ballR;
                let cy2 = cy
                this.context.save()
                /* 小球style */
                this.context.strokeStyle = "#3498db"
                this.context.fillStyle = "rgba(241, 196, 15,0.6)"
                this.circle.call(this, cx, cy, cx2, cy2, true);
                this.context.restore()
            }
        }
    }
    // 计算两点之间距离
    twoPointDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
}
