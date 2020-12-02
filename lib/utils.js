'use strict';

/** 
 * @fileoverview Utility functions
 * @package
 */

import _ from 'lodash';

/**
 * Compute a full list of indices of all cells for 
 * a supercell of given size
 * @param {Array} scell        Size of the requested supercell 
 */
function supercellGrid(scell) {
    var bounds = _.map(scell, function(x) {
        var lb = Math.ceil(-x / 2)+(1-x%2); // This makes it so that for even supercells we skew on the positive side
        if (lb == -0) {
            lb = 0; // Avoids -0
        }
        var ub = Math.ceil(x / 2)+(1-x%2);
        return [lb, ub];
    });
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
 * @param  {int}    n       Number of atoms in the model
 * 
 * @return {int}            Overall index
 */
function supercellIndex(i, ijk, scell, n) {

    ijk = _.map(ijk, function(x, i) {
        return x + Math.floor((scell[i]-1)/2); // Important (depends on the convention in supercellGrid)
    });

    // If any of these is smaller than 0, we're sure to be out
    if (ijk[0] < 0 || ijk[1] < 0 || ijk[2] < 0) {
        return -1;
    }
    if (ijk[0] >= scell[0] || ijk[1] >= scell[1] || ijk[2] >= scell[2]) {
        return -1;
    }

    var itot = ijk[2] + ijk[1] * scell[2] + ijk[0] * scell[2] * scell[1];
    itot = i + itot*n;

    return itot;
}

export {
    supercellGrid, supercellIndex
}