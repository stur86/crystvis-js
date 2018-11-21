'use strict';

window.$ = require('jquery');
window.THREE = require('three');

var Renderer = require('./lib/render.js').Renderer;

// Bootstrap the whole thing!
var r;
var box
var arrows;
$(document).ready(function() {
    r = new Renderer('.main-app-content', 640, 480);
    r._addAtom('Atom', [0, 0, 1], 0.5, 0xff0000);
    r._addAtom('Atom', [0.9, 0, -0.2], 0.35, 0xeeeeee);
    r._addAtom('Atom', [-0.9, 0, -0.2], 0.35, 0xeeeeee);

    r._addBond('AB', [0, 0, 1], [0.9, 0, -0.2], 0.2, 0xff0000, 0xeeeeee);
    r._addBond('AB', [0, 0, 1], [-0.9, 0, -0.2], 0.2, 0xff0000, 0xeeeeee);

    var latt = new THREE.Matrix3();
    latt.set(10, 0, 0, 1, 5, 0, 0, 0, 2).transpose();

    var ba = r._addLattice('lattice', latt);
    box = ba[0];
    arrows = ba[1];

    r._addBillBoard([2, 0, 0], 'Hello');
});

window.hide_arrows = function() {
    arrows.visible = !arrows.visible;
}