import ToolCanvas from "./ToolCanvas.js";

const toolCanvasDom = document.getElementById("toolCanvas");

let tool = new ToolCanvas(toolCanvasDom);

// 绘制左侧工具栏
function drawToolCanvas(){
    tool.lineIcon();
    tool.rectIcon();
    tool.circleIcon();
    tool.openLineIcon();
    tool.closeLineIcon();
    tool.curveIcon();
    tool.fontIcon();
    tool.tailIcon();
    tool.eraserIcon();
}

drawToolCanvas()
