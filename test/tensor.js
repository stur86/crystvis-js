'use strict';


import * as chai from 'chai';
import chaiAlmost from 'chai-almost'

import * as mjs from 'mathjs'

import {
    TensorData
} from '../lib/tensor.js'

import {
    getIsotopeData
} from '../lib/data.js'

chai.use(chaiAlmost(1e-3));

const expect = chai.expect;

describe('#tensordata', function() {

    it('should properly separate the symmetric part of a tensor', function() {
        var td = new TensorData([
            [0, 2, 1],
            [0, 0, 1],
            [1, 1, 0]
        ]);

        expect(td.symmetric).to.deep.equal([
            [0, 1, 1],
            [1, 0, 1],
            [1, 1, 0]
        ]);

        expect(td.asymmetric).to.deep.equal([
            [0, 1, 0],
            [-1, 0, 0],
            [0, 0, 0]
        ]);
    });

    it('should compute and order eigenvalues properly', function() {

        var td = new TensorData([
            [1, 2, 3],
            [2, 3, 4],
            [3, 4, 5]
        ]);

        expect(td.eigenvalues).to.deep.almost.equal([-6.234754e-01, 0,
            9.623475e+00
        ]);

        // Reconstruct the matrix
        var ev = td.eigenvectors;
        var D = mjs.diag(td.eigenvalues);
        var evT = mjs.transpose(ev);
        expect(mjs.multiply(ev, mjs.multiply(D, evT))).to.deep.almost.equal(td.symmetric);
    });

    it('should change bases properly', function() {

        var td0 = new TensorData([
            [15, 2, 2],
            [ 2, 3, 6],
            [ 2, 6, 9]
        ]);

        var td1 = td0.rotate(td0.eigenvectors);
        expect(td1.symmetric).to.deep.almost.equal(mjs.diag(td0.eigenvalues));

        // And vice versa...
        var td2 = td1.rotate(td0.eigenvectors, true);
        expect(td2.symmetric).to.deep.almost.equal(td0.symmetric);
    });

    it('should order eigenvalues properly following the Haeberlen convention', function() {

        var td = new TensorData([
            [1,0,0],
            [0,2,0],
            [0,0,-6]
        ]);

        // Haeberlen order:
        // e_x = 2 
        // e_y = 1
        // e_z = -6

        expect(td.isotropy).to.equal(-1);
        expect(td.haeberlen_eigenvalues).to.deep.equal([2, 1, -6]);
        expect(td.anisotropy).to.equal(-7.5);
        expect(td.reduced_anisotropy).to.equal(-5);
        expect(td.asymmetry).to.equal(0.2);
        expect(td.span).to.equal(8);
        expect(td.skew).to.almost.equal(0.75);

    });

    it ('should convert properly an EFG tensor to Hz', function() {

        var efg = new TensorData([
            [ 1.05124449e-01,  1.42197546e-01,  1.53489044e+00],
            [ 1.42197546e-01,  2.40599479e-02, -9.03880151e-01],
            [ 1.53489044e+00, -9.03880151e-01, -1.29184397e-01]
        ]);

        // Convert to Hz
        var Q = getIsotopeData('O', 17).Q;
        efg = efg.efgAtomicToHz(Q);

        // Comparison in kHz
        expect(efg.haeberlen_eigenvalues[2]/1e3).to.almost.equal(11233.854188);
    });

    it ('should convert properly an ISC tensor to Hz', function() {

        var isc = new TensorData([
            [1.8373758951855776, -0.6444912603875048, 0.03379154211567881], 
            [-0.6738855911039692, 0.72064084469826, -0.4004091413405982], 
            [0.014472208799926917, -0.3990514190555465, 0.3282668712885049]
        ]);

        // Convert to Hz
        var g1 = getIsotopeData('C', 13).gamma;
        var g2 = getIsotopeData('H', 1).gamma;
        isc = isc.iscAtomicToHz(g1, g2);

        // Comparison in kHz
        expect(isc.haeberlen_eigenvalues[2]).to.almost.equal(6.53565087);
    });
});