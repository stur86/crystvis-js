'use strict';

import _ from 'lodash';
import * as mjs from 'mathjs';
import * as THREE from 'three';
import {
    unitSphere,
} from './geometries.js';
import {
    DitherMaterial
} from '../dither.js';

// Basic materials
const _phong = new THREE.MeshPhongMaterial({});

class EllipsoidMesh extends THREE.Mesh {

    constructor(parameters = {}) {

        var defaults = {
            position: [0, 0, 0],
            eigenvalues: [1, 1, 1],
            eigenvectors: [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ],
            color: 0xff0000,
            opacity: 0.5,
            scalingFactor: 1.0
        };

        parameters = _.merge(defaults, parameters);

        var a1 = parameters.eigenvectors[0];
        var a2 = parameters.eigenvectors[1];
        var a3 = parameters.eigenvectors[2];

        var geometry = unitSphere;

        // var material = _phong.clone();
        // material.color = new THREE.Color(parameters.color);
        // material.transparent = (parameters.opacity < 1);
        // material.opacity = parameters.opacity;
        // 
        var material = new DitherMaterial({
            color: new THREE.Color(parameters.color),
            alpha: parameters.opacity
        });

        super(geometry, material);

        var matline = new THREE.LineBasicMaterial({
            color: new THREE.Color(parameters.color),
        });
        var geoline = new THREE.CircleBufferGeometry(1.0, 32);
        geoline = new THREE.EdgesGeometry(geoline);

        var cseg = new THREE.LineSegments(geoline, matline);
        this.add(cseg);
        cseg = new THREE.LineSegments(geoline, matline);
        cseg.rotateX(Math.PI/2.0);
        this.add(cseg);
        cseg = new THREE.LineSegments(geoline, matline);
        cseg.rotateY(Math.PI/2.0);
        this.add(cseg);


        this._eigenvalues = parameters.eigenvalues;
        this._eigenvectors = parameters.eigenvectors;

        this.position.fromArray(parameters.position);
        this.scalingFactor = 1.0;
        this.renderOrder = 0.5;

        // Rotation matrix
        var rotm = new THREE.Matrix4();
        rotm.set(
            a1[0], a2[0], a3[0], 0,
            a1[1], a2[1], a3[1], 0,
            a1[2], a2[2], a3[2], 0,
            0, 0, 0, 1);
        this.setRotationFromMatrix(rotm);
    }

    get scalingFactor() {
        return this._scalefactor;
    }

    set scalingFactor(s) {
        this._scalefactor = s;
        this.scale.fromArray(mjs.multiply(this._eigenvalues, s));
    }
}

export {
    EllipsoidMesh
}