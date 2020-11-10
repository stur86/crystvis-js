'use strict';

/** 
 * @fileoverview Basic objects rendered by Renderer, derived from THREE.js
 * classes
 * @package
 */

const _ = require('lodash');
const THREE = require('three');

// Basic geometric models
const _res = 32;
const _sphere = new THREE.SphereBufferGeometry(1.0, _res, _res);
const _cylinder = new THREE.CylinderBufferGeometry(1, 1, 1, _res);
_cylinder.rotateX(Math.PI / 2.0);

// Basic materials
const _phong = new THREE.MeshPhongMaterial({});

// Atoms
function AtomMesh(radius = 1, color = 0xffffff) {
    var mat = _phong.clone();
    mat.color = new THREE.Color(color);

    THREE.Mesh.call(this, _sphere, mat);

    this.scale.set(radius, radius, radius);
}
AtomMesh.prototype = Object.create(THREE.Mesh.prototype);
Object.defineProperty(AtomMesh.prototype, 'atom_radius', {
    get: function() {
        return this.geometry.parameters.radius*this.scale.x;
    },
    set: function(r) {
        var s = r / this.geometry.parameters.radius;
        this.scale.set(s, s, s);
    }
});
Object.defineProperty(AtomMesh.prototype, 'atom_color', {
    get: function() {
        return this.material.color.getHex();
    },
    set: function(c) {
        this.material.color = new THREE.Color(c);
        this.needsUpdate = true;
    }
});
Object.defineProperty(AtomMesh.prototype, 'atom_opacity', {
    get: function() {
        return this.material.opacity;
    },
    set: function(o) {
        this.material.transparent = (o < 1);
        this.material.opacity = o;
        this.needsUpdate = true;
    }
});

// Bonds
function BondMesh(p0, p1, radius = 1, color0 = 0xff0000, color1 = 0x00ff00) {
    p0 = p0.clone();
    p1 = p1.clone();

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

    THREE.Group.call(this);
    var bond0 = new THREE.Mesh(_cylinder, mat0);
    bond0.scale.set(radius, radius, l / 2.0);
    bond0.position.copy(p0.clone().addScaledVector(dp, 0.25));
    bond0.setRotationFromMatrix(rmat);
    var bond1 = new THREE.Mesh(_cylinder, mat1);
    bond1.scale.set(radius, radius, l / 2.0);
    bond1.position.copy(p1.clone().addScaledVector(dp, -0.25));
    bond1.setRotationFromMatrix(rmat);

    this.add(bond0);
    this.add(bond1);
}
BondMesh.prototype = Object.create(THREE.Group.prototype);
Object.defineProperty(BondMesh.prototype, 'bond_radius', {
    get: function() {
        return this.children[0].geometry.parameters.radiusTop;
    }
});
Object.defineProperty(BondMesh.prototype, 'bond_radius_scale', {
    get: function() {
        return this.children[0].scale.x;
    },
    set: function(s) {
        this.children[0].scale.set(s, s, 1);
        this.children[1].scale.set(s, s, 1);
    }
});
Object.defineProperty(BondMesh.prototype, 'bond_color_1', {
    get: function() {
        return this.children[0].material.color.getHex();
    },
    set: function(c) {
        this.children[0].material.color = new THREE.Color(c);
    }
});
Object.defineProperty(BondMesh.prototype, 'bond_color_2', {
    get: function() {
        return this.children[1].material.color.getHex();
    },
    set: function(c) {
        this.children[1].material.color = new THREE.Color(c);
    }
});

// Cell box
function BoxMesh(lattice, lw=1.0, color=0xffffff) {

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
    THREE.LineSegments.call(this, boxGeom, boxMat);
}
BoxMesh.prototype = Object.create(THREE.LineSegments.prototype);

// Axes
function AxesMesh(lattice, lw = 1.2, colors = [0xff0000, 0x00ff00, 0x0000ff]) {

    THREE.Group.call(this);
    var origin = new THREE.Vector3(0, 0, 0);
    var elems = lattice.elements;


    for (var i = 0; i < 3; ++i) {
        var dir = new THREE.Vector3(elems[3 * i],
            elems[3 * i + 1],
            elems[3 * i + 2]);
        var l = dir.length() / 3.0;
        dir.normalize();
        var arr = new THREE.ArrowHelper(dir, origin, l, colors[i]);
        arr.line.material.linewidth = lw * 1.2; // Must be slightly thicker
        this.add(arr);
    }
}
AxesMesh.prototype = Object.create(THREE.Group.prototype);


// Export all
exports.AtomMesh = AtomMesh;
exports.BondMesh = BondMesh;
exports.BoxMesh  = BoxMesh;
exports.AxesMesh = AxesMesh;