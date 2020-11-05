const WIDTH = 50;
const HEIGHT = 50;
const INIT_X = 15;
const INIT_Y = 18;
const CONTENT_COLOR = "#648CE6"; // 工具图形内容颜色
const ITEM_OFFSET_Y = 12; // 工具图形间距
const GRID_COLOR = "rgb(0, 0, 200)"; // 网格颜色
const CannvasBG = "#eeeeef"; //canvas背景颜色
const [clickShadowX, clickShadowY, clickShadowBlur] = [6, 6, 4];
// 左侧菜单栏默认顺序，可更改
const DefaultOrder = ["line", "rect", "circle", "openLine", "closeLine", "curve", "font", "tail", "eraser"];

// 对象数组新增or编辑
function iconListUpdate(arr, key, obj) {
    let existIndex = arr.findIndex((item) => item[key] === obj[key]);
    if (typeof existIndex >= 0) {
        Object.assign(arr[existIndex], obj);
    } else {
        arr.push(obj);
    }
}
// 节流函数 防止频繁触发
function throttle(fn, wait) {
    var pre = Date.now();
    return function () {
        var context = this;
        var args = arguments;
        var now = Date.now();
        if (now - pre >= wait) {
            fn.apply(context, args);
            pre = Date.now();
        }
    };
}

export default class ToolCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.strokeStyle = CONTENT_COLOR;
        /* 鼠标当前移动到的icon图标及位置 */
        this.curIcon = null;
        this.curLayerX = -1;
        this.curLayerY = -1;
        this.aIconList = [
            // {type:"line",x:0,y:0,w:0,h:0}
        ]; //记录没个icon的位置，否则没法制作点击事件

        /* 增加事件监听 */
        canvas.addEventListener("mousemove", (e) => {
            this.dealMouseMove(e);
        });
        canvas.addEventListener("mouseout", () => {
            this.curLayerX = -1;
            this.curLayerY = -1;
        });
        canvas.addEventListener("mousedown", (e) => {
            this.dealMouseDown(e);
        });
    }

    /**
     * 绘制左侧工具图形
     * @param type {String} - 工具图标的类型
     * @param order {Number} - 工具图标的排列顺序，非必填，不填的话按照类型的默认顺序
     * @param params {params} - [params = []] 绘制具体工具图标可传参数
     */
    drawIcon(type, order, params = []) {
        if (!DefaultOrder.includes(type)) {
            throw new Error("icon类型非法");
        }

        if (!Array.isArray(params)) {
            throw new Error("第二个参数必须为数组");
        }
        typeof order !== "number" && (order = DefaultOrder[type]);
        let x = INIT_X;
        let y = INIT_Y + order * ITEM_OFFSET_Y;
        this.baseRect([INIT_X, INIT_Y, WIDTH, HEIGHT]);
        this[type].apply(this, [x, y, ...params]);
        iconListUpdate(this.aIconList, "type", { x, y, w: WIDTH, h: HEIGHT, type, params, drawFun: this[type] });
    }
    // 基础框
    baseRect(param, halfShadow) {
        let [x, y, w, h] = param;
        this.context.save();
        this.context.shadowOffsetX = 2;
        this.context.shadowOffsetY = 2;
        this.context.shadowColor = "rgba(0,0,0,0.2)";
        this.context.shadowBlur = 2;
        this.context.strokeStyle = "#a1b5e2";
        this.context.fillStyle = CannvasBG;
        this.context.strokeRect(...param);
        this.context.fillRect(...param);
        if (halfShadow) {
            this.context.beginPath();
            this.context.translate(x, y);
            this.context.moveTo(w, 0);
            this.context.lineTo(w, h);
            this.context.lineTo(0, h);
            this.context.closePath();
            this.context.fillStyle = "#dddddd";
            this.context.fill();
        }
        this.context.restore();
    }
    // 线
    line(x, y, horizontalOffset = 4) {
        this.context.beginPath();
        /* 当lineWidth是奇数时，会存在线宽大于设置的宽度，并且两边半个px存在阴影的情况，可以多加0.5像素 */
        let offset = horizontalOffset + 0.5;
        this.context.moveTo(x + offset, y + offset);
        this.context.lineTo(x + WIDTH - offset, y + HEIGHT - offset);
        this.context.stroke();
    }
    // 矩形
    rect(order = 1, insideOffset = 4) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT], true);
        this.context.beginPath();
        let offset = insideOffset + 0.5;
        this.context.strokeRect(x + offset, y + offset, WIDTH - 2 * offset, HEIGHT - 2 * offset);
        this.context.stroke();
        iconListUpdate(this.aIconList, "type", { x, y, w: WIDTH, h: HEIGHT, type: "rect", order, drawFun: this.rectIcon });
    }
    // 圆
    circle(order = 2, r = 20) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT], true);
        this.context.beginPath();
        this.context.save();
        let offsetX = x + WIDTH / 2;
        let offsetY = y + HEIGHT / 2;
        this.context.translate(offsetX, offsetY);
        this.context.arc(0, 0, r, 0, Math.PI * 2);
        this.context.stroke();
        this.context.restore();
        iconListUpdate(this.aIconList, "type", { x, y, w: WIDTH, h: HEIGHT, type: "rect", order, drawFun: this.rectIcon });
    }

    // 开口线，借鉴例子中的图案，关系不大
    openLine(order = 3) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT]);
        this.context.beginPath();
        this.drawOpenPathIconLines(x, y);
        this.context.stroke();
    }
    // 闭合线
    closeLine(order = 4) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT], true);
        this.context.beginPath();
        this.drawOpenPathIconLines(x, y);
        this.context.closePath();
        this.context.stroke();
    }

    drawOpenPathIconLines(x, y) {
        this.context.lineTo(x + 13, y + 19);
        this.context.lineTo(x + 15, y + 17);
        this.context.lineTo(x + 25, y + 12);
        this.context.lineTo(x + 35, y + 13);
        this.context.lineTo(x + 38, y + 15);
        this.context.lineTo(x + 40, y + 17);
        this.context.lineTo(x + 39, y + 23);
        this.context.lineTo(x + 36, y + 25);
        this.context.lineTo(x + 32, y + 27);
        this.context.lineTo(x + 28, y + 29);
        this.context.lineTo(x + 26, y + 31);
        this.context.lineTo(x + 24, y + 33);
        this.context.lineTo(x + 22, y + 35);
        this.context.lineTo(x + 20, y + 37);
        this.context.lineTo(x + 18, y + 39);
        this.context.lineTo(x + 16, y + 39);
        this.context.lineTo(x + 13, y + 36);
        this.context.lineTo(x + 11, y + 34);
    }

    // 曲线
    curve(order = 5) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT], true);
        this.context.save();
        this.context.translate(x, y);
        this.context.beginPath();
        this.context.moveTo(36, 6);
        this.context.quadraticCurveTo(-10, 2, 40, 44);
        this.context.stroke();
        this.context.restore();
    }
    // 文字 （直接用文字绘制就行，不需要用线描出来）
    font(order = 6) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT], true);
        this.context.save();
        this.context.translate(x, y);
        this.context.beginPath();
        this.context.font = "48px Palatino"; //默认10px sans-serif
        this.context.textAlign = "center"; //默认start
        this.context.textBaseline = "middle"; //默认alphabetic
        // 字体位置也算一个坑。一般如果不设置的话，默认可以理解为在设置坐标的左下角
        let fillColor = "rgba(100, 140, 230, 0.5)";
        this.context.fillStyle = fillColor;
        this.context.strokeText("T", 25, 30);
        this.context.fillText("T", 25, 30);
        this.context.restore();
    }
    // 尾随效果
    tail(order = 7) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT], true);
        this.context.save();
        this.context.translate(x, y);
        this.context.strokeStyle = "rgba(100, 140, 230, 0.6)";
        let cx = 16;
        let cy = 14;
        for (let index = 0; index < 10; index++) {
            if (index < 5) {
                cx += 2.5;
                cy += 2;
            } else {
                cx -= 2;
                cy += 2;
            }
            this.context.beginPath();
            this.context.arc(cx, cy, 12, 0, Math.PI * 2);
            this.context.stroke();
        }
        this.context.restore();
    }
    // 橡皮擦
    eraser(order = 8) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT]);
        this.context.save();
        this.context.translate(x, y);
        let offsetX = WIDTH / 2;
        let offsetY = HEIGHT / 2;
        this.context.beginPath();
        this.context.arc(offsetX, offsetY, 20, 0, Math.PI * 2);
        this.context.strokeStyle = "rgba(100, 140, 200, 0.5)";
        this.context.stroke();
        /* clip()裁剪后不能访问裁剪区域的其他区域（只能渲染在裁剪区域）。clip()能限定显示区域 */
        this.context.clip();
        this.gridIcon(0, 0, WIDTH, HEIGHT, 4);
        this.context.restore();
    }

    // 画网格线
    grid(x, y, w, h, gridGap, color = GRID_COLOR) {
        this.context.save();
        /* 网格作为背景，需要部分透明 */
        this.context.strokeStyle = color;
        this.context.fillStyle = "#ffffff";
        this.context.lineWidth = 0.5;
        this.context.fillRect(x, y, w, h);
        this.context.globalAlpha = 0.1;
        let currentX = 0;
        let currentY = 0;
        this.context.beginPath();
        while (currentX < w) {
            this.context.moveTo(currentX, 0);
            this.context.lineTo(currentX, h);
            currentX += gridGap + 0.5;
        }
        while (currentY < h) {
            this.context.moveTo(0, currentY);
            this.context.lineTo(w, currentY);
            currentY += gridGap + 0.5;
        }
        this.context.stroke();
        this.context.restore();
    }

    // 备份当前画布
    backupCanvas() {
        // 清空画布
        /* 创建的dom元素如果没被append到html中，那么就和其他变量一样，随GC回收 */
        let backupCanvas = document.getElementById("canvas");
        let backupCtx = backupCanvas.getContext("2d");
        backupCtx.drawImage(this.canvas, this.canvas.width, this.canvas.height);
        return backupCanvas;
    }
    // 处理鼠标移动事件
    dealMouseMove(e) {
        this.curLayerX = e.layerX;
        this.curLayerY = e.layerY;
        let inIcon = this.aIconList.find((item) => {
            let xIn = e.layerX >= item.x && e.layerX <= item.x + item.w;
            let yIn = e.layerY >= item.y && e.layerY <= item.y + item.h;
            return xIn && yIn;
        });
        if (typeof inIcon !== "undefined") {
            this.curIcon = inIcon;
            this.canvas.style.cursor = "pointer";
        } else {
            this.curIcon = null;
            this.canvas.style.cursor = "inherit";
        }
    }
    // 处理点击事件
    dealMouseDown(e) {
        this.aIconList.forEach((item) => {
            if (item.selected) {
                /* 1是border的宽度 */
                this.context.clearRect(
                    item.x - 1,
                    item.y - 1,
                    item.w + clickShadowX + clickShadowBlur + 1,
                    item.h + clickShadowY + clickShadowBlur + 1
                );
                item.drawFun.apply(this, [item.order]);
            }
            item.selected = false;
        });

        this.curIcon.selected = true;
        let curIcon = this.curIcon;
        this.context.save();
        this.context.shadowOffsetX = clickShadowX;
        this.context.shadowOffsetY = clickShadowY;
        this.context.shadowColor = "rgba(0,0,0,1)";
        this.context.shadowBlur = clickShadowBlur;
        this.context.fillStyle = "rgba(0,0,0,0.5)";
        /* clip 和 globalCompositeOperation两个属性有大用，在画重叠的图形的时候，否则只有重绘了  */
        this.context.globalCompositeOperation = "destination-over"; // destination-over 现有画布内容后面绘制新图形，一般来说新画的图形覆盖已有图形，这个属性就把这一点调换了
        this.context.fillRect(curIcon.x, curIcon.y, curIcon.w, curIcon.h);
        this.context.restore();
    }
}
