import ToolCanvas from "./js/ToolCanvas.js";
import DrawCanvas from "./js/DrawCanvas.js";

const DEFAULTCURSOR = "crosshair"; //默认鼠标样式
export default class DrawGraphic {
    constructor(toolDom, drawDom, bgDom) {
        this.toolCanvas = new ToolCanvas(toolDom);
        this.drawCanvas = new DrawCanvas(drawDom, bgDom);
        Object.defineProperty(this.toolCanvas, "selectedIcon", {
            /* 监听绘制类型  */
            set: (value) => {
                this.drawCanvas.drawType = value;
                if (value === "font") {
                    this.drawCanvas.cursorType = "text";
                    this.drawCanvas.currentFont = null;
                } else {
                    this.drawCanvas.cursorType = DEFAULTCURSOR;

                    /* 有一些类型鼠标松开时还未结束绘制，这时候如果切换类型需要立即结束上次绘制，并且做一些初始化处理 */
                    if (this.drawCanvas.currentCurve) {
                        this.currentCurve = null;
                        this.curveStep = "";
                        this.drawCanvas.isDrawing = false;
                        this.drawCanvas.restoreCanvas();
                    }
                    if (this.drawCanvas.currentFont) {
                        this.drawCanvas.font("", "", true, false);
                        this.drawCanvas.isDrawing = false;
                        this.drawCanvas.currentFont = null;
                        this.drawCanvas.textArr.length = 0;
                    }
                    if (value === "eraser") {
                        this.drawCanvas.lastEraser = null;
                    }
                }
            },
        });
    }
    // 初始化绘图工具
    init() {
        // 绘制左侧工具栏
        /* 左侧ICON排列顺序可更改，只需要改变DefaultOrder的内置顺序，然后再init即可 */
        this.toolCanvas.init();
        this.drawCanvas.init();
    }
    // 清除实例，去掉监听
    destroy() {
        this.toolCanvas.destroy();
        this.drawCanvas.destroy();
    }
}
