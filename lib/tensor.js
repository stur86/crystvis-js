'use strict';

/**
 * @fileoverview TensorData class to store tensors like NMR data and such.
 * @package
 */

import _ from 'lodash';
import * as mjs from 'mathjs';
import * as THREE from 'three';

/**
 * TensorData object, to store whole tensors, diagonalise their symmetric part
 * and return derived quantities
 * @param {Array | mathjs.Matrix | TensorData} M     Tensor in matrix form
 */
function TensorData(M) {

    if (M instanceof TensorData)
        M = M._M;
    else if (M instanceof Array)
        M = mjs.matrix(M);

    this._M = M;

    var MT = mjs.transpose(M);
    this._Msymm = mjs.divide(mjs.add(M, MT), 2.0);
    this._Masymm = mjs.subtract(M, this._Msymm);

    // Diagonalize
    var eigs = mjs.eigs(this._Msymm);
    // Sort by eigenvalue magnitude
    var evecs = mjs.transpose(eigs.vectors._data);
    eigs = _.zip(eigs.values._data, evecs);
    eigs = _.sortBy(eigs, function(x) { return x[0]; });
    eigs = _.unzip(eigs);

    this._evals = eigs[0];
    
    // Make it right-handed
    evecs = eigs[1];
    evecs[2] = mjs.cross(evecs[0], evecs[1]);
    this._evecs = mjs.transpose(evecs);

    // Isotropy
    this._iso = mjs.mean(this._evals);

    // Haeberlen order
    var iso = this._iso;
    var haeb = _.zip(_.range(3), this._evals);
    haeb = _.sortBy(haeb, function(x) {
        return Math.abs(x[1]-iso);
    });

    this._haeb_evals = [
        this._evals[haeb[1][0]],
        this._evals[haeb[0][0]],
        this._evals[haeb[2][0]]        
    ];

    this._haeb_evecs = mjs.transpose([
        evecs[haeb[1][0]],
        evecs[haeb[0][0]],
        mjs.cross(evecs[haeb[1][0]], evecs[haeb[0][0]])
    ]);

}
TensorData.prototype = {
    get data() {
        return JSON.parse(JSON.stringify(this._M._data));
    },
    get symmetric() {
        return JSON.parse(JSON.stringify(this._Msymm._data));
    },
    get asymmetric() {
        return JSON.parse(JSON.stringify(this._Masymm._data));
    },
    get eigenvalues() {
        return Array.from(this._evals);
    },
    get eigenvectors() {
        return JSON.parse(JSON.stringify(this._evecs));
    },
    get haeberlen_eigenvalues() {
        return Array.from(this._haeb_evals);
    },
    get haeberlen_eigenvectors() {
        return JSON.parse(JSON.stringify(this._haeb_evecs));
    },
    get isotropy() {
        return this._iso;
    },
    get anisotropy() {
        return this._haeb_evals[2]-(this._haeb_evals[0]+this._haeb_evals[1])/2.0;
    },
    get reduced_anisotropy() {
        return this._haeb_evals[2]-this._iso;
    },
    get asymmetry() {
        var ra = this.reduced_anisotropy;
        return (this._haeb_evals[1]-this._haeb_evals[0])/ra;
    },
    get span() {
        return this._evals[2]-this._evals[0];
    },
    get skew() {
        var s = this.span;
        return 3*(this._evals[1]-this._iso)/s;
    },
    /**
     * Rotate the TensorData by a given basis, either as passive or active
     * transformation. Returns the rotated TensorData (does not modify this in
     * place). Default is passive. The convention is such that for a symmetric
     * tensor,
     *
     * T.rotate(T.eigenvectors)
     *
     * returns the diagonalised tensor.
     * 
     * @param  {Array | mathjs.Matrix | TensorData}  basis  Basis to rotate into
     * @param  {Boolean}                             active If true, make it an active transformation (default is false)
     * 
     * @return {TensorData}                                 Rotated tensor
     */
    rotate(basis, active=false) {
        // Rotate the tensor by the given basis of vectors
        if (basis instanceof mjs.Matrix) 
            basis = basis._data;
        if (basis instanceof TensorData)
            basis = basis._M._data;

        var bR = basis;
        var bL = mjs.transpose(basis);

        if (active) {
            bR = bL;
            bL = basis;
        }
        var rdata = mjs.multiply(bL, this._M._data, bR);

        return new TensorData(rdata);
    }
}

export {
    TensorData
}