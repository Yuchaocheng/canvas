import Utils from "./Util.js";

const DEFAULTCURSOR = "crosshair"; //默认鼠标样式
const DRAWINGCOLOR = "green"; //绘制过程中线条的颜色
const CURVEBALLR = 20; // 贝塞尔曲线图的小球半径
const FONTSTYLE = "48px Palatino"; //字体样式
const FONTLINEGAP = 8; //字体换行之间的间隙大小
const TAILR = 40; // 尾随效果圆半径，橡皮擦也用这个
/* 橡皮擦样式 */
const ERASER_LINE_WIDTH = 1; // 橡皮擦的半径必须要加上橡皮擦border的宽度，否则clip清除不了边
const ERASER_SHADOW_STYLE = "blue";
const ERASER_STROKE_STYLE = "rgba(0,0,255,0.6)";
const ERASER_SHADOW_OFFSET = -5;
const ERASER_SHADOW_BLUR = 20;
const GRID_COLOR = "rgb(0, 0, 200)"; // 网格颜色

// 绘制类型为路径类型
const PATHDRAWTYPE = ["openLine", "closeLine", "tail"];

export default class DrawCanvas {
    constructor(canvas, bgCanvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.lineWidth = 1; // 默认线条长度
        this.context.font = FONTSTYLE; //默认字体样式
        /* 使字体位于单位中心 */
        this.context.textBaseline = "middle"; //默认alphabetic
        this.context.strokeStyle = this.strokeColor = "cornflowerblue"; //默认线条颜色，可配
        this.context.fillStyle = this.fillColor = "rgba(253, 203, 110,0.6)"; //默认填充颜色，可配
        this.bgCanvas = bgCanvas;
        this.currentCurve = null; //绘制贝塞尔曲线当前坐标信息
        this.curveStep = ""; //绘制二次贝塞尔曲线当前步骤
        this.imageData = null; //保存的canvas像素信息
        this.currentFont = null;
        this.lastEraser = null;
        /* 绘制类型，和左侧icon图标对应 */
        this.drawType = "";
        this.isDrawing = false; //是否正在绘制某种图形
        /* 鼠标信息 */
        this.mouseInfo = {
            mouseDownX: -1,
            mouseDownY: -1,
            latestEvent: null, //解决鼠标移出画布外up后异常
        };
        // 鼠标移动的路径
        this.pathArr = [];
        this.textArr = []; //文字存储
    }
    // 方便调用
    get lineWidth() {
        return this.context.lineWidth;
    }
    set lineWidth(value) {
        this.context.lineWidth = value;
    }
    get cursorType() {
        this.canvas.style.cursor;
    }
    set cursorType(cursor) {
        this.canvas.style.cursor = cursor;
    }
    init() {
        this.cursorType = DEFAULTCURSOR;
        this.grid();
        this.handleMouseDown = this.handleMouseDown.bind(this); //监听函数绑定this
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = Utils.throttle(this.handleMouseMove, 16).bind(this);
        this.documentMouseUp = this.documentMouseUp.bind(this);
        this.documentKeypress = this.documentKeypress.bind(this);
        this.documentKeydown = this.documentKeydown.bind(this);
        this.canvas.addEventListener("mousedown", this.handleMouseDown);
        this.canvas.addEventListener("mouseup", this.handleMouseUp);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
        document.addEventListener("mouseup", this.documentMouseUp);
        document.addEventListener("keypress", this.documentKeypress);
        document.addEventListener("keydown", this.documentKeydown);
    }
    // 实例销毁，主要清除监听事件
    destroy() {
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.removeEventListener("mouseup", this.handleMouseUp);
        this.canvas.removeEventListener("mousedown", this.handleMouseDown);
        document.removeEventListener("mouseup", this.documentMouseUp);
        document.removeEventListener("keypress", this.documentKeypress);
        document.removeEventListener("keydown", this.documentKeydown);
        this.canvas.width = this.canvas.width;
        this.bgCanvas.width = this.canvas.width;
    }
    /* 鼠标按下 */
    handleMouseDown(e) {
        const { mouseInfo, drawType, pathArr } = this;
        let isNeedSave = true; //是否需要存储画布数据
        if (PATHDRAWTYPE.includes(drawType)) {
            // 路径类型，鼠标移动时不需要一直重绘
            pathArr.push([e.layerX, e.layerY]);
        }
        if (drawType === "curve") {
            if (this.curveStep === "up") {
                // 已经绘制上了一个小球后点击
                this.curveStep = "ballMove";
                let bInCurveCircle = this.judgeInCircle(e.layerX, e.layerY);
                if (!bInCurveCircle) {
                    //如果未点击再圆内，则重新开始画一个二次贝塞尔曲线
                    this.restoreCanvas();
                    this.curveStep = "move";
                }
                isNeedSave = false;
            } else if (!this.curveStep) {
                //初始鼠标点击
                this.curveStep = "move";
            }
        } else if (drawType === "font") {
            // font 绘制起始于鼠标点击，这和其他一般类型开始于move不同
            if (this.currentFont) {
                isNeedSave = false;
                this.font(e.layerX, e.layerY, true);
            } else {
                this.saveImageData(); //先存储再绘制
                isNeedSave = false;
                this.font(e.layerX, e.layerY);
            }
        }
        if (isNeedSave) {
            this.saveImageData();
        }
        this.isDrawing = true;
        /* 尾随效果直接在move时绘制，不在up时重绘 */
        this.context.strokeStyle = drawType === "tail" ? this.strokeColor : DRAWINGCOLOR;
        mouseInfo.mouseDownX = e.layerX;
        mouseInfo.mouseDownY = e.layerY;
        mouseInfo.latestEvent = e;
    }
    /* 鼠标移动 */
    handleMouseMove(e) {
        const { mouseInfo, drawType, pathArr, curveStep } = this;
        if (!this.isDrawing) {
            return;
        }
        if (drawType === "font") {
            // font类型没有鼠标移动事件，是由键盘事件控制
            return;
        }
        if (PATHDRAWTYPE.includes(drawType)) {
            pathArr.push([e.layerX, e.layerY]);
        } else if (drawType === "curve") {
            if (curveStep === "up" || !curveStep) {
                //小球已被绘制，鼠标移动过程
                this.cursorType = this.judgeInCircle(e.layerX, e.layerY) ? "pointer" : DEFAULTCURSOR;
                return;
            }
            this.restoreCanvas();
        } else {
            if (drawType !== "eraser") {
                //橡皮擦移动过程中不恢复canvas
                this.restoreCanvas();
            }
        }
        let defaultParams = [mouseInfo.mouseDownX, mouseInfo.mouseDownY, e.layerX, e.layerY];
        /* 各绘制方式传入不同参数 */
        let oParamsMap = {
            openLine: [pathArr],
            closeLine: [pathArr],
            tail: [pathArr],
            eraser: [e.layerX, e.layerY],
        };
        /* 左侧tool类型和draw方法不对应时，做个映射 */
        let oTypeMap = {
            openLine: "linePath",
            closeLine: "linePath",
        };
        let funName = drawType in oTypeMap ? oTypeMap[drawType] : drawType;
        let aParams = drawType in oParamsMap ? oParamsMap[drawType] : defaultParams;
        this[funName](...aParams);
        mouseInfo.latestEvent = e;
    }
    /* 鼠标松开  */
    handleMouseUp(e) {
        const { mouseInfo, drawType, pathArr } = this;
        if (!this.isDrawing) {
            return;
        }
        let noUpTypes = ["font", "tail"]; //这些类型不需要鼠标放开事件
        if (noUpTypes.includes(drawType)) {
            if (drawType === "tail") {
                this.isDrawing = false;
            }
            return;
        }
        if (drawType !== "eraser") {
            this.restoreCanvas();
        }
        this.context.strokeStyle = this.strokeColor;
        this.context.fillStyle = this.fillColor;
        if (drawType === "curve") {
            if (this.curveStep === "move") {
                this.curveStep = "up";
                // 当前还属于绘制过程，并不算绘制完成；
                this.context.strokeStyle = DRAWINGCOLOR;
            } else if (this.curveStep === "ballMove") {
                this.curveStep = "ballUp";
            }
        }
        let defaultParams = [mouseInfo.mouseDownX, mouseInfo.mouseDownY, e.layerX, e.layerY];
        let oParamsMap = {
            rect: [...defaultParams, true], // 绘制结束时，矩形和圆填充
            circle: [...defaultParams, true],
            openLine: [pathArr, false, true],
            closeLine: [pathArr, true, true],
            eraser: [e.layerX, e.layerY, true],
        };
        /* 左侧icon类型和draw的方法名不完全对应时，映射关系 */
        let oTypeMap = {
            openLine: "linePath",
            closeLine: "linePath",
        };
        let funName = drawType in oTypeMap ? oTypeMap[drawType] : drawType;
        let aParams = drawType in oParamsMap ? oParamsMap[drawType] : defaultParams;
        this[funName](...aParams);

        /* 一般情况下鼠标松开一次绘制结束，下面是一些特殊情况 */
        if (drawType === "curve" && this.curveStep !== "ballMove") {
            return;
        }

        /* 绘制结束，初始化数据 */
        this.isDrawing = false;
        mouseInfo.mouseDownX = -1;
        mouseInfo.mouseDownY = -1;
        mouseInfo.latestEvent = null;
        pathArr.length = 0;
    }
    // 页面鼠标松开事件
    /* 
        event.target返回触发事件的元素
        event.currentTarget返回绑定事件的元素
    */
    documentMouseUp(e) {
        const isUpOut = this.canvas.contains(e.target);
        if (!isUpOut && this.isDrawing) {
            this.handleMouseUp(this.mouseInfo.latestEvent);
        }
    }
    // /* keypress按下有值的键时触发（Ctrl、Alt、Shift、Meta 这些键不触发）如果用户一直按键不松开，就会连续触发键盘事件 */
    documentKeypress(e) {
        if (this.drawType !== "font") {
            return;
        }
        if (e.keyCode === 13) {
            // 回车键回车，光标位置移动到下一格，fontArr清空
            this.font("", "", true); //第三个参数为是否换行
            return;
        }
        this.textArr.push(e.key);
        this.font();
    }
    // 回车键不触发，单独加一个监听函数判断
    documentKeydown(e) {
        if (this.drawType !== "font") {
            return;
        }
        if (e.keyCode === 8) {
            //backpack
            this.textArr.pop();
            this.font();
        }
    }
    // 绘制背景网格
    grid() {
        let ctx = this.bgCanvas.getContext("2d");
        /* 网格作为背景，需要部分透明 */
        ctx.strokeStyle = GRID_COLOR;
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.1;
        Utils.grid(ctx, { xGap: 10, yGap: 10 });
    }
    saveImageData(isReturn) {
        if (isReturn) {
            return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        }
        this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    restoreCanvas(imageData = this.imageData) {
        this.context.putImageData(imageData, 0, 0);
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
        let r = Utils.twoPointDistance(x1, y1, x2, y2);
        /* arc的绘制，border是算在半径内的 */
        this.context.arc(x1, y1, r, 0, Math.PI * 2);
        this.context.stroke();
        if (isFill) {
            this.context.fill();
        }
    }
    linePath(pathArr = [], isFill, isDone) {
        this.context.beginPath();
        let aDrawPath = pathArr.slice(-2);
        if (isDone) {
            //鼠标松开时绘制的线条，需绘制整条
            aDrawPath = pathArr;
        }
        /* 路径绘制时，不需要全部重绘，只画结尾两个点 */
        aDrawPath.forEach((item) => this.context.lineTo(...item));
        if (isFill) {
            this.context.closePath();
            this.context.fill();
        }
        this.context.stroke();
    }
    /**
     * curve 方法总共有四个步骤，首次move和up，出现调整球，然后对调整球进行ballMove和ballUp
     */
    curve(x1, y1, x2, y2) {
        const { curveStep } = this;
        if (curveStep === "move" || curveStep === "up") {
            this.line.call(this, x1, y1, x2, y2);
            if (curveStep === "up") {
                this.drawCurveBall(x1, y1, x2, y2);
                this.currentCurve = {
                    rx: (x1 + x2) / 2,
                    ry: (y1 + y2) / 2,
                    r: CURVEBALLR,
                    startX: x1,
                    startY: y1,
                    endX: x2,
                    endY: y2,
                };
            }
        } else if (curveStep === "ballMove") {
            this.drawCurveBall(x2, y2);
            this.context.beginPath();
            this.context.moveTo(this.currentCurve.startX, this.currentCurve.startY);
            this.context.quadraticCurveTo(x2, y2, this.currentCurve.endX, this.currentCurve.endY);
            this.context.stroke();
        } else if (curveStep === "ballUp") {
            this.context.beginPath();
            this.context.moveTo(this.currentCurve.startX, this.currentCurve.startY);
            this.context.quadraticCurveTo(x2, y2, this.currentCurve.endX, this.currentCurve.endY);
            this.context.fill();
            this.context.stroke();
            this.currentCurve = null;
            this.curveStep = "";
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
    // 判断当前点是否在某个圆内,这里主要是为了画曲线时候调用,判断别的圆第三个参数需要传入相应的对象
    judgeInCircle(px, py, circleParams = this.currentCurve) {
        if (!circleParams) {
            return false;
        }
        this.context.beginPath();
        this.context.arc(circleParams.rx, circleParams.ry, circleParams.r, 0, Math.PI * 2);
        return this.context.isPointInPath(px, py);
    }
    /* 只能输入英文，web上目前好像只有input框能实现其他语言的输入，如果一定要输入其他语言，需要做透明input模拟
       因为这里主要是学习canvas用法，就不做其他语言的扩展了。isDone是否绘制完成 。
    */
    font(x, y, isDone, needCursor = true) {
        if (this.currentFont) {
            //键盘事件
            let content = this.textArr.join("");
            this.restoreCanvas();
            this.context.strokeStyle = this.strokeColor;
            this.context.fillStyle = this.fillColor;
            this.context.strokeText(content, this.currentFont.x, this.currentFont.y);
            this.context.fillText(content, this.currentFont.x, this.currentFont.y);
            let textSize = this.context.measureText(content);
            if (!isDone) {
                let cursorX = this.currentFont.x + textSize.width + 4; //4像素是流出来的空隙
                this.fontCursor(cursorX, this.currentFont.y);
            } else {
                let newX = x;
                let newY = y;
                if (typeof x !== "number" && needCursor) {
                    //按下了回车键
                    newX = this.currentFont.x;
                    newY = this.currentFont.y + this.currentFont.fontSize + FONTLINEGAP;
                }
                //一次font绘制结束
                this.saveImageData();
                this.currentFont = null;
                this.textArr.length = 0;
                if (needCursor) {
                    //大部分情况结束一次文字绘制后，立即开启下一次文字绘制。比如换行，比如鼠标切换位置。但是特殊情况只是单纯结束绘制
                    this.font(newX, newY);
                }
                this.isDrawing = false;
            }
        } else {
            this.currentFont = { x, y };
            this.fontCursor(x, y);
        }
    }
    // 鼠标光标
    fontCursor(x, y) {
        const CursorWidth = 1;
        let fontSize = 48; //默认值
        const aMatch = this.context.font.match(/(\d+)px/);
        if (aMatch) {
            fontSize = +aMatch[1];
        }
        this.currentFont.fontSize = fontSize;
        // 不必知道前面的样式，就可以用save还原回去
        this.context.save();
        this.context.fillStyle = "#1e90ff";
        this.context.fillRect(x, y - fontSize / 2, CursorWidth, fontSize);
        this.context.restore();
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
    // 擦除上次橡皮擦圆圈。擦除上次这个动作也是和橡皮擦实物运用思路是一致的
    eraserMain() {
        this.context.save();
        this.context.beginPath();
        // +1是为了防锯齿
        this.context.arc(this.lastEraser.x, this.lastEraser.y, TAILR + ERASER_LINE_WIDTH + 1, 0, Math.PI * 2);
        this.context.clip();
        this.clearAll();
        this.context.restore();
    }
    // 橡皮擦样式，模仿书中的样式
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
    }
}
