'use strict';

/** 
 * @fileoverview Class holding "model views", subsets of atoms in a Model used
 * for selection or to perform operations in block
 * @package 
 */

import _ from 'lodash';


function ModelView(model, indices) {
    this._model = model;
    this._indices = indices;
    this._images = _.map(indices, function(i) {
        return model._atom_images[i];
    });

    this._bonds = {};
    for (var i = 0; i < this._images.length; ++i) {
        var img = this._images[i];
        var bonds = img.bonds;
        for (var j = 0; j < bonds.length; ++j) {
            var b = bonds[j];
            this._bonds[b.key] = b;
        }
    }
    this._bonds = Object.values(this._bonds);
}
ModelView.prototype = {
    get model() {
        return this._model;
    },
    get indices() {
        return Array.from(this._indices);
    },
    get atoms() {
        return Array.from(this._images);
    },
    get length() {
        return this._indices.length;
    },
    // Operations on the selected atoms
    // Visibility
    show() {
        this._model._setAtomsProperty(this._images, 'visible', true);
        return this;
    },
    hide() {
        this._model._setAtomsProperty(this._images, 'visible', false);
        return this;
    },
    /**
     * Run a function on each AtomImage, returning an Array of the results.
     * 
     * @param  {Function}   func    Function to run, should take AtomImage and
     *                              index as arguments
     *                              
     * @return {Array}              Return values
     */
    map(func) {
        var returns = [];
        for (var i = 0; i < this.length; ++i) {
            returns.push(func(this._images[i], i));
        }        
        return returns;
    },
    /**
     * Perform a further search within the atoms included in this ModelView.
     * 
     * @param  {Array}   query    Query for the search, formatted as for 
     *                            the Model.find function.
     *                              
     * @return {ModelView}        Result of the query
     */
    find(query) {
        var found = this._model._qparse.parse(query);
        return new ModelView(this._model, 
                             _.intersectionWith(this._indices, found));
    },
    // Logical operations with another ModelView
    and(mview) {
        if (this._model != mview._model)
            throw 'The two ModelViews do not refer to the same Model';
        return new ModelView(this._model, 
                             _.intersectionWith(this._indices, mview._indices));
    },
    or(mview) {
        if (this._model != mview._model)
            throw 'The two ModelViews do not refer to the same Model';
        return new ModelView(this._model, 
                             _.unionWith(this._indices, mview._indices));
    },
    xor(mview) {
        if (this._model != mview._model)
            throw 'The two ModelViews do not refer to the same Model';
        return new ModelView(this._model, 
                             _.xorWith(this._indices, mview._indices));
    },
    not() {
        return new ModelView(this._model, 
                             _.xorWith(this._indices, 
                                       _.range(this._model._atom_images.length)));        
    },
    // Internal function used to turn a single value, array of values, or 
    // function into an array of values
    _standardValueArray(value) {

        if (_.isFunction(value)) {
            value = this.map(value);
        }
        else if (!(value instanceof Array)) {
            value = Array(this.length).fill(value);
        }

        return Array.from(value);
    },
    /**
     * Set some property of the atoms within the ModelView. 
     *
     * @param {String}              name    Name of the property to set
     * @param {int|Array|function}  value   Value to set for the atoms. It can
     *                                      be either:
     *                                      
     *                                      1. a single value for all of them
     *                                      2. an Array of values as long as
     *                                      the ModelView
     *                                      3. a function that accepts an 
     *                                      AtomImage and an index and returns
     *                                      a value                                    
     */
    setProperty(name, value) {

        if (name[0] == '_') {
            // Assignment of hidden properties not supported!
            throw 'Can not assign a value to hidden properties';
        }

        value = this._standardValueArray(value);

        for (var i = 0; i < this.length; ++i) {
            var v = value[i];
            var aimg = this._images[i];
            aimg[name] = v;
        }

        return this;
    },
    /**
     * Set the color of the atoms within the ModelView. 
     * 
     * @param {int|Array|function}  color   Color to use for the atoms. Works
     *                                      as the value argument of setProperty().
     *                                      If left empty, restores default.
     *                                    
     */
    setColor(color) {

        if (color == null) {
            // Default
            color = function(a, i) {
                return a.cpkColor;
            }
        }

        this.setProperty('color', color);
        
        return this;
    },
    /**
     * Set the radius of the atoms within the ModelView. 
     * 
     * @param {int|Array|function}  radius  Radius to use for the atoms. Works
     *                                      as the value argument of setProperty().
     *                                      If left empty, restores default.
     *                                    
     */
    setRadius(radius) {

        if (radius == null) {
            // Default 
            radius = function(a, i) {
                return a.base_radius;
            }
        }

        this.setProperty('radius', radius);

        return this;
    },
    /**
     * Set the scale of the atoms within the ModelView. 
     * 
     * @param {int|Array|function}  scale   Scale to use for the atoms. Works
     *                                      as the value argument of setProperty().
     *                                      If left empty, restores default.
     *                                    
     */
    setScale(scale) {

        if (scale == null) {
            // Default 
            scale = 1;
        }

        this.setProperty('scale', scale);

        return this;
    },
    /**
     * Set the opacity of the atoms within the ModelView. 
     * 
     * @param {int|Array|function}  opacity Opacity to use for the atoms. Works
     *                                      as the value argument of setProperty().
     *                                      If left empty, restores default.
     *                                    
     */
    setOpacity(opacity) {

        if (opacity == null) {
            // Default 
            opacity = 1;
        }

        this.setProperty('opacity', opacity);

        return this;
    },
    /**
     * Set the highlighting of the atoms within the ModelView on or off. 
     * 
     * @param {bool|Array|function}  highlight Highlighting to use for the atoms. Works
     *                                         as the value argument of setProperty().
     *                                         If left empty, restores default.
     *                                    
     */
    setHighlighted(highlight) {

        if (highlight == null) {
            // Default 
            highlight = false;
        }

        this.setProperty('highlighted', highlight);

        return this;
    },
    addLabels(text, name='label', args={}) {

        // Defaults
        if (!text) {
            text = function(a, i) {
                return a.element;
            }
        }

        text = this._standardValueArray(text);
        name = this._standardValueArray(name);
        args = this._standardValueArray(args);

        for (var i = 0; i < this.length; ++i) {
            var aimg = this._images[i];
            var shiftX = args[i].shiftX || aimg.radius*4;
            var shiftY = args[i].shiftY || 0;
            var size = args[i].size || 1;

            aimg.addLabel(text[i], [shiftX, shiftY], name[i], size, args[i]);
        }

        return this;
    },
    removeLabels(name='label') {

        name = this._standardValueArray(name);

        for (var i = 0; i < this.length; ++i) {
            var aimg = this._images[i];
            aimg.removeLabel(name[i]);
        }
    }

}

export {
    ModelView
}