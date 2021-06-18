'use strict';

/**
 * @fileoverview Class constituting the main object that plots crystals in the webpage
 * @package
 */

import * as _ from 'lodash';

import {
    Renderer as Renderer
} from './render.js';
import {
    Loader as Loader
} from './loader.js';
import {
    Model as Model
} from './model.js';
import {
    ModelView as ModelView
} from './modelview.js';
import {
    AtomMesh
} from './primitives';

class CrystVis {

    static LEFT_CLICK = 1;
    static MIDDLE_CLICK = 2;
    static RIGHT_CLICK = 4;
    static ALT_BUTTON = 8;
    static CTRL_BUTTON = 16;
    static CMD_BUTTON = 16; // Alias for Mac users
    static SHIFT_BUTTON = 32;

    /**
     * An object providing a full interface to a renderer for crystallographic 
     * models
     * @class
     * @param {string}  element     CSS-style identifier for the HTML element to 
     *                              put the renderer in
     * @param {int}     width       Window width
     * @param {int}     height      Window height
     */
    constructor(element, width = 800, height = 600) {

        // Create a renderer
        this._renderer = new Renderer(element, width, height);
        this._loader = new Loader();

        this._models = {};

        this._current_model = null;
        this._current_mname = null;
        this._displayed = null;
        this._selected = null;

        // Handling events
        this._atom_click_events = {};
        this._atom_click_events[CrystVis.LEFT_CLICK] = this._defaultAtomLeftClick.bind(this);
        this._atom_click_events[CrystVis.LEFT_CLICK + CrystVis.SHIFT_BUTTON] = this._defaultAtomShiftLeftClick.bind(this);
        this._atom_click_events[CrystVis.LEFT_CLICK + CrystVis.CTRL_BUTTON] = this._defaultAtomCtrlLeftClick.bind(this);

        this._atom_click_defaults = _.cloneDeep(this._atom_click_events);

        this._renderer.addClickListener(this._handleAtomClick.bind(this),
            this._renderer._groups.model, AtomMesh);
        this._renderer.addSelBoxListener(this._onAtomBox.bind(this),
            this._renderer._groups.model, AtomMesh);

        // Additional options
        // Hidden (need dedicated setters)
        this._hsel = false; // If true, highlight the selected atoms

        // Vanilla (no get/set needed)
        this.cifsymtol = 1e-2; // Parameter controlling the tolerance to symmetry when loading CIF files

    }

    get model_list() {
        return Object.keys(this._models);
    }

    get model() {
        return this._current_model;
    }

    get displayed() {
        return this._displayed;
    }

    set displayed(d) {
        if (!(d instanceof ModelView)) {
            throw new Error('.displayed must be set with a ModelView');
        }
        this._displayed.hide();
        this._displayed = d;
        this._displayed.show();
    }

    get selected() {
        return this._selected;
    }

    set selected(s) {
        if (!(s instanceof ModelView)) {
            throw new Error('.selected must be set with a ModelView');
        }
        this._selected.setProperty('highlighted', false);
        this._selected = s;
        this._selected.setProperty('highlighted', this._hsel);
    }

    get highlight_selected() {
        return this._hsel;
    }

    set highlight_selected(hs) {
        this._hsel = hs;
        if (this._selected) {
            this._selected.setProperty('highlighted', this._hsel);
        }
    }

    onAtomClick(callback = null, modifiers = CrystVis.LEFT_CLICK) {

        // Check that event makes sense
        var lc = modifiers & CrystVis.LEFT_CLICK;
        var mc = modifiers & CrystVis.MIDDLE_CLICK;
        var rc = modifiers & CrystVis.RIGHT_CLICK;

        if (lc + mc + rc == 0) {
            throw 'Can not set event without any click type';
        }
        if ((lc && mc) || (lc && rc) || (mc && rc)) {
            throw 'Can not set event with two or more click types';
        }

        if (callback)
            this._atom_click_events[modifiers] = callback.bind(this);
        else
            this._atom_click_events[modifiers] = this._atom_click_defaults[modifiers];
    }
    _defaultAtomLeftClick(atom, event) {
        var i = atom.img_index;
        this.selected = new ModelView(this._current_model, [i]);
    }
    _defaultAtomShiftLeftClick(atom, event) {
        var i = atom.img_index;
        this.selected = this.selected.or(new ModelView(this._current_model, [i]));
    }
    _defaultAtomCtrlLeftClick(atom, event) {
        var i = atom.img_index;
        this.selected = this.selected.xor(new ModelView(this._current_model, [i]));
    }

    // Callback for when atoms are clicked
    _handleAtomClick(alist, event) {

        if (alist.length == 0) {
            return;
        }

        let clicked = alist[0].image;

        let modifiers = [CrystVis.LEFT_CLICK, CrystVis.MIDDLE_CLICK, CrystVis.RIGHT_CLICK][event.button];

        modifiers += event.shiftKey * CrystVis.SHIFT_BUTTON;
        modifiers += (event.ctrlKey || event.metaKey) * CrystVis.CTRL_BUTTON;
        modifiers += event.altKey * CrystVis.ALT_BUTTON;

        var callback = this._atom_click_events[modifiers];

        if (callback)
            callback(clicked, event);

    }

    // Callback for a whole box dragged over atoms
    _onAtomBox(alist) {

        var images = [];
        var indices = [];
        for (var i = 0; i < alist.length; ++i) {
            images.push(alist[i].image);
            indices.push(images[i].img_index);
        }

        this.selected = this.selected.xor(new ModelView(this._current_model, indices));

    }

    /**
     * Load one or more atomic models from a file's contents
     * 
     * @param  {String} contents    The contents of the structure file
     * @param  {String} format      The file's format (cif, xyz, etc.). Default is cif.
     * @param  {String} prefix      Prefix to use when naming the models. Default is empty.
     * @param  {Object} parameters  Loading parameters:
     *                                  supercell        -  Supercell size (only used if the structure is periodic)
     *                                  molecularCrystal -  If true, try to make the model load completing molecules 
     *                                                      across periodic boundaries
     * 
     * @return {Object}             Names of the models we tried to load, and values of true/false for successful loading or not
     */
    loadModels(contents, format, prefix, parameters = {}) {

        var defaults = {
            supercell: [1, 1, 1],
            molecularCrystal: false
        };

        parameters = _.merge(defaults, parameters);

        // By default, it's cif
        format = format || 'cif';
        format = format.toLowerCase();

        // By default, same as the format
        prefix = prefix || format;

        var structs = this._loader.load(contents, format, prefix);

        // Now make unique names
        var loaded = {};
        for (var n in structs) {
            var iter = 0;
            var coll = true;
            var nn = n;
            while (coll) {
                nn = n + (iter > 0 ? '_' + iter : '');
                coll = nn in this._models;
                iter++;
            }
            var s = structs[n];
            if (!s) {
                console.warn('Model ' + n + ' could not load properly');
                loaded[nn] = false;
                continue;
            }
            this._models[nn] = new Model(s, parameters);
            loaded[nn] = true;
        }

        return loaded;
    }

    /**
     * Render a model
     * 
     * @param  {String} name    Name of the model to display. If empty, just
     *                          clear the renderer window.
     */
    displayModel(name) {

        if (this._current_model) {
            this._current_model.renderer = null;
        }
        this._renderer.clear();

        if (!name) {
            // If called with nothing, just quit here
            return;
        }

        if (!(name in this._models)) {
            throw 'The requested model does not exist';
        }

        var m = this._models[name];
        m.renderer = this._renderer;

        this._current_model = m;
        this._current_mname = name;

        this._displayed = m.find({
            'cell': [
                [0, 0, 0]
            ]
        });
        this._selected = new ModelView(m, []); // Empty

        this._displayed.show();
    }

    /**
     * Erase a model from the recorded ones
     * 
     * @param  {String} name    Name of the model to delete
     */
    deleteModel(name) {

        if (!(name in this._models)) {
            throw 'The requested model does not exist';
        }

        if (this._current_mname == name) {
            this._current_model.renderer = null;
            this._current_model = null;
            this._current_mname = null;
        }

        delete this._models[name];
    }

    /**
     * Add a primitive shape to the drawing
     * 
     * @param {THREE.Object3D} p    Primitive to add 
     */
    addPrimitive(p) {
        this._renderer.add(p);
    }

    /**
     * Remove a primitive shape from the drawing
     * 
     * @param {THREE.Object3D} p    Primitive to remove
     */
    removePrimitive(p) {
        this._renderer.remove(p);
    }
}

export {
    CrystVis
}