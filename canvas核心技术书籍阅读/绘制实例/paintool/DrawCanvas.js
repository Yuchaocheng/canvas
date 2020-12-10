import ToolCanvas from "./ToolCanvas.js";
const CANVASBG = "#ffffff"; //canvas默认背景
const DRAWINGCOLOR = "green"; //鼠标移动过程中线条的颜色
const CURVEBALLR = 20; // 贝塞尔曲线图的小球半径
const FONTSTYLE = "48px Palatino"; //字体样式
const CURSORTIME = 1000; //光标闪烁一次的时间(暂时不知道怎么实现)
const FONTLINEGAP = 8; //字体换行之间的间隙大小
const TAILR = 40; // 尾随效果圆半径，橡皮擦也用这个
/* 橡皮擦样式 */
const ERASER_LINE_WIDTH = 1; // 橡皮擦的半径必须要加上橡皮擦border的宽度，否则clip清除不了边
const ERASER_SHADOW_STYLE = "blue";
const ERASER_STROKE_STYLE = "rgba(0,0,255,0.6)";
const ERASER_SHADOW_OFFSET = -5;
const ERASER_SHADOW_BLUR = 20;

export default class DrawCanvas {
    #ImageData;
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.strokeStyle = "cornflowerblue"; // 默认线条颜色
        this.context.fillStyle = "rgba(253, 203, 110,0.6)"; // 默认填充颜色
        this.context.lineWidth = 1; // 默认线条长度
        this.context.font = FONTSTYLE; //默认字体样式
        /* 使字体位于单位中心 */
        this.context.textBaseline = "middle"; //默认alphabetic
        this.tool = new ToolCanvas(canvas);
        this.grid();
        this.currentCurve = null;
        this.#ImageData = null;
        this.currentFont = null;
        this.lastEraser = null;
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
    get lineWidth() {
        return this.context.lineWidth;
    }
    set lineWidth(value) {
        this.context.lineWidth = value;
    }
    grid() {
        this.tool.grid(0, 0, this.canvas.width, this.canvas.height, 10);
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
    /* 只能输入英文，web上目前好像只有input框能实现其他语言的输入，如果一定要输入其他语言，需要做透明input模拟
       因为这里主要是学习canvas用法，就不做其他语言的扩展了。isDone是否绘制完成 。
    */
    font(x, y, textArr, isDone) {
        if (this.currentFont) {
            //键盘事件
            let content = textArr.join("");
            this.restoreCanvas();
            this.context.strokeText(content, this.currentFont.x, this.currentFont.y);
            this.context.fillText(content, this.currentFont.x, this.currentFont.y);
            let textSize = this.context.measureText(content);
            if (!isDone) {
                let cursorX = this.currentFont.x + textSize.width + 4; //4像素是流出来的空隙
                this.fontCursor(cursorX, this.currentFont.y);
            } else {
                let newX = x;
                let newY = y;
                if (typeof x !== "number") {
                    //按下了回车键
                    newX = this.currentFont.x;
                    newY = this.currentFont.y + this.currentFont.fontSize + FONTLINEGAP;
                }
                //一次font绘制结束
                this.saveImageData();
                this.currentFont = null;
                this.font(newX, newY);
            }
        } else {
            this.currentFont = { x, y };
            this.fontCursor(x, y);
        }
    }
    // 鼠标光标
    fontCursor(x, y) {
        const CursorWidth = 1;
        let aMatch = this.context.font.match(/(\d+)px/);
        let fontSize = 48; //默认值
        if (aMatch) {
            fontSize = +aMatch[1];
        }
        this.currentFont.fontSize = fontSize;
        // 不必知道前面的样式，就可以用save还原回去
        this.context.save();
        this.context.fillStyle = "#1e90ff";
        this.context.fillRect(x, y - fontSize / 2, CursorWidth, fontSize);
        this.context.restore();
        /* 光标闪烁目前看好像没办法完成，闪烁本身是简单的，但是会影响其他图形，因为半秒内也有可能画了其他图形 */
        // setTimeout(() => {
        //     this.context.save();
        //     this.context.fillStyle = "white";
        //     this.context.fillRect(x, y - fontSize / 2, CursorWidth, fontSize);
        //     this.context.fillRect(0,0,200,200);
        //     this.context.restore();
        // }, CURSORTIME / 2);
    }
    // 尾随效果
    tail(path) {
        // 尾随效果是不重新绘制的，所以每次都取最后一个点
        this.context.beginPath();
        this.context.save();
        let [x, y] = path[path.length - 1];
        // this.context.moveTo(x + TAILR, y); //arc的起笔是在圆的(0,r)位置
        this.context.arc(x, y, TAILR, 0, Math.PI * 2);
        this.context.globalAlpha = "0.6";
        this.context.stroke();
        this.context.globalAlpha = "0.2";
        this.context.fill();
        this.context.restore();
    }
    // 橡皮擦
    eraser(x, y, isDone) {
        if (!this.lastEraser) {
            this.lastEraser = { x, y };
            return;
        }
        this.eraserMain();
        /* 绘制本次橡皮擦圆圈 */
        if (isDone) {
            this.lastEraser = null;
            return;
        }
        this.context.save();
        this.context.beginPath();
        this.setEraserAttributes();
        this.context.arc(x, y, TAILR, 0, Math.PI * 2);
        this.context.clip();
        this.context.stroke();
        this.context.restore();
        this.lastEraser.x = x;
        this.lastEraser.y = y;
    }
    // 擦除上次橡皮擦圆圈，并补上背景
    eraserMain() {
        this.context.save();
        this.context.beginPath();
        // +1是为了防锯齿
        this.context.arc(this.lastEraser.x, this.lastEraser.y, TAILR + ERASER_LINE_WIDTH + 1, 0, Math.PI * 2);
        this.context.clip();
        // this.context.fill(); //这里是不用fill的，原因就是下面画网格的时候就相当于清空了这个圆里面的内容
        this.grid();
        this.context.restore();
    }
    // 橡皮擦样式，模仿下书中的样式
    setEraserAttributes() {
        this.context.lineWidth = ERASER_LINE_WIDTH;
        this.context.shadowColor = ERASER_SHADOW_STYLE;
        this.context.shadowOffsetX = ERASER_SHADOW_OFFSET;
        this.context.shadowOffsetY = ERASER_SHADOW_OFFSET;
        this.context.shadowBlur = ERASER_SHADOW_BLUR;
        this.context.strokeStyle = ERASER_STROKE_STYLE;
    }
    // 清空画布
    clearAll() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.grid();
    }
    // 画布截屏(写得不是很好，有时间优化下)
    capture() {
        /* transitionend animationend 动画回调函数 */
        let img = document.createElement("img");
        let btn = document.createElement("xy-button");
        btn.innerHTML = "×";
        btn.style.position = "fixed";

        btn.onclick = () => {
            img.style.opacity = 0;
            document.body.removeChild(btn);
            setTimeout(() => {
                document.body.removeChild(img);
            }, 600);
        };
        this.canvas.toBlob((blob) => {
            let url = URL.createObjectURL(blob);
            img.src = url;
        });
        img.onload = () => {
            let style = {
                transition: "all 0.6s ease-out",
                transformOrigin: "right bottom",
                position: "fixed",
                right: 0,
                bottom: 0,
            };
            document.body.appendChild(img);
            Object.assign(img.style, style);
            setTimeout(() => {
                btn.style.bottom = img.height / 2 - 40 + "px";
                btn.style.right = "6px";
                setTimeout(() => {
                    document.body.appendChild(btn);
                }, 600);
                img.style.transform = "scale(0.5)";
            }, 50);
        };
    }
}
