'use strict';

/**
 * @fileoverview Classes for lattice box primitives
 */

import * as THREE from 'three';

// Cell box
class BoxMesh extends THREE.LineSegments {

    /**
     * Constructor for BoxMesh primitive
     * 
     * @param  {Array}  lattice Lattice parameters for the unit cell
     * @param  {Number} lw      Line width
     * @param  {Number} color   Color of the lines
     * 
     */
    constructor(lattice, lw = 1.0, color = 0xffffff) {

        if (lattice instanceof Array) {
            var lc = lattice;
            lattice = new THREE.Matrix3();
            lattice.set(lc[0][0], lc[1][0], lc[2][0],
                lc[0][1], lc[1][1], lc[2][1],
                lc[0][2], lc[1][2], lc[2][2]);
        }

        // Add a representation of a cartesian lattice given as a matrix
        var boxGeom = new THREE.BoxGeometry(1, 1, 1);

        // Change the vertices' coordinates from fractional to absolute
        for (var i = 0; i < 8; ++i) {
            var v = boxGeom.vertices[i];
            v.addScalar(0.5); // Move the origin to 0,0,0
            v.applyMatrix3(lattice);
        }

        boxGeom = new THREE.EdgesGeometry(boxGeom); // Convert to wireframe
        var boxMat = new THREE.LineBasicMaterial({
            color: color,
            linewidth: lw
        });

        super(boxGeom, boxMat);
    }

}

// Arrows for axes
class AxesMesh extends THREE.Group {

    constructor(lattice, lw = 1.2, colors = [0xff0000, 0x00ff00, 0x0000ff]) {

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

        for (var i = 0; i < 3; ++i) {
            var dir = new THREE.Vector3(elems[3 * i],
                elems[3 * i + 1],
                elems[3 * i + 2]);
            var l = dir.length() / 3.0;
            dir.normalize();
            var arr = new THREE.ArrowHelper(dir, origin, l, colors[i]);
            arr.line.material.linewidth = lw;
            this.add(arr);
        }
    }

    get x_color() {
        return this.children[0].line.material.color.getHex();
    } 

    set x_color(c) {
        this.children[0].line.material.color = new THREE.Color(c);
        this.children[0].cone.material.color = new THREE.Color(c);
    }

    get y_color() {
        return this.children[1].line.material.color.getHex();
    } 

    set y_color(c) {
        this.children[1].line.material.color = new THREE.Color(c);
        this.children[1].cone.material.color = new THREE.Color(c);
    }

    get z_color() {
        return this.children[2].line.material.color.getHex();
    } 

    set z_color(c) {
        this.children[2].line.material.color = new THREE.Color(c);
        this.children[2].cone.material.color = new THREE.Color(c);
    }

    get thickness() {
        return this.children[0].line.material.linewidth;
    }

    set thickness(lw) {
        for (var i = 0; i < 3; ++i) {
            this.children[i].line.material.linewidth = lw;
        }        
    }

}

export {
    BoxMesh, AxesMesh
};