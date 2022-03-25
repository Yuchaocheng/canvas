import Utils from "./Util.js";

const WIDTH = 50;
const HEIGHT = 50;
const INIT_X = 15;
const INIT_Y = 18;
const CONTENT_COLOR = "#648CE6"; // 工具图形内容颜色
const ITEM_OFFSET_Y = 12; // 工具图形间距
const GRID_COLOR = "rgb(0, 0, 200)"; // 网格颜色
const IconBG = "#eeeeee"; //canvas背景颜色
const [clickShadowX, clickShadowY, clickShadowBlur] = [6, 6, 4];

// 对象数组新增or编辑
function iconListUpdate(arr, key, obj) {
    let existIndex = arr.findIndex((item) => key in item && item[key] === obj[key]);
    if (existIndex >= 0) {
        Object.assign(arr[existIndex], obj);
    } else {
        arr.push(obj);
    }
}

export default class ToolCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.strokeStyle = CONTENT_COLOR;
        // 左侧菜单栏默认顺序，可更改
        this.DefaultOrder = ["line", "rect", "circle", "openLine", "closeLine", "curve", "font", "tail", "eraser"];
        this.shadowTypeList = ["rect", "circle", "closeLine", "curve", "font", "tail"]; //有半阴影效果图标
        /* 鼠标当前移动到的icon图标及位置 */
        this.curIcon = null;
        this.selectedIcon = "";
        this.curOffsetX = -1;
        this.curOffsetY = -1;
        //记录每个icon的位置，否则没法制作点击事件
        this.aIconList = [
            // {type:"line",x:0,y:0,w:0,h:0}
        ];
    }
    // 初始化，绘制全部左侧icon图标
    init() {
        /* 增加事件监听 */
        this.dealMouseMove = this.dealMouseMove.bind(this); //监听函数绑定this
        this.dealMouseDown = this.dealMouseDown.bind(this);
        this.dealMouseOut = this.dealMouseOut.bind(this);
        this.canvas.addEventListener("mousemove", this.dealMouseMove);
        this.canvas.addEventListener("mouseout", this.dealMouseOut);
        this.canvas.addEventListener("mousedown", this.dealMouseDown);

        /* 初始绘制工具图形 */
        this.DefaultOrder.forEach((item) => {
            this.drawIcon(item);
        });
        // 默认选中第一个图形
        this.curIcon = this.aIconList[0];
        this.dealMouseDown();
        this.curIcon = null;
        console.log(this.aIconList, 222);
    }
    // 实例销毁，主要清除监听事件
    destroy() {
        this.canvas.removeEventListener("mousemove", this.dealMouseMove);
        this.canvas.removeEventListener("mouseout", this.dealMouseOut);
        this.canvas.removeEventListener("mousedown", this.dealMouseDown);
        this.canvas.width = this.canvas.width;
    }
    /**
     * 绘制左侧工具图形
     * @param type {String} - 工具图标的类型
     * @param order {Number} - 工具图标的排列顺序，非必填，不填的话按照类型的默认顺序
     * @param params {params} - [params = []] 绘制具体工具图标可传参数
     */
    drawIcon(type, order, params = []) {
        const { DefaultOrder, shadowTypeList, aIconList } = this;
        let defaultIndex = DefaultOrder.indexOf(type);
        if (defaultIndex === -1) {
            throw new Error("icon类型非法");
        }

        if (!Array.isArray(params)) {
            throw new Error("第三个参数必须为数组");
        }
        typeof order !== "number" && (order = defaultIndex);
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        let hasShadow = shadowTypeList.includes(type);
        this.baseRect([x, y], hasShadow);
        this[type].apply(this, [x, y, ...params]);
        iconListUpdate(aIconList, "type", { x, y, w: WIDTH, h: HEIGHT, type, params });
    }
    // 基础框
    baseRect(position, halfShadow) {
        let ctx = this.context;
        let [x, y] = position;
        ctx.save();
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 2;
        ctx.strokeStyle = "#a1b5e2";
        ctx.fillStyle = IconBG;
        ctx.strokeRect(x, y, WIDTH, HEIGHT);
        ctx.fillRect(x, y, WIDTH, HEIGHT);
        if (halfShadow) {
            ctx.beginPath();
            ctx.translate(x, y);
            ctx.moveTo(WIDTH, 0);
            ctx.lineTo(WIDTH, HEIGHT);
            ctx.lineTo(0, HEIGHT);
            ctx.closePath();
            ctx.fillStyle = "#dddddd";
            ctx.fill();
        }
        ctx.restore();
    }
    // 线
    line(x, y, horizontalOffset = 4) {
        this.context.beginPath();
        let offset = horizontalOffset;
        this.context.moveTo(x + offset, y + offset);
        this.context.lineTo(x + WIDTH - offset, y + HEIGHT - offset);
        this.context.stroke();
    }
    // 矩形
    rect(x, y, insideOffset = 4) {
        this.context.beginPath();
        /* 当lineWidth是奇数时，直线变宽且两边颜色变淡，移动0.5像素解决 */
        this.context.save();
        this.context.translate(0.5, 0.5);
        let offset = insideOffset;
        this.context.strokeRect(x + offset, y + offset, WIDTH - 2 * offset, HEIGHT - 2 * offset);
        this.context.stroke();
        this.context.restore();
    }
    // 圆
    circle(x, y, r = 20) {
        this.context.beginPath();
        this.context.save();
        let offsetX = x + WIDTH / 2;
        let offsetY = y + HEIGHT / 2;
        this.context.translate(offsetX, offsetY);
        this.context.arc(0, 0, r, 0, Math.PI * 2);
        this.context.stroke();
        this.context.restore();
    }

    // 开口线，借鉴例子中的图案，关系不大
    openLine(x, y) {
        this.context.beginPath();
        this.drawOpenPathIconLines(x, y);
        this.context.stroke();
    }
    // 闭合线
    closeLine(x, y) {
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
    curve(x, y) {
        this.context.save();
        this.context.translate(x, y);
        this.context.beginPath();
        this.context.moveTo(36, 6);
        this.context.quadraticCurveTo(-10, 2, 40, 44);
        this.context.stroke();
        this.context.restore();
    }
    // 文字 （直接用文字绘制就行，不需要用线描出来）
    font(x, y) {
        this.context.save();
        this.context.translate(x, y);
        this.context.beginPath();
        this.context.font = "48px Palatino"; //默认10px sans-serif
        this.context.textAlign = "center"; //默认start
        this.context.textBaseline = "middle"; //默认alphabetic
        // 字体位置也算一个坑。一般如果不设置的话，默认可以理解为设置坐标在文字左下角
        let fillColor = "rgba(100, 140, 230, 0.5)";
        this.context.fillStyle = fillColor;
        this.context.strokeText("T", 25, 30);
        this.context.fillText("T", 25, 30);
        this.context.restore();
    }
    // 尾随效果
    tail(x, y) {
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
    eraser(x, y) {
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
        this.grid(0, 0, WIDTH, HEIGHT, 4);
        this.context.restore();
    }

    // 画网格线
    grid(x = 0, y = 0, w = this.canvas.width, h = this.canvas.height) {
        this.context.save();
        /* 网格作为背景，需要部分透明 */
        this.context.strokeStyle = GRID_COLOR;
        this.context.fillStyle = "#ffffff";
        this.context.lineWidth = 0.5;
        this.context.fillRect(x, y, w, h);
        this.context.globalAlpha = 0.1;
        Utils.grid(this.context);
        this.context.restore();
    }

    // 备份当前画布（用ImageData对象保存好过用新建一个canvas对象保存 ）
    backupCanvas() {
        // 清空画布
        /* 创建的dom元素如果没被append到html中，那么就和其他变量一样，随GC回收 */
        let backupCanvas = document.createElement("canvas");
        let backupCtx = backupCanvas.getContext("2d");
        backupCtx.drawImage(this.canvas, this.canvas.width, this.canvas.height);
        return backupCanvas;
    }
    // 处理鼠标移动事件
    dealMouseMove(e) {
        this.curOffsetX = e.offsetX;
        this.curOffsetY = e.offsetY;
        let inIcon = this.aIconList.find((item) => {
            // debugger;
            let xIn = e.offsetX >= item.x && e.offsetX <= item.x + item.w;
            let yIn = e.offsetY >= item.y && e.offsetY <= item.y + item.h;
            return xIn && yIn;
        });
        console.log(this.curIcon, "curIcon");
        if (typeof inIcon !== "undefined") {
            this.curIcon = inIcon;
            this.canvas.style.cursor = "pointer";
        } else {
            this.curIcon = null;
            this.canvas.style.cursor = "inherit";
        }
    }
    // 处理鼠标移出事件
    dealMouseOut() {
        this.curOffsetX = -1;
        this.curOffsetY = -1;
    }
    // 处理点击事件
    dealMouseDown(e) {
        let { curIcon, aIconList, context } = this;
        if (!curIcon) {
            // 点击到空白区域
            return;
        }
        let oldIconType = "";
        aIconList.forEach((item) => {
            if (item.selected) {
                oldIconType = item.type;
                /* 1是border的宽度 */
                context.clearRect(item.x - 1, item.y - 1, item.w + clickShadowX + clickShadowBlur + 1, item.h + clickShadowY + clickShadowBlur + 1);
                // item.drawFun.apply(this, [item.order]);
                this.drawIcon(item.type);
            }
            item.selected = false;
        });

        curIcon.selected = true;
        this.selectedIcon = curIcon.type;
        context.save();
        context.shadowOffsetX = clickShadowX;
        context.shadowOffsetY = clickShadowY;
        context.shadowColor = "rgba(0,0,0,1)";
        context.shadowBlur = clickShadowBlur;
        context.fillStyle = "rgba(0,0,0,0.5)";
        /* clip 和 globalCompositeOperation两个属性有大用，在画重叠的图形的时候，否则只有重绘了  */
        context.globalCompositeOperation = "destination-over"; // destination-over 现有画布内容后面绘制新图形，一般来说新画的图形覆盖已有图形，这个属性就把这一点调换了
        context.fillRect(curIcon.x, curIcon.y, curIcon.w, curIcon.h);
        context.restore();
    }
}
