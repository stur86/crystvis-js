'use strict';

/**
 * @fileoverview Class constituting the main object that plots crystals in the webpage
 * @package
 */

const _ = require('lodash');

const Renderer = require('./render.js').Renderer;
const Loader = require('./loader.js').Loader;
const Model = require('./model.js').Model;

/**
 * An object providing a full interface to a renderer for crystallographic 
 * models
 * @class
 * @param {string}  element     CSS-style identifier for the HTML element to 
 *                              put the renderer in
 * @param {Object}  options     Rendering window options (width, height, etc.)
 */
function CrystVis(element, options) {

    // Defaults
    options = _.merge({
        'width': 800,
        'height': 600
    }, options);

    // Create a renderer
    var w = options['width'];
    var h = options['height'];

    this._renderer = new Renderer(element, w, h);
    this._renderer.setBboardAbsoluteScale(true);
    this._loader = new Loader();

    this._models = {};

    this._current_model = null;
    this._current_mname = null;
    this._displayed = [];
    this._selected = [];

    this._renderer.addClickListener(function(a) {
        for (var i = 0; i < a.length; ++i) {
            console.log(a[i].object);
        }
    }, this._renderer._g._ab);
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
    loadModels(contents, format, prefix, scell=[1,1,1]) {

        // By default, it's cif
        format = format || 'cif';
        format = format.toLowerCase();

        // By default, same as the format
        prefix = prefix || format;

        var structs;

        switch (format) {
            case 'cif':
                structs = this._loader.loadCIF(contents);
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
            this._current_model.unsetRenderer();
        }

        if (!name) {
            // If called with nothing, just quit here
            return;
        }

        if (!(name in this._models)) {
            throw 'The requested model does not exist';
        }

        var m = this._models[name];
        m.setRenderer(this._renderer);

        this._current_model = m;
        this._current_mname = name;

        this._displayed = m.find(['cell', [0, 0, 0]]);

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
            this._current_model.unsetRenderer();
            this._current_model = null;
            this._current_mname = null;
        }

        delete this._models[name];
    }
}

exports.CrystVis = CrystVis;