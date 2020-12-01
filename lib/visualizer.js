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
} from './graphics.js';

/**
 * An object providing a full interface to a renderer for crystallographic 
 * models
 * @class
 * @param {string}  element     CSS-style identifier for the HTML element to 
 *                              put the renderer in
 * @param {int}     width       Window width
 * @param {int}     height      Window height
 */
function CrystVis(element, width = 800, height = 600) {

    // Create a renderer
    this._renderer = new Renderer(element, width, height);
    this._renderer.setBboardAbsoluteScale(true);
    this._loader = new Loader();

    this._models = {};

    this._current_model = null;
    this._current_mname = null;
    this._displayed = null;
    this._selected = null;

    this._renderer.addClickListener(this._onAtomClick.bind(this),
        this._renderer._g._ab, AtomMesh);
    this._renderer.addSelBoxListener(this._onAtomBox.bind(this),
        this._renderer._g._ab, AtomMesh);

    // Additional options
    // Hidden (need dedicated setters)
    this._hsel = false; // If true, highlight the selected atoms

    // Vanilla (no get/set needed)
    this.cifsymtol = 1e-2; // Parameter controlling the tolerance to symmetry when loading CIF files

    // Additional action callbacks
    this.action_atom_click_left = null;
    this.action_atom_click_right = null;
    this.action_atom_click_middle = null;
    this.action_selbox_drag = null;
}

CrystVis.prototype = {
    get model_list() {
        return Object.keys(this._models);
    },
    get model() {
        return this._current_model;
    },
    get displayed() {
        return this._displayed;
    },
    set displayed(d) {
        if (!(d instanceof ModelView)) {
            throw '.displayed must be set with a ModelView';
        }
        this._displayed.hide();
        this._displayed = d;
        this._displayed.show();
    },
    get selected() {
        return this._selected;
    },
    set selected(s) {
        if (!(s instanceof ModelView)) {
            throw '.selected must be set with a ModelView';
        }
        this._selected.setHighlighted(false);
        this._selected = s;
        this._selected.setHighlighted(this._hsel);
    },
    get highlight_selected() {
        return this._hsel;
    },
    set highlight_selected(hs) {
        this._hsel = hs;
        if (this._selected) {
            this._selected.setHighlighted(this._hsel);
        }
    },
    // Callback for when atoms are clicked
    _onAtomClick(alist, event) {

        if (alist.length == 0) {
            return;
        }

        clicked = alist[0].image;

        console.log(clicked);

        if (event.button == 0) {
            if(this.action_atom_click_left) {
                this.action_atom_click_left(clicked);
            }
            else {
                // Default
                var i = clicked.img_index;
                this.selected = this.selected.xor(new ModelView(this._current_model, [i]));                
            }
        }
        else if (event.button == 1) {
            if (this.action_atom_click_middle) {
                this.action_atom_click_middle(clicked);
            }
        }
        else if (event.button == 2) {
            if (this.action_atom_click_right) {
                this.action_atom_click_right(clicked);
            }
        }

    },
    // Callback for a whole box dragged over atoms
    _onAtomBox(alist) {

        var images = [];
        var indices = [];
        for (var i = 0; i < alist.length; ++i) {
            images.push(alist[i].image);
            indices.push(images[i].img_index);
        }

        this.selected = this.selected.xor(new ModelView(this._current_model, indices));

    },
    /**
     * Load one or more atomic models from a file's contents
     * 
     * @param  {String} contents The contents of the structure file
     * @param  {String} format   The file's format (cif, xyz, etc.). Default is cif.
     * @param  {String} prefix   Prefix to use when naming the models. Default is empty.
     * @param {Array}   scell    Supercell size (only used if the structure is periodic)
     * 
     * @return {String[]}        Names of the loaded models.
     */
    loadModels(contents, format, prefix, scell = [1, 1, 1]) {

        // By default, it's cif
        format = format || 'cif';
        format = format.toLowerCase();

        // By default, same as the format
        prefix = prefix || format;

        var structs;

        switch (format) {
            case 'cif':
                structs = this._loader.loadCIF(contents, this.cifsymtol);
                break;
            case 'xyz':
                var a = this._loader.loadXYZ(contents);
                structs = {};
                structs[prefix] = a;
                break;
            default:
                throw 'Unsupported file format';
                return [];
        }

        // Now make unique names
        var loaded = [];
        for (var n in structs) {
            var iter = 0;
            var coll = true;
            var nn = n;
            while (coll) {
                nn = n + (iter > 0 ? '_' + iter : '');
                coll = nn in this._models;
                iter++;
            }
            this._models[nn] = new Model(structs[n], scell);
            loaded.push(nn);
        }

        return loaded;
    },
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

        this._displayed = m.find(['cell', [0, 0, 0]]);
        this._selected = new ModelView(m, []); // Empty

        this._displayed.show();
    },
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
}

exports.CrystVis = CrystVis;