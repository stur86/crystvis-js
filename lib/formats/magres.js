'use strict';

/**
 * @fileoverview Function for loading Magres files
 * @package
 */

import _ from 'lodash';
import {
    Atoms
} from 'crystcif-parse';
import {
    TensorData
} from '../tensor.js';

const MagresUnits = {
    length: {
        ang: 1.0,
        Angstrom: 1.0
    },
    sus: {
        '10^-6.cm^3.mol^-1': 1.0
    },
    ms: {
        ppm: 1.0
    },
    efg: {
        au: 1.0
    },
    isc: {
        '10^19.T^2.J^-1': 1.0
    }
};

// Magres parsing utility functions
function parseNoAtomLine(line, units) {
    // Assumed to be just nine numbers, a full 3x3 matrix.
    // Used for susceptibility
    let tens = [];
    for (let i = 0; i < 3; ++i) {
        tens.push([]);
        for (let j = 0; j < 3; ++j) {
            tens[i].push(parseFloat(line[3 * i + j]) * units);
        }
    }

    return new TensorData(tens);
}

function parseOneAtomLine(line, units, labels) {
    // Species label + index, then nine numbers
    let sp = line[0];
    let sp_i = parseInt(line[1]);
    let i = _.findIndex(labels, function(x) {
        return (x[0] == sp) && (x[1] == sp_i);
    });
    let ltrim = Array.from(line).splice(2);

    let ans = {
        i: i,
        tens: parseNoAtomLine(ltrim, units)
    }

    return ans;
}

function parseTwoAtomLine(line, units, labels) {
    let sp1 = line[0]
    let sp1_i = parseInt(line[1]);
    let i1 = _.findIndex(labels, function(x) {
        return (x[0] == sp1) && (x[1] == sp1_i);
    });
    let ltrim = Array.from(line).splice(2);

    let ans = parseOneAtomLine(ltrim, units, labels);

    ans = {
        i1: i1,
        i2: ans.i,
        tens: ans.tens
    };

    return ans;
}

const MagresParsers = {
    sus: parseNoAtomLine,
    ms: parseOneAtomLine,
    efg: parseOneAtomLine,
    isc: parseTwoAtomLine
};

function load(contents, filename) {

    const known_blocks = ['atoms', 'magres'];

    let lines = _.split(contents, '\n');

    // First line contains version
    let v_re = /#\$magres-abinitio-v([0-9]+\.[0-9]+)/;
    let v_match = lines[0].match(v_re);

    if (!v_match) {
        throw Error('Invalid Magres file format: no version line');
    }
    let version = v_match[1];

    // Start by identifying blocks
    let blocks = {};
    let b_re = /\[(\/)?([a-zA-Z_]+)\]/;
    let block_name = null;
    let block_lines = [];

    for (let i = 1; i < lines.length; ++i) {
        let b_match = lines[i].match(b_re);
        if (b_match) {
            // Start or end?
            if (b_match[1] == '/') {
                if (b_match[2] == block_name) {
                    // End block
                    blocks[block_name] = block_lines;
                    block_name = null;
                    block_lines = [];
                } else {
                    throw Error('Invalid Magres file format: block closed without opening');
                }
            } else {
                if (block_name) {
                    throw Error('Invalid Magres file format: block opened without closing');
                }
                block_name = b_match[2];
            }
        } else if (block_name) {
            block_lines.push(lines[i]);
        }
    }

    // Process each block
    for (let bname in blocks) {
        let block = blocks[bname];

        if (!known_blocks.includes(bname)) {
            // We don't know this block
            blocks[bname] = _.join(block, '\n');
            continue;
        }

        let data = {};

        for (let i = 0; i < block.length; ++i) {
            let l = block[i];
            let lspl = _.trim(l).split(/\s+/);
            // Is it a 'units' line?
            if (lspl[0] == 'units') {
                let tag = lspl[1];
                if (tag in data) {
                    throw Error('Invalid Magres file format: units specified after tag ' + tag + ' has been used');
                }
                data[tag] = {
                    'units': lspl[2],
                    'lines': []
                };
            } else {
                let tag = lspl[0];
                if (!(tag in data)) {
                    data[tag] = {
                        'units': null,
                        'lines': []
                    };
                }
                data[tag].lines.push(lspl.splice(1));
            }
        }

        blocks[bname] = data;

    }

    // Now on to read the blocks themselves

    let ablock = blocks.atoms;

    if (!ablock) {
        throw Error('Invalid Magres file format: does not contain atoms block');
    }

    // Read in the cell, if present
    let cell = null;
    if ('lattice' in ablock) {
        let u = 1.0;
        let uname = ablock.lattice.units;
        if (uname) {
            u = MagresUnits.length[uname];
            if (!u) {
                throw Error('Invalid Magres file format: invalid units for cell');
            }
        }
        cell = [];
        let line = Array.from(ablock.lattice.lines[0]);
        for (let i = 0; i < 3; ++i) {
            cell.push(_.map(line.splice(0, 3), function(x) {
                return parseFloat(x) * u;
            }));
        }
    }

    // Read in the atom positions and species
    let elems = [];
    let pos = [];
    let labels = [];

    if ('atom' in ablock) {
        let u = 1.0;
        let uname = ablock.atom.units;
        if (uname) {
            u = MagresUnits.length[uname];
            if (!u) {
                throw Error('Invalid Magres file format: invalid units for atom');
            }
        }

        for (let i = 0; i < ablock.atom.lines.length; ++i) {
            let l = ablock.atom.lines[i];
            elems.push(l[0]);
            labels.push([l[1], parseInt(l[2])]);
            pos.push(_.map(l.splice(3), function(x) {
                return parseFloat(x) * u;
            }));
        }

    } else {
        throw Error('Invalid Magres file format: no atom position data found');
    }

    // Create atoms object
    let atoms = new Atoms(elems, pos, cell, {
        'magres-blocks': blocks,
        'magres-version': version,
    });
    // Add array
    atoms.set_array('magres-labels', labels);
    let N = elems.length;

    // Now for the magres stuff
    let mblock = blocks.magres;

    if (mblock) {

        for (let tag in mblock) {
            let tag_type = tag.split('_')[0];

            let u = 1.0;
            let uname = mblock[tag].units;
            if (uname) {
                u = MagresUnits[tag_type][uname];
                if (!u) {
                    throw Error('Invalid Magres file format: invalid units for ' + tag);
                }
            }

            // Initialise as dictionary
            let tag_dimension;
            let tag_data;
            switch (MagresParsers[tag_type]) {
                case parseNoAtomLine:
                    tag_dimension = 0;
                    break;
                case parseOneAtomLine:
                    tag_dimension = 1;
                    tag_data = new Array(N);
                    break;
                case parseTwoAtomLine:
                    tag_dimension = 2;
                    tag_data = _.times(N, function() {
                        return new Array(N);
                    });
            }

            for (let i = 0; i < mblock[tag].lines.length; ++i) {
                let l = mblock[tag].lines[i];
                let data = MagresParsers[tag_type](l, u, labels);
                switch (tag_dimension) {
                    case 0:
                        tag_data = data;
                        break;
                    case 1:
                        tag_data[data.i] = data.tens;
                        break;
                    case 2:
                        tag_data[data.i1][data.i2] = data.tens;
                        tag_data[data.i2][data.i1] = data.tens;
                        break;
                }
            }

            if (tag_dimension == 0) {
                atoms.info[tag] = tag_data;
            } else {
                atoms.set_array(tag, tag_data);
            }

        }

    }

    filename = filename || 'magres';
    let structs = {};
    structs[filename] = atoms;

    return structs;
}

export {
    load
};