'use strict';

const expect = require('chai').expect;

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const nm = require('numeric');

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

describe('#atomimage', function () {
    it('should correctly compute the periodic copy position', function () {
        var aim = new AtomImage(chamodel, 0, [1, 0, 0]);
        [25.339775, 1.16060394, 1.8119109].forEach(function (v, i) {
            expect(aim.xyz[i]).to.be.closeTo(v, 1e-5);
        });

        aim = new AtomImage(chamodel, 0, [-1, 1, 1]);
        [-8.847725, 13.00350134, 16.5789109].forEach(function (v, i) {
            expect(aim.xyz[i]).to.be.closeTo(v, 1e-5);
        });
    });
});

describe('#model', function () {
    it('should correctly compute a supercell grid', function () {
        chamodel.supercell = [3, 3, 3];
        expect(chamodel.supercell_grid.length).to.be.equal(27);
    });

    it('should correctly compute the minimum supercell for given radii', function() {
        expect(orgmodel.minimumSupercell(5)).to.deep.equal([3, 3, 3]);
        expect(orgmodel.minimumSupercell(10)).to.deep.equal([5, 5, 3]);
        expect(orgmodel.minimumSupercell(20)).to.deep.equal([7, 7, 5]);
    });

    it('should correctly query for atoms in various ways', function () {
        // Here we only test the raw query functions, not meant for 
        // public use

        var found = pyrmodel._queryElements(['C']);
        expect(_.map(found, function (v) { return v[0]; })).to.deep.equal([0, 1, 2, 4, 5]);

    });
});