import ToolCanvas from "./ToolCanvas.js";

const toolCanvasDom = document.getElementById("toolCanvas");

let tool = new ToolCanvas(toolCanvasDom);

// 绘制左侧工具栏
/* 左侧ICON排列顺序可更改，只需要改变DefaultOrder的内置顺序，然后init即可 */
// tool.DefaultOrder = tool.DefaultOrder.reverse() //反序
tool.init();
