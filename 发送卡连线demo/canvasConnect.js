/* 常量 */
var BGLINEWIDTH = 1; //背景网格线宽
var IRADIUS = 24; // 圆半径
var IRADIUSWIDTH = 2; // 圆线条宽度
var CIRCLESTROKECOLOR = "white"; //圆线条颜色
var FONTFAMILY = "Palatino"; //圆内字体样式
var FONTCOLOR = "white"; //圆内字体样式
var CONNECTLINECOLOR = "white"; //连线线条颜色
var TRIANGLEFILL = "WHITE"; //三角形颜色
var fontSize = 24; //默认字体大小

function Connect() {
    //  初始化信息
    this.bgCanvas = null; //背景cnavas
    this.mainCanvas = null; //主绘制canvas
    this.bgCtx = null; // 背景canvas绘制上下文
    this.ctx = null; //主canvas绘制上下文
    this.iXNum = -1; //水平方向单元格数量
    this.iYNum = -1; //垂直方向单元格数量
    this.aCellList = []; // 单元格坐标信息
    this.aWillDrawCells = []; // 需绘制单元格
    this.iWidth = 0; //单元格宽度
    this.iHeight = 0; //单元格高度
    this.iClickCell = -1; //  鼠标点击单元格
    this.aUndoList = []; //被撤销的单元格数组，记录下来用作恢复
    this.iMouseMovingCell = -1; // 鼠标移动的单元格
    this.lineType = 1;
    this.iSendPort = -1;
}
Connect.prototype = {
    init: function (option) {
        this.bgCanvas = document.getElementById(option.bgCanvas);
        this.mainCanvas = document.getElementById(option.mainCanvas);
        this.bgCtx = this.bgCanvas.getContext("2d");
        this.ctx = this.mainCanvas.getContext("2d");
        this.iXNum = option.iXNum;
        this.iYNum = option.iYNum;
        this.iWidth = this.bgCanvas.width / this.iXNum; //单元格宽度
        this.iHeight = this.bgCanvas.height / this.iYNum; //单元格高度
        /* 默认样式 */
        /* 使字体位于单位中心 */
        this.ctx.textBaseline = "middle"; //字体相对y坐标居中
        this.ctx.textAlign = "center"; // 字体相对x坐标居中
        this.grid(this.iXNum, this.iYNum);

        // 添加监听
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.mainCanvas.addEventListener("mousemove", this.handleMouseMove);
        this.mainCanvas.addEventListener("click", this.handleMouseClick);
        this.activeColor = "";
        this.iSendPort = option.iSendPort || -1;
    },
    // 鼠标移动处理
    handleMouseMove: function (e) {
        var iMouseMovingCell = this.findCurrentIndex(e.offsetX, e.offsetY);
        if (iMouseMovingCell !== this.iMouseMovingCell) {
            /* 移动到不同单元格时触发 */
            if (typeof this.chagneMoveCell === "function") {
                var iMonvingX = iMouseMovingCell % this.iXNum;
                var iMonvingY = Math.floor(iMouseMovingCell / this.iXNum);
                this.chagneMoveCell(iMonvingX, iMonvingY);
            }
        }

        this.iMouseMovingCell = iMouseMovingCell;
    },
    handleMouseLeave: function () {
        this.iMouseMovingCell = -1;
        if (typeof this.chagneMoveCell === "function") {
            this.chagneMoveCell(-1, -1);
        }
    },
    handleMouseClick: function (e) {
        if (!this.activeColor) {
            return;
        }
        this.iClickCell = this.findCurrentIndex(e.offsetX, e.offsetY);
        var bCellHasDrawed = this.aWillDrawCells
            .map(function (item) {
                return item.iCellIndex;
            })
            .includes(this.iClickCell);
        if (bCellHasDrawed) {
            //已经绘制过的单元格点击无效
            return;
        }
        if ($scope.lineType === 1) {
            this.selfDefineType();
        } else {
            this.otherLineType($scope.lineType);
        }
    },
    // 绘制背景网格，不计算线宽
    grid: function (iX, iY) {
        var self = this;
        this.aCellList = Array.from({ length: iX * iY }, function (item, index) {
            var xP = (index % iX) * self.iWidth;
            var yP = Math.floor(index / iX) * self.iHeight;
            return [xP, yP];
        });
        this.bgCtx.save();
        this.bgCtx.translate(0.5, 0.5); // 半像素问题解决
        for (var i = 1; i < iX; i++) {
            var drawX = this.iWidth * i;
            this.bgCtx.moveTo(drawX, 0);
            this.bgCtx.lineTo(drawX, this.bgCanvas.height);
        }
        for (var j = 1; j < iY; j++) {
            var drawY = this.iHeight * j;
            this.bgCtx.moveTo(0, drawY);
            this.bgCtx.lineTo(this.bgCanvas.width, drawY);
        }

        this.bgCtx.lineWidth = BGLINEWIDTH;
        this.bgCtx.stroke();
        this.bgCtx.restore();
    },
    /* 划线类型分为自定义和非自定义 */
    selfDefineType: function () {
        var self = this;
        var aCurrnetPortList = this.aWillDrawCells.filter(function (item) {
            return item.sendPort === self.iSendPort;
        });
        this.aWillDrawCells.push({
            iCellIndex: this.iClickCell, //第几个单元格
            sendPort: this.iSendPort, //几号发送口
            sort: aCurrnetPortList.length, //排序依据
        });
        this.drawAll();
    },
    // 单元格绘制
    drawAll: function () {
        // 每次都重绘
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.aWillDrawCells.length) {
            return;
        }
        this.aWillDrawCells.forEach(function (item) {
            fillCell(item.iCellIndex, item.sendPort);
            if (item.sort === 0) {
                drawTextCircle(item.iCellIndex, item.sendPort);
            }
        });
        /* 单元格连线绘制 */
        // 当前已绘制的发送口
        var aDrawedPortList = [];
        aWillDrawCells.forEach(function (item) {
            if (!aDrawedPortList.includes(item.sendPort)) {
                aDrawedPortList.push(item.sendPort);
            }
        });
        // 一个发送口一个发送口连线
        aDrawedPortList.forEach(function (iSendPort) {
            var aPortArr = this.aWillDrawCells
                .filter(function (item) {
                    return item.sendPort === iSendPort;
                })
                .sort(function (pre, cur) {
                    return pre.sendPort - cur.sendPort;
                });
            if (aPortArr.length > 1) {
                // 大于1则需要连线
                connectLine(aPortArr);
            }
        });
    },
    /* 工具函数 */
    // 根据位置找到单元格
    findCurrentIndex: function (offsetX, offsetY) {
        var self = this;
        return this.aCellList.findIndex(function (item) {
            var bXIn = offsetX >= item[0] && offsetX <= item[0] + self.iWidth;
            var bYIn = offsetY >= item[1] && offsetY <= item[1] + self.iHeight;
            return bXIn && bYIn;
        });
    },
};
export default Connect;
