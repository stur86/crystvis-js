'use strict';

const expect = require('chai').expect;

const fs = require('fs');
const path = require('path');
const Loader = require('../lib/loader.js').Loader;

describe('#loading', function () {
    it('should load properly an XYZ file', function () {

        var loader = new Loader();

        var xyz = fs.readFileSync(path.join(__dirname, 'data', 'pyridine.xyz'), "utf8");
        var a = loader.loadXYZ(xyz);

        expect(a.get_chemical_symbols()).to.deep.equal(['C', 'C', 'C', 'N', 'C', 'C',
            'H', 'H', 'H', 'H', 'H']);
    });
    it('should load properly an extended XYZ file', function () {

        var loader = new Loader();

        var xyz = fs.readFileSync(path.join(__dirname, 'data', 'si8.xyz'), "utf8");
        var a = loader.loadXYZ(xyz);

        expect(a.get_cell()).to.deep.equal([[5.44, 0, 0], [0, 5.44, 0], [0, 0, 5.44]]);
        expect(a.get_array('spin')).to.deep.equal([1, 0, 0, 0, 0, 0, 0, 0]);
    });
});