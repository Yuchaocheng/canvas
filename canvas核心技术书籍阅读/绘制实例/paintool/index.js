import ToolCanvas from "./ToolCanvas.js";
import DrawCanvas from "./DrawCanvas.js";

const toolCanvasDom = document.getElementById("toolCanvas");
const drawCanvasDom = document.getElementById("drawCanvas");

let toolCanvas = new ToolCanvas(toolCanvasDom);
let drawCanvas = new DrawCanvas(drawCanvasDom);

// 绘制左侧工具栏
/* 左侧ICON排列顺序可更改，只需要改变DefaultOrder的内置顺序，然后init即可 */
// tool.DefaultOrder = tool.DefaultOrder.reverse() //反序
toolCanvas.init();

drawCanvas.line(101,101,100,400)

