import ToolCanvas from "./ToolCanvas.js";
import DrawCanvas from "./DrawCanvas.js";

const DRAWINGCOLOR = "green"; //鼠标移动过程中线条的颜色
const GUIDELINECOLOR = "rgba(116, 185, 255,1)"; //辅助线颜色
const DEFAULTCURSOR = "crosshair"; //默认鼠标样式

let strokeColor = "cornflowerblue"; //图形边界颜色，默认为cornflowerblue
// 鼠标事件数据
let mouseEvent = {
    isMouseDown: false,
    mouseDownX: -1,
    mouseDownY: -1,
    latestEvent: null,
};

let aBaseLineTypes = ["line", "rect", "circle"]; //基本类型
let aPathType = ["openLine", "closeLine"]; //路径类型
let pathArr = [];

const toolCanvasDom = document.getElementById("toolCanvas");
const drawCanvasDom = document.getElementById("drawCanvas");

let toolCanvas = new ToolCanvas(toolCanvasDom);
let drawCanvas = new DrawCanvas(drawCanvasDom);

// 绘制左侧工具栏
/* 左侧ICON排列顺序可更改，只需要改变DefaultOrder的内置顺序，然后init即可 */
// toolCanvas.DefaultOrder = toolCanvas.DefaultOrder.reverse() //反序
toolCanvas.init();

toolCanvas.changeIcon = function (value, oldValue) {
    if (value !== "curve" && drawCanvas.currentCurve) {
        /* curve类型步骤如果没走完，选中别的类型就自动清空画的内容 */
        drawCanvas.restoreCanvas();
        drawCanvas.currentCurve = null;
    }
};

/* 画布事件监听 */
drawCanvasDom.addEventListener("mousedown", drawCanvasMouseDown);
drawCanvasDom.addEventListener("mouseup", drawCanvasMouseUp);
drawCanvasDom.addEventListener("mousemove", drawCanvasMouseMove);
document.addEventListener("mouseup", documentMouseUp);

//处理画布鼠标点击事件
function drawCanvasMouseDown(e) {
    mouseEvent.isMouseDown = true;
    // 画曲线拖动小球时不存储当前画布
    if (!(toolCanvas.selectedIcon === "curve" && drawCanvas.currentCurve)) {
        drawCanvas.saveImageData();
    }
    drawCanvas.strokeColor = DRAWINGCOLOR;
    mouseEvent.mouseDownX = e.layerX;
    mouseEvent.mouseDownY = e.layerY;
    mouseEvent.latestEvent = e;
    if (aPathType.includes(toolCanvas.selectedIcon)) {
        pathArr.push([e.layerX, e.layerY]);
    }
    if (toolCanvas.selectedIcon === "curve" && drawCanvas.currentCurve) {
        let inCircle = drawCanvas.judgeInCircle(e.layerX, e.layerY);
        if (inCircle) {
            drawCanvasDom.style.cursor = "pointer";
            drawCanvas.currentCurve.step = "ballMove";
        } else {
            drawCanvasDom.style.cursor = DEFAULTCURSOR;
        }
    }
    if (toolCanvas.selectedIcon === "font") {
        drawCanvas.draw("font", [e.layerX, e.layerY]);
    }
}

//处理画布鼠标松开事件
function drawCanvasMouseUp(e) {
    if (!mouseEvent.isMouseDown) {
        return;
    }
    if (!toolCanvas.selectedIcon || toolCanvas.selectedIcon === "font") {
        return;
    }
    drawCanvas.strokeColor = strokeColor;
    drawCanvas.restoreCanvas();
    if (aBaseLineTypes.includes(toolCanvas.selectedIcon)) {
        drawCanvas.draw(toolCanvas.selectedIcon, [mouseEvent.mouseDownX, mouseEvent.mouseDownY, e.layerX, e.layerY, true]);
    } else if (aPathType.includes(toolCanvas.selectedIcon)) {
        let needFill = toolCanvas.selectedIcon === "closeLine";
        drawCanvas.draw("linePath", [pathArr, needFill]);
        pathArr.length = 0;
    } else if (toolCanvas.selectedIcon === "curve") {
        if (drawCanvas.currentCurve && drawCanvas.currentCurve.step === "ballMove") {
            drawCanvas.draw("curve", ["ballUp", e.layerX, e.layerY]);
        } else {
            drawCanvas.strokeColor = DRAWINGCOLOR;
            drawCanvas.draw("curve", ["up", mouseEvent.mouseDownX, mouseEvent.mouseDownY, e.layerX, e.layerY]);
        }
    }
    mouseEvent.isMouseDown = false;
    mouseEvent.mouseDownX = -1;
    mouseEvent.mouseDownY = -1;
    mouseEvent.latestEvent = null;
}

// 页面鼠标松开事件
function documentMouseUp() {
    if (mouseEvent.isMouseDown) {
        drawCanvasMouseUp(mouseEvent.latestEvent);
    }
}

//处理画布鼠标移动事件
function drawCanvasMouseMove(e) {
    let inCircle = false;
    if (toolCanvas.selectedIcon === "curve" && drawCanvas.currentCurve) {
        inCircle = drawCanvas.judgeInCircle(e.layerX, e.layerY);
        if (inCircle) {
            drawCanvasDom.style.cursor = "pointer";
        } else {
            drawCanvasDom.style.cursor = DEFAULTCURSOR;
        }
    }
    if (!mouseEvent.isMouseDown) {
        return;
    }
    if (!toolCanvas.selectedIcon || toolCanvas.selectedIcon === "font") {
        return;
    }
    drawCanvas.restoreCanvas();
    if (aBaseLineTypes.includes(toolCanvas.selectedIcon)) {
        // 基本类型添加两条辅助线
        drawCanvas.strokeColor = GUIDELINECOLOR;
        drawCanvas.line(e.layerX, 0, e.layerX, drawCanvasDom.height);
        drawCanvas.line(0, e.layerY, drawCanvasDom.width, e.layerY);
        drawCanvas.strokeColor = DRAWINGCOLOR;
        drawCanvas.draw(toolCanvas.selectedIcon, [mouseEvent.mouseDownX, mouseEvent.mouseDownY, e.layerX, e.layerY]);
    } else if (aPathType.includes(toolCanvas.selectedIcon)) {
        pathArr.push([e.layerX, e.layerY]);
        drawCanvas.draw("linePath", [pathArr]);
    } else if (toolCanvas.selectedIcon === "curve") {
        if (drawCanvas.currentCurve && drawCanvas.currentCurve.step === "ballMove") {
            drawCanvas.draw("curve", ["ballMove", e.layerX, e.layerY]);
        } else {
            drawCanvas.draw("curve", [, mouseEvent.mouseDownX, mouseEvent.mouseDownY, e.layerX, e.layerY]);
        }
    }
    mouseEvent.latestEvent = e;
}
