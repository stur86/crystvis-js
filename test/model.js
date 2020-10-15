'use strict';

const expect = require('chai').expect;

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Atoms = require('crystcif-parse').Atoms;
const Model = require('../lib/model.js').Model;
const AtomImage = require('../lib/model.js').AtomImage;
const Loader = require('../lib/loader.js').Loader;

// Load test files
var cif = fs.readFileSync(path.join(__dirname, 'data', 'CHA.cif'), "utf8");
var cha = Atoms.readCif(cif)['CHA'];
var chamodel = new Model(cha);

cif = fs.readFileSync(path.join(__dirname, 'data', 'org.cif'), "utf8");
var org = Atoms.readCif(cif)['1501936'];
var orgmodel = new Model(org);

var xyz = fs.readFileSync(path.join(__dirname, 'data', 'pyridine.xyz'), "utf8");
var loader = new Loader();
var pyr = loader.loadXYZ(xyz);
var pyrmodel = new Model(pyr);

xyz = fs.readFileSync(path.join(__dirname, 'data', 'si8.xyz'), "utf8");
var loader = new Loader();
var si = loader.loadXYZ(xyz);
var simodel = new Model(si);

describe('#atomimage', function() {
    it('should correctly compute the periodic copy position', function() {
        var aim = new AtomImage(chamodel, 0, [1, 0, 0]);
        [25.339775, 1.16060394, 1.8119109].forEach(function(v, i) {
            expect(aim.xyz[i]).to.be.closeTo(v, 1e-5);
        });

        aim = new AtomImage(chamodel, 0, [-1, 1, 1]);
        [-8.847725, 13.00350134, 16.5789109].forEach(function(v, i) {
            expect(aim.xyz[i]).to.be.closeTo(v, 1e-5);
        });
    });
    it('should correctly identify equalities', function() {
        var ai0 = new AtomImage(chamodel, 0, [0, 0, 1]);
        var ai1 = new AtomImage(chamodel, 0, [0, 0, 1]);
        var ai2 = new AtomImage(chamodel, 0, [1, 0, 0]);
        var ai3 = new AtomImage(simodel,  0, [0, 0, 1]);

        expect(ai0.equals(ai1)).to.be.equal(true);
        expect(ai0.equals(ai2)).to.be.equal(false);
        expect(ai0.equals(ai3)).to.be.equal(false);
    });
});

describe('#model', function() {
    it('should correctly compute a supercell grid', function() {
        chamodel.supercell = [3, 3, 3];
        expect(chamodel.supercell_grid.length).to.be.equal(27);
    });

    it('should correctly compute the minimum supercell for given radii', function() {
        expect(orgmodel.minimumSupercell(5)).to.deep.equal([3, 3, 3]);
        expect(orgmodel.minimumSupercell(10)).to.deep.equal([5, 5, 3]);
        expect(orgmodel.minimumSupercell(20)).to.deep.equal([7, 7, 5]);
    });

    it('should correctly return its various properties', function() {
        expect(pyrmodel.length).to.equal(11);
        expect(chamodel.periodic).to.be.true;
        expect(pyrmodel.periodic).to.be.false;
        expect(simodel.periodic).to.be.true;
    });

    it('should correctly query for atoms in various ways', function() {
        // Here we only test the raw query functions, not meant for 
        // public use

        var found = pyrmodel._queryElements(['C']);
        expect(_.map(found, function(v) {
            return v[0];
        })).to.deep.equal([0, 1, 2, 4, 5]);

        found = chamodel._queryCell([5, 5, 5]); // Beyond the supercell size
        expect(found).to.deep.equal([]);

        found = chamodel._queryCell([1, 1, 1]);
        expect(found.length).to.equal(chamodel.length);
        expect(found[0][1]).to.deep.equal([1, 1, 1]);

        found = pyrmodel._queryBox([-1, -0.5, -2.3], [0, 0.5, 1.7]);
        found = _.sortBy(found, function(x) {
            return x[0];
        });
        expect(found).to.deep.equal([
            [0, [0, 0, 0]],
            [3, [0, 0, 0]],
            [6, [0, 0, 0]]
        ]);

        found = simodel._queryBox([-1.5, -1.5, -1.5], [1.5, 1.5, 1.5]);
        found = _.sortBy(found, function(x) {
            return x[0];
        });
        // Start like this because the supercell grid is limited
        expect(found).to.deep.equal([
            [0, [0, 0, 0]],
            [1, [0, 0, 0]],
        ]);

        // Expand and repeat
        simodel.supercell = [3, 3, 3];
        found = simodel._queryBox([-1.5, -1.5, -1.5], [1.5, 1.5, 1.5]);
        found = _.sortBy(found, function(x) {
            return x[0];
        });
        expect(found).to.deep.equal([
            [0, [0, 0, 0]],
            [1, [0, 0, 0]],
            [3, [-1, -1, 0]],
            [5, [-1, 0, -1]],
            [7, [0, -1, -1]]
        ]);

        found = simodel._querySphere([0, 0, 0], 2.4);
        found = _.sortBy(found, function(x) {
            return x[0];
        });

        expect(found).to.deep.equal([
            [0, [0, 0, 0]],
            [1, [0, 0, 0]],
            [3, [-1, -1, 0]],
            [5, [-1, 0, -1]],
            [7, [0, -1, -1]]
        ]);

        // Test a more complex query
        found = simodel.find(['$and',
            ['box', [0,0,0], [2,2,2]], 
            ['box', [1,1,1], [3,3,3]], 
        ]);

        expect(found.length).to.equal(1);
        expect(found[0].index).to.equal(1);

    });
});