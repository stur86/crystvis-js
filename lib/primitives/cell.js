'use strict';

/**
 * @fileoverview Classes for lattice box primitives
 */

import _ from 'lodash';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { cellMatrix3 } from '../utils.js';
import { TextSprite } from './sprites.js';

const LABEL_HEIGHT  = 0.04; // Height of the label

// Cell box
class BoxMesh extends THREE.LineSegments {

    /**
     * Constructor for BoxMesh primitive
     * 
     * @param  {Array}  lattice     Lattice parameters for the unit cell
     * @param  {Object} parameters  Options:
     *                                  color
     *                                  
     */
    constructor(lattice, parameters = {}) {

        const defaults = {
            color: 0xffffff,
        }

        parameters = _.merge(defaults, parameters);

        if (lattice instanceof Array) {
            lattice = cellMatrix3(lattice);
        }

        var boxGeom = new THREE.BoxGeometry(1, 1, 1);
        boxGeom = new THREE.EdgesGeometry(boxGeom); // Convert to wireframe

        var boxMat = new THREE.LineBasicMaterial({
            color: parameters.color,
        });

        super(boxGeom, boxMat);

        // Set the actual lattice basis
        this.matrix.setFromMatrix3(lattice);
        this.matrix.setPosition( (new Vector3(0.5, 0.5, 0.5)).applyMatrix3(lattice) );
        this.matrixAutoUpdate = false;
    }

    get color() {
        return this.material.color.getHex();
    }

    set color(c) {
        this.material.color.set(c);
        this.needsUpdate = true;
    }


}

// Arrows for axes
class AxesMesh extends THREE.Group {

    /**
     * Constructor for AxesMesh primitive
     * 
     * @param  {Array}  lattice     Lattice parameters for the unit cell
     * @param  {Object} parameters  Options:
     *                                  linewidth (NB: on most platforms linewidth will always be 1 regardless of the set value. This is a known issue with three.js)
     *                                  xColor
     *                                  yColor
     *                                  zColor
     *                                  labels: array of strings for the labels. Defaults to null, which means no labels
     * 
     */
    constructor(lattice, parameters = {}) {

        var defaults = {
            linewidth: 1.2, // this often is effectively 1.0. See: https://threejs.org/docs/?q=lineba#api/en/materials/LineBasicMaterial.linewidth
            xColor: 0xff0000,
            yColor: 0x00ff00,
            zColor: 0x0000ff,
            labels: null
        };

        parameters = _.merge(defaults, parameters);

        super();

        if (lattice instanceof Array) {
            var lc = lattice;
            lattice = new THREE.Matrix3();
            lattice.set(lc[0][0], lc[1][0], lc[2][0],
                lc[0][1], lc[1][1], lc[2][1],
                lc[0][2], lc[1][2], lc[2][2]);
        }

        var origin = new THREE.Vector3(0, 0, 0);
        var elems = lattice.elements;

        var colors = [
            parameters.xColor,
            parameters.yColor,
            parameters.zColor
        ];

        for (var i = 0; i < 3; ++i) {
            var dir = new THREE.Vector3(elems[3 * i],
                elems[3 * i + 1],
                elems[3 * i + 2]);
            var l = dir.length() / 3.0;
            dir.normalize();
            var arr = new THREE.ArrowHelper(dir, origin, l, colors[i]);
            arr.line.material.linewidth = parameters.linewidth;
            this.add(arr);

            if (parameters.labels) {
                // assert parameters.labels.length == 3
                var label = parameters.labels[i];
                var labelPos = dir.clone().multiplyScalar(l * 1.1);
                var text = new TextSprite(label, {
                    position: labelPos,
                    color: colors[i],
                    height: LABEL_HEIGHT,
                    faceCamera: true,
                    fixScale: true,
                    shift: [0.0,0,0.0],
                    });
                this.add(text);
            }


        }
    }

    get xColor() {
        return this.children[0].line.material.color.getHex();
    }

    set xColor(c) {
        this.children[0].line.material.color = new THREE.Color(c);
        this.children[0].cone.material.color = new THREE.Color(c);
    }

    get yColor() {
        return this.children[1].line.material.color.getHex();
    }

    set yColor(c) {
        this.children[1].line.material.color = new THREE.Color(c);
        this.children[1].cone.material.color = new THREE.Color(c);
    }

    get zColor() {
        return this.children[2].line.material.color.getHex();
    }

    set zColor(c) {
        this.children[2].line.material.color = new THREE.Color(c);
        this.children[2].cone.material.color = new THREE.Color(c);
    }

    get linewidth() {
        return this.children[0].line.material.linewidth;
    }

    set linewidth(lw) {
        for (var i = 0; i < 3; ++i) {
            this.children[i].line.material.linewidth = lw;
        }
    }

}

export {
    BoxMesh,
    AxesMesh
};