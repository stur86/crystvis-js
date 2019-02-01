var Atoms = require('crystcif-parse').Atoms;
var fs = require('fs');
var nm = require('numeric');

var cif = fs.readFileSync('CHA.cif', "utf8");
var a = Atoms.readCif(cif)['CHA'];

var c = a.get_cell();

console.log(c);
console.log(nm.dot(c, nm.transpose(c)));