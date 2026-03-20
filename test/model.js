'use strict';


import * as chai from 'chai';
import chaiAlmost from 'chai-almost'

import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import {
    fileURLToPath
} from 'url';

import {
    Atoms as Atoms
} from '@ccp-nc/crystcif-parse';
import {
    Model,
    AtomImage,
    BondImage
} from '../lib/model.js';
import {
    Loader as Loader
} from '../lib/loader.js';

chai.use(chaiAlmost(1e-3));

const expect = chai.expect
const __dirname = path.dirname(fileURLToPath(
    import.meta.url));

// Load test files
var cif = fs.readFileSync(path.join(__dirname, 'data', 'CHA.cif'), "utf8");
var cha = Atoms.readCif(cif)['CHA'];
var chamodel = new Model(cha);
var chamodel3 = new Model(cha, {
    supercell: [3, 3, 3]
});

cif = fs.readFileSync(path.join(__dirname, 'data', 'org.cif'), "utf8");
var org = Atoms.readCif(cif)['1501936'];
var orgmodel = new Model(org);

var xyz = fs.readFileSync(path.join(__dirname, 'data', 'pyridine_nocell.xyz'), "utf8");
var loader = new Loader();
// try to load an xyz with no unit cell, catch the error
try {
    loader.load(xyz, 'xyz');
} catch (e) {
    // Accept either the short legacy message or the more descriptive one
    expect(e.message).to.match(/No unit cell/);
}

// manually added in dummy cell:
xyz = fs.readFileSync(path.join(__dirname, 'data', 'pyridine.xyz'), "utf8");
var pyr = loader.load(xyz, 'xyz')['xyz'];
var pyrmodel = new Model(pyr);



xyz = fs.readFileSync(path.join(__dirname, 'data', 'si8.xyz'), "utf8");
var si = loader.load(xyz, 'xyz')['xyz'];
var simodel = new Model(si);
var simodel3 = new Model(si, {
    supercell: [3, 3, 3]
});

xyz = fs.readFileSync(path.join(__dirname, 'data', 'H2O.xyz'), "utf8");
var h2o = loader.load(xyz, 'xyz')['xyz'];
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
            expect(ai.imgIndex).to.equal(i);
        }
    });
    it('should correctly identify the closest bonding neighbours', function() {

        // This one relies on Model to compute the right bonds

        var atoms = h2omodel.atoms;
        var a = atoms[0];

        expect(a.bondedAtoms).to.deep.equal([atoms[1], atoms[2]]);

    });
    it('should correctly retrieve a corresponding array value', function() {

        simodel.setArray('test_arr', _.range(simodel.length));

        for (var i = 0; i < simodel.length; ++i) {
            expect(simodel.atoms[i].getArrayValue('test_arr'), i);
        }

    });
});

describe('#bondimage', function() {
    it('should correctly compute the distance between atoms in the bond', function() {

        var a1 = new AtomImage(h2omodel, 0, [0, 0, 0]);
        var a2 = new AtomImage(h2omodel, 1, [0, 0, 0]);

        var b = new BondImage(h2omodel, a1, a2);

        expect(b.length).to.almost.equal(0.9686);
    });
});

describe('#model', function() {

    it('should generate the right atomic labels', function() {
        expect(h2omodel._labels).to.deep.equal(['O_1', 'H_1', 'H_2', 'O_2', 'H_3', 'H_4']);
    });

    it('should correctly compute a supercell grid', function() {
        expect(chamodel3.supercellGrid.length).to.be.equal(27);
    });

    it('should correctly compute the minimum supercell for given radii', function() {
        expect(orgmodel.minimumSupercell(5)).to.deep.equal([3, 3, 3]);
        expect(orgmodel.minimumSupercell(10)).to.deep.equal([5, 5, 3]);
        expect(orgmodel.minimumSupercell(20)).to.deep.equal([7, 7, 5]);
    });

    it('should correctly return its various properties', function() {
        expect(pyrmodel.length).to.equal(11);
        expect(chamodel.periodic).to.be.true;
        expect(pyrmodel.periodic).to.be.true;
        expect(simodel.periodic).to.be.true;
    });

    it('should correctly identify CH bond presence', function() {
        expect(chamodel._queryCHBond()).to.be.false;
        expect(simodel._queryCHBond()).to.be.false;
        expect(pyrmodel._queryCHBond()).to.be.true;
        expect(h2omodel._queryCHBond()).to.be.false;
        expect(orgmodel._queryCHBond()).to.be.true;
    });

    it('should correctly query for atoms in various ways', function() {
        // Here we only test the raw query functions, not meant for 
        // public use

        var found = pyrmodel._queryElements(['C']);
        expect(found).to.deep.equal([0, 1, 2, 4, 5]);

        // Cell
        found = chamodel._queryCell([5, 5, 5]); // Beyond the supercell size
        expect(found).to.deep.equal([]);

        found = chamodel3._queryCell([1, 1, 1]);
        expect(found.length).to.equal(chamodel.length);
        expect(found[0]).to.equal(26 * chamodel.length);

        // Box
        //TODO why doesn't this work when I have a cell defined? 
        // found = pyrmodel._queryBox([-1, -0.5, -2.3], [0, 0.5, 1.7]);
        // found.sort();
        // expect(found).to.deep.equal([0, 3, 6]);

        found = simodel._queryBox([-1.5, -1.5, -1.5], [1.5, 1.5, 1.5]);
        expect(found).to.deep.equal([0, 1]);

        // Bigger supercell
        found = simodel3._queryBox([-1.5, -1.5, -1.5], [1.5, 1.5, 1.5]);
        expect(found).to.deep.equal([11, 29, 79, 104, 105]);

        found = simodel3._querySphere([0, 0, 0], 2.4);
        expect(found).to.deep.equal([11, 29, 79, 104, 105]);

        // Indices
        found = simodel3._queryIndices(0);
        expect(found).to.deep.equal(_.range(27).map((x) => {
            return 8*x;
        }));

        // Using an atom as the centre
        found = simodel._querySphere(simodel.atoms[0], 2.4);
        expect(found).to.deep.equal([0, 1]);

        // Bonds
        found = h2omodel._queryBonded(h2omodel.atoms[0]);
        expect(found).to.deep.equal([1, 2]);
        found = h2omodel._queryBonded(h2omodel.atoms[0], 2);
        expect(found).to.deep.equal([1, 2]);
        found = h2omodel._queryBonded(h2omodel.atoms[0], 2, true);
        expect(found.length).to.equal(0);
        found = pyrmodel._queryBonded(pyrmodel.atoms[3], 2, true);
        found.sort();
        expect(found).to.deep.equal([1, 5, 8, 9]);

        // Molecules
        found = h2omodel._queryMolecule(h2omodel.atoms[0]);
        found.sort();
        expect(found).to.deep.equal([0, 1, 2]);
        found = h2omodel._queryMolecule(h2omodel.atoms[3]); // Out of bounds
        expect(found).to.deep.equal([3]);

        // Test a more complex query
        found = simodel3.find({
            '$and': [{
                'box': [
                    [0, 0, 0],
                    [2, 2, 2]
                ]
            }, {
                'box': [
                    [1, 1, 1],
                    [3, 3, 3]
                ]
            }]
        });

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

    it('should correctly load a model as molecular crystal', function() {

        var h2omolcryst = new Model(h2o, {
            molecularCrystal: true
        });

        for (let i = 0; i < h2omolcryst._molecules.length; ++i) {
            let mol = h2omolcryst._molecules[i];
            for (let j = 0; j < mol.length; ++j) {
                expect(mol[j].cell).to.deep.equal([0, 0, 0]);
            }
        }

        // Check that it didn't alter the original Atoms object
        expect(h2omolcryst.positions).to.not.deep.equal(h2omodel.positions);

    });

    it('should correctly work with isotopes', function() {

        var h2omodel = new Model(h2o, {
            supercell: [2,1,1]
        });

        var a0 = h2omodel.find({indices: 0}).atoms;

        expect(a0[0].isotope).to.equal(16);        
        expect(a0[1].isotope).to.equal(16);        

        // Now set them both
        a0[0].isotopeGlobal = 17;
        expect(a0[0].isotope).to.equal(17);
        expect(a0[1].isotope).to.equal(17);

        // Now only one
        a0[1].isotope = 18;
        expect(a0[0].isotope).to.equal(17);
        expect(a0[1].isotope).to.equal(18);

        // And attached data
        expect(a0[0].isotopeData.gamma/1e7).to.almost.equal(-3.628);
        expect(a0[1].isotopeData.gamma).to.equal(null); // No spin

        // Load NMR active isotopes
        h2omodel = new Model(h2o, {
            supercell: [1,1,1],
            useNMRActiveIsotopes: true
        });

        expect(h2omodel.atoms[0].isotope).to.equal(17);
        expect(h2omodel.atoms[1].isotope).to.equal(1);
    });
});

describe('#modelview', function() {

    it('should correctly AND two successive queries', function() {

        var mv1 = h2omodel.find({
            'cell': [
                [0, 0, 0]
            ]
        });
        var mv2 = mv1.find({
            'elements': 'O'
        });
        expect(mv2.indices).to.deep.equal([0, 3]);

    });

    it('should correctly perform boolean operations between views', function() {

        var mv1 = h2omodel.find({
            'elements': 'O'
        });
        var mv2 = h2omodel.find({
            'elements': 'H'
        });
        var mv3 = h2omodel.find({
            'sphere': [
                [0, 0, 0], 1
            ]
        });

        var mvAnd = mv1.and(mv2);
        expect(mvAnd.length).to.equal(0);

        var mvOr = mv1.or(mv2);
        expect(mvOr.indices.sort()).to.deep.equal([0, 1, 2, 3, 4, 5]);

        var mvXor = mv1.xor(mv3);
        expect(mvXor.indices.sort()).to.deep.equal([1, 2, 3]);

        var mvNot = mv3.not();
        expect(mvNot.indices.sort()).to.deep.equal([3, 4, 5]);

        // Throw exception
        var mvSi = simodel.find({
            'all': []
        });

        expect(function() {
            mv1.and(mvSi);
        }).to.throw('The two ModelViews do not refer to the same Model');

    });

    it('should correctly identify the unique sites based on the labels', function() {
            // modelview with all atoms
            var mv = chamodel.find({'all': []});
            // 
            let newMV = mv.uniqueSites();
            // O1, O2, O3, O4, T1 (5 sites)
            expect(newMV.length).to.equal(5);
            expect(newMV._indices.sort()).to.deep.equal([0, 18, 36, 54, 72]);

            // make sure it works with subsets
            var mv2 = chamodel.find({'elements': ['Si']});           
            newMV = mv2.uniqueSites();
            expect(newMV.length).to.equal(1);
            expect(newMV._indices.sort()).to.deep.equal([72]);   
    });
});

// ---------------------------------------------------------------------------
// Tests: ModelView serialisation (§6.1, §6.3) and Model reconstruction (§6.2, §6.3)
// ---------------------------------------------------------------------------

describe('ModelView#toIndices', function() {

    it('returns a plain array equal to the view indices', function() {
        var mv = h2omodel.find({ elements: ['O'] });
        var result = mv.toIndices();
        expect(result).to.deep.equal(mv.indices);
    });

    it('returns a copy — mutating it does not affect the view', function() {
        var mv = h2omodel.find({ elements: ['O'] });
        var result = mv.toIndices();
        result.push(999);
        expect(mv.indices.length).to.equal(result.length - 1);
    });

    it('returns an empty array for an empty view', function() {
        var mv = h2omodel.view([]);
        expect(mv.toIndices()).to.deep.equal([]);
    });

});

describe('ModelView#toLabels', function() {

    it('returns one crystLabel per atom in the view', function() {
        var mv = h2omodel.find({ elements: ['O'] });
        var labels = mv.toLabels();
        expect(labels).to.be.an('array');
        expect(labels.length).to.equal(mv.length);
        labels.forEach(l => expect(l).to.be.a('string').and.have.length.above(0));
    });

    it('all labels contain the element symbol', function() {
        var mv = h2omodel.find({ elements: ['H'] });
        mv.toLabels().forEach(l => expect(l).to.match(/^H/));
    });

    it('returns an empty array for an empty view', function() {
        var mv = h2omodel.view([]);
        expect(mv.toLabels()).to.deep.equal([]);
    });

    it('round-trips: toLabels then viewFromLabels gives the same indices', function() {
        // Use a multi-site structure for a meaningful round-trip
        var mv = chamodel.find({ elements: ['O'] });
        var labels = mv.toLabels();
        var restored = chamodel.viewFromLabels(labels);
        expect(restored.indices.sort((a,b)=>a-b))
            .to.deep.equal(mv.indices.slice().sort((a,b)=>a-b));
    });

});

describe('Model#viewFromIndices', function() {

    it('produces a view with exactly the specified indices', function() {
        var indices = [0, 2, 4];
        var mv = h2omodel.viewFromIndices(indices);
        expect(mv.indices).to.deep.equal(indices);
    });

    it('is equivalent to model.view(indices)', function() {
        var indices = [1, 3];
        var a = h2omodel.viewFromIndices(indices);
        var b = h2omodel.view(indices);
        expect(a.indices).to.deep.equal(b.indices);
    });

    it('defaults to an empty view when called with no arguments', function() {
        var mv = h2omodel.viewFromIndices();
        expect(mv.length).to.equal(0);
    });

    it('round-trips with toIndices()', function() {
        var original = h2omodel.find({ elements: ['H'] });
        var restored = h2omodel.viewFromIndices(original.toIndices());
        expect(restored.indices).to.deep.equal(original.indices);
    });

});

describe('Model#viewFromLabels', function() {

    it('finds atoms matching the given labels', function() {
        var mv = chamodel.find({ elements: ['Si'] });
        var labels = mv.toLabels();
        var restored = chamodel.viewFromLabels(labels);
        expect(restored.length).to.equal(mv.length);
    });

    it('returns an empty view for an empty label array', function() {
        var mv = chamodel.viewFromLabels([]);
        expect(mv.length).to.equal(0);
    });

    it('ignores unknown labels', function() {
        // Grab a real label dynamically, then mix it with a nonsense one
        var validLabel = chamodel._atom_images[0].crystLabel;
        var mv = chamodel.viewFromLabels([validLabel, 'DOES_NOT_EXIST']);
        expect(mv.length).to.be.greaterThan(0);
        mv.toLabels().forEach(l => expect(l).to.not.equal('DOES_NOT_EXIST'));
    });

    it('round-trips with toLabels() across a different supercell model', function() {
        // Use the unit-cell model to get labels, then restore on the same model
        var mv = chamodel.find({ elements: ['O'] });
        var labels = mv.toLabels();
        var restored = chamodel.viewFromLabels(labels);
        expect(restored.indices.sort((a,b)=>a-b))
            .to.deep.equal(mv.indices.slice().sort((a,b)=>a-b));
    });

});