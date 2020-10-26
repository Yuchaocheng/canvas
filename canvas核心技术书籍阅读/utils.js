// 节流函数
function throttle(func, wait) {
  let timeout = null;
  // 形成闭包。timeout参数因为需要给下面定义的函数取，所以throttle函数不会被清除，一直存在。
  return function () {
    if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(this, arguments);
        timeout = null;
      }, wait);
    }
  };
}
