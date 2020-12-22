'use strict';

import _ from 'lodash';
import $ from 'jquery';
import * as THREE from 'three';
import chroma from 'chroma-js';

import chai from 'chai';
import {
    Renderer
} from '../../lib/render.js';
import {
    Model
} from '../../lib/model.js';
import {
    CrystVis
} from '../../lib/visualizer.js';
import * as Primitives from '../../lib/primitives';
import circle_sprite from '../../lib/assets/circle.png';
import {
    RubikMedium
} from '../../lib/assets/fonts';

import {
    exampleFiles
} from './examples.js';

var renderer;
var visualizer;

describe('Font tests', function() {

    it('should successfully create a BitmapFont', function() {
        chai.expect(RubikMedium.ready).to.equal(true);
    });

    it('should successfully create a geometry from said font', function() {

        var geo = RubikMedium.getTextGeometry('Hello world');
    });
});

describe('Renderer tests', function() {
    it('should successfully load a Renderer', function() {
        renderer = new Renderer('#main-app', 640, 480);
    });
    it('should successfully create an atom', function() {
        var a = new Primitives.AtomMesh([0, 0, 0], 0.5, 0xff0000);
        renderer.add(a, 'model');
        chai.expect(renderer._groups.model.children).to.include(a);
        renderer.remove(a, 'model');
    });
    it('should successfully create a unit cell', function() {
        var latt = new THREE.Matrix3();
        latt.set(10, 0, 0, 1, 8, 0, 0, 0, 9).transpose();

        var box = new Primitives.BoxMesh(latt);
        var ax = new Primitives.AxesMesh(latt);

        renderer.add(box, 'model');
        renderer.add(ax, 'model');

        chai.expect(renderer._groups.model.children).to.include.members([box, ax]);

        renderer.remove(box, 'model');
        renderer.remove(ax, 'model');
    });
    it('should successfully create a bond', function() {
        var b = new Primitives.BondMesh([0, 0, 0], [1, 0, 0]);

        renderer.add(b, 'model');

        chai.expect(renderer._groups.model.children).to.include(b);

        renderer.remove(b, 'model');
    });
    it('should successfully render sprites', function() {
        var s = new Primitives.ImageSprite(circle_sprite, {
            position: [0, 0, 0]
        });
        renderer.add(s, 'primitives');
        var ts = new Primitives.TextSprite('Hello world');
        renderer.add(ts, 'primitives');

        chai.expect(renderer._groups.primitives.children).to.include.members([s, ts]);

        renderer.remove(s);
        renderer.remove(ts);
    });
    it('should successfully clear a scene', function() {

        var a = new Primitives.AtomMesh([0, 0, 0], 0.5, 0xff0000);
        renderer.add(a);

        renderer.clear();

    });

    after(function() {
        // Destroy the renderer
        renderer = null;
        $('#main-app').empty();
    });
});

describe('Visualizer tests', function() {
    it('should successfully load a CrystVis visualizer', function() {
        visualizer = new CrystVis('#main-app', 640, 480);
    });

    it('should load new models in the visualizer', function() {

        var m1 = visualizer.loadModels(exampleFiles['H2O.xyz'], 'xyz', 'xyz', [3, 3, 3]);
        var m2 = visualizer.loadModels(exampleFiles['org.cif']);
        var m3 = visualizer.loadModels(exampleFiles['si8.xyz'], 'xyz');
        var m4 = visualizer.loadModels(exampleFiles['example_single.cif']);
        var m5 = visualizer.loadModels(exampleFiles['ethanol.magres'], 'magres');

        chai.expect(visualizer.model_list.sort()).to.deep.equal(['1501936', 'I', 'magres', 'xyz', 'xyz_1']);
    });

    it('should correctly visualize a model', function() {

        visualizer.displayModel('I');

    });

    it('should correctly apply changes in properties to the displayed atoms', function() {

        visualizer.displayed.setColor(0xff0000);
        visualizer.displayed.setColor();

        visualizer.displayed.setOpacity(0.4);
        visualizer.displayed.setOpacity();

        visualizer.displayed.addLabels();
        visualizer.displayed.addLabels(function(a, i) {
            return a.radius;
        }, 'radius', {
            shift: [0.1, -0.03, 0],
            color: 0xff0000
        });

    });

    it('should correctly add/remove ellipsoids to the displayed atoms', function() {

        var data = {
            eigenvalues: [1, 2, 4],
            eigenvectors: [
                [1, 1, 0],
                [1, -1, 0],
                [0, 0, 1]
            ]
        };

        visualizer.displayed.atoms[0].addEllipsoid(data, 'test');
        visualizer.displayed.atoms[1].addEllipsoid(data, 'test2', {color: 0x00ee88});
        visualizer.displayed.atoms[0].removeEllipsoid('test');

        // Set their properties
        visualizer.displayed.atoms[1].ellipsoidProperty('test2', 'color', 0x8800ee);

    });

    it('should correctly draw simple primitives', function() {

        var a1 = visualizer.displayed.atoms[0];
        var a2 = visualizer.displayed.atoms[1];
        var a3 = visualizer.displayed.atoms[2];
        var line1 = new Primitives.LineMesh(a1, a2);
        var line2 = new Primitives.LineMesh(a2, a3, {
            color: 0xff9900,
            dashed: true,
        });

        visualizer.addPrimitive(line1);
        visualizer.addPrimitive(line2);
        visualizer.removePrimitive(line1);

    });

});


// Bootstrap the whole thing!
$(document).ready(function() {


    // var Atoms = require('crystcif-parse').Atoms;

    // var a = new Atoms(['C'], [[0, 0, 1]], [[2, 0, 0], [0, 2, 0], [0, 1, 2]]);

    // var m = new Model(a);

    // console.log(m);
    // r = new Renderer('.main-app-content', 640, 480);

    // var O = new THREE.Vector3(0, 0, 1);
    // var H1 = new THREE.Vector3(0.9, 0, -0.2);
    // var H2 = new THREE.Vector3(-0.9, 0, -0.2);


    // r._addAtom(O, 0.5, 0xff0000);
    // r._addAtom(H1, 0.35, 0xeeeeee);
    // r._addAtom(H2, 0.35, 0xeeeeee);

    // r._addBond(O, H1, 0.2, 0xff0000, 0xeeeeee);
    // r._addBond(O, H2, 0.2, 0xff0000, 0xeeeeee);

    // var latt = new THREE.Matrix3();
    // latt.set(10, 0, 0, 1, 8, 0, 0, 0, 9).transpose();

    // var ba = r._addLattice(latt);
    // box = ba[0];
    // arrows = ba[1];

    // r._addBillBoard(O.clone().add(new THREE.Vector3(0.6, 0.6, 0)), 'Hello world');

    // ellipsoids = [];
    // ellipsoids.push(r._addEllipsoid(O, new THREE.Vector3(1, -1, 0),
    //     new THREE.Vector3(2, 2, 0), new THREE.Vector3(0, 0, 3),
    //     0xde3300, 0.3, Renderer.DITHERNET));
    // ellipsoids.push(r._addEllipsoid(H1, new THREE.Vector3(1, 0, 0),
    //     new THREE.Vector3(0, 0.8, 0), new THREE.Vector3(0, 0, 1.2),
    //     0x0033de, 0.3, Renderer.DITHER));

    // // Vector field test
    // var points = [];
    // var vectors = [];

    // for (var x = 0; x <= 3; x += 0.5) {
    //     for (var y = 0; y <= 3; y += 0.5) {
    //         for (var z = 0; z <= 2; z += 0.5) {
    //             points.push(new THREE.Vector3(x, y, z));
    //             vectors.push(new THREE.Vector3(Math.cos(3*x)*0.2, Math.sin(3*y)*0.2, 0));
    //         }           
    //     }
    // }

    // var bez = chroma.bezier(['red', 'blue']);
    // // r._addVectorField(points, vectors, function(p, v, i) {
    // //     return bez(p.length()/6.0).hex();
    // // });

    // // Testing the isosurface

    // var N = 20;
    // var sfield = [];
    // for (var x = 0; x < N; x++) {
    //     sfield.push([]);
    //     for (var y = 0; y < N; y++) {
    //         sfield[x].push([]);
    //         for (var z = 0; z < N; z++) {
    //             var f = Math.abs(x-N/2.0)*Math.abs(y-N/2.0)*Math.abs(z-N/2.0);
    //             f = Math.cos(x)+Math.cos(y)+Math.cos(z);
    //             sfield[x][y].push(f);
    //         }
    //     }
    // }

    // r._addIsosurface(sfield, 0.5, latt, 0x00ffff, 0.3, Renderer.PHONG, Renderer.ISO_SURFACE_NETS);

    // r._addSprite(H1, 'circle.png', 1, 0xffffff);
    // 

    // var vs = new CrystVis('.main-app-content', {'width': 640, 'height': 480});

});

// window.hide_arrows = function() {
//     arrows.visible = !arrows.visible;
// }

// window.rescale_ellipsoids = function(e) {
//     var s = parseFloat(e.target.value);

//     _.forEach(ellipsoids, function(el) {
//         el._rescale(s);
//     });
// }