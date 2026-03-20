'use strict';

/** 
 * @fileoverview Utility functions
 * @module
 */

import _ from 'lodash';
import * as THREE from 'three';

/**
 * Compute a full list of indices of all cells for 
 * a supercell of given size
 * @param {Array} scell        Size of the requested supercell 
 */
function supercellGrid(scell) {
    var bounds = _.map(scell, function(x) {
        var lb = Math.ceil(-x / 2)+(1-x%2); // This makes it so that for even supercells we skew on the positive side
        if (Object.is(lb, -0)) {
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

/**
 * Turn a unit cell expressed as Array of Arrays into a THREE.Matrix3 object
 * @param {Array}   cell    Cell in Array form
 *
 * @return {THREE.Matrix3}  Cell in THREE.Matrix3 form
 */
function cellMatrix3(cell) {
    var lc = cell;
    cell = new THREE.Matrix3();
    cell.set(lc[0][0], lc[1][0], lc[2][0],
        lc[0][1], lc[1][1], lc[2][1],
        lc[0][2], lc[1][2], lc[2][2]);

    return cell;
}

/** Add a static variable to a class definition, old style (will become 
 * obsolete once the static keyword is widely accepted in ES) 
 * @param {Object}  cls      Class 
 * @param {String}  name     Name of the variable to define
 * @param {any}     value    Value to assign to it
 */
function addStaticVar(cls, name, value) {
    Object.defineProperty(cls, name, {
        value: value,
        writable: false
    });
}

/** Shift a CPK Color to be more distinct (used for isotopes) 
 *
 * @param {int}    basec    Base color to modify. Can be anything accepted
 *                             by the THREE.Color constructor, but by default
 *                             we assume it's an hex integer.
 * @param {float}  shift    Shift to apply. Should range from -1 to 1.
 *
 * @return  {int}           Shifted color, returned as hex code.
 * 
 * */
function shiftCpkColor(basec, shift=0) {
    let c = new THREE.Color(basec);
    let hsl = {};
    c.getHSL(hsl);
    // Here the goal is to choose a color that's still similar enough
    // to the original, but also contrasts to it.
    // We shift it more in hue if it's not very saturated/bright, and
    // also shift its lightness towards 0.5 and saturation towards 1,
    // so the hue becomes more evident

    /*
    let f = ((1.0-hsl.s)/2 + Math.abs(hsl.l-0.5))*0.7 + 0.3;
    hsl.h = (hsl.h+shift*f*0.5)%1;

    f *= 0.4;
    hsl.s = f+(1-f)*hsl.s;
    f *= 0.5;
    hsl.l = f/2.0+(1-f)*hsl.l;
    */
   
    // How close to white/black is the color?
    let bw = Math.abs(hsl.l-0.5)/0.5;

    if (Math.abs(bw-1) < 1e-2) {
        // By convention we set the hue as blue
        hsl.h = 0.6666;
    }

    // Reduce/increase luminance most for blacks and whites
    hsl.l = (hsl.l-0.5)*(1-0.05*bw)+0.5;
    // Increase saturation most for blacks and whites
    hsl.s = hsl.s + 0.8*bw;
    // Rotate hue least for vivid colors
    hsl.h = (hsl.h+0.1*(0.5+bw)*shift);

    c.setHSL(hsl.h, hsl.s, hsl.l);

    return c.getHex();
}

/** Produce a low-collision hash code from a string argument. The algorithm
 * is inspired by Java's .hashCode() method.
 * 
 * @param {String} arg    The string to hash
 * 
 * @return {int}          Hash code
 */
function hashCode(arg) {
    arg = arg.toString(); // For sanity
    let hash = 0;

    for (let i = 0; i < arg.length; ++i) {
        let char = arg.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
}


/**
 * Compare floating point numbers for equality with a given tolerance
 * 
 * @param {float} a    First number
 * @param {float} b    Second number
 * @param {float} tol  Tolerance (absolute)
 * 
 * @return {bool}      True if the numbers are equal within the tolerance
 * 
 * TODO: could add relative tolerance as well
 */
function floatEqual(a, b, tol=1e-6) {
    // check for NaNs
    if (a !== a || b !== b) {
        return false;
    }

    return Math.abs(a-b) < tol;
}

export {
    supercellGrid, supercellIndex, cellMatrix3, addStaticVar, shiftCpkColor, hashCode, floatEqual
}