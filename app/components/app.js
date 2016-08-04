import PIXI from 'pixi.js';
import DepthPerspectiveFilter from './DepthPerspective/DepthPerspectiveFilter';
import testPNG from '../../images/mango_512_image.jpg';
import depthPNG from '../../images/mango_512_depth.jpg';

let stageSize = { width: 512, height: 512 };

// Create a pixi renderer
let renderer = PIXI.autoDetectRenderer(stageSize.width, stageSize.height);
// add render view to DOM
document.body.appendChild(renderer.view);
renderer.view.addEventListener('mousemove', onHover, false);

let stage = new PIXI.Container(0xFFFFFF);
let depthFilter = null;
let depthOffset = { x: 0, y: 0 };
let easedOffset = depthOffset;

// update only once
update();

//start animating
animate();
function animate() {
  updateOffset();
  renderer.render(stage);

  requestAnimationFrame(animate);
}

function update() {
  updateSprite();
  updateDepthFilter();
}

function updateSprite() {
  let depthRenderTexture = PIXI.Texture.fromImage(depthPNG);
  depthFilter = new DepthPerspectiveFilter(depthRenderTexture);
  depthFilter.map = depthRenderTexture;

  let sprite = PIXI.Sprite.fromImage(testPNG);
  sprite.filters = [depthFilter];
  stage.addChild(sprite);
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
