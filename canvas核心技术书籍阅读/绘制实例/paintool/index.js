import ToolCanvas from "./ToolCanvas.js";

const toolCanvasDom = document.getElementById("toolCanvas");

let tool = new ToolCanvas(toolCanvasDom);

// 绘制左侧工具栏
function drawToolCanvas(){
    tool.drawIcon("line")
}
// isPointInPath
drawToolCanvas()
