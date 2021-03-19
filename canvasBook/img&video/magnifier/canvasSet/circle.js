import Utils from "../Util.js";
const DEFAULTOPTIONS = {
    minR: 5,
    maxR: 20,
};
export default class Circle {
    constructor(id, options) {
        this.id = id;
        this.canvas = Utils.createCanvas(id);
        if (!this.canvas) {
            throw new Error(`未取到${id}元素`);
        }
        options = Object.assign({}, DEFAULTOPTIONS, options);
        this.currentR = options.minR;
        this.ctx = this.canvas.getContext("2d");
        this.init();
    }
    init() {
        this.draw();
    }
    draw() {
        this.ctx.lineWidth = 2;
        let width = this.canvas.width;
        let height = this.canvas.height;
        let maxR = (Math.min(width, height) - this.ctx.lineWidth) / 2;
        if (this.currentR > maxR) {
            this.currentR = maxR;
        }
        this.ctx.beginPath();
        this.ctx.arc(width / 2, height / 2, this.currentR, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    reDraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
    }
}
