## 浏览器内部自己实现了双缓冲技术，所以不需要开发人员再手动实现。
所谓双缓冲技术，就是说在重绘cnavas时，清除canvas后再重绘，理论上会有一点闪烁。双缓冲技术就是将所有东西都绘制到离屏canvas，然后
再把离屏canvas的内容一次性绘制到屏幕canvans中