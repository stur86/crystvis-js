'use strict';

/** 
 * @fileoverview Utility functions
 * @package
 */

const _ = require('lodash');

/**
 * Compute a full list of indices of all cells for 
 * a supercell of given size
 * @param {Array} scell        Size of the requested supercell 
 */
function supercellGrid(scell) {
    var bounds = _.map(scell, function (x) { return [Math.ceil(-x / 2), Math.ceil(x / 2)] });
    var grid = [];

    for (var i = bounds[0][0]; i < bounds[0][1]; ++i) {
        for (var j = bounds[1][0]; j < bounds[1][1]; ++j) {
            for (var k = bounds[2][0]; k < bounds[2][1]; ++k) {
                grid.push([i, j, k]);
            }
        }
    }

    return grid;
}

/**
 * Reduce a tuple of atomic index + i,j,k cell indices to a single integer
 * @param  {int}    i       Atomic index
 * @param  {Array}  ijk     Cell indices
 * @param  {Array}  scell   Supercell size
 * @return {int}            Overall index
 */
function supercellIndex(i, ijk, scell) {
    ijk = [ijk[0]+(scell[0]-1)/2, 
           ijk[1]+(scell[1]-1)/2,
           ijk[2]+(scell[2]-1)/2];

    var itot = ijk[2]+ijk[1]*scell[2]+ijk[0]*scell[2]*scell[1];
    itot += i*scell[0]*scell[1]*scell[2];

    return itot;
}

exports.supercellGrid = supercellGrid;
exports.supercellIndex = supercellIndex;