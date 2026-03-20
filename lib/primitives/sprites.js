'use strict';

/**
 * @fileoverview Primitive classes for Sprites and Billboards of various types
 */

import _ from 'lodash';
import * as THREE from 'three';
import {
    OpenSans
} from '../assets/fonts/index.js';


class ImageSprite extends THREE.Sprite {
    /**
     * Create an ImageSprite object
     * 
     * @param  {Array}          position    Position of the sprite
     * @param  {Object}         parameters  Options:
     *                                          position
     *                                          size
     *                                          color
     * 
     */
    constructor(map, parameters = {}) {

        var defaults = {
            position: [0, 0, 0],
            size: 1.0,
            color: 0xffffff,
            onOverlay: false
        };

        parameters = _.merge(defaults, parameters);

        var p = parameters.position;

        if (p instanceof Array) {
            p = new THREE.Vector3(p[0], p[1], p[2]);
        }


        if (!(map instanceof THREE.Texture)) {
            map = new THREE.TextureLoader().load(map);
        }
        var smat = new THREE.SpriteMaterial({
            map: map,
            color: parameters.color,
            depthTest: !parameters.onOverlay
        });

        super(smat);

        this.position.copy(p);
        var s = parameters.size;
        this.scale.copy(new THREE.Vector3(s, s, s));
        this.renderOrder = 2;

        if (parameters.onOverlay)
            this.renderOrder = 9999;
    }

    get size() {
        return this.scale.x;
    }

    set size(s) {
        this.scale.set(s, s, s);
    }

    get color() {
        return this.material.color.getHex();
    }

    set color(c) {
        this.material.color.set(c);
        this.needsUpdate = true;
    }
}

class TextSprite extends THREE.Mesh {


    constructor(text, parameters = {}) {

        var defaults = {
            position: [0, 0, 0],
            font: OpenSans,
            color: 0xffffff,
            opacity: 1.0,
            height: 1.0,
            faceCamera: false,
            fixScale: false,
            shift: [0,0,0],
            geometryOptions: {},
            onOverlay: false
        };

        parameters = _.merge(defaults, parameters);

        var p = parameters.position;

        if (p instanceof Array) {
            p = new THREE.Vector3(p[0], p[1], p[2]);
        }

        // Create the geometry
        var geo = parameters.font.getTextGeometry(text);

        // Calculate the scale
        var targScale = parameters.height / geo.layout.height;

        // Create the material
        var mat = parameters.font.getTextMaterial(parameters.color,
            parameters.opacity,
            parameters.faceCamera,
            parameters.fixScale,
            targScale, 
            parameters.shift, 
            !parameters.onOverlay);

        super(geo, mat);
        // Store the raw geometry height so the height getter/setter can convert
        // between world-space height and the targScale shader uniform.
        this._geomH = geo.layout.height;
        if (!parameters.faceCamera)
            this.scale.set(targScale,-targScale,targScale);
        this.position.copy(p);

        if (parameters.onOverlay)
            this.renderOrder = 9999;
    }

    get color() {
        return this.material.uniforms.color.value.getHex();
    }

    set color(c) {
        // Handle color conversion more explicitly to avoid colorspace issues
        if (typeof c === 'number') {
            // Convert hex color properly to ensure correct representation
            const hexString = '#' + ('000000' + c.toString(16)).slice(-6);
            this.material.uniforms.color.value.set(hexString);
        } else {
            this.material.uniforms.color.value.set(c);
        }
        this.material.uniformsNeedUpdate = true;
    }

    get opacity() {
        return this.material.uniforms.opacity.value;
    }

    set opacity(o) {
        this.material.uniforms.opacity.value = o;
        this.material.uniformsNeedUpdate = true;
    }

    get targScale() {
        return this.material.uniforms.targScale.value;
    }

    set targScale(s) {
        this.material.uniforms.targScale.value = s;
        this.material.uniformsNeedUpdate = true;
    }

    get height() {
        return this.material.uniforms.targScale.value * this._geomH;
    }

    set height(h) {
        const s = h / this._geomH;
        this.material.uniforms.targScale.value = s;
        this.material.uniformsNeedUpdate = true;
        if (!this.material.uniforms.fixScale.value) {
            this.scale.set(s, -s, s);
        }
    }

    get shift() {
        return this.material.uniforms.shift.value.toArray();
    }

    set shift(s) {
        this.material.uniforms.shift.value = s;
        this.material.uniformsNeedUpdate = true;
    }

}

export {
    ImageSprite,
    TextSprite
}