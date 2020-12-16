'use strict';

/**
 * @fileoverview Classes for Atom and Bond primitives
 */

import _ from 'lodash';
import * as THREE from 'three';
import {
    unitSphere,
    unitCylinder,
    unitCircle
} from './geometries.js';
import {
    auraVertShader,
    auraFragShader
} from '../shaders';

// Basic materials
const _phong = new THREE.MeshPhongMaterial({});

class AtomMesh extends THREE.Mesh {

    /**
     * Constructor for the AtomMesh object
     * 
     * @param {Array}  position     Position of the atom
     * @param {Number} radius       Radius of the atom
     * @param {Number} color        Color of the atom (hex number)
     */
    constructor(position, radius = 1, color = 0xffffff) {

        var mat = _phong.clone();
        mat.color = new THREE.Color(color);

        super(unitSphere, mat);

        this.scale.set(radius, radius, radius);
        this.position.set(position[0], position[1], position[2]);
        this.image = null;

    }

    get atom_radius() {
        return this.geometry.parameters.radius * this.scale.x;
    }

    set atom_radius(r) {
        var s = r / this.geometry.parameters.radius;
        this.scale.set(s, s, s);
    }

    get atom_color() {
        return this.material.color.getHex();
    }

    set atom_color(c) {
        this.material.color = new THREE.Color(c);
        this.needsUpdate = true;
    }

    get atom_opacity() {
        return this.material.opacity;
    }

    set atom_opacity(o) {
        this.material.transparent = (o < 1);
        this.material.opacity = o;
        this.needsUpdate = true;
    }

}

class BondMesh extends THREE.Group {

    /**
     * Constructor for the BondMesh object
     * 
     * @param {Array} p0        Position of the first atom
     * @param {Array} p1        Position of the second atom
     * @param {Number} radius   Radius of the bond
     * @param {Number} color0   Color of the first atom (hex number)
     * @param {Number} color1   Color of the second atom (hex number)
     */
    constructor(p0, p1, radius = 1, color0 = 0xff0000, color1 = 0x00ff00) {

        super();

        p0 = new THREE.Vector3(p0[0], p0[1], p0[2]);
        p1 = new THREE.Vector3(p1[0], p1[1], p1[2]);

        var dp = p1.clone();
        dp.sub(p0);
        var l = dp.length();

        // Halfpoint?
        var hv = p0.clone();
        hv.addScaledVector(dp, 0.5);

        var rmat = new THREE.Matrix4();
        rmat.lookAt(p0, p1, new THREE.Vector3(0, 0, 1));

        var mat0 = _phong.clone();
        mat0.color = new THREE.Color(color0);
        var mat1 = _phong.clone();
        mat1.color = new THREE.Color(color1);

        var bond0 = new THREE.Mesh(unitCylinder, mat0);
        bond0.scale.set(radius, radius, l / 2.0);
        bond0.position.copy(p0.clone().addScaledVector(dp, 0.25));
        bond0.setRotationFromMatrix(rmat);
        var bond1 = new THREE.Mesh(unitCylinder, mat1);
        bond1.scale.set(radius, radius, l / 2.0);
        bond1.position.copy(p1.clone().addScaledVector(dp, -0.25));
        bond1.setRotationFromMatrix(rmat);

        this.add(bond0);
        this.add(bond1);
    }

    get bond_radius() {
        return this.children[0].geometry.parameters.radiusTop * this.children[0].scale.x;
    }

    set bond_radius(r) {
        var r0 = this.children[0].geometry.parameters.radiusTop;
        var s = r / r0;
        var z = this.children[0].scale.z;
        this.children[0].scale.set(s, s, z);
        this.children[1].scale.set(s, s, z);
    }

    get bond_color_1() {
        return this.children[0].material.color.getHex();
    }

    set bond_color_1(c) {
        this.children[0].material.color = new THREE.Color(c);
    }

    get bond_color_2() {
        return this.children[1].material.color.getHex();
    }

    set bond_color_2(c) {
        this.children[1].material.color = new THREE.Color(c);
    }

    get bond_opacity_1() {
        return this.children[0].material.opacity;
    }

    set bond_opacity_1(o) {
        this.children[0].material.transparent = (o < 1);
        this.children[0].material.opacity = o;
        this.children[0].material.needsUpdate = true;
    }

    get bond_opacity_2() {
        return this.children[1].material.opacity;
    }

    set bond_opacity_2(o) {
        this.children[1].material.transparent = (o < 1);
        this.children[1].material.opacity = o;
        this.children[1].material.needsUpdate = true;
    }

}

class AuraMesh extends THREE.Mesh {

    constructor(parameters = {}) {

        var defaults = {
            scale: 1,
            radius: 1,
            fill: 0xaaaa00,
            border: 0xffff00,
            opacity: 0.5,
            borderFraction: 0.08
        };

        parameters = _.merge(defaults, parameters);

        var mat = new THREE.RawShaderMaterial({
            uniforms: {
                targScale: new THREE.Uniform(parameters.scale),
                targRadius: new THREE.Uniform(parameters.radius),
                fill: new THREE.Uniform(new THREE.Color(parameters.fill)),
                border: new THREE.Uniform(new THREE.Color(parameters.border)),
                border_f: new THREE.Uniform(parameters.borderFraction),
                opacity: new THREE.Uniform(parameters.opacity)
            },
            side: THREE.DoubleSide,
            transparent: true,
            vertexShader: auraVertShader,
            fragmentShader: auraFragShader
        });

        super(unitCircle, mat);

    }

    get scale() {
        return this.material.uniforms.targScale.value;
    }

    set scale(s) {
        this.material.uniforms.targScale.value = s;
        this.material.uniformsNeedUpdate = true;
    }

    get radius() {
        return this.material.uniforms.targRadius.value;
    }

    set radius(r) {
        this.material.uniforms.targRadius.value = r;
        this.material.uniformsNeedUpdate = true;
    }

    get fill() {
        return this.material.uniforms.fill.value.getHex();
    }

    set fill(c) {
        this.material.uniforms.fill.value = new THREE.Color(c);
        this.material.uniformsNeedUpdate = true;
    }

    get border() {
        return this.material.uniforms.border.value.getHex();
    }

    set border(c) {
        this.material.uniforms.border.value = new THREE.Color(c);
        this.material.uniformsNeedUpdate = true;
    }

    get borderFraction() {
        return this.material.uniforms.border_f.value;
    }

    set borderFraction(f) {
        this.material.uniforms.border_f.value = f;
        this.material.uniformsNeedUpdate = true;
    }

    get opacity() {
        return this.material.uniforms.opacity.value;
    }

    set opacity(o) {
        this.material.uniforms.opacity.value = o;
        this.material.uniformsNeedUpdate = true;
    }
}

export {
    AtomMesh,
    BondMesh,
    AuraMesh
};