import PIXI from 'pixi.js';
import DepthPerspectiveFilter from './DepthPerspective/DepthPerspectiveFilter';
import DepBlurFilter from './DepthPerspective/DepBlurFilter';
import testPNG from '../../images/mango_image.jpg';
import depthPNG from '../../images/mango_depth.jpg';

let stageSize = { width: 768, height: 1024};

// Create a pixi renderer
let renderer = PIXI.autoDetectRenderer(stageSize.width, stageSize.height);
let renderer2 = PIXI.autoDetectRenderer(stageSize.width, stageSize.height);
// add render view to DOM
document.body.appendChild(renderer.view);
document.body.appendChild(renderer2.view);
renderer.view.addEventListener('mousemove', onHover, false);

let stage = new PIXI.Container(0xFFFFFF);
let stage2 = new PIXI.Container(0xFFFFFF);

let depthFilter = null;
let depthOffset = { x: 0, y: 0 };
let easedOffset = depthOffset;
let dirty = true;

// update only once
updateSprite();
renderer2.render(stage2);

//start animating
animate2();

function animate() {
    if (dirty) {
        updateOffset();
        renderer.render(stage);
    }
    requestAnimationFrame(animate);
}

var ani2id;
var count = 0;
function animate2() {
    renderer2.render(stage2);
    if (count == 100) {
        cancelAnimationFrame(ani2id);
        updateToDepBlur();
        update();
        updateOffset();
        renderer.render(stage);
        animate();
    }
    count++;
    ani2id = requestAnimationFrame(animate2);
}

function update() {
    updateDepthFilter();
}

function updateToDepBlur() {
    let dataURL = renderer2.view.toDataURL();

    let newDepthRenderTexture = new PIXI.Texture.fromImage(dataURL);
    console.log(newDepthRenderTexture);
    depthFilter = new DepthPerspectiveFilter(newDepthRenderTexture);
    depthFilter.map = newDepthRenderTexture;

    let sprite = PIXI.Sprite.fromImage(testPNG);
    sprite.filters = [depthFilter];
    stage.addChild(sprite);
}

function updateSprite() {

    let depBlurFilter = new DepBlurFilter();
    
    //let depTexture = PIXI.Texture.fromImage(depthPNG);
    //depTexture.filters = [depBlurFilter];

    let depTexture = PIXI.Sprite.fromImage(depthPNG);
    depTexture.filters = [depBlurFilter];
    stage2.addChild(depTexture);
}

function updateDepthFilter() {
    depthFilter.scale = 0.015;
    depthFilter.offset = {
        x: easedOffset.x || 0,
        y: easedOffset.y || 0
    };
    depthFilter.focus = 0.5
        depthFilter.enlarge = 1.00;
}

function onHover(event) {
    let hoverElement = event.currentTarget;
    let pointerEvent = event.touches ? event.touches[0] : event;
    let x = (pointerEvent.pageX - hoverElement.offsetLeft) / hoverElement.offsetWidth;
    let y = (pointerEvent.pageY - hoverElement.offsetTop) / hoverElement.offsetHeight;

    x = Math.max(-1, Math.min(1, (x * 2 - 1) * hoverElement.offsetWidth / stageSize.width));
    y = Math.max(-1, Math.min(1, (y * 2 - 1) * hoverElement.offsetHeight / stageSize.height));

    depthOffset = { x: x, y: -y };
    dirty = true;
}

function updateOffset() {
    if (depthOffset.x !== easedOffset.x || depthOffset.y !== easedOffset.y) {
        let easeFactor = 0.4;
        easedOffset.x = easedOffset.x * easeFactor + depthOffset.x * (1 - easeFactor);
        easedOffset.y = easedOffset.y * easeFactor + depthOffset.y * (1 - easeFactor);
        if (Math.abs(easedOffset.x - depthOffset.x) < 0.0001 && Math.abs(easedOffset.y - depthOffset.y) < 0.0001) {
            easedOffset = depthOffset;
        }

        depthFilter.offset = {
            x: easedOffset.x,
            y: easedOffset.y
        };
    }
}
