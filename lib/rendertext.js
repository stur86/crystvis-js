'use strict';

// NPM imports
import * as THREE from 'three';

function make_colorstr(col) {
    // Takes a colour object, returns an rgba string.
    if (!(col instanceof THREE.Color)) {
        col = new THREE.Color(col);
    }

    var r = col.r*255;
    var g = col.g*255;
    var b = col.b*255;
    var a = col.a;

    if (a == null) {
        a = 1;
    }

    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

function RenderTextSprite(message, size=1, shift=[0, 0], parameters={}, cwidth=256, cheight=256, maxloops=10) {
    // Create a THREE.js sprite with text rendered on top
    var fontFace = parameters.fontFace || "Arial";
    var fontSize = parameters.fontSize || 12;
    var fontWeight = parameters.fontWeight || "Bold";
    var textColor = parameters.textColor || 0xffffff;
    var textAlign = parameters.textAlign || 'left';
    var textBaseline = parameters.textBaseline || 'middle';

    var canvas = document.createElement('canvas');
    canvas.width = cwidth / 2;
    canvas.height = cheight;
    var context;
    var metrics;
    var room

    var i = 0;
    do {
        canvas.width = canvas.width * 2;
        context = canvas.getContext('2d');
        context.font = fontWeight + " " + fontSize + "px " + fontFace;
        context.textAlign = textAlign;
        context.textBaseline = textBaseline;
        metrics = context.measureText(message);
        room = canvas.width * (textAlign == 'center' ? 1 : 0.5);
        i += 1;
    } while (metrics.width >= room && i < maxloops);

    var origin = [0, canvas.height/2.0];
    switch(textAlign) {
        case 'center':
            origin[0] = canvas.width/2.0;
            break;
        case 'right':
            origin[0] = canvas.width;
            break;
    }
    // Apply shift
    origin[0] += shift[0]*fontSize;
    origin[1] += shift[1]*fontSize;

    context.fillStyle = make_colorstr(textColor);
    context.fillText(message, origin[0], origin[1]);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthWrite: false, // This is necessary to have proper rendering on top of transparent surfaces.
    });

    THREE.Sprite.call(this, spriteMaterial);
    this.scale.set(size * canvas.width / fontSize, size * canvas.height / fontSize);

    this._targsize = size;
    this._basescale = new THREE.Vector2(canvas.width / fontSize,
        canvas.height / fontSize);

    switch(textAlign) {
        case 'left':
            this.center.set(0, 0.5);
            break;
        case 'right':
            this.center.set(1, 0.5);
            break;
        default:
            break;
    }

    return this;
}
RenderTextSprite.prototype = Object.create(THREE.Sprite.prototype);

exports.RenderTextSprite = RenderTextSprite;