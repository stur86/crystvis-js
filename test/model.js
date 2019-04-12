'use strict';

const expect = require('chai').expect;

const fs = require('fs');
const path = require('path');
const nm = require('numeric');

const Atoms = require('crystcif-parse').Atoms;
const Model = require('../lib/model.js').Model;
const AtomImage = require('../lib/model.js').AtomImage;

// Load a test file
var cif = fs.readFileSync(path.join(__dirname, 'data', 'CHA.cif'), "utf8");
var cha = Atoms.readCif(cif)['CHA'];
var chamodel = new Model(cha);

describe('#atomimage', function() {
    it('should correctly compute the periodic copy position', function() {
        var aim = new AtomImage(chamodel, 0, [1,0,0]);
        [25.339775, 1.16060394, 1.8119109].forEach(function(v, i) {
            expect(aim.xyz[i]).to.be.closeTo(v, 1e-5);
        });

        aim = new AtomImage(chamodel, 0, [-1,1,1]);
        [-8.847725, 13.00350134, 16.5789109].forEach(function(v, i) {
            expect(aim.xyz[i]).to.be.closeTo(v, 1e-5);
        });
    });
});

describe('#model', function() {
    it('should correctly compute a supercell grid', function() {
        chamodel.supercell = [3,3,3];
        expect(chamodel.supercell_grid.length).to.be.equal(27);
    });
})