/**

  Experimental shader giving perspective effect on image with depthmap.

  Quality is controlled by defined profiles 1, 2 and 3.

  ---------------
  The MIT License

  Copyright (c) 2014 Rafał Lindemann. http://panrafal.github.com/depthy

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.

*/
import PIXI from 'pixi.js';
let fs = require('fs');

function DepBlurFilter()
{
    PIXI.AbstractFilter.call(this,
        //vertex shader
        fs.readFileSync(__dirname + '/DepBlurFilter.vert', 'utf8'),
        //null,
        //fragment shader
        fs.readFileSync(__dirname + '/DepBlurFilter.frag', 'utf8'),
        //uniforms
        this.uniforms
    );
};

DepBlurFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
DepBlurFilter.prototype.constructor = DepBlurFilter;

export default DepBlurFilter;
