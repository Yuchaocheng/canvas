import Utils from "../Util.js";

const MagnifierCircleR = 10; //放大镜边宽度
const DEFAULTOPTIONS = {
    minR: 5,
    maxR: 20,
};
export default class Magnifier {
    constructor(id, options) {
        this.id = id;
        this.canvas = Utils.createCanvas(id);
        if (!this.canvas) {
            throw new Error(`未取到${id}元素`);
        }
        this.offsetCanvas = Utils.createOffsetCanvas(this.canvas);
        this.offsetCtx = this.offsetCanvas.getContext("2d");
        this.bgCanvas = Utils.createOffsetCanvas(this.canvas);
        this.bgCtx = this.bgCanvas.getContext("2d");
        options = Object.assign({}, DEFAULTOPTIONS, options);
        this.ctx = this.canvas.getContext("2d");
        this.times = options.times || 1.5; //放大倍数，默认为1
        this.LensRadius = options.LensRadius || 120; //放大镜大小，默认100
        this.rectImageData = null; //放大区域矩形imageData保存
        this.init();
        this.isDragging = false;
        this.currentBall = { x: -1, y: -1, offsetX: -1, offsetY: -1 }; //小球当前信息
    }
    async init() {
        await this.loadBackground();
        this.magnify(460, 410);
        this.drawMagnifierCircle(460, 410, true);
        this.dealMouseDown = this.dealMouseDown.bind(this);
        this.dealMouseMove = Utils.throttle(this.dealMouseMove, 20).bind(this);
        this.dealMouseUp = this.dealMouseUp.bind(this);
        this.canvas.addEventListener("mousedown", this.dealMouseDown);
        this.canvas.addEventListener("mousemove", this.dealMouseMove);
        this.canvas.addEventListener("mouseup", this.dealMouseUp);
    }
    // 加载背景
    loadBackground() {
        return new Promise((resolve) => {
            let image = new Image();
            image.src = "../../image/camp.png";
            image.onload = () => {
                this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
                /* 背景数据保存在bgCanvas中，后续要使用多个时候直接调用即可 */
                this.bgCtx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
                resolve();
            };
        });
    }
    drawBackground() {
        this.ctx.drawImage(this.bgCanvas, 0, 0);
    }
    // 绘制放大镜实例
    drawMagnifierCircle(x, y, isInit) {
        // ctx.fillRect()
        const { ctx, LensRadius } = this;
        ctx.lineWidth = MagnifierCircleR;
        ctx.save();
        this.ctx.beginPath();
        ctx.arc(x, y, LensRadius, 0, Math.PI * 2);
        ctx.clip();
        /* 创造一个径向渐变，样式模仿一下书中 */
        let gradient = ctx.createRadialGradient(x, y, LensRadius - MagnifierCircleR, x, y, LensRadius);
        gradient.addColorStop(0, "rgba(0,0,0,0.2)");
        gradient.addColorStop(0.8, "rgb(235,237,255)");
        gradient.addColorStop(0.9, "rgb(235,237,255)");
        gradient.addColorStop(1.0, "rgba(150,150,150,0.9)");
        ctx.shadowColor = "rgba(52, 72, 35, 1.0)";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = gradient;
        ctx.stroke();
        ctx.restore();
        if (isInit) {
            /* 记录一下小球位置，下次鼠标移动时计算偏移量 */
            this.currentBall.x = x;
            this.currentBall.y = y;
        }
    }
    // 放大
    magnify(rx, ry) {
        const { ctx, LensRadius, offsetCanvas, offsetCtx, times } = this;
        let x = rx - LensRadius;
        let y = ry - LensRadius;
        let scaleSize = times * 2 * LensRadius;
        offsetCanvas.width = scaleSize;
        offsetCanvas.height = scaleSize;
        offsetCtx.save();
        /* 关键步骤：平移画布，使离屏画布左上角实际绘制的是放大后图形中心部分。目的是主画布再drawImage时，不用再缩放和切割，提升性能 */
        offsetCtx.translate(-scaleSize / 2 + LensRadius, -scaleSize / 2 + LensRadius);
        offsetCtx.drawImage(this.canvas, x, y, this.LensRadius * 2, this.LensRadius * 2, 0, 0, scaleSize, scaleSize);
        offsetCtx.restore();
        ctx.save();
        ctx.arc(rx, ry, LensRadius - MagnifierCircleR / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(offsetCanvas, x, y);
        ctx.restore();
    }
    // 设置放大倍速
    setTimes(times) {
        this.times = times;
    }
    draw(currentX, currentY) {
        const { currentBall } = this;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        let cx = currentX - currentBall.offsetX;
        let cy = currentY - currentBall.offsetY;
        this.magnify(cx, cy);
        this.drawMagnifierCircle(cx, cy);
        return { x: cx, y: cy };
    }
    dealMouseDown(e) {
        const { currentBall } = this;
        currentBall.offsetX = e.offsetX - currentBall.x;
        currentBall.offsetY = e.offsetY - currentBall.y;
        this.isDragging = true;
    }
    dealMouseMove(e) {
        if (this.isDragging) {
            this.draw(e.offsetX, e.offsetY);
        }
    }
    dealMouseUp(e) {
        const { currentBall } = this;
        if (this.isDragging) {
            let circleInfo = this.draw(e.offsetX, e.offsetY);
            // 初始化数据
            currentBall.x = circleInfo.x;
            currentBall.y = circleInfo.y;
            currentBall.offsetX = -1;
            currentBall.offsetY = -1;
            this.isDragging = false;
        }
    }
}
