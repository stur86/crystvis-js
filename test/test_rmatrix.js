'use strict';

var expect = require('chai').expect;

const Atoms = require('crystcif-parse').Atoms;
const path = require('path');
const fs = require('fs');
var nm = require('numeric');

var cif = fs.readFileSync(path.join(__dirname, 'CHA.cif'), "utf8");
var a = Atoms.readCif(cif)['CHA'];

var c = new nm.T(a.get_cell());
var rmat = c.dot(c.transpose());

console.log(rmat);
// console.log(nm.dot(c, nm.transpose(c)));