import ToolCanvas from "./ToolCanvas.js";
import DrawCanvas from "./DrawCanvas.js";

const DRAWINGCOLOR = "green"; //鼠标移动过程中线条的颜色
const GUIDELINECOLOR = "rgba(116, 185, 255,1)"; //辅助线颜色

let strokeColor = "cornflowerblue"; //图形边界颜色，默认为cornflowerblue
// 鼠标事件数据
let mouseEvent = {
    isMouseDown: false,
    mouseDownX: -1,
    mouseDownY: -1,
    moveEvent: null,
};
const toolCanvasDom = document.getElementById("toolCanvas");
const drawCanvasDom = document.getElementById("drawCanvas");

let toolCanvas = new ToolCanvas(toolCanvasDom);
let drawCanvas = new DrawCanvas(drawCanvasDom);

// 绘制左侧工具栏
/* 左侧ICON排列顺序可更改，只需要改变DefaultOrder的内置顺序，然后init即可 */
// tool.DefaultOrder = tool.DefaultOrder.reverse() //反序
toolCanvas.init();

/* 画布事件监听 */
drawCanvasDom.addEventListener("mousedown", drawCanvasMouseDown);
drawCanvasDom.addEventListener("mouseup", drawCanvasMouseUp);
drawCanvasDom.addEventListener("mousemove", drawCanvasMouseMove);
document.addEventListener("mouseup", documentMouseUp);

//处理画布鼠标点击事件
function drawCanvasMouseDown(e) {
    mouseEvent.isMouseDown = true;
    drawCanvas.saveImageData();
    drawCanvas.strokeColor = DRAWINGCOLOR;
    mouseEvent.mouseDownX = e.layerX;
    mouseEvent.mouseDownY = e.layerY;
}

//处理画布鼠标松开事件
function drawCanvasMouseUp(e) {
    if (!mouseEvent.isMouseDown) {
        return;
    }
    if (!toolCanvas.selectedIcon) {
        return;
    }
    drawCanvas.restoreCanvas();
    drawCanvas.strokeColor = strokeColor;
    drawCanvas.draw(toolCanvas.selectedIcon, [mouseEvent.mouseDownX, mouseEvent.mouseDownY, e.layerX, e.layerY, true]);
    mouseEvent.isMouseDown = false;
    mouseEvent.mouseDownX = -1;
    mouseEvent.mouseDownY = -1;
    mouseEvent.moveEvent = null;
}

// 全部鼠标松开事件
function documentMouseUp() {
    if (mouseEvent.isMouseDown) {
        drawCanvasMouseUp(mouseEvent.moveEvent);
    }
}

//处理画布鼠标移动事件
function drawCanvasMouseMove(e) {
    if (!mouseEvent.isMouseDown) {
        return;
    }
    if (!toolCanvas.selectedIcon) {
        return;
    }
    /* 这三种类型的图需要画一下辅助线 */
    let aGuideLineTypes = ["line", "rect", "circle"];
    drawCanvas.restoreCanvas();
    if (aGuideLineTypes.includes(toolCanvas.selectedIcon)) {
        drawCanvas.strokeColor = GUIDELINECOLOR;
        drawCanvas.draw(toolCanvas.selectedIcon, [e.layerX, 0, e.layerX, drawCanvasDom.height]);
        drawCanvas.draw(toolCanvas.selectedIcon, [0, e.layerY, drawCanvasDom.width, e.layerY]);
        drawCanvas.strokeColor = DRAWINGCOLOR;
    }
    drawCanvas.draw(toolCanvas.selectedIcon, [mouseEvent.mouseDownX, mouseEvent.mouseDownY, e.layerX, e.layerY]);
    mouseEvent.moveEvent = e;
}
