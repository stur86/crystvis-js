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
import {
    addStaticVar
} from '../utils.js';

class EllipsoidMesh extends THREE.Mesh {

    constructor(parameters = {}) {

        const defaults = {
            center: [0, 0, 0],
            eigenvalues: [1, 1, 1],
            eigenvectors: [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ],
            color: 0xff0000,
            opacity: 0.5,
            opacityMode: EllipsoidMesh.DITHER,
            showEllipsoid: true,
            showCircles: true,
            showAxes: true,
            scalingFactor: 1.0
        };

        parameters = _.merge(defaults, parameters);

        var geometry = unitSphere;
        var material;

        var c = new THREE.Color(parameters.color);

        switch (parameters.opacityMode) {
            case EllipsoidMesh.DITHER:
                material = new DitherMaterial({
                    color: c,
                    opacity: parameters.opacity,
                    shiftSeed: parameters.ditherSeed
                });
                break;
            case EllipsoidMesh.PHONG:
                material = new THREE.MeshPhongMaterial({
                    transparent: true,
                    color: c,
                    opacity: parameters.opacity
                });
                break;
            default:
                throw new Error('Invalid opacityMode argument passed to EllipsoidMesh');
        }

        super(geometry, material);

        if (parameters.showCircles) {

            let matline = new THREE.LineBasicMaterial({
                color: new THREE.Color(c),
            });
            let geoline = new THREE.CircleGeometry(1.0, 32);
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
                color: new THREE.Color(0xff0000),
            });

            let geoline = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1, 0, 0),
                new THREE.Vector3(1, 0, 0)
            ]);
            
            // change the color of the x axis
            matline = new THREE.LineBasicMaterial({
                color: new THREE.Color(0xff0000),
            });
            let xseg = new THREE.LineSegments(geoline, matline);
            this.add(xseg);

            // change the color of the y axis
            matline = new THREE.LineBasicMaterial({
                color: new THREE.Color(0x00ff00),
            });
            let yseg = new THREE.LineSegments(geoline, matline);
            yseg.rotateZ(Math.PI / 2.0);
            this.add(yseg);

            // change the color of the z axis
            matline = new THREE.LineBasicMaterial({
                color: new THREE.Color(0x0000ff),
            });
            // matline.color = new THREE.Color(0x0000ff);
            let zseg = new THREE.LineSegments(geoline, matline);
            zseg.rotateY(Math.PI / 2.0);
            this.add(zseg);
        }

        let c0 = parameters.center;

        if (!(c0 instanceof THREE.Vector3)) {
            c0 = new THREE.Vector3(c0[0], c0[1], c0[2]);
        }
        this.position.copy(c0);            

        this._scalefactor = parameters.scalingFactor;

        this.eigenvalues = parameters.eigenvalues;
        this.eigenvectors = parameters.eigenvectors;

        // set material to be invisible if showEllipsoid is false
        if (!parameters.showEllipsoid) {
            material.visible = false;
        }
        this.renderOrder = 0.5;
    }

    get eigenvalues() {
        return Array.from(this._eigenvalues);
    }

    set eigenvalues(v) {
        this._eigenvalues = v;
        this.scalingFactor = this._scalefactor;
    }

    get eigenvectors() {
        return JSON.parse(JSON.stringify(this._eigenvectors));
    }

    set eigenvectors(v) {
        this._eigenvectors = v;

        var basis = _.map(_.range(3), (i) => {
            return new THREE.Vector3(v[0][i],
                v[1][i],
                v[2][i]).normalize();
        });
        var rotm = new THREE.Matrix4();
        rotm.makeBasis(basis[0], basis[1], basis[2]);
        this.setRotationFromMatrix(rotm);
    }

    get color() {
        // Handle both standard materials and DitherMaterial
        if (this.material.uniforms && this.material.uniforms.color) {
            return this.material.uniforms.color.value.getHex();
        } else if (this.material.color) {
            return this.material.color.getHex();
        }
        return 0xffffff; // Default fallback
    }

    set color(c) {
        // Change all colors
        
        // Handle DitherMaterial or standard material
        if (this.material.uniforms && this.material.uniforms.color) {
            this.material.uniforms.color.value.set(c);
            this.material.uniformsNeedUpdate = true;
        } else if (this.material.color) {
            this.material.color.set(c);
        }
        
        // Update child elements
        for (let i = 0; i < this.children.length; ++i) {
            const childMaterial = this.children[i].material;
            if (childMaterial && childMaterial.color) {
                childMaterial.color.set(c);
            }
        }
    }

    get opacity() {
        return this.material.opacity;
    }

    set opacity(o) {
        this.material.opacity = o;
    }

    get scalingFactor() {
        return this._scalefactor;
    }

    set scalingFactor(s) {
        this._scalefactor = s;
        this.scale.fromArray(mjs.multiply(this._eigenvalues, s));
    }
}

addStaticVar(EllipsoidMesh, 'DITHER', 0);
addStaticVar(EllipsoidMesh, 'PHONG', 1);

export {
    EllipsoidMesh
}