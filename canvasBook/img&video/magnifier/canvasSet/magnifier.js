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
        options = Object.assign({}, DEFAULTOPTIONS, options);
        this.ctx = this.canvas.getContext("2d");
        this.times = options.times || 1; //放大倍数，默认为1
        this.LensRadius = options.LensRadius || 100; //放大镜大小，默认100
        this.rectImageData = null; //放大区域矩形imageData保存
        this.init();
    }
    async init() {
        await this.loadBackground();
        this.magnify(460, 100);
        this.drawMagnifierCircle(460, 410);
    }
    // 加载背景
    loadBackground() {
        return new Promise((resolve) => {
            let image = new Image();
            image.src = "../../../image/camp.png";
            image.onload = () => {
                this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
                resolve();
            };
        });
    }
    // 绘制放大镜实例
    drawMagnifierCircle(x, y) {
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
    }
    // 放大
    magnify(rx, ry) {
        const { ctx, LensRadius, offsetCanvas,offsetCtx } = this;
        let x = rx - LensRadius / 2;
        let y = ry - LensRadius / 2;
        this.rectImageData = ctx.getImageData(x, y, this.LensRadius, this.LensRadius);
        offsetCtx.clearRect(0, 0, offsetCanvas.width, offsetCanvas.height);
        offsetCtx.putImageData()
    }
    // 设置放大倍速
    setTimes(times) {
        this.times = times;
    }
}
