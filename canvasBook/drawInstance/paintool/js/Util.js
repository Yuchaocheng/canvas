class Utils {
    constructor() {
        //
    }
    // 绘制网格
    grid(ctx, { x = 0, y = 0, w = 0, h = 0, xGap = 4, yGap = 4 } = {}) {
        // debugger
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
}
export default new Utils();
