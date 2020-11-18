import ToolCanvas from "./ToolCanvas.js";
const DRAWINGCOLOR = "green"; //鼠标移动过程中线条的颜色
const CURVEBALLR = 20; // 贝塞尔曲线图的小球半径
const FONTSTYLE = "48px Palatino"; //字体样式
const CURSORTIME = 1000; //光标闪烁一次的时间

export default class DrawCanvas {
    #ImageData;
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.strokeStyle = "cornflowerblue"; // 默认线条颜色
        this.context.fillStyle = "rgba(253, 203, 110,0.6)"; // 默认填充颜色
        this.context.font = FONTSTYLE; //默认字体样式
        /* 使字体位于单位中心 */
        this.context.textAlign = "center"; //默认start
        this.context.textBaseline = "middle"; //默认alphabetic
        this.tool = new ToolCanvas(canvas);
        this.tool.grid(0, 0, this.canvas.width, this.canvas.height, 10);
        this.currentCurve = null;
        this.#ImageData = null;
        this.currentFont = null;
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
    saveImageData(isTem) {
        // 临时保存
        if (isTem) {
            return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.#ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    restoreCanvas(imgData) {
        if (imgData) {
            this.context.putImageData(imgData, 0, 0);
        } else {
            this.context.putImageData(this.#ImageData, 0, 0);
        }
    }
    // 总的绘制方法入口
    draw(type, params) {
        this[type].apply(this, params);
    }
    // 画直线(半像素问题，如果是水平或垂直线，在lineWidth是基数时会出现，原因就是画的线是以起始坐标为中心，向两端扩张造成)
    line(x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
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
        /* arc的绘制，border是算在半径内的 */
        this.context.arc(x1, y1, r, 0, Math.PI * 2);
        this.context.stroke();
        if (isFill) {
            this.context.fill();
        }
    }
    linePath(pathArr, isFill) {
        this.context.beginPath();
        pathArr.forEach((item) => this.context.lineTo(...item));
        if (isFill) {
            this.context.closePath();
            this.context.fill();
        }
        this.context.stroke();
    }
    /**
     * curve 方法总共有四个步骤，首次move和up，出现调整球，然后对调整球进行ballMove和ballUp
     * @param step {String} - [step = "move" ] 当前步骤
     */
    curve(step = "move", x1, y1, x2, y2) {
        if (step === "move" || step === "up") {
            this.line.call(this, x1, y1, x2, y2);
            if (step === "up") {
                this.drawCurveBall(x1, y1, x2, y2);
                this.currentCurve = {
                    rx: (x1 + x2) / 2,
                    ry: (y1 + y2) / 2,
                    r: CURVEBALLR,
                    startX: x1,
                    startY: y1,
                    endX: x2,
                    endY: y2,
                    step: "up",
                };
            }
        } else if (step === "ballMove") {
            this.drawCurveBall(x1, y1);
            this.context.beginPath();
            this.context.moveTo(this.currentCurve.startX, this.currentCurve.startY);
            this.context.quadraticCurveTo(x1, y1, this.currentCurve.endX, this.currentCurve.endY);
            this.context.stroke();
        } else if (step === "ballUp") {
            this.context.beginPath();
            this.context.moveTo(this.currentCurve.startX, this.currentCurve.startY);
            this.context.quadraticCurveTo(x1, y1, this.currentCurve.endX, this.currentCurve.endY);
            this.context.fill();
            this.context.stroke();
            this.currentCurve = null;
        }
    }
    // 画curve图的小球
    drawCurveBall(x1, y1, x2, y2) {
        let cx, cy;
        if (typeof x2 === "undefined") {
            cx = x1;
            cy = y1;
        } else {
            cx = (x1 + x2) / 2;
            cy = (y1 + y2) / 2;
        }
        /* 为了配合前面的画圆方法，再造一个圆上的点位。画圆更合适的是直接传半径。这里是专门适应这个例子的实现 */
        let cx2 = cx + CURVEBALLR;
        let cy2 = cy;
        this.context.save();
        /* 小球style */
        this.context.strokeStyle = "#3498db";
        this.context.fillStyle = "rgba(241, 196, 15,0.6)";
        this.circle.call(this, cx, cy, cx2, cy2, true);
        this.context.restore();
    }
    // 计算两点之间距离
    twoPointDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    // 判断当前点是否在某个圆内,这里主要是为了画曲线时候调用,判断别的圆第三个参数需要传入相应的对象
    judgeInCircle(px, py, circleParams = this.currentCurve) {
        this.context.beginPath();
        this.context.arc(circleParams.rx, circleParams.ry, circleParams.r, 0, Math.PI * 2);
        return this.context.isPointInPath(px, py);
    }
    font(x, y) {
        // 先执行一遍，就不用等一秒才出来效果
        this.fontCursor(x, y);
        setInterval(() => {
            this.fontCursor(x, y);
        }, CURSORTIME);
    }
    // 鼠标光标
    fontCursor(x, y) {
        let temImgData = this.saveImageData(true);
        const CursorWidth = 1;
        let aMatch = this.context.font.match(/(\d+)px/);
        let fontSize = 48;
        if (aMatch) {
            fontSize = +aMatch[1];
        }
        // 不必知道前面的样式，就可以用save还原回去
        this.context.save();
        this.context.fillStyle = "#1e90ff";
        this.context.fillRect(x, y - fontSize / 2, CursorWidth, fontSize);
        this.context.restore();
        setTimeout(() => {
            this.restoreCanvas(temImgData);
        }, CURSORTIME / 2);
    }
}
