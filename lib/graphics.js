'use strict';

/** 
 * @fileoverview Basic objects rendered by Renderer, derived from THREE.js
 * classes
 * @package
 */

import _ from 'lodash';
import * as THREE from 'three';

// Basic geometric models
const _res = 16;
const _sphere = new THREE.SphereBufferGeometry(1.0, _res, _res);
const _cylinder = new THREE.CylinderBufferGeometry(1, 1, 1, _res);
_cylinder.rotateX(Math.PI / 2.0);

// Basic materials
const _phong = new THREE.MeshPhongMaterial({});

function ImageSprite(p, map, size = 1, color = 0xffffff) {

    if (p instanceof Array) {
        p = new THREE.Vector3(p[0], p[1], p[2]);
    }

    var smap = new THREE.TextureLoader().load(map);
    var smat = new THREE.SpriteMaterial({
        map: smap,
        color: color
    });

    THREE.Sprite.call(this, smat);
    this.position.copy(p);
    this.scale.copy(new THREE.Vector3(size, size, size));
    this.renderOrder = 2;

}
ImageSprite.prototype = Object.create(THREE.Sprite.prototype);

/**
 * [RenderTextSprite description]
 * @param {[type]} message    [description]
 * @param {Number} size       [description]
 * @param {Array}  shift      [description]
 * @param {[type]} 0]         [description]
 * @param {Object} parameters [description]
 * @param {Number} cwidth     [description]
 * @param {Number} cheight    [description]
 * @param {Number} maxloops   [description]
 */
function LabelSprite(message,
    size = 1, shift = [0, 0],
    parameters = {}, cwidth = 256, cheight = 256,
    maxloops = 10) {
    // Create a THREE.js sprite with text rendered on top
    var position = parameters.position || new THREE.Vector3(0, 0, 0);
    var fontFace = parameters.fontFace || "Arial";
    var fontSize = parameters.fontSize || 12;
    var fontWeight = parameters.fontWeight || "Bold";
    var textColor = parameters.textColor || 0xffffff;
    var textAlign = parameters.textAlign || 'left';
    var textBaseline = parameters.textBaseline || 'middle';
    var renderOrder = parameters.renderOrder || 2;

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

    var origin = [0, canvas.height / 2.0];
    switch (textAlign) {
        case 'center':
            origin[0] = canvas.width / 2.0;
            break;
        case 'right':
            origin[0] = canvas.width;
            break;
    }
    // Apply shift
    origin[0] += shift[0] * fontSize;
    origin[1] += shift[1] * fontSize;

    context.fillStyle = new THREE.Color(textColor).getStyle();
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

    switch (textAlign) {
        case 'left':
            this.center.set(0, 0.5);
            break;
        case 'right':
            this.center.set(1, 0.5);
            break;
        default:
            break;
    }

    if (position instanceof Array) {
        position = new THREE.Vector3(position[0], position[1], position[2]);
    }

    this.position.copy(position);
    this.renderOrder = renderOrder;

    return this;
}
LabelSprite.prototype = Object.create(THREE.Sprite.prototype);

// Export all
export {
    ImageSprite,
    LabelSprite
};