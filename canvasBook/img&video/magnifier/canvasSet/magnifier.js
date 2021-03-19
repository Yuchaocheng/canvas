import Utils from "../Util.js";
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
        options = Object.assign({}, DEFAULTOPTIONS, options);
        this.ctx = this.canvas.getContext("2d");
        this.init();
    }
    init() {
        this.loadBackground();
    }
    loadBackground() {
        let image = new Image();
        image.src = "../../../image/camp.png";
        image.onload = () => {
            this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        };
    }
}
