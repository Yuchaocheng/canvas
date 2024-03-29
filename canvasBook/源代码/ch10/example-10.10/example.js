/*
 * Copyright (C) 2012 David Geary. This code is from the book
 * Core HTML5 Canvas, published by Prentice-Hall in 2012.
 *
 * License:
 *
 * Permission is hereby granted, free of charge, to any person 
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * The Software may not be used to create training material of any sort,
 * including courses, books, instructional videos, presentations, etc.
 * without the express written consent of David Geary.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
*/

var context = document.getElementById('canvas').getContext('2d'),
    image = new Image(),

    alphaSpan = document.getElementById('alphaSpan'),
    sizeSpan  = document.getElementById('sizeSpan'),

    sizeSlider  = new COREHTML5.Slider('blue', 'cornflowerblue',
                                       0.85, // knob percent
                                       90,   // take up % of width
                                       50),  // take up % of height

    alphaSlider = new COREHTML5.Slider('blue', 'cornflowerblue',
                                       0.50, // knob percent
                                       90,   // take up % of width
                                       50),  // take up % of height

    pan = new COREHTML5.Pan(context.canvas, image),
    e = pan.domElement,

    ALPHA_MAX = 1.0,
    SIZE_MAX = 12;

// Event Handlers.....................................................

sizeSlider.addChangeListener(function (e) {
   var size = (parseFloat(sizeSlider.knobPercent) * 12);
   size = size < 2 ? 2 : size;
   sizeSpan.innerHTML = size.toFixed(1) + '%';

   pan.imageContext.setTransform(1,0,0,1,0,0); // identity matrix
   pan.viewportPercent = size;

   pan.erase();
   pan.initialize();
   pan.draw();
});
   
alphaSlider.addChangeListener(function (e) {
   alphaSpan.innerHTML =
      parseFloat(alphaSlider.knobPercent * 100).toFixed(0) + '%';
   alphaSpan.style.opacity = parseFloat(alphaSlider.knobPercent);
   pan.panCanvasAlpha = alphaSlider.knobPercent;
   pan.erase();
   pan.draw();
});

// Initialization....................................................

image.src = 'pencilsAndBrush.jpg';
document.getElementById('body').appendChild(e);
e.className = 'pan';

alphaSlider.appendTo('alphaSliderDiv');
sizeSlider.appendTo('sizeSliderDiv');

pan.viewportPercent = sizeSlider.knobPercent * SIZE_MAX;
pan.panCanvasAlpha  = alphaSlider.knobPercent * ALPHA_MAX;

sizeSpan.innerHTML = pan.viewportPercent.toFixed(0) + '%';
alphaSpan.innerHTML = (pan.panCanvasAlpha * 100).toFixed(0)  + '%';

alphaSlider.draw();
sizeSlider.draw();
