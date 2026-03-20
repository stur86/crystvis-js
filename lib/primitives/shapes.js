'use strict';

/** 
 * @fileoverview Basic primitives for geometric shapes
 * @module 
 */

import _ from 'lodash';
import * as THREE from 'three';
import {
    AtomImage
} from '../model.js';

class LineMesh extends THREE.Line {

    /**
     * Create a line to draw on the model
     * 
     * @param  {Array | AtomImage}  p1         Line starting point
     * @param  {Array | AtomImage}  p2         Line end point
     * @param  {Object} parameters             Options:
     *                                             - color
     *                                             - dashed
     *                                             - linewidth
     *                                             
     */
    constructor(p1, p2, parameters = {}) {

        var defaults = {
            color: 0xffffff,
            dashed: false,
            linewidth: 1,
            onOverlay: false
        };

        parameters = _.merge(defaults, parameters);

        // Interpret the points
        if (p1 instanceof AtomImage) {
            p1 = p1.xyz;
        }

        if (p2 instanceof AtomImage) {
            p2 = p2.xyz;
        }

        // We position this in the middle point
        var center = new THREE.Vector3(p1[0]+p2[0], p1[1]+p2[1], p1[2]+p2[2]).divideScalar(2.0);
        var diff = new THREE.Vector3(p1[0]-p2[0], p1[1]-p2[1], p1[2]-p2[2]).divideScalar(2.0);

        var geo = new THREE.BufferGeometry().setFromPoints([diff, diff.clone().negate()]);

        var mat;

        if (parameters.dashed) {
            mat = new THREE.LineDashedMaterial({
                color: new THREE.Color(parameters.color),
                linewidth: parameters.linewidth,
                dashSize: 0.15,
                gapSize: 0.05,
                depthTest: !parameters.onOverlay
            });
        } else {
            mat = new THREE.LineBasicMaterial({
                color: new THREE.Color(parameters.color),
                linewidth: parameters.linewidth,
                depthTest: !parameters.onOverlay
            });
        }

        super(geo, mat);
        this.position.copy(center);

        if (parameters.onOverlay)
            this.renderOrder = 9999;
        this.computeLineDistances();

    }

    get color() {
        return this.material.color.getHex();
    }

    set color(c) {
        this.material.color.set(c);
    }

    get linewidth() {
        return this.material.linewidth;
    }

    set linewidth(lw) {
        this.material.linewidth = lw;
    }

}

export {
    LineMesh
}