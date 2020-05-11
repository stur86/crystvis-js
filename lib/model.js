'use strict';

/** 
 * @fileoverview Class holding the atomic models to be plotted
 * @package 
 */

const _ = require('lodash');
const nm = require('numeric');
const Atoms = require('crystcif-parse').Atoms;

const utils = require('./utils.js');

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
        var ediag = nm.eig(this._r_matrix);
        // Sort by eigenvalue
        ediag = _.zip(ediag.lambda.x, ediag.E.transpose().x);
        ediag = _.sortBy(ediag, function (x) { return x[0]; });
        ediag = _.unzip(ediag);
        this._r_diag = {
            lambda: new nm.T(ediag[0]),
            E: new nm.T(ediag[1]).transpose()
        };

        this._supercell = [1, 1, 1]; // Default starting supercell size
    }
    this._supercell_grid = [[0, 0, 0]];
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
        if (!this._periodic)
            return;
        this._supercell = scell;
        this._supercell_grid = utils.supercellGrid(scell);
    },
    get supercell_grid() { return _.cloneDeep(this._supercell_grid); },
    /**
     * Compute and return the minimum supercell that guarantees
     * containing all atoms at a maximum distance r from those in the
     * [0,0,0] cell.
     * 
     * @param {float} r     
     */
    minimumSupercell(r) {
        var utransf_mat = this._r_diag.E.dot(nm.diag(nm.pow(this._r_diag.lambda.x, -0.5)));
        var utransf_norm = utransf_mat.transpose();
        for (var i = 0; i < 3; ++i) {
            var norm = utransf_mat.getRow(i).norm2();
            for (var j = 0; j < 3; ++j) {
                utransf_norm.x[j][i] *= r / norm;
            }
        }
        var qmatrix = utransf_mat.dot(utransf_norm);
        var scell = [];
        for (var i = 0; i < 3; ++i) {
            var b = 0;
            for (var j = 0; j < 3; ++j) {
                b = Math.max(Math.ceil(Math.abs(qmatrix.x[i][j])), b);
            }
            scell.push(2*b+1);
        }

        return scell;
    },

    // Query functions. These are for internal use and return references
    // to atom images in the form [index, [i,j,k]]
    _queryElements(elems) {
        if (_.isString(elems)) {
            elems = [elems]; // A single symbol
        }

        var indices = _.reduce(this._elems, function (inds, s, i) {
            if (elems.indexOf(s) > -1) {
                inds.push(i);
            }
            return inds;
        }, []);

        var found = [];
        for (var i = 0; i < this._supercell_grid.length; ++i) {
            var cell = this._supercell_grid[i];
            found = found.concat(_.map(indices, function (x) { return [x, cell] }));
        }

        return found;
    }
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