'use strict';

/**
 * @fileoverview Class constituting the main object that plots crystals in the webpage
 * @package
 */

const _ = require('lodash');

const Renderer = require('./render.js').Renderer;
const Loader = require('./loader.js').Loader;

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
    options = _.merge({'width': 800, 'height': 600}, options);

    // Create a renderer
    var w = options['width'];
    var h = options['height'];

    this._renderer = new Renderer(element, w, h);
    this._loader = new Loader();

    this._models = {};
}

exports.CrystVis = CrystVis;