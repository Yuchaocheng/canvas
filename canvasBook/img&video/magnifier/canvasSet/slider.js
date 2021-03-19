/* 问题：在class内部如何优雅地添加监听并且remove监听 */
const BALLR = 14; //小球半径
// 默认的一些配置项
const DEFAULTOPTIONS = {
    width: 160, //滑块长度
    height: 20, //滑块高度
    value: 0, //小球在滑块中百分比
};

import Utils from "../Util.js";
export default class Slider {
    constructor(id, options) {
        this.id = id;
        this.canvas = Utils.createCanvas(id);
        if (!this.canvas) {
            throw new Error(`未取到${id}元素`);
        }
        this.ctx = this.canvas.getContext("2d");
        this.offsetCanvas = Utils.createOffsetCanvas(this.canvas);
        this.offsetCtx = this.offsetCanvas.getContext("2d");
        this.boundInfo = Utils.getBounding(this.canvas);
        options = Object.assign({}, DEFAULTOPTIONS, options);
        this.sliderWidth = options.width < this.canvas.width ? options.width : this.canvas.width;
        this.sliderHeight = options.height < this.canvas.height ? options.height : this.canvas.height;
        /* 滑块距离canvas左上间隙，为了滑块在canvas中居中显示 */
        this.widthGap = (this.canvas.width - this.sliderWidth) / 2;
        this.heightGap = (this.canvas.height - this.sliderHeight) / 2;
        // 小球移动宽度
        this.ballMoveWidth = this.sliderWidth - BALLR * 2;
        this.value = options.value;
        /* 鼠标当前位于 */
        this.mouseCurIn = "canvas";
        this.isDragging = false; //是否处于拖拽状态
        this.init();
    }
    init() {
        this.dealMouseDown = this.dealMouseDown.bind(this);
        this.dealMouseMove = Utils.throttle(this.dealMouseMove, 20).bind(this);
        this.dealMouseUp = this.dealMouseUp.bind(this);
        this.canvas.addEventListener("mousedown", this.dealMouseDown);
        document.addEventListener("mousemove", this.dealMouseMove);
        document.addEventListener("mouseup", this.dealMouseUp);
        this.drawSlider();
        this.saveCanvas();
        this.drawBall();
    }
    destroy() {
        this.canvas.removeEventListener("mousedown", this.dealMouseDown);
        document.removeEventListener("mousemove", this.dealMouseMove);
        document.removeEventListener("mouseup", this.dealMouseUp);
    }
    get cursor() {
        this.canvas.style.cursor;
    }
    set cursor(cursor) {
        this.canvas.style.cursor = cursor;
    }
    // 绘制滑块
    drawSlider(onlyPath) {
        const { ctx, sliderWidth, sliderHeight, widthGap, heightGap } = this;
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "cornflowerblue";
        ctx.strokeStyle = "#ecf0f1";
        Utils.roundRect(ctx, widthGap, heightGap, sliderWidth, sliderHeight, sliderHeight / 2);
        if (onlyPath) {
            ctx.restore();
            return;
        }
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
    // 绘制小球
    drawBall(onlyPath) {
        const { ctx, ballMoveWidth, sliderHeight, widthGap, heightGap, value } = this;
        const rx = (+value / 100) * ballMoveWidth + widthGap + BALLR;
        const ry = sliderHeight / 2 + heightGap;
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "rgba(247, 241, 227,0.7)";
        ctx.strokeStyle = "rgb(52, 72, 35)";
        ctx.arc(rx, ry, BALLR, 0, Math.PI * 2);
        if (onlyPath) {
            ctx.restore();
            return;
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    // 保存cnavas当前快照
    saveCanvas() {
        this.offsetCtx.clearRect(0, 0, this.offsetCanvas.width, this.offsetCanvas.height);
        this.offsetCtx.drawImage(this.canvas, 0, 0);
    }
    // 还原canvas保存的快照
    restoreCanvas() {
        this.ctx.clearRect(0, 0, this.offsetCanvas.width, this.offsetCanvas.height);
        this.ctx.drawImage(this.offsetCanvas, 0, 0);
    }
    pointInSlider(x, y) {
        this.drawSlider(true);
        return this.ctx.isPointInPath(x, y);
    }
    pointInBall(x, y) {
        this.drawBall(true);
        return this.ctx.isPointInPath(x, y);
    }
    /* 鼠标按下事件 */
    dealMouseDown(e) {
        const { mouseCurIn } = this;
        if (mouseCurIn === "canvas") {
            return;
        }
        if (mouseCurIn === "ball") {
            this.cursor = "grabbing";
            this.isDragging = true;
        }
    }
    /* 鼠标移动事件 */
    dealMouseMove(e) {
        const { isDragging, boundInfo } = this;
        // 非本canvas触发
        if (!isDragging && !this.canvas.contains(e.target)) {
            return;
        }
        if (isDragging) {
            this.restoreCanvas();
            /* 不是自身触发的事件，不要用offsetX，offsetX是鼠标位置与目标节点左侧的水平距离 */
            let x = e.clientX - boundInfo.left;
            this.countValue(x);
            this.drawBall();
        } else {
            this.cursor = "default";
            this.mouseCurIn = "canvas";
            if (this.pointInSlider(e.offsetX, e.offsetY)) {
                if (this.pointInBall(e.offsetX, e.offsetY)) {
                    this.cursor = "grab";
                    this.mouseCurIn = "ball";
                } else {
                    this.cursor = "pointer";
                    this.mouseCurIn = "slider";
                }
            }
        }
    }
    /* 鼠标松开事件 */
    dealMouseUp(e) {
        const { mouseCurIn, boundInfo } = this;
        // 非本canvas触发
        if (!this.isDragging && !this.canvas.contains(e.target)) {
            return;
        }
        if (mouseCurIn === "canvas") {
            return;
        }
        if (this.isDragging) {
            this.cursor = "default";
            this.isDragging = false;
        } else {
            this.restoreCanvas();
            //点击事件
            let x = e.clientX - boundInfo.left;
            this.countValue(x);
            this.drawBall();
        }
    }
    countValue(x) {
        const { ballMoveWidth, widthGap } = this;
        x = x - widthGap - BALLR;
        if (x < 0) {
            this.value = 0;
        } else if (x > ballMoveWidth) {
            this.value = 100;
        } else {
            this.value = Math.ceil((x / ballMoveWidth) * 100);
        }
    }
    setValue(val) {
        this.restoreCanvas();
        this.value = val;
        this.drawBall();
    }
}
