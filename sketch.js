
let _drawer;
let _mainHue = 0;


let TOPPING_TUBE_LENGTH_MULTIPLIER = 1.0;
let TOPPING_HEIGHT_MULTIPLIER = 1.0;

async function setup() {
  createCanvas(1000, 1000);
  background(30);

  colorMode(HSB);

  TOPPING_HEIGHT_MULTIPLIER = random(0.0001, 0.1);
  
  TOPPING_TUBE_LENGTH_MULTIPLIER = random(0.02, 0.18);

  _mainHue = random(0, 360);

  _drawer = new NYDrawer();
  _drawer.strokeRotNoiseX = 0.000;
  _drawer.strokeRotNoiseY = 0.000;

  // bg
  await rectBG();


  // try divider
  DIVIDE_CHANCE = 0.8;
  MAX_DEPTH = 3;

  let padding = 0.05 * min(width, height);
  let rectWidth = width - padding * 2;
  let rectHeight = height - padding * 2;

  let rects = subdivideRect(padding, padding, rectWidth, rectHeight, 0);

  // for (let i = 0; i < rects.length; i++) {
  //   fill('black');
  //   stroke('white');

  //   rect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
  // }

  for (let i = 0; i < rects.length; i++) {

    if (i != 0 && random() < 0.2)
      continue;

    let pizzaSize = min(rects[i].w, rects[i].h) * random(0.5, 0.9);

    let xOffsetSpace = rects[i].w - pizzaSize;
    let yOffsetSpace = rects[i].h - pizzaSize;

    let nowX = rects[i].x + rects[i].w * 0.5 + random(-0.5, 0.5) * xOffsetSpace;
    let nowY = rects[i].y + rects[i].h * 0.5 + random(-0.5, 0.5) * yOffsetSpace;

    // draw pizza in center
    await drawPizza(nowX, nowY, pizzaSize);
    await sleep(100);
  }

}

async function drawPizza(_x, _y, _size) {
  // create a pizza shape
  let pizzaSliceCount = int(random(4, 13));
  let pizzaSize = _size;
  let sliceAngle = 360 / pizzaSliceCount;
  let angleOffset = random(-180, 180);

  let centerRadius = _size * random(0.03, 0.12);
  let pizzaEdgeThickness = _size * 0.08;

  for (let i = 0; i < pizzaSliceCount; i++) {

    let nowDirection = sliceAngle * i + angleOffset;
    nowDirection += random(-3, 3);

    let nowCenterOffset = centerRadius + random(-0.2, 0.2) * centerRadius;

    let nowX = _x + sin(radians(nowDirection)) * nowCenterOffset;
    let nowY = _y - cos(radians(nowDirection)) * nowCenterOffset;

    drawPizzaSlice(nowX, nowY, pizzaSize, sliceAngle, nowDirection, pizzaEdgeThickness);
  }

}


async function drawPizzaSlice(_x, _y, _length, _arcAngle, _direction, _edgeThickness) {

  blendMode(BLEND);
  let sliceColor = NYColor.generateRandomColor(_mainHue);

  let startAngle = _direction - 0.5 * _arcAngle;
  let endAngle = _direction + 0.5 * _arcAngle;

  _drawer.strokeLength = 6;
  _drawer.lineDensity = random(0.06, 0.12);

  _drawer.fromColor = NYColor.generateRandomColor(_mainHue);
  _drawer.toColor = NYColor.generateRandomColor(_mainHue);
  _drawer.toColor = _drawer.toColor.slightRandomize(30, 20, 20);

  _drawer.fromColor.a = 0.7;
  _drawer.toColor.a = 0.7;
  _drawer.NYPie(_x, _y, _length, _length, startAngle, endAngle);

  // draw edge
  sliceColor.h += processHue(30);
  sliceColor.b -= 20;
  _drawer.fromColor = sliceColor.copy();
  _drawer.toColor = sliceColor.slightRandomize();

  let edgeDrawCount = _edgeThickness * 0.14;
  for (let i = 0; i < edgeDrawCount; i++) {
    let t = i / (edgeDrawCount - 1);
    let nowLength = _length + lerp(0, _edgeThickness, t);

    _drawer.nowApplyColor = NYLerpColor(_drawer.fromColor, _drawer.toColor, t);
    _drawer.nowApplyColor = _drawer.nowApplyColor.slightRandomize();
    _drawer.NYArc(_x, _y, nowLength, nowLength, startAngle, endAngle);
  }

  // leaf toppings
  let toppingLeafCount = random(60, 480);

  for (let i = 0; i < toppingLeafCount; i++) {
    let distRatio = easeOutSine(random(0.03, 0.85));
    let leftRightRatio = random(0.05, 0.95);

    let toppingPosDir = _direction + lerp(-0.5 * _arcAngle, 0.5 * _arcAngle, leftRightRatio);
    let toppingPosDist = _length * distRatio * 0.5;

    let nowX = _x + sin(radians(toppingPosDir)) * toppingPosDist;
    let nowY = _y - cos(radians(toppingPosDir)) * toppingPosDist;

    blendMode(BLEND);
    drawToppingLeaf(nowX, nowY);
    await sleep(1);
  }

  // tube toppings
  let toppingTubeCount = random(10, 60);
  let tubeBaseLength = TOPPING_TUBE_LENGTH_MULTIPLIER * _length;
  let tubeHeight = _length * TOPPING_HEIGHT_MULTIPLIER;

  for (let i = 0; i < toppingTubeCount; i++) {
    let distRatio = easeOutSine(random(0.12, 0.88));
    let leftRightRatio = random(0.12, 0.88);

    let toppingPosDir = _direction + lerp(-0.5 * _arcAngle, 0.5 * _arcAngle, leftRightRatio);
    let toppingPosDist = _length * distRatio * 0.5;

    let nowX = _x + sin(radians(toppingPosDir)) * toppingPosDist;
    let nowY = _y - cos(radians(toppingPosDir)) * toppingPosDist;

    blendMode(BLEND);
    drawToppingTube(nowX, nowY, tubeBaseLength * random(0.3, 1.2), tubeHeight);
    await sleep(1);
  }
}

let toppingTubeNoiseScaleX = 0.01;
let toppingTubeNoiseScaleY = 0.01;

async function drawToppingTube(_x, _y, _length, _tubeHeight) {
  let density = 0.8;
  let drawCount = _length * 0.5 * density;
  let stepDist = 1.0 / density;

  let tubeColor = NYColor.generateRandomColor(processHue(_mainHue + 60));
  if (random() < 0.12)
    tubeColor.h = processHue(tubeColor.h + 60);

  if (random() < 0.12) {
    tubeColor.h = 0;
    tubeColor.s = 0;
    tubeColor.b = 100;
  }

  tubeColor.a = 0.8;

  // draw backward
  let nowX = _x;
  let nowY = _y;

  for (let i = 0; i < drawCount; i++) {
    let nowNoiseValue = noise(nowX * toppingTubeNoiseScaleX, nowY * toppingTubeNoiseScaleY, 6666) * 720;
    nowX -= sin(radians(nowNoiseValue)) * stepDist;
    nowY += cos(radians(nowNoiseValue)) * stepDist;

    let nowColor = tubeColor.slightRandomize();

    stroke(nowColor.h, nowColor.s, nowColor.b, nowColor.a);

    push();
    translate(nowX, nowY);
    rotate(radians(nowNoiseValue + 90));

    line(0, -0.5 * _tubeHeight, 0, 0.5 * _tubeHeight);
    pop();
  }


  // draw forward
  nowX = _x;
  nowY = _y;

  for (let i = 0; i < drawCount; i++) {
    let nowNoiseValue = noise(nowX * toppingTubeNoiseScaleX, nowY * toppingTubeNoiseScaleY, 6666) * 720;
    nowX += sin(radians(nowNoiseValue)) * stepDist;
    nowY -= cos(radians(nowNoiseValue)) * stepDist;

    push();
    translate(nowX, nowY);
    rotate(radians(nowNoiseValue + 90));

    line(0, -0.5 * _tubeHeight, 0, 0.5 * _tubeHeight);
    pop();
  }


}

async function drawToppingLeaf(_x, _y) {
  let toppingColor = NYColor.generateRandomColor(processHue(_mainHue + 180));
  _drawer.fromColor = toppingColor.copy();
  _drawer.toColor = toppingColor.slightRandomize();
  _drawer.lineDensity = 0.8;

  let size = random(0.3, 2);

  let leafW = 1 * size;
  let leafH = 2 * size;

  let xFrom = - leafW * 0.5;
  let xTo = leafW * 0.5;

  let yFrom = - leafH * 0.5;
  let yTo = leafH * 0.5;

  let xCount = abs(xTo - xFrom) * 0.9;
  let yCount = int(random(2, 6));

  let strokeLength = abs(yTo - yFrom) / yCount;
  let randomRot = random(0, 360);

  push();
  translate(_x, _y);
  rotate(radians(randomRot));

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      let xt = x / (xCount - 1);
      let yt = y / (yCount - 1);

      let nowX = lerp(xFrom, xTo, xt);
      let nowY = lerp(yFrom, yTo, yt);

      let nowColor = NYLerpColor(_drawer.fromColor, _drawer.toColor, yt);
      stroke(nowColor.h, nowColor.s, nowColor.b, nowColor.a);
      strokeWeight(1);

      let strokeRandomRot = noise(nowX * 0.1, nowY * 0.1, 32767) * 60 - 30;
      push();
      translate(nowX, nowY);
      rotate(radians(strokeRandomRot));
      line(0, -0.5 * strokeLength, 0, 0.5 * strokeLength)
      pop();
    }
  }

  pop();
}

let flowNoiseScale = 0.001;

async function rectBG() {
  let bgRot = random(0, 360);

  let xCount = random(6, 12);
  let yCount = random(6, 24);

  let xWidth = width / xCount;
  let yWidth = height / yCount;

  push();
  translate(width / 2, height / 2);
  rotate(radians(bgRot));

  for (let y = 0; y < yCount; y++) {
    for (let x = 0; x < xCount; x++) {

      let nowX = random(-0.7, 0.7) * width;
      let nowY = (y - 0.5 * yCount) * yWidth + random(-0.2, 0.2) * yWidth;

      let nowW = xWidth * random(1, 3);
      let nowH = yWidth * random(0.1, 1.2);

      let nowColor = NYColor.generateRandomColor(processHue(_mainHue - 60));
      if (random() < 0.12)
        nowColor.h = processHue(nowColor.h + 180);
      nowColor.s = random(0, 0);
      nowColor.b = random(3, 24);
      nowColor.a = 0.8;
      // noStroke();

      stroke(nowColor.h, nowColor.s, nowColor.b, nowColor.a);
      drawSlicedRect(nowX, nowY, nowW, nowH);
    }
  }

  // also draw some random stroke line
  let rectStrokeCount = int(random(3, 12));

  for(let i=0; i<rectStrokeCount; i++) {
    let x = random()
  }

  pop();
}

function drawSlicedRect(_x, _y, _w, _h) {
  let density = random(0.01, 0.4);
  let xSlices = int(random(10, 60));
  let xStep = _w / xSlices;
  let sliceWidth = (_w * density) / xSlices;

  for (let i = 0; i < xSlices; i++) {
    let nowX = _x + i * xStep;
    let nowY = _y;

    bgStokeRect(nowX, nowY, sliceWidth, _h);
  }
}

function bgStokeRect(_x, _y, _w, _h) {
  let density = 0.8;
  let xCount = _w * density;
  let yCount = int(random(1, 12));

  let xStep = 1.0 / density;
  let strokeLength = _h / yCount;

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {

      let nowX = _x + x * xStep;
      let nowY = _y + y * strokeLength;

      strokeWeight(random(1, 2));
      line(nowX, nowY, nowX, nowY + strokeLength);
    }
  }

}

function drawFlowStroke(_x, _y, _length, _height) {
  let nowX = _x;
  let nowY = _y;

  let drawCount = _length * 0.6;
  let stepDist = 4;

  for (let i = 0; i < drawCount; i++) {

    let nowNoiseValue = noise(nowX * flowNoiseScale, nowY * flowNoiseScale, 6666) * 720;
    let nowSizeNoise = noise(nowX * flowNoiseScale, nowY * flowNoiseScale, 9999);

    nowX -= sin(radians(nowNoiseValue)) * stepDist;
    nowY += cos(radians(nowNoiseValue)) * stepDist;

    let nowSize = _height * lerp(0.8, 1.2, nowSizeNoise);
    strokeWeight(2);
    push();
    translate(nowX, nowY);
    rotate(radians(nowNoiseValue + 90));

    line(0, -0.5 * nowSize, 0, 0.5 * nowSize);
    pop();
  }


}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}