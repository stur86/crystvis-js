'use strict';

/** 
 * @fileoverview Class holding the atomic models to be plotted
 * @package 
 */

var nm = require('numeric');
var Atoms = require('crystcif-parse').Atoms;

/**
 * 
 * @class
 * 
 * @param {crystcif.Atoms} atoms   Atomic structure, in crystcif's Atoms format
 */
function Model(atoms) {

    this._atoms = atoms;
    this._data = {};

    /* Load the positions, cell, and other key data
       Important: to save memory, we're simply storing references.
       These are NOT to be changed!
    */
    this._elems = this._atoms._arrays['symbols'];
    this._nums = this._atoms._arrays['numbers'];
    this._positions = this._atoms._arrays['positions'];
    this._cell = this._atoms._cell;
    this._pbc = this._atoms._pbc;
    this._periodic = !this._pbc.includes(false);
    this._inv_cell = this._atoms._inv_cell;

    if (this._periodic) {
        // R matrix: indispensable for calculations of periodic distances
        this._r_matrix = nm.dot(this._cell, nm.transpose(this._cell));
        this._r_diag = nm.eig(this._r_matrix);
    }
}

Model.prototype = {
    get symbols() { return this._elems; },
    get numbers() { return this._nums; },
    get positions() { return this._positions; },
    get cell() { return this._cell; },
    get pbc() { return this._pbc; },
    get periodic() { return this._periodic; },
}

/**
 * An 'image' of a single atom from a model. This represents a specific periodic copy of that atom (if applicable).
 * 
 * @param {Model} model     The model from which the image is from
 * @param {int} index       Index of the atom in the model 
 * @param {Array} ijk       Indices of the cell in which the image is located
 */
function AtomImage(model, index, ijk) {

    this._model = model;
    this._index = index;
    this._ijk = ijk || [0, 0, 0];

    this._xyz0 = model._positions[index];
    this._xyz = nm.add(this._xyz0, nm.dot(this._ijk, model._cell));
}

AtomImage.prototype = {
    get model() { return this._model; },
    get index() { return this._index; },
    get ijk() { return this._ijk; },
    get xyz0() { return this._xyz0; },
    get xyz() { return this._xyz; }
}

exports.Model = Model;
exports.AtomImage = AtomImage;