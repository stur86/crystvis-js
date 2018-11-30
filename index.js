'use strict';

window._ = require('lodash');
window.$ = require('jquery');
window.THREE = require('three');
window.chroma = require('chroma-js');

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

    // ellipsoids = [];
    // ellipsoids.push(r._addEllipsoid(O, new THREE.Vector3(1, -1, 0),
    //     new THREE.Vector3(2, 2, 0), new THREE.Vector3(0, 0, 3),
    //     0xde3300, 0.6));
    // ellipsoids.push(r._addEllipsoid(H1, new THREE.Vector3(1, 0, 0),
    //     new THREE.Vector3(0, 0.8, 0), new THREE.Vector3(0, 0, 1.2),
    //     0x0033de, 0.6));

    // Vector field test
    var points = [];
    var vectors = [];

    for (var x = 0; x <= 3; x += 0.5) {
        for (var y = 0; y <= 3; y += 0.5) {
            for (var z = 0; z <= 2; z += 0.5) {
                points.push(new THREE.Vector3(x, y, z));
                vectors.push(new THREE.Vector3(Math.cos(3*x)*0.2, Math.sin(3*y)*0.2, 0));
            }           
        }
    }

    var bez = chroma.bezier(['red', 'blue']);
    r._addVectorField(points, vectors, function(p, v, i) {
        return bez(p.length()/6.0).hex();
    });

    // Testing the isosurface
    
    var N = 20;
    var sfield = [];
    for (var x = 0; x < N; x++) {
        sfield.push([]);
        for (var y = 0; y < N; y++) {
            sfield[x].push([]);
            for (var z = 0; z < N; z++) {
                var f = Math.abs(x-N/2.0)*Math.abs(y-N/2.0)*Math.abs(z-N/2.0);
                sfield[x][y].push(f);
            }
        }
    }

    r._addIsosurface(sfield, 20, latt, 0x00ff00, 0.7);

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