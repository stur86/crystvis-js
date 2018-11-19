'use strict';

// NPM imports
var $ = require('jquery');
var _ = require('lodash');
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

function Renderer(target, width, height) {

    // Grab the target element
    this._div = $(target);

    this._w = width;
    this._h = height;
    this._updateSize();

    // Renderer
    this._r = new THREE.WebGLRenderer();
    this._r.setPixelRatio(window.devicePixelRatio);
    this._r.setSize(this._w, this._h);
    this._div.append(this._r.domElement);

    // Scene
    this._s = new THREE.Scene();

    // var geometry = new THREE.BoxGeometry(1, 1, 1);
    // var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // var cube = new THREE.Mesh(geometry, material);
    // cube.name = 'Cube';
    // this._s.add(cube);

    // Camera
    this._c = new THREE.PerspectiveCamera(60, this._w / this._h, 0.1, 100);
    this._c.position.set(0, 0, 2);
    this._c.lookAt(new THREE.Vector3(0, 0, 0));

    // Controls
    this._oc = new OrbitControls(this._c, this._r.domElement);
    this._oc.addEventListener('change', this._render.bind(this));

    // Raycast for clicks
    this._rcastlist = [];
    this._r.domElement.addEventListener('mousedown', this._raycastClick.bind(this));

    // Set up the animation
    this._animate();
}

Renderer.prototype = {
    _render: function() {
        this._r.clear();
        this._r.render(this._s, this._c);
    },
    _animate: function() {
        requestAnimationFrame(this._animate.bind(this));
        this._render();
    },
    _updateSize: function() {
        this._w = this._w || this._div.innerWidth();
        this._h = this._h || this._div.innerHeight();
    },
    _raycastClick: function(e) {
        // We create a 2D vector
        var vector = new THREE.Vector2();
        // We set its position where the user clicked and we convert it to a number between -1 & 1
        vector.set(
            2 * (e.clientX / this._w) - 1,
            1 - 2 * (e.clientY / this._h)
        );

        // We create a raycaster, which is some kind of laser going through your scene
        var raycaster = new THREE.Raycaster();
        // We apply two parameters to the 'laser', its origin (where the user clicked) and the direction (what the camera 'sees')
        raycaster.setFromCamera(vector, this._c);

        // We get all the objects the 'laser' find on its way (it returns an array containing the objects)
        for (var i = 0; i < this._rcastlist.length; ++i) {

            var targ = this._rcastlist[i][1] || this._s;

            var intersects = raycaster.intersectObjects(targ.children);
            this._rcastlist[i][0](intersects);
        }
    },
    addClickListener: function(listener, group) {
        var cl = [listener, group];
        this._rcastlist.push(cl);
        return cl; 
    },
    removeClickListener: function(cl) {
        _.pull(this._rcastlist, cl);
    }
}

exports.Renderer = Renderer;