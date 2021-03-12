// work一旦被主线程创建，就会执行内部代码
addEventListener("message", function (e) {
    if (e.data) {
        let data = e.data.data;
        let width = e.data.width;
        let length = data.length;
        for (i = 0; i < length; ++i) {
            if ((i + 1) % 4 != 0) {
                // console.log(i); //不要在里面加打印，100多万次打印直接跑崩
                if ((i + 4) % (width * 4) == 0) {
                    // last pixel in a row
                    data[i] = data[i - 4];
                    data[i + 1] = data[i - 3];
                    data[i + 2] = data[i - 2];
                    data[i + 3] = data[i - 1];
                    i += 4;
                } else {
                    data[i] = 2 * data[i] - data[i + 4] - 0.5 * data[i + 4];
                }
            }
        }
        postMessage(e.data);
    }
});