'use strict';

/** 
 * @fileoverview Class holding the atomic models to be plotted
 * @package 
 */

const _ = require('lodash');
const nm = require('numeric');
const Atoms = require('crystcif-parse').Atoms;

/**
 * An object containing an Atomic structure and taking care of its periodic
 * nature, allowing querying and selection, and so on.
 * @class
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
        this._supercell = [1, 1, 1]; // Default starting supercell size
        this._supercell_grid = [[0, 0, 0]];
    }
}

Model.prototype = {
    // Using the .get_ methods of _atoms guarantees these are copies,
    // not pointers to the real thing
    get symbols() { return this._atoms.get_chemical_symbols(); },
    get numbers() { return this._atoms.get_atomic_numbers(); },
    get positions() { return this._atoms.get_positions(); },
    get scaled_positions() { return this._atoms.get_scaled_positions(); },
    get cell() { return this._atoms.get_cell(); },
    get pbc() { return this._atoms.get_pbc(); },
    get periodic() { return this._periodic; },
    get supercell() { return _.clone(this._supercell); },
    set supercell(scell) {
        this._supercell = scell;
        this._supercell_grid = [];
        var bounds = _.map(scell, function (x) { return [Math.ceil(-x / 2), Math.ceil(x / 2)] });

        for (var i = bounds[0][0]; i < bounds[0][1]; ++i) {
            for (var j = bounds[1][0]; j < bounds[1][1]; ++j) {
                for (var k = bounds[2][0]; k < bounds[2][1]; ++k) {
                    this._supercell_grid.push([i, j, k]);
                }
            }
        }
    },
    get supercell_grid() { return _.cloneDeep(this._supercell_grid); }
}

/**
 * An 'image' of a single atom from a model. This represents a specific periodic copy of that atom (if applicable).
 * @class
 * @param {Model} model     The model from which the image is from
 * @param {int} index       Index of the atom in the model 
 * @param {Array} ijk       Indices of the cell in which the image is located
 */
function AtomImage(model, index, ijk) {

    this._model = model;
    this._index = index;
    this._ijk = ijk || [0, 0, 0];

    this._xyz0 = model.positions[index];
    this._fxyz0 = model.scaled_positions[index];
    this._fxyz = nm.add(this._fxyz0, ijk);
    this._xyz = nm.dot(this._fxyz, model._cell);
}

AtomImage.prototype = {
    get model() { return this._model; },
    get index() { return this._index; },
    get ijk() { return _.cloneDeep(this._ijk); },
    get xyz0() { return _.cloneDeep(this._xyz0); },
    get xyz() { return _.cloneDeep(this._xyz); },
    get fxyz0() { return _.cloneDeep(this._fxyz0); },
    get fxyz() { return _.cloneDeep(this._fxyz); }
}

exports.Model = Model;
exports.AtomImage = AtomImage;