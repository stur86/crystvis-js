'use strict';

// NPM imports
var THREE = require('three');

function make_colorstr(col) {
    // Takes a colour object, returns an rgba string.
    var r = col.r || 1;
    var g = col.g || 1;
    var b = col.b || 1;
    var a = col.a || 1;

    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

exports.renderTextSprite = function(message, size, parameters, cwidth, cheight, maxloops) {
    // Create a THREE.js sprite with text rendered on top
    if (parameters === undefined) parameters = {};
    var fontface = parameters.fontface || "Arial";
    var fontsize = parameters.fontsize || 18;
    var fontweight = parameters.fontweight || "Bold";
    var textColor = parameters.textColor || { r: 255, g: 255, b: 255, a: 1.0 };
    var textAlign = parameters.textAlign || 'center';
    var textBaseline = parameters.textBaseline || 'middle';

    size = size || 1;
    cwidth = cwidth || 256;
    cheight = cheight || 256;
    maxloops = maxloops || 10; // Just to make sure it doesn't run infinitely

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
        context.font = fontweight + " " + fontsize + "px " + fontface;
        context.textAlign = textAlign;
        context.textBaseline = textBaseline;
        metrics = context.measureText(message);
        room = canvas.width * (textAlign == 'center' ? 1 : 0.5);
        i += 1;
    } while (metrics.width >= room && i < maxloops);

    context.fillStyle = make_colorstr(textColor);

    context.fillText(message, canvas.width / 2.0, canvas.height / 2.0);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthWrite: false // This is necessary to have proper rendering on top of transparent surfaces.
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size * canvas.width / fontsize, size * canvas.height / fontsize);

    sprite._targsize = size;
    sprite._basescale = new THREE.Vector2(canvas.width / fontsize,
        canvas.height / fontsize);

    return sprite;
}