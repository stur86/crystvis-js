'use strict';

/** 
 * @fileoverview Class holding "model views", subsets of atoms in a Model used
 * for selection or to perform operations in block
 * @package 
 */

const _ = require('lodash');


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
    get images() {
        return this._images;
    },
    get length() {
        return this._indices.length;
    },
    // Operations on the selected atoms
    // Visibility and appearance
    show() {
        this._model._setAtomsProperty(this._images, 'visible', true);
        return this;
    },
    hide() {
        this._model._setAtomsProperty(this._images, 'visible', false);
        return this;
    },
    map(func) {
        var returns = [];
        for (var i = 0; i < this.length; ++i) {
            returns.push(func(this._images[i], i));
        }
        return returns;
    },
    find(query) {
        var found = this._model._qparse.parse(query);
        return new ModelView(this._model, 
                             _.intersectionWith(this._indices, found));
    },
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
    }
}
exports.ModelView = ModelView;