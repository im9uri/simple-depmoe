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

function DepthPerspectiveFilter(texture)
{
    // set the uniforms
    this.uniforms = {
        displacementMap: {type: 'sampler2D', value:texture},
        scale:           {type: '1f', value:0.015},
        offset:          {type: 'v2', value:{x:0, y:0}},
        mapDimensions:   {type: 'v2', value:{x:1, y:5112}},
        dimensions:      {type: 'v4', value:[0,0,0,0]},
        focus:           {type: '1f', value:0.5},
        enlarge:         {type: '1f', value:1.06}
    };

    if (texture.baseTexture.hasLoaded)
    {
        this.uniforms.mapDimensions.value.x = texture.width;
        this.uniforms.mapDimensions.value.y = texture.height;
    }
    else
    {
        let boundLoadedFunction = this.onTextureLoaded.bind(this);
        texture.baseTexture.on('loaded', boundLoadedFunction);
    }

    PIXI.AbstractFilter.call(this,
        //vertex shader
        //fs.readFileSync(__dirname + '/DepMoeFilter2.vert', 'utf8'),
        null,
        //fragment shader
        fs.readFileSync(__dirname + '/DepMoeFilter2.frag', 'utf8'),
        //uniforms
        this.uniforms
    );
};

DepthPerspectiveFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
DepthPerspectiveFilter.prototype.constructor = DepthPerspectiveFilter;

DepthPerspectiveFilter.prototype.onTextureLoaded = function()
{
    this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width;
    this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;

    this.uniforms.displacementMap.value.baseTexture.off('loaded', this.boundLoadedFunction);
};

/**
 * The texture used for the displacemtent map * must be power of 2 texture at the moment
 *
 * @property map
 * @type Texture
 */
Object.defineProperties(DepthPerspectiveFilter.prototype, {
    map: {
        get: function ()
        {
            return this.uniforms.displacementMap.value;
        },
        set: function (value)
        {
            this.uniforms.displacementMap.value = value;
        }
    }
});

/**
 * The multiplier used to scale the displacement result from the map calculation.
 *
 * @property scale
 * @type Point
 */
Object.defineProperties(DepthPerspectiveFilter.prototype, {
    scale: {
        get: function ()
        {
            return this.uniforms.scale.value;
        },
        set: function (value)
        {
            this.uniforms.scale.value = value;
        }
    }
});

/**
 * Focus point in paralax
 *
 * @property focus
 * @type float
 */
Object.defineProperties(DepthPerspectiveFilter.prototype, {
    focus: {
        get: function ()
        {
            return this.uniforms.focus.value;
        },
        set: function (value)
        {
            this.uniforms.focus.value = Math.min(1,Math.max(0,value));
        }
    }
});

/**
 * Image enlargment
 *
 * @property enlarge
 * @type float
 */
Object.defineProperties(DepthPerspectiveFilter.prototype, {
    enlarge: {
        get: function() {
            return this.uniforms.enlarge.value;
        },
        set: function(value) {
            this.uniforms.enlarge.value = value;
        }
    }
});

/**
 * The offset used to move the displacement map.
 *
 * @property offset
 * @type Point
 */
Object.defineProperties(DepthPerspectiveFilter.prototype, {
    offset: {
        get: function() {
            return this.uniforms.offset.value;
        },
        set: function(value) {
            this.uniforms.offset.value = value;
        }
    }
});

export default DepthPerspectiveFilter;
