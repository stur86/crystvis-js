'use strict';

window._ = require('lodash');
window.$ = require('jquery');
window.THREE = require('three');

var Renderer = require('./lib/render.js').Renderer;

// Bootstrap the whole thing!
var r;
var box
var arrows;
var ellipsoids;
$(document).ready(function() {
    r = new Renderer('.main-app-content', 640, 480);

    var O = new THREE.Vector3(0, 0, 1);
    var H1 = new THREE.Vector3(0.9, 0, -0.2);
    var H2 = new THREE.Vector3(-0.9, 0, -0.2);

    r._addAtom(O, 0.5, 0xff0000);
    r._addAtom(H1, 0.35, 0xeeeeee);
    r._addAtom(H2, 0.35, 0xeeeeee);

    r._addBond(O, H1, 0.2, 0xff0000, 0xeeeeee);
    r._addBond(O, H2, 0.2, 0xff0000, 0xeeeeee);

    var latt = new THREE.Matrix3();
    latt.set(10, 0, 0, 1, 5, 0, 0, 0, 2).transpose();

    var ba = r._addLattice(latt);
    box = ba[0];
    arrows = ba[1];

    r._addBillBoard(O.clone().add(new THREE.Vector3(0.6, 0.6, 0)), 'Hello');

    ellipsoids = [];
    ellipsoids.push(r._addEllipsoid(O, new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(2, 2, 0), new THREE.Vector3(0, 0, 3),
        0xde3300, 0.6));
    ellipsoids.push(r._addEllipsoid(H1, new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0.8, 0), new THREE.Vector3(0, 0, 1.2),
        0x0033de, 0.6));
});

window.hide_arrows = function() {
    arrows.visible = !arrows.visible;
}

window.rescale_ellipsoids = function(e) {
    var s = parseFloat(e.target.value);

    _.forEach(ellipsoids, function(el) {
        el._rescale(s);
    });
}