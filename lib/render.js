'use strict';

/** 
 * @fileoverview Classes and methods for rendering using THREE.js
 * @module
 */

// NPM imports
import $ from 'jquery';
import _ from 'lodash';
import * as THREE from 'three';

// Internal imports
import {
    OrbitControls
} from './orbit.js';
import {
    SelectionBox,
    SelectionHelper
} from './selbox.js';

import * as Primitives from './primitives/index.js';

import {
    TextSprite
} from './primitives/index.js';

// Ratio of secondary directional light intensity to primary
const SECONDARY_LIGHT_INTENSITY_RATIO = 0.4;
const DRAG_THRESHOLD_SQ = 25;

// themes:
const themes = {
    dark: {
        background: 0x000000,
        foreground: 0xffffff,
        highlight: 0x00ff00,
        cell_line_color: 0xffffff,
        label_color: 0xffffff,

    },
    light: {
        background: 0xffffff,
        foreground: 0x000000,
        highlight: 0x00ff00,
        cell_line_color: 0x000000,
        label_color: 0x000000,
    }
}


class Renderer {

    /** 
     * An object representing the THREE.js graphical renderer for atomic models 
     * @class
     * @param {string}  target          CSS selector for the target HTML element in which to put the renderer
     * @param {int}     width           Desired width for the renderer
     * @param {int}     height          Desired height for the renderer. If both this and width are zero, automatically
     *                                  resizes with the container
     * @param {object}  options         Optional parameters for the WebGLRenderer
     */
    constructor(target, width, height, options = {}) {

        // Grab the target element
        this._div = $(target);
        this._autoResize = (width == 0) && (height == 0);

        this._w = width;
        this._h = height;
        this._updateSize();

        // combine options with defaults
        this._options = Object.assign({
            antialias: true,
            alpha: true,
        }, options);
        
        // Renderer
        this._r = new THREE.WebGLRenderer(this._options);
        this._r.autoClear = true;
        this._r.setPixelRatio(window.devicePixelRatio);
        this._r.setSize(this._w, this._h);
        this._div.append(this._r.domElement);

        // Scene
        this._s = new THREE.Scene();

        // Camera
        var ratio = this._w * 1.0 / this._h;
        this._depth = 1000; // For now we use a constant
        this._c = new THREE.OrthographicCamera(-20, 20,
            20 / ratio, -20 / ratio,
            0.1, 2 * this._depth);
        this._s.add(this._c);

        // Lights
        this._l = {}
        // Increase ambient light intensity to mimic older Three.js behavior
        this._l._amb = new THREE.AmbientLight(0xffffff, 0.3);
        this._l._amb.name = 'ambLight';
        // Add more intensity to directional light for better highlights
        this._l._dir = new THREE.DirectionalLight(0xffffff, 0.6);
        this._l._dir.position.set(0, 1, -1);
        this._l._dir.name = 'dirLight';
        // Add a second directional light from opposite direction for better illumination
        this._l._dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
        this._l._dir2.position.set(0, -1, 1);
        this._l._dir2.name = 'dirLight2';
        this._s.add(this._l._amb); // Added to scene
        this._c.add(this._l._dir); // Added to camera (rotates with it)
        this._c.add(this._l._dir2); // Added to camera (rotates with it)

        // Controls
        this._oc = new OrbitControls(this._c, this._r.domElement);
        this.resetOrbitCenter(0, 0, 0);

        // Raycast for clicks
        this._rcastlist = [];
        this._raycaster = new THREE.Raycaster();
        this._ndcVector = new THREE.Vector2();
        this._clickDownX = 0;
        this._clickDownY = 0;
        this._pointerDownValid = false;
        this._boundClickDown = (e) => {
            if (!e.isPrimary) return;
            this._clickDownX = e.clientX;
            this._clickDownY = e.clientY;
            this._pointerDownValid = true;
        };
        this._boundClickUp = (e) => {
            if (!e.isPrimary) return;
            if (!this._pointerDownValid) return;
            this._pointerDownValid = false;
            const dx = e.clientX - this._clickDownX;
            const dy = e.clientY - this._clickDownY;
            if (dx * dx + dy * dy <= DRAG_THRESHOLD_SQ) {
                this._raycastClick(e);
            }
        };
        this._boundClickCancel = (e) => {
            if (!e.isPrimary) return;
            this._pointerDownValid = false;
        };
        this._r.domElement.addEventListener('pointerdown', this._boundClickDown);
        this._r.domElement.addEventListener('pointerup', this._boundClickUp);
        this._r.domElement.addEventListener('pointercancel', this._boundClickCancel);

        // Groups
        this._groups = {
            model: new THREE.Group(),
            primitives: new THREE.Group(),
            notifications: new THREE.Group(),
        };

        this._s.add(this._groups.model);
        this._s.add(this._groups.primitives);
        this._s.add(this._groups.notifications);

        // Selection box (multiple raycast)
        this._sboxlist = [];
        this._sbox = new SelectionBox(this._c, this._s);
        this._sboxhelp = new SelectionHelper(this._sbox, this, 'crystvis-selbox-helper');
        this._sboxhelp.selectOverCallback = this._selectBoxEnd.bind(this);

        // Color scheme
        this.theme = themes.dark;
        // Aura (highlight) appearance — policy read by AtomImage.aura at construction
        this._auraFill           = 0xaaaa00;
        this._auraBorder         = 0xffff00;
        this._auraBorderFraction = 0.8;
        this._auraOpacity        = 0.8;
        // Cell axis colours — wired to AxesMesh via vis.appearance.cell.axis*
        this._cell_x_color = 0xff0000;
        this._cell_y_color = 0x00ff00;
        this._cell_z_color = 0x0000ff;

        this.selbox_bkg_color = 0x1111aa;
        this.selbox_border_color = 0x5555dd;
        this.selbox_opacity = 0.5;

        // Set up the animation
        this._animate();

        // Resizing in case it's required
        if (this._autoResize) {
            this._resizeObs = new ResizeObserver(this._resize.bind(this)
                );
            this._resizeObs.observe(this._div[0]);
        }

    }

    _render() {
        this._r.render(this._s, this._c);
    }

    _animate() {
        this._animFrameId = requestAnimationFrame(this._animate.bind(this));
        this._render();
    }

    _updateSize() {
        this._w = this._w || this._div.innerWidth();
        this._h = this._h || this._div.innerHeight();
    }

    _resize() {
        // Resize event handler
        this._w = 0;
        this._h = 0;
        this._updateSize()
        this._r.setSize(this._w, this._h);

        var ratio = this._w * 1.0 / this._h;
        this._c.top = 20/ratio;
        this._c.bottom = -20/ratio;
        this._c.updateProjectionMatrix();
    }

    _raycastClick(e) {

        // We create a 2D vector
        var vector = this.documentToWorld(e.clientX, e.clientY);

        // Reuse the shared raycaster instance
        // We apply two parameters to the 'laser', its origin (where the user clicked) 
        // and the direction (what the camera 'sees')
        this._raycaster.setFromCamera(vector, this._c);

        // We get all the objects the 'laser' find on its way (it returns an array containing the objects)
        for (var i = 0; i < this._rcastlist.length; ++i) {

            var func = this._rcastlist[i][0];
            var targ = this._rcastlist[i][1];
            var filter = this._rcastlist[i][2];

            targ = targ || this._s;
            var intersects = this._raycaster.intersectObjects(targ.children);

            var objects = [];
            for (var j = 0; j < intersects.length; ++j) {
                var o = intersects[j].object;
                if (!filter || intersects[j].object instanceof filter) {
                    objects.push(o);
                }
            }

            func(objects, e);

        }
    }

    _selectBoxEnd(p1, p2) {
        for (var i = 0; i < this._sboxlist.length; ++i) {
            var func = this._sboxlist[i][0];
            var targ = this._sboxlist[i][1];
            var filter = this._sboxlist[i][2];

            var selected = this._sbox.select(p1, p2, targ);

            selected = _.filter(selected, function(o) {
                return (!filter || o instanceof filter)
            });

            func(selected);
        }
    }

    /**
     * Draw list of notifications
     * @param {Array} messages - List of (strings) messages to display
     * @param {Object} parameters - Parameters for the messages
     * 
    */
    addNotifications(messages, parameters={}) {
        // TODO: adjust position of messages when camera is rotated
        // currently this is only correct when camera is looking down the z-axis
        //top of message should be the bottom left corner of the canvas
        var position = [this._c.left, this._c.bottom, this._c.near];
        // calculate height of messages
        const messages_height = 0.05 * messages.length;
        // todo: this should really be the x projection of the unit cell
        // rather than the length of the 0th unit cell vector
        // but it works for now...
        const xshift = this.getOrbitCenter().x * 2;
        const yshift = 0.05 * messages_height + this.getOrbitCenter().y + 0.5;
        const defaults = {
            position: position,
            height: messages_height,
            color: this.theme.label_color,
            faceCamera: true,
            fixScale: true,
            shift: [xshift,yshift,0.0],
            onOverlay: true,
        };

        parameters = _.merge(defaults, parameters);

        // add text sprite to scene
        // Create a TextSprite to hold the message
        var messageSprite = new TextSprite(messages.join('\n'), parameters);

        this._groups.notifications.add(messageSprite);
    }

    /**
     * Remove all notifications from the scene
    */
    clearNotifications() {
        this._groups.notifications.remove(...this._groups.notifications.children);
    }


    add(object, group = 'primitives') {
        if (!(this._groups[group].children.includes(object)))
            this._groups[group].add(object);
    }

    remove(object, group = 'primitives') {
        this._groups[group].remove(object);
    }

    /**
     * Add a listener for click events on a given group
     * 
     * @param {Function}    listener        Listener function. Will receive a list of objects, sorted by distance.
     * @param {THREE.Group} group           Group on which to detect clicks
     * @param {Function}    filtertype      If present, only pass objects of this class
     * 
     * @returns {Array}                     Reference to the created listener
     */
    addClickListener(listener, group, filtertype = null) {
        var cl = [listener, group, filtertype];
        this._rcastlist.push(cl);
        return cl;
    }

    /**
     * Remove a listener
     * @param {Array} cl                Reference to the listener to remove (as returned by addClickListener) 
     */
    removeClickListener(cl) {
        _.pull(this._rcastlist, cl);
    }

    /**
     * Add a listener for selection box events
     * 
     * @param {Function} listener           Listener function
     * @param {THREE.Group} group           Group on which to detect clicks
     * @param {Function}    filtertype      If present, only pass objects of this class
     *
     * @returns {Array}                     Reference to the created listener
     */
    addSelBoxListener(listener, group, filtertype = null) {
        var sbl = [listener, group, filtertype];
        this._sboxlist.push(sbl);
        return sbl;
    }

    /**
     * Remove a selection box listener
     * @param  {Array} sbl              Reference to the listener to remove (as returned by addSelBoxListener) 
     */
    removeSelBoxListener(sbl) {
        _.pull(this._sboxlist, sbl);
    }

    /**
     * Tear down the renderer, cancelling the animation loop, removing all canvas
     * event listeners (orbit controls, raycaster, selection box), disconnecting any
     * ResizeObserver, and releasing the WebGL context.  After this call the instance
     * must not be used again.
     */
    dispose() {
        // 1. Stop the animation loop
        if (this._animFrameId != null) {
            cancelAnimationFrame(this._animFrameId);
            this._animFrameId = null;
        }

        // 2. Remove the raycaster's own pointer listeners
        this._r.domElement.removeEventListener('pointerdown', this._boundClickDown);
        this._r.domElement.removeEventListener('pointerup', this._boundClickUp);
        this._r.domElement.removeEventListener('pointercancel', this._boundClickCancel);
        this._rcastlist = [];
        this._sboxlist = [];

        // 3. Dispose OrbitControls (removes its own listeners from the canvas)
        if (this._oc) {
            this._oc.dispose();
            this._oc = null;
        }

        // 4. Dispose the selection box helper (removes its listeners and overlay)
        if (this._sboxhelp) {
            this._sboxhelp.dispose();
            this._sboxhelp = null;
        }

        // 5. Stop watching for container resize
        if (this._resizeObs) {
            this._resizeObs.disconnect();
            this._resizeObs = null;
        }

        // 6. Release the WebGL context and GPU resources
        this._r.dispose();
        this._r.domElement.remove();
        this._r = null;
    }

    /**
     * Set properties of ambient light
     * 
     * @param {float} intensity     Intensity
     */
    setAmbientLight(intensity) {
        this._l._amb.intensity = intensity;
    }

    /**
     * Set properties of directional light
     *
     * @param {float} intensity     Intensity
     * @param {float} px            Direction, x  (camera-local position; useful range ≈ -2000..2000)
     * @param {float} py            Direction, y
     * @param {float} pz            Direction, z
     */
    setDirectionalLight(intensity, px, py, pz) {
        // px/py/pz are raw camera-local position components.  Pass null to
        // preserve the current value on any axis.
        px = px === null ? this._l._dir.position.x : px;
        py = py === null ? this._l._dir.position.y : py;
        pz = pz === null ? this._l._dir.position.z : pz;
        this._l._dir.intensity = intensity;
        this._l._dir.position.set(px, py, pz);

        // Automatically update the second light to maintain opposite direction
        if (this._l._dir2) {
            this._l._dir2.intensity = intensity * SECONDARY_LIGHT_INTENSITY_RATIO;
            this._l._dir2.position.set(-px, -py, -pz);
        }
    }

    /**
     * Reset the camera's view so its central axis is rendered
     * with an offset from the center of the canvas
     * 
     * @param  {float} fx   Horizontal offset in the canvas (in fraction of its width, -0.5 to 0.5)
     * @param  {float} fy   Vertical offset in the canvas (in fraction of its height, -0.5 to 0.5)
     */
    resetCameraCenter(fx=0, fy=0) {
        this._c.setViewOffset(this._w, this._h, -fx*this._w, -fy*this._h, 
                              this._w, this._h);
    }

    /**
     * Reset the camera so it orbits around a given point
     * 
     * @param  {float} x            X coordinate of the point
     * @param  {float} y            Y coordinate of the point
     * @param  {float} z            Z coordinate of the point
     */
    resetOrbitCenter(x=0, y=0, z=0) {
        this._oc.reset();

        var p = new THREE.Vector3(x, y, z);

        // difference between the oc target and the camera position
        var d = new THREE.Vector3();
        d.subVectors(this._c.position, this._oc.target);

        // if d is small, return (no need to move the camera)
        if (d.length() < 0.001) {
            d = new THREE.Vector3(0, 0, 1);

            this._oc.target= d;
            this._oc.update();
        }
        if (p.distanceTo(this._oc.target) > 0.001) {
            this._c.position.set(x, y, this._depth + 0.1);
            // this._oc.lookAlong(d);
            this._oc.target= p;
            this._oc.update();
        }
    }

    getOrbitCenter() {
        return this._oc.target;
    }

    /**
     * Return a plain serialisable snapshot of the current camera state.
     *
     * @return {{ position: {x,y,z}, target: {x,y,z}, zoom: number }}
     */
    getCameraState() {
        const pos = this._c.position;
        const tgt = this._oc.target;
        return {
            position: { x: pos.x, y: pos.y, z: pos.z },
            target:   { x: tgt.x, y: tgt.y, z: tgt.z },
            zoom:     this._c.zoom,
        };
    }

    /**
     * Restore a camera snapshot produced by {@link Renderer#getCameraState}.
     *
     * @param {{ position?: {x,y,z}, target?: {x,y,z}, zoom?: number }} state
     */
    setCameraState(state) {
        if (!state) return;

        if (state.position) {
            this._c.position.set(state.position.x, state.position.y, state.position.z);
        }
        if (state.target) {
            this._oc.target.set(state.target.x, state.target.y, state.target.z);
        }
        if (typeof state.zoom === 'number') {
            this._c.zoom = state.zoom;
            this._c.updateProjectionMatrix();
        }
        this._oc.update();
    }

    /**
     * Subscribe to camera-change events fired by OrbitControls whenever
     * the user rotates, pans, or zooms.  The callback receives a camera
     * state snapshot identical to the one returned by {@link Renderer#getCameraState}.
     *
     * @param  {Function} callback  `callback(cameraState)` called on each change
     * @return {Function}           Unsubscribe function — call it to remove the listener
     */
    onCameraChange(callback) {
        const handler = () => callback(this.getCameraState());
        this._oc.addEventListener('change', handler);
        return () => {
            if (this._oc) this._oc.removeEventListener('change', handler);
        };
    }


    /**
     * Remove all currently rendered objects.
     */
    clear(model = true, primitives = true) {
        if (model)
            this._groups.model.clear();
        if (primitives)
            this._groups.primitives.clear();
        // Reset camera position
        this._oc.reset();
    }

    /**
     * Convert coordinates in the dom element frame to coordinates in the world frame
     */
    documentToWorld(x, y) {
        const rect = this._r.domElement.getBoundingClientRect();
        // We set its position where the user clicked and we convert it to a number between -1 & 1
        this._ndcVector.set(
            2 * ((x - rect.left) / rect.width) - 1,
            1 - 2 * ((y - rect.top) / rect.height)
        );

        return this._ndcVector;
    }

    // Style
    get selbox_bkg_color() {
        return this._selbox_bkg_color;
    }

    set selbox_bkg_color(c) {
        c = new THREE.Color(c).getStyle();
        this._selbox_bkg_color = c;
        this._sboxhelp.element.css({
            'background-color': c
        });
    }

    get selbox_border_color() {
        return this._selbox_border_color;
    }

    set selbox_border_color(c) {
        c = new THREE.Color(c).getStyle();
        this._selbox_border_color = c;
        this._sboxhelp.element.css({
            'border-color': c
        });
    }

    get selbox_opacity() {
        return this._selbox_opacity;
    }

    set selbox_opacity(o) {
        this._selbox_opacity = o;
        this._sboxhelp.element.css({
            'opacity': o
        });
    }

    // themes
    get theme() {
        return this._theme;
    }

    set theme(t) {
        this._theme = t;
        // background color
        this._r.setClearColor(t.background, 1);
        // label colour — read by AtomImage.addLabel() at construction time
        this._labelColor = t.label_color;
        // Label height is not theme-dependent; preserve across theme changes
        if (this._labelHeight === undefined) this._labelHeight = 0.04;
    }

    // ─── Boundary colour/light methods ───────────────────────────────────────────
    // Policy (what colour) is stored in CrystVis._appearance; the Renderer only
    // provides the mechanism (WebGL/CSS commands).

    /**
     * Update the WebGL clear (background) colour.
     * @param {number|string} c  Anything accepted by THREE.Color
     */
    setClearColor(c) {
        const hex = new THREE.Color(c).getHex();
        this._theme = Object.assign({}, this._theme, { background: hex });
        this._r.setClearColor(hex, 1);
    }

    /**
     * Update the default label colour stored on the renderer.
     * Retroactive updates of existing sprites are handled by CrystVis.
     * @param {number|string} c
     */
    setLabelColor(c) {
        const hex = new THREE.Color(c).getHex();
        this._labelColor = hex;
        this._theme = Object.assign({}, this._theme, { label_color: hex });
    }

    /**
     * Store the world-space height used when constructing new atom labels.
     * Retroactive updates to existing sprites are handled by CrystVis.
     * @param {number} h
     */
    setLabelHeight(h) {
        this._labelHeight = h;
    }

    /**
     * Update the unit-cell wireframe colour stored in the theme.
     * Live BoxMesh updates are handled by CrystVis.
     * @param {number|string} c
     */
    setCellLineColor(c) {
        const hex = new THREE.Color(c).getHex();
        this._theme = Object.assign({}, this._theme, { cell_line_color: hex });
    }

    /**
     * Update the aura fill colour used when constructing new AuraMesh instances.
     * @param {number|string} c
     */
    setAuraFill(c)           { this._auraFill = new THREE.Color(c).getHex(); }

    /**
     * Update the aura border colour used when constructing new AuraMesh instances.
     * @param {number|string} c
     */
    setAuraBorder(c)         { this._auraBorder = new THREE.Color(c).getHex(); }

    /**
     * Update the fraction of the aura radius that is the border (0–1).
     * @param {number} v
     */
    setAuraBorderFraction(v) { this._auraBorderFraction = v; }

    /**
     * Update the aura opacity (0–1).
     * @param {number} v
     */
    setAuraOpacity(v)        { this._auraOpacity = v; }

    /**
     * Update the cell X-axis colour and return the stored hex.
     * @param {number|string} c
     */
    setCellAxisX(c) { this._cell_x_color = new THREE.Color(c).getHex(); }

    /**
     * Update the cell Y-axis colour.
     * @param {number|string} c
     */
    setCellAxisY(c) { this._cell_y_color = new THREE.Color(c).getHex(); }

    /**
     * Update the cell Z-axis colour.
     * @param {number|string} c
     */
    setCellAxisZ(c) { this._cell_z_color = new THREE.Color(c).getHex(); }

    // This convenient wrapper is useful to keep the Primitives out of the Model's logic.
    // This way, we don't suffer problems when testing purely mathematical/logical stuff
    // by command line with mocha. Primitives are messy and don't build well for CLI with
    // esbuild, for some reason.
    get Primitives() {
        return Primitives;
    }

}

/**
 * Add a vector field representation to the model
 * 
 * @param {Array} points            List of origins for the vectors
 * @param {Array} vectors           Vectors to plot
 * @param {*} colors                Colors for each vector. Can be a single color, an array of colors, or a function that takes 
 *                                  origin, vector, and index, and returns a color.
 * @param {float} scale             Scaling factor
 * 
 * @returns {THREE.Group}           Rendered object
 */

/*
_addVectorField: function(points, vectors, colors, scale) {

    var N = points.length;
    if (vectors.length != N)
        throw 'Points and vectors arrays not matching for vector field';

    // We always reduce colors to a function with signature (p, v, i) but
    // it can also be an array or a single scalar.
    colors = colors || 0xffffff;
    switch (typeof colors) {
        case 'function':
            break;
        case 'object':
            if (colors.length != N)
                throw 'Colors array not matching for vector field';
            var colors_arr = colors.slice();
            colors = function(p, v, i) {
                return colors_arr[i];
            }
            break;
        default:
            var colors_val = colors;
            colors = function(p, v, i) {
                return colors_val;
            }
    }
    scale = scale || 1;

    var vfield = new THREE.Group();

    for (var i = 0; i < N; ++i) {
        var p = points[i];
        var v = vectors[i];
        var c = colors(p, v, i);
        var l = v.length();
        v.normalize();
        var arr = new THREE.ArrowHelper(v, p, l, c, 0.2 * l, 0.1 * l);
        vfield.add(arr);
    }

    this._g._plots.add(vfield);

    return vfield;
},

*/


export {
    Renderer,
    themes
};