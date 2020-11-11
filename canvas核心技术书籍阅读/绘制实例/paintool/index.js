import ToolCanvas from "./ToolCanvas.js";
import DrawCanvas from "./DrawCanvas.js";

const DRAWINGCOLOR = "green"; //鼠标移动过程中线条的颜色

let strokeColor = "cornflowerblue"; //图形边界颜色，默认为cornflowerblue
// 鼠标事件数据
let mouseEvent = {
    isMouseDown: false,
    mouseDownX: -1,
    mouseDownY: -1,
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
    drawCanvas.draw(toolCanvas.selectedIcon, [mouseEvent.mouseDownX, mouseEvent.mouseDownY, e.layerX, e.layerY]);
    mouseEvent.isMouseDown = false;
    mouseEvent.mouseDownX = -1;
    mouseEvent.mouseDownY = -1;
}

//处理画布鼠标移动事件
function drawCanvasMouseMove(e) {
    if (!mouseEvent.isMouseDown) {
        return;
    }
    if (!toolCanvas.selectedIcon) {
        return;
    }
    drawCanvas.restoreCanvas();
    drawCanvas.draw(toolCanvas.selectedIcon, [mouseEvent.mouseDownX, mouseEvent.mouseDownY, e.layerX, e.layerY]);
}
