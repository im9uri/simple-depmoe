let PIXI = require('pixi.js');
let DepthPerspectiveFilter = require('./DepthPerspective/DepthPerspectiveFilter.js');

import testPNG from '../../images/mango_image.jpg';
import depthPNG from '../../images/mango_depth.jpg';

let loader = new PIXI.loaders.Loader();
loader.add(testPNG).add(depthPNG);
loader.once('complete', start);
loader.load();

function start() {
  let stageSize = { width: 768, height: 1024 };
  let renderer = new PIXI.WebGLRenderer(stageSize.width, stageSize.height);
  document.body.appendChild(renderer.view);
  renderer.view.addEventListener('mousemove', onHover, false);

  let stage = new PIXI.Container();
  let imageRenderTexture = null;
  let depthRenderTexture = null;
  let depthFilter = null;
  let depthOffset = { x: 0, y: 0 };
  let easedOffset = depthOffset;

  //update only once
  update();

  //start animating
  animate();
  function animate() {
    updateOffset();
    renderer.render(stage);
    
    requestAnimationFrame(animate);
  }

  function update() {
    updateSize();

    updateImageTexture();
    updateDepthTexture();

    updateStage();
    updateDepthFilter();
  }

  function updateSize() {

  }

  function updateImageTexture() {
    // prepare image render
    let imageSprite = new PIXI.Sprite.fromImage(testPNG);

    let imageContainer = new PIXI.Container();
    imageContainer.addChild(imageSprite);

    imageRenderTexture = new PIXI.RenderTexture(renderer, stageSize.width, stageSize.height);
    imageRenderTexture.render(imageContainer);
  }

  function updateDepthTexture() {
    // prepare depth render / filter
    let depthSprite = new PIXI.Sprite.fromImage(depthPNG);

    let depthContainer = new PIXI.Container();
    depthContainer.addChild(depthSprite);

    depthRenderTexture = new PIXI.RenderTexture(renderer, stageSize.width, stageSize.height);
    depthRenderTexture.render(depthContainer);
  }

  function updateStage() {
    // combine image with depthmap
    depthFilter = new DepthPerspectiveFilter(depthRenderTexture);
    depthFilter.map = depthRenderTexture;

    let compoundSprite = new PIXI.Sprite(imageRenderTexture);
    compoundSprite.filters = [depthFilter];

    stage.addChild(compoundSprite);
  }

  function updateDepthFilter() {
    depthFilter.scale = 0.015;
    depthFilter.offset = {
      x: easedOffset.x || 0,
      y: easedOffset.y || 0
    };
    depthFilter.focus = 0.5
    depthFilter.enlarge = 1.06;
  }

  function onHover(event) {
    let hoverElement = event.currentTarget;
    let pointerEvent = event.touches ? event.touches[0] : event;
    let x = (pointerEvent.pageX - hoverElement.offsetLeft) / hoverElement.offsetWidth;
    let y = (pointerEvent.pageY - hoverElement.offsetTop) / hoverElement.offsetHeight;
    x = Math.max(-1, Math.min(1, (x * 2 - 1) * hoverElement.offsetWidth / stageSize.width));
    y = Math.max(-1, Math.min(1, (y * 2 - 1) * hoverElement.offsetHeight / stageSize.height));

    depthOffset = { x: -x, y: -y };
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
}


