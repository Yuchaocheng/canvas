const WIDTH = 50;
const HEIGHT = 50;
const INIT_X = 15;
const INIT_Y = 18;
const CONTENT_COLOR = "#648CE6"; // 工具图形内容颜色
const ITEM_OFFSET_Y = 22; // 工具图形间距
export default class ToolCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.context.strokeStyle = CONTENT_COLOR;
  }
  // 基础框
  baseRect(param) {
    this.context.save();
    this.context.shadowOffsetX = 1;
    this.context.shadowOffsetY = 1;
    this.context.shadowColor = "rgba(0,0,0,0.4)";
    this.context.shadowBlur = 2;
    this.context.strokeStyle = "#a1b5e2";
    this.context.fillStyle = "#eeeeef";
    this.context.strokeRect(...param);
    this.context.fillRect(...param);
    this.context.restore();
  }
  // 线。水平偏移量
  lineIcon(horizontalOffset) {
    let x = INIT_X;
    let y = INIT_Y + order * ITEM_OFFSET_Y;
    this.baseRect([INIT_X, INIT_Y]);
    this.context.beginPath();
    /* 当lineWidth是奇数时，会存在线宽大于设置的宽度，并且两边半个px存在阴影的情况，可以多加0.5像素 */
    let offset = horizontalOffset + 0.5;
    this.context.moveTo(x + offset, y + offset);
    this.context.lineTo(x + w - offset, y + h - offset);
    this.context.stroke();
  }
  // 矩形
  rectIcon(params = [], order = 1) {
    let [x = 15, y = 18, w = 50, h = 50] = params;
    this.context.save();
    this.context.translate(0, ITEM_OFFSET_Y * order);
    this.baseRect([x, y, w, h]);
    this.context.beginPath();
    let offset = 4 + 0.5;
    this.context.strokeRect(
      x + offset,
      y + offset,
      w - 2 * offset,
      h - 2 * offset
    );
    this.context.stroke();
    this.context.restore();
  }
}
