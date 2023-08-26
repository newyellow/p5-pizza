
const COLOR_RANDOM_BY_SHAPE = 0;
const COLOR_RANDOM_BY_LAYER = 1;
const COLOR_RANDOM_BY_STOKEDOT = 2;

class NYDrawer {
    constructor() {
        this.lineDensity = 0.08;
        this.strokeDensity = 0.24;

        this.strokeLength = 8;
        this.strokeWidth = [1, 3];

        this.strokeRotNoiseX = 0.01;
        this.strokeRotNoiseY = 0.02;
        this.strokeRotMultiplyValue = 720;
        this.strokeRot = 200;

        this.mainHue = random(0, 360);
        this.colorRandomMode = COLOR_RANDOM_BY_SHAPE;
        this.nowColor = NYColor.generateRandomColor(this.mainHue);
        this.fromColor = this.nowColor.copy();
        this.toColor = this.nowColor.copy();
        this.nowApplyColor = this.nowColor.copy();

        colorMode(HSB);
    }

    NYArc(x, y, w, h, start, stop) {

        // calculate the length of the ellipse arc
        let arcLength = radians((stop - start)) * (w + h) / 2;
        let drawCount = arcLength * this.strokeDensity;

        for (let i = 0; i < drawCount; i++) {
            let t = i / (drawCount - 1);

            let nowAngle = lerp(start, stop, t);

            let nowX = x + sin(radians(nowAngle)) * w / 2;
            let nowY = y - cos(radians(nowAngle)) * h / 2;

            this.strokeRot = getAngle(x, y, nowX, nowY);
            this.NYStrokeDot(nowX, nowY);
        }
    }

    NYPie(x, y, w, h, start, stop) {
        let drawLayers = ((w + h) / 2) * this.lineDensity;

        for (let i = 0; i < drawLayers; i++) {
            let t = i / (drawLayers - 1);
            let nowW = lerp(0, w, t);
            let nowH = lerp(0, h, t);

            this.nowApplyColor = NYLerpColor(this.fromColor, this.toColor, t);
            this.NYArc(x, y, nowW, nowH, start, stop);
        }
    }

    NYCircle(x, y, r) {
        let drawLayers = r * this.lineDensity;

        for (let i = 0; i < drawLayers; i++) {
            let t = i / (drawLayers - 1);
            let nowR = lerp(0, r, t);

            this.nowApplyColor = NYLerpColor(this.fromColor, this.toColor, t);
            this.NYCircleLine(x, y, nowR);
        }
    }

    NYCircleLine(x, y, r) {
        let drawLength = 2 * PI * r;
        let drawCount = drawLength * this.strokeDensity;

        for (let i = 0; i < drawCount; i++) {

            let t = i / (drawCount - 1);
            let nowX = x + sin(radians(t * 360)) * r / 2;
            let nowY = y - cos(radians(t * 360)) * r / 2;

            this.strokeRot = getAngle(x, y, nowX, nowY);
            this.NYStrokeDot(nowX, nowY);
        }
    }

    NYRect(_x, _y, _w, _h) {

        let xCount = _w * this.lineDensity;
        let yCount = _h / this.strokeLength;

        for (let x = 0; x < xCount; x++) {
            for (let y = 0; y < yCount; y++) {
                let xt = x / (xCount - 1);
                let yt = y / (yCount - 1);

                let nowX = _x + lerp(0, _w, xt);
                let nowY = _y + lerp(0, _h, yt);

                let nowColor = NYLerpColor(this.fromColor, this.toColor, yt);
                stroke(nowColor.h, nowColor.s, nowColor.b, nowColor.a);
                strokeWeight(random(this.strokeWidth[0], this.strokeWidth[1]));

                push();
                translate(nowX, nowY);

                line(0, -0.5 * this.strokeLength, 0, 0.5 * this.strokeLength)
                pop();
            }
        }
    }

    NYLine(x1, y1, x2, y2) {

        let drawLength = dist(x1, y1, x2, y2);
        let drawCount = drawLength * this.strokeDensity;

        for (let i = 0; i < drawCount; i++) {
            let t = i / (drawCount - 1);

            let nowX = lerp(x1, x2, t);
            let nowY = lerp(y1, y2, t);

            this.NYStrokeDot(nowX, nowY);
        }
    }

    NYStrokeDot(x, y) {

        stroke(this.nowApplyColor.h, this.nowApplyColor.s, this.nowApplyColor.b, this.nowApplyColor.a);
        strokeWeight(random(this.strokeWidth[0], this.strokeWidth[1]));

        // let rot = noise(x * this.strokeRotNoiseX, y * this.strokeRotNoiseY) * this.strokeRotMultiplyValue;

        push();
        translate(x, y);
        rotate(radians(this.strokeRot));

        line(0, -0.5 * this.strokeLength, 0, 0.5 * this.strokeLength);
        pop();
    }
}

class NYColor {
    constructor(_h, _s, _b, _a = 1.0) {
        this.h = _h;
        this.s = _s;
        this.b = _b;
        this.a = _a;
    }

    copy() {
        return new NYColor(this.h, this.s, this.b, this.a);
    }

    slightRandomize(_hDiff = 10, _sDiff = 12, _bDiff = 12) {
        let newH = processHue(this.h + random(-_hDiff, _hDiff));
        let newS = this.s + random(-_sDiff, _sDiff);
        let newB = this.b + random(-_bDiff, _bDiff);

        return new NYColor(newH, newS, newB, this.a);
    }

    static generateRandomColor(_mainHue) {
        let h = processHue(_mainHue + random(-30, 30));
        let s = random(40, 60);
        let b = random(80, 100);

        return new NYColor(h, s, b);
    }
}
