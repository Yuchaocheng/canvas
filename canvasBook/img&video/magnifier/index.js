import Slider from "./canvasSet/slider.js";
import Circle from "./canvasSet/circle.js";
import Magnifier from "./canvasSet/magnifier.js";
const timesMin = 1; //放大镜最小倍数
const timesMax = 3; //放大镜最大倍数
const sizeCircleMinR = 5;
const sizeCircleMaxR = 20;

const timesDom = document.getElementById("times");

let timesSider = new Slider("timesCanvas");
/* 获取对象原型，可以用这个方法获取到对象的原型，然后给原型添加属性和方法 */
// let classSelf =  Object.getPrototypeOf(timesSider)
let sizesSider = new Slider("sizesCanvas");
let timesValue = 0;
let sizesValue = 0;

let sizeCircle = new Circle("sizeCircle");
let MagnifierInstance = new Magnifier("magnifier");

Object.defineProperty(timesSider, "value", {
    /* 监听绘制类型  */
    set(value) {
        timesValue = value;
        let times = ((timesMax - timesMin) / 100) * timesValue + timesMin;
        timesDom.innerHTML = times.toFixed(2);
    },
    get() {
        return timesValue;
    },
});
timesSider.value = 30; //默认放大倍数

Object.defineProperty(sizesSider, "value", {
    /* 监听绘制类型  */
    set(value) {
        sizesValue = value;
        let radius = ((sizeCircleMaxR - sizeCircleMinR) / 100) * sizesValue + sizeCircleMinR;
        sizeCircle.currentR = radius;
        sizeCircle.reDraw();
    },
    get() {
        return sizesValue;
    },
});
timesSider.setValue(30); //默认放大倍数
sizesSider.setValue(60); //默认放大倍数
