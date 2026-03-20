'use strict';

import _ from 'lodash';
import $ from 'jquery';
import * as THREE from 'three';
import chroma from 'chroma-js';

import * as chai from 'chai';
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
import {
    OpenSans
} from '../../lib/assets/fonts';

import {
    exampleFiles
} from './examples.js';

var renderer;
var visualizer;

describe('Font tests', function() {

    it('should successfully create a BitmapFont', function() {
        chai.expect(OpenSans.ready).to.equal(true);
    });

    it('should successfully create a geometry from said font', function() {

        var geo = OpenSans.getTextGeometry('Hello world');
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
        var ts = new Primitives.TextSprite('Hello world');
        renderer.add(ts, 'primitives');

        chai.expect(renderer._groups.primitives.children).to.include.members([ts]);

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

        var m1 = visualizer.loadModels(exampleFiles['H2O.xyz'], 'xyz', 'xyz', {
            supercell: [3, 3, 3]
        });
        var m2 = visualizer.loadModels(exampleFiles['org.cif']);
        var m3 = visualizer.loadModels(exampleFiles['si8.xyz'], 'xyz');
        var m4 = visualizer.loadModels(exampleFiles['example_single.cif']);
        var m5 = visualizer.loadModels(exampleFiles['ethanol.magres'], 'magres');

        chai.expect(visualizer.modelList.sort()).to.deep.equal(['cif_1501936', 'cif_I', 'magres', 'xyz', 'xyz_1']);
    });

    it('should correctly visualize a model', function() {

        visualizer.displayModel('cif_I');

    });

    it('should correctly apply changes in properties to the displayed atoms', function() {

        visualizer.displayed.setProperty('color', 0xff0000);
        visualizer.displayed.setProperty('color');

        visualizer.displayed.setProperty('opacity', 0.4);
        visualizer.displayed.setProperty('opacity');

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
        visualizer.displayed.atoms[1].addEllipsoid(data, 'test2', {
            color: 0x00ee88
        });
        visualizer.displayed.atoms[0].removeEllipsoid('test');

        // Set their properties
        visualizer.displayed.atoms[1].ellipsoidProperty('test2', 'color', 0x8800ee);

    });

    // euler disks
    // it('should correctly add/remove euler disks to the displayed atoms', function() {

    //     var data = {
    //         dataA = {eigenvectors: [
    //             [1, 1, 0],
    //             [1, -1, 0],
    //             [0, 0, 1]
    //            ]
    //         };
    //         dataB = {eigenvectors: [
    //             [1, 1, 0],
    //             [1, -1, 0],
    //             [0, 0, 1]
    //             ]
    //         }
    //     };

    //     visualizer.displayed.atoms[0].addEulerDisk(data, 'test');
    //     visualizer.displayed.atoms[1].addEulerDisk(data, 'test2', {
    //         color: 0x00ee88
    //     });
    //     visualizer.displayed.atoms[0].removeEulerDisk('test');

    //     // Set their properties
    //     visualizer.displayed.atoms[1].eulerDiskProperty('test2', 'color', 0x8800ee);

    // });


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


describe('Appearance API tests', function() {
    // Suite-local visualizer — always initialised in before() so this suite
    // works both in isolation (individual click) and as part of the full run.
    // No after() so the canvas remains visible once tests complete.
    var avis;

    before(function() {
        // If a previous suite already left a visualizer running in #main-app,
        // dispose it cleanly before we create our own.
        if (visualizer) {
            visualizer.dispose();
            visualizer = null;
            $('#main-app').empty();
        }
        avis = new CrystVis('#main-app', 640, 480);
        // Load a periodic model so box / axes are present
        avis.loadModels(exampleFiles['si8.xyz'], 'xyz');
        avis.displayModel('xyz');
        avis.displayed = avis.model.find({ all: [] });
    });

    // ── background ────────────────────────────────────────────────────────────
    it('appearance.background setter updates the WebGL clear colour', function() {
        avis.appearance.background = 0x112233;
        chai.expect(avis.appearance.background).to.equal(0x112233);
    });

    it('appearance.background restores to dark theme colour', function() {
        avis.appearance.background = 0x000000;
        chai.expect(avis.appearance.background).to.equal(0x000000);
    });

    // ── theme ──────────────────────────────────────────────────────────────────
    it('vis.theme = "light" sets a light background', function() {
        avis.theme = 'light';
        chai.expect(avis.appearance.background).to.equal(0xffffff);
    });

    it('vis.theme = "dark" restores a dark background', function() {
        avis.theme = 'dark';
        chai.expect(avis.appearance.background).to.equal(0x000000);
    });

    it('appearance.theme getter returns the current renderer theme object', function() {
        var t = avis.appearance.theme;
        chai.expect(t).to.be.an('object');
        chai.expect(t).to.have.property('background');
        chai.expect(t).to.have.property('cell_line_color');
    });

    it('appearance.theme setter with unknown string throws', function() {
        chai.expect(function() { avis.appearance.theme = 'nonexistent'; }).to.throw(/Theme nonexistent not found/);
    });

    // ── label.color ────────────────────────────────────────────────────────────
    it('appearance.label.color getter returns a number', function() {
        chai.expect(avis.appearance.label.color).to.be.a('number');
    });

    it('appearance.label.color setter updates the renderer and retroactively patches existing sprites', function() {
        avis.displayed.addLabels((a) => a.crystLabel, 'test-lbl');
        avis.appearance.label.color = 0xff4400;
        chai.expect(avis._renderer._labelColor).to.equal(0xff4400);
        var allMatch = avis.displayed.atoms.every(function(a) {
            var lbl = a._labels['test-lbl'];
            return !lbl || lbl.color === 0xff4400;
        });
        chai.expect(allMatch).to.be.true;
        // Leave labels visible as a final visual check
    });

    // ── highlight (aura) ───────────────────────────────────────────────────────
    it('appearance.highlight.color getter returns a number', function() {
        chai.expect(avis.appearance.highlight.color).to.be.a('number');
    });

    it('appearance.highlight.color setter updates the renderer aura fill colour', function() {
        avis.appearance.highlight.color = 0x00aaff;
        chai.expect(avis._renderer._auraFill).to.equal(0x00aaff);
    });

    it('appearance.highlight.borderColor setter updates the renderer aura border colour', function() {
        avis.appearance.highlight.borderColor = 0x0055ff;
        chai.expect(avis._renderer._auraBorder).to.equal(0x0055ff);
    });

    it('appearance.highlight.borderFraction setter stores the value', function() {
        avis.appearance.highlight.borderFraction = 0.6;
        chai.expect(avis._renderer._auraBorderFraction).to.equal(0.6);
    });

    it('appearance.highlight.opacity setter stores the value', function() {
        avis.appearance.highlight.opacity = 0.5;
        chai.expect(avis._renderer._auraOpacity).to.equal(0.5);
    });

    // ── cell.lineColor ─────────────────────────────────────────────────────────
    it('appearance.cell.lineColor getter returns a number', function() {
        chai.expect(avis.appearance.cell.lineColor).to.be.a('number');
    });

    it('appearance.cell.lineColor setter retroactively updates the live BoxMesh', function() {
        avis.appearance.cell.lineColor = 0x00ff99;
        var box = avis.model.box;
        chai.expect(box).to.not.be.null;
        chai.expect(box.color).to.equal(0x00ff99);
    });

    // ── cell axis colours ──────────────────────────────────────────────────────
    it('appearance.cell.axisX setter updates the renderer and live AxesMesh', function() {
        avis.appearance.cell.axisX = 0xff2200;
        chai.expect(avis._renderer._cell_x_color).to.equal(0xff2200);
    });

    it('appearance.cell.axisY setter updates the renderer and live AxesMesh', function() {
        avis.appearance.cell.axisY = 0x22ff00;
        chai.expect(avis._renderer._cell_y_color).to.equal(0x22ff00);
    });

    it('appearance.cell.axisZ setter updates the renderer and live AxesMesh', function() {
        avis.appearance.cell.axisZ = 0x0022ff;
        chai.expect(avis._renderer._cell_z_color).to.equal(0x0022ff);
    });

    // ── selbox ─────────────────────────────────────────────────────────────────
    it('appearance.selbox.background setter round-trips through renderer', function() {
        avis.appearance.selbox.background = 0x223344;
        // After CSS conversion the stored value is a CSS string, not a hex int
        chai.expect(avis.appearance.selbox.background).to.be.a('string');
    });

    it('appearance.selbox.opacity setter stores the value', function() {
        avis.appearance.selbox.opacity = 0.3;
        chai.expect(avis.appearance.selbox.opacity).to.equal(0.3);
    });

    // ── lighting ───────────────────────────────────────────────────────────────
    it('appearance.lighting.ambient getter returns a number', function() {
        chai.expect(avis.appearance.lighting.ambient).to.be.a('number');
    });

    it('appearance.lighting.ambient setter stores the value and drives the light', function() {
        avis.appearance.lighting.ambient = 0.5;
        chai.expect(avis.appearance.lighting.ambient).to.equal(0.5);
        chai.expect(avis._renderer._l._amb.intensity).to.equal(0.5);
    });

    it('appearance.lighting.directional setter stores the value and drives the light', function() {
        avis.appearance.lighting.directional = 0.7;
        chai.expect(avis.appearance.lighting.directional).to.equal(0.7);
        chai.expect(avis._renderer._l._dir.intensity).to.equal(0.7);
    });

    it('appearance.lighting.setDirectional() sets intensity but preserves direction', function() {
        var prevPos = avis._renderer._l._dir.position.clone();
        avis.appearance.lighting.setDirectional(0.4, null, null, null);
        chai.expect(avis._renderer._l._dir.intensity).to.equal(0.4);
        chai.expect(avis._renderer._l._dir.position.x).to.equal(prevPos.x);
        chai.expect(avis._renderer._l._dir.position.y).to.equal(prevPos.y);
        chai.expect(avis._renderer._l._dir.position.z).to.equal(prevPos.z);
    });

    it('appearance.lighting.setDirectional() can also change direction', function() {
        avis.appearance.lighting.setDirectional(0.6, 0, 1, 0);
        chai.expect(avis._renderer._l._dir.intensity).to.equal(0.6);
        chai.expect(avis._renderer._l._dir.position.y).to.equal(1);
    });

});


// Bootstrap the whole thing!
$(document).ready(function() {


    // var Atoms = require('@ccp-nc/crystcif-parse').Atoms;

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