'use strict';

/**
 * @fileoverview Class constituting the main object that plots crystals in the webpage
 * @package
 */

const _ = require('lodash');

const Renderer = require('./render.js').Renderer;
const Loader = require('./loader.js').Loader;
const Model = require('./model.js').Model;
const AtomImage = require('./model.js').AtomImage;

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
    this._loader = new Loader();

    this._models = {};

    this._current_model = null;
    this._displayed = [];
    this._selected = [];
}

CrystVis.prototype = {
    /**
     * Load one or more atomic models from a file's contents
     * 
     * @param  {String} contents The contents of the structure file
     * @param  {String} format   The file's format (cif, xyz, etc.). Default is cif.
     * @param  {String} prefix   Prefix to use when naming the models. Default is empty.
     * 
     * @return {String[]}        Names of the loaded models.
     */
    loadModels(contents, format, prefix) {

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
            this._models[nn] = new Model(structs[n]);
            loaded.push(nn);
        }

        return loaded;
    },
    /**
     * Render a model
     * 
     * @param  {String} name Name of the model to display
     */
    displayModel(name) {

        if (!(name in this._models)) {
            throw 'The requested model does not exist';
        }

        var m = this._models[name];
        m.setRenderer(this._renderer);
        this._current_model = m;

        this._displayed = m.find(['cell', [0,0,0]]);

        m.setAtomsVisibility(this._displayed, true);
        m.setBondsVisibility(this._displayed, true);
        m.setCellVisibility(true);

    }
}

exports.CrystVis = CrystVis;