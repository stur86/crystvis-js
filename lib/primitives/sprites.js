'use strict';

/**
 * @fileoverview Primitive classes for Sprites and Billboards of various types
 */

import * as THREE from 'three';


class ImageSprite extends THREE.Sprite {
    constructor(position, map, size = 1, color = 0xffffff) {

        if (position instanceof Array) {
            position = new THREE.Vector3(position[0],
                position[1],
                position[2]);
        }

        if (!(map instanceof THREE.Texture)) {
            map = new THREE.TextureLoader().load(map);
        }
        var smat = new THREE.SpriteMaterial({
            map: map,
            color: color
        });

        super(smat);
        this.position.copy(position);
        this.scale.copy(new THREE.Vector3(size, size, size));
        this.renderOrder = 2;
    }
}

export {
    ImageSprite
}