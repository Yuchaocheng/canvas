const WIDTH = 50;
const HEIGHT = 50;
const INIT_X = 15;
const INIT_Y = 18;
const CONTENT_COLOR = "#648CE6"; // 工具图形内容颜色
const ITEM_OFFSET_Y = 12; // 工具图形间距
export default class ToolCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.strokeStyle = CONTENT_COLOR;
    }
    // 基础框
    baseRect(param, halfShadow) {
        let [x, y, w, h] = param;
        this.context.save();
        this.context.shadowOffsetX = 1;
        this.context.shadowOffsetY = 1;
        this.context.shadowColor = "rgba(0,0,0,0.4)";
        this.context.shadowBlur = 2;
        this.context.strokeStyle = "#a1b5e2";
        this.context.fillStyle = "#eeeeef";
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
    lineIcon(horizontalOffset = 4, order = 0) {
        let x = INIT_X;
        let y = INIT_Y + order * ITEM_OFFSET_Y;
        this.baseRect([INIT_X, INIT_Y, WIDTH, HEIGHT]);
        this.context.beginPath();
        /* 当lineWidth是奇数时，会存在线宽大于设置的宽度，并且两边半个px存在阴影的情况，可以多加0.5像素 */
        let offset = horizontalOffset + 0.5;
        this.context.moveTo(x + offset, y + offset);
        this.context.lineTo(x + WIDTH - offset, y + HEIGHT - offset);
        this.context.stroke();
    }
    // 矩形
    rectIcon(insideOffset = 4, order = 1) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT], true);
        this.context.beginPath();
        let offset = insideOffset + 0.5;
        this.context.strokeRect(x + offset, y + offset, WIDTH - 2 * offset, HEIGHT - 2 * offset);
        this.context.stroke();
    }
    // 圆
    circleIcon(r = 20, order = 2) {
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
    }

    // 开口线，借鉴例子中的图案，关系不大
    openLineIcon(order = 3) {
        let x = INIT_X;
        let y = INIT_Y + order * (HEIGHT + ITEM_OFFSET_Y);
        this.baseRect([x, y, WIDTH, HEIGHT]);
        this.context.beginPath();
        this.drawOpenPathIconLines(x, y);
        this.context.stroke();
    }
    // 闭合线
    closeLineIcon(order = 4) {
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
}
