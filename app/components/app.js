var PIXI = require('pixi.js');
console.log(PIXI);

var renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0xffffff});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;
var container = new PIXI.Container();
stage.addChild(container);

// create a texture from an image path
var texture = new PIXI.Texture.fromImage('./images/test.png');
// create a new Sprite using the texture
var sprite = new PIXI.Sprite(texture);
container.addChild(sprite);

// //create displacementFilter
// var displacementSprite = new PIXI.Sprite.fromImage('images/depth.png');
// var displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
// stage.addChild(displacementSprite);
// container.filters = [displacementFilter];

// //create depthFilter
// // var depthTexture = new PIXI.Sprite.fromImage('images/depth.png');
// // var depthTexture = new PIXI.Texture.fromImage('images/test.png');
// // var depthFilter = new PIXI.DepthPerspectiveFilter(depthTexture, 2);
// // stage.addChild(depthTexture);
// // container.filters = [depthFilter];

stage.on('mousemove', onPointerMove)
     .on('touchmove', onPointerMove);


// start animating
animate();

function animate() {
    requestAnimationFrame(animate);
    // render the container
    renderer.render(stage);
}

function onPointerMove(eventData)
{
    // displacementSprite.x = eventData.data.global.x - 100;
    // displacementSprite.y = eventData.data.global.y - displacementSprite.height /2;
}
