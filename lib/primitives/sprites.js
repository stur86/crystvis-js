'use strict';

/**
 * @fileoverview Primitive classes for Sprites and Billboards of various types
 */

import _ from 'lodash';
import * as THREE from 'three';
import {
    RubikMedium
} from '../assets/fonts';


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
            color: 0xffffff
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
            color: parameters.color
        });

        super(smat);

        this.position.copy(p);
        var s = parameters.size;
        this.scale.copy(new THREE.Vector3(s, s, s));
        this.renderOrder = 2;
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
        this.material.color = new THREE.Color(c);
        this.needsUpdate = true;
    }
}

class TextSprite extends THREE.Mesh {


    constructor(text, parameters = {}) {

        var defaults = {
            position: [0, 0, 0],
            font: RubikMedium,
            color: 0xffffff,
            opacity: 1.0,
            height: 1.0,
            faceCamera: false,
            fixScale: false,
            shift: [0,0,0],
            geometryOptions: {}
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
            parameters.shift);

        super(geo, mat);
        if (!parameters.faceCamera)
            this.scale.set(targScale,-targScale,targScale);
        this.position.copy(p);

    }

}

export {
    ImageSprite,
    TextSprite
}