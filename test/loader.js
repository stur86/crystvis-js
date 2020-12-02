'use strict';

import chai from 'chai'
import chaiAlmost from 'chai-almost'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

import { Loader } from '../lib/loader.js'

const expect = chai.expect
const __dirname = path.dirname(fileURLToPath(import.meta.url));


chai.use(chaiAlmost(1e-3));

describe('#loading', function() {
    it('should load properly an XYZ file', function() {

        var loader = new Loader();

        var xyz = fs.readFileSync(path.join(__dirname, 'data', 'pyridine.xyz'), "utf8");
        var a = loader.loadXYZ(xyz);

        expect(a.get_chemical_symbols()).to.deep.equal(['C', 'C', 'C', 'N', 'C', 'C',
            'H', 'H', 'H', 'H', 'H'
        ]);
    });
    it('should load properly an extended XYZ file', function() {

        var loader = new Loader();

        var xyz = fs.readFileSync(path.join(__dirname, 'data', 'si8.xyz'), "utf8");
        var a = loader.loadXYZ(xyz);

        expect(a.get_cell()).to.deep.almost.equal([
            [5.44, 0, 0],
            [0, 5.44, 0],
            [0, 0, 5.44]
        ]);
        expect(a.get_array('spin')).to.deep.equal([1, 0, 0, 0, 0, 0, 0, 0]);
    });
    it('should load properly a CIF file', function() {

        var loader = new Loader();

        var cif = fs.readFileSync(path.join(__dirname, 'data', 'org.cif'), "utf8");
        var a = loader.loadCIF(cif)['1501936'];


        chai.expect(a.get_cell()).to.deep.almost.equal([
            [8.2302, 0.0, 0.0],
            [1.7507207912272031, 8.096583378263006, 0.0],
            [1.7848106706548383, 1.959874486240255, 12.914460443940394]
        ]);
    });
});