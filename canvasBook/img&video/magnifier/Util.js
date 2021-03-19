class Utils {
    constructor() {
        //
    }
    // 绘制网格
    grid(ctx, { x = 0, y = 0, w = 0, h = 0, xGap = 4, yGap = 4 } = {}) {
        if (!ctx) {
            throw new Error("第一个参数错误！");
        }
        w = w || ctx.canvas.width;
        h = h || ctx.canvas.height;
        ctx.save();
        let offset = ctx.lineWidth < 1 ? ctx.lineWidth : 0;
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = xGap + offset; i < w; i += xGap) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
        }
        for (let i = yGap + offset; i < w; i += yGap) {
            ctx.moveTo(0, i);
            ctx.lineTo(w, i);
        }
        ctx.stroke();
        ctx.restore();
    }

    // 节流函数 防止频繁触发
    throttle(fn, wait) {
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
    // 计算两点之间距离
    twoPointDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    // 根据给定容器id，生成canvas
    createCanvas(id) {
        let container = document.getElementById(id);
        if (container) {
            let styleObj = getComputedStyle(container);
            let width = parseInt(styleObj.width, 10);
            let height = parseInt(styleObj.height, 10);
            let canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            container.appendChild(canvas);
            return canvas;
        } else {
            return null;
        }
    }
    createOffsetCanvas(canvas) {
        if (typeof canvas === "object" && canvas.nodeType === 1 && canvas.tagName === "CANVAS") {
            let offsetCanvas = document.createElement("canvas");
            offsetCanvas.width = canvas.width;
            offsetCanvas.height = canvas.height;
            return offsetCanvas;
        }
        return null;
    }
    // r传入数字则代表4个角圆角值一样，传入数组则可以单独设置每个角
    roundRect(ctx, x, y, w, h, r = 0) {
        let roundArr = [];
        if (typeof r === "number") {
            roundArr = new Array(4).fill(r);
        } else {
            roundArr = r;
        }
        // r不能超过宽高中较小的那个的一半
        let iMaxR = Math.min(w, h) / 2;
        roundArr = roundArr.map((item) => {
            if (item > iMaxR) {
                item = iMaxR;
            }
            return item;
        });
        ctx.moveTo(x + roundArr[0], y);
        // arcTo会绘制当前笔触（moveTo）到第一个端点的路径，所以lineTo可以省略
        // ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + roundArr[1], roundArr[1]);
        ctx.arcTo(x + w, y + h, x + w - roundArr[2], y + h, roundArr[2]);
        ctx.arcTo(x, y + h, x, y + h - roundArr[3], roundArr[3]);
        ctx.arcTo(x, y, x + roundArr[0], y, roundArr[0]);
    }
    getBounding(dom) {
        if (typeof dom === "string") {
            dom = document.getElementById("dom");
        }
        if (typeof dom === "object" && dom.nodeType === 1) {
            // rect的属性是继承的属性，并不是自身的属性。
            let rect = dom.getBoundingClientRect();
            return rect;
        } else {
            throw new Error("参数必须为元素id或者dom元素");
        }
    }
}
export default new Utils();
