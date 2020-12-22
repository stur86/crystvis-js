'use strict';

import _ from 'lodash';
import * as mjs from 'mathjs';
import * as THREE from 'three';
import {
    unitSphere,
} from './geometries.js';
import {
    DitherMaterial
} from './dither.js';

// Basic materials
const _phong = new THREE.MeshPhongMaterial({});

class EllipsoidMesh extends THREE.Mesh {

    constructor(parameters = {}) {

        var defaults = {
            eigenvalues: [1, 1, 1],
            eigenvectors: [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ],
            color: 0xff0000,
            opacity: 0.5,
            opacityMode: EllipsoidMesh.DITHER,
            showCircles: true,
            showAxes: true,
            scalingFactor: 1.0
        };

        parameters = _.merge(defaults, parameters);

        var geometry = unitSphere;
        var material;

        switch (parameters.opacityMode) {
            case EllipsoidMesh.DITHER:
                material = new DitherMaterial({
                    color: new THREE.Color(parameters.color),
                    opacity: parameters.opacity
                });
                break;
            case EllipsoidMesh.PHONG:
                material = new THREE.MeshPhongMaterial({
                    transparent: true,
                    color: new THREE.Color(parameters.color),
                    opacity: parameters.opacity
                });
                break;
            default:
                throw new Error('Invalid opacityMode argument passed to EllipsoidMesh');
        }

        super(geometry, material);

        if (parameters.showCircles) {

            let matline = new THREE.LineBasicMaterial({
                color: new THREE.Color(parameters.color),
            });
            let geoline = new THREE.CircleBufferGeometry(1.0, 32);
            geoline = new THREE.EdgesGeometry(geoline);

            let cseg = new THREE.LineSegments(geoline, matline);
            this.add(cseg);
            cseg = new THREE.LineSegments(geoline, matline);
            cseg.rotateX(Math.PI / 2.0);
            this.add(cseg);
            cseg = new THREE.LineSegments(geoline, matline);
            cseg.rotateY(Math.PI / 2.0);
            this.add(cseg);

        }

        if (parameters.showAxes) {

            let matline = new THREE.LineBasicMaterial({
                color: new THREE.Color(parameters.color),
            });

            let geoline = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1, 0, 0),
                new THREE.Vector3(1, 0, 0)
            ]);

            let cseg = new THREE.LineSegments(geoline, matline);
            this.add(cseg);
            cseg = new THREE.LineSegments(geoline, matline);
            cseg.rotateZ(Math.PI / 2.0);
            this.add(cseg);
            cseg = new THREE.LineSegments(geoline, matline);
            cseg.rotateY(Math.PI / 2.0);
            this.add(cseg);
        }


        this._eigenvalues = parameters.eigenvalues;
        this._eigenvectors = parameters.eigenvectors;

        this.scalingFactor = parameters.scalingFactor;
        this.renderOrder = 0.5;


        // Rotation matrix
        var evecs = parameters.eigenvectors;
        var basis = _.map(_.range(3), (i) => {
            return new THREE.Vector3(evecs[0][i],
                evecs[1][i],
                evecs[2][i]).normalize();
        });
        var rotm = new THREE.Matrix4();
        rotm.makeBasis(basis[0], basis[1], basis[2]);
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

// Static variables (we do it this way since the static keyword isn't still
// supported even by the linter...)
Object.defineProperty(EllipsoidMesh, 'DITHER', {
    value: 0
});
Object.defineProperty(EllipsoidMesh, 'PHONG', {
    value: 1
});

export {
    EllipsoidMesh
}