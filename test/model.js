'use strict';

const expect = require('chai').expect;

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Atoms = require('crystcif-parse').Atoms;
const Model = require('../lib/model.js').Model;
const ModelView = require('../lib/modelview.js').ModelView;
const AtomImage = require('../lib/model.js').AtomImage;
const Loader = require('../lib/loader.js').Loader;

// Load test files
var cif = fs.readFileSync(path.join(__dirname, 'data', 'CHA.cif'), "utf8");
var cha = Atoms.readCif(cif)['CHA'];
var chamodel = new Model(cha);
var chamodel3 = new Model(cha, [3, 3, 3]);

cif = fs.readFileSync(path.join(__dirname, 'data', 'org.cif'), "utf8");
var org = Atoms.readCif(cif)['1501936'];
var orgmodel = new Model(org);

var xyz = fs.readFileSync(path.join(__dirname, 'data', 'pyridine.xyz'), "utf8");
var loader = new Loader();
var pyr = loader.loadXYZ(xyz);
var pyrmodel = new Model(pyr);

xyz = fs.readFileSync(path.join(__dirname, 'data', 'si8.xyz'), "utf8");
var si = loader.loadXYZ(xyz);
var simodel = new Model(si);
var simodel3 = new Model(si, [3, 3, 3]);

xyz = fs.readFileSync(path.join(__dirname, 'data', 'H2O.xyz'), "utf8");
var h2o = loader.loadXYZ(xyz);
var h2omodel = new Model(h2o);

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
        var ai3 = new AtomImage(simodel, 0, [0, 0, 1]);

        expect(ai0.equals(ai1)).to.be.equal(true);
        expect(ai0.equals(ai2)).to.be.equal(false);
        expect(ai0.equals(ai3)).to.be.equal(false);
    });
    it('should correctly generate string IDs', function() {

        var ai = new AtomImage(chamodel, 2, [3, -1, 2]);

        expect(ai.id).to.equal('2_3_-1_2');
    });
    it('should correctly calculate its integer index', function() {

        for (var i = 0; i < simodel3.atoms.length; ++i) {
            var ai = simodel3.atoms[i];
            expect(ai.img_index).to.equal(i);
        }

    })
});

describe('#model', function() {

    it('should correctly compute a supercell grid', function() {
        expect(chamodel3.supercell_grid.length).to.be.equal(27);
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

    it('should behave gracefully in case of non-periodic systems', function() {
        expect(pyrmodel.cell).to.be.null;
    });

    it('should correctly query for atoms in various ways', function() {
        // Here we only test the raw query functions, not meant for 
        // public use

        var found = pyrmodel._queryElements(['C']);
        expect(found).to.deep.equal([0, 1, 2, 4, 5]);

        found = chamodel._queryCell([5, 5, 5]); // Beyond the supercell size
        expect(found).to.deep.equal([]);

        found = chamodel3._queryCell([1, 1, 1]);
        expect(found.length).to.equal(chamodel.length);
        expect(found[0]).to.equal(26 * chamodel.length);

        found = pyrmodel._queryBox([-1, -0.5, -2.3], [0, 0.5, 1.7]);
        found = _.sortBy(found, function(x) {
            return x[0];
        });
        expect(found).to.deep.equal([0, 3, 6]);

        found = simodel._queryBox([-1.5, -1.5, -1.5], [1.5, 1.5, 1.5]);
        expect(found).to.deep.equal([0, 1]);

        // Bigger supercell
        found = simodel3._queryBox([-1.5, -1.5, -1.5], [1.5, 1.5, 1.5]);
        expect(found).to.deep.equal([11, 29, 79, 104, 105]);

        found = simodel3._querySphere([0, 0, 0], 2.4);
        // found = _.sortBy(found, function(x) {
        //     return x[0];
        // });
        expect(found).to.deep.equal([11, 29, 79, 104, 105]);

        // Using an atom as the centre
        found = simodel._querySphere(simodel.atoms[0], 2.4);
        expect(found).to.deep.equal([0, 1]);

        // Test a more complex query
        found = simodel3.find(['$and', ['box', [0, 0, 0],
                [2, 2, 2]
            ],
            ['box', [1, 1, 1],
                [3, 3, 3]
            ],
        ]);

        expect(found.length).to.equal(1);
        expect(found.atoms[0].index).to.equal(1);

    });

    it('should identify the right bonds', function() {

        var bonds = h2omodel._bondmat;

        expect(bonds[0][1]).to.deep.equal([
            [0, 0, 0]
        ]);
        expect(bonds[0][2]).to.deep.equal([
            [0, 0, 0]
        ]);
        expect(bonds[3][4]).to.deep.equal([
            [0, 0, -1]
        ]);
        expect(bonds[3][5]).to.deep.equal([
            [0, -1, -1]
        ]);

    });

    it('should identify the right molecules', function() {

        expect(h2omodel._molinds).to.deep.equal([0, 0, 0, 1, 1, 1]);
    });
});

describe('#modelview', function() {

    it('should correctly AND two successive queries', function() {

        var mv1 = h2omodel.find(['cell', [0, 0, 0]]);
        var mv2 = mv1.find(['elements', 'O']);
        expect(mv2.indices).to.deep.equal([0, 3]);

    });

    it('should correctly perform boolean operations between views', function() {

        var mv1 = h2omodel.find(['elements', 'O']);
        var mv2 = h2omodel.find(['elements', 'H']);
        var mv3 = h2omodel.find(['sphere', [0, 0, 0], 1]);

        var mvAnd = mv1.and(mv2);
        expect(mvAnd.length).to.equal(0);

        var mvOr = mv1.or(mv2);
        expect(mvOr.indices.sort()).to.deep.equal([0, 1, 2, 3, 4, 5]);

        var mvXor = mv1.xor(mv3);
        expect(mvXor.indices.sort()).to.deep.equal([1, 2, 3]);

        var mvNot = mv3.not();
        expect(mvNot.indices.sort()).to.deep.equal([3, 4, 5]);

        // Throw exception
        var mvSi = simodel.find(['all']);

        expect(function() {
            mv1.and(mvSi);
        }).to.throw('The two ModelViews do not refer to the same Model');       

    });

});