'use strict';

/**
 * @fileoverview Function for loading CASTEP's Cell files
 * @module
 */

import _ from 'lodash';
import {
    Atoms
} from '@ccp-nc/crystcif-parse';

function cellBlocks(lines, units={}) {
    const block_re = /%BLOCK\s+([A-Z_]+)/;
    const endblock_re = /%ENDBLOCK\s+([A-Z_]+)/;

    let blocks = {};
    _.forEach(lines, (l, i) => {

        let lu = l.toUpperCase();
        let ms = block_re.exec(lu);
        let me = endblock_re.exec(lu);

        if (ms) {
            let name = ms[1].toUpperCase();
            if (name in blocks) {
                throw Error('Duplicated ' + name + ' block found');
            }
            blocks[name] = {start: i};
        } else if (me) {
            let name = me[1].toUpperCase();
            if (!(name in blocks)) {
                throw Error('Block ' + name + ' ends without starting');
            }

            blocks[name]['end'] = i;
            // Assign the contents
            let i0 = blocks[name].start;
            // Identify any units
            let ul = lines[i0+1].trim().toLowerCase();
            if (units[name] && (ul === units[name] || units[name].includes(ul))) {
                i0 += 1;
                blocks[name]['units'] = ul;
            }
            blocks[name]['lines'] = lines.slice(i0+1, i);
        }
    });

    return blocks;
}

function load(contents, filename='cell') {

    // Split the file into lines
    let lines = _.split(contents, '\n');

    // Admissible units
    const units = {
        'LATTICE_CART':  ['ang', 'bohr'],
        'LATTICE_ABC':   ['ang', 'bohr'],
        'POSITIONS_ABS': ['ang', 'bohr'],
    };
    // conversion factors
    const unit_conv = {
        'ang': 1.0,
        'bohr': 0.5291772108 // CODATA 2002
    };

    // Find blocks
    let blocks = cellBlocks(lines, units);

    let pabs = ('POSITIONS_ABS' in blocks);
    let pfrac = ('POSITIONS_FRAC' in blocks);
    let ccart = ('LATTICE_CART' in blocks);
    let cabc = ('LATTICE_ABC' in blocks);

    switch(pabs+pfrac) {
        case 0:
            throw Error('No positions block found');
        case 2:
            throw Error('Duplicated positions blocks found');
        default:
            break;
    }

    switch(ccart+cabc) {
        case 0:
            throw Error('No lattice block found');
        case 2:
            throw Error('Duplicated lattice blocks found');
        default:
            break;
    }

    // Parse the cell
    let cell = ccart? blocks['LATTICE_CART'].lines : blocks['LATTICE_ABC'].lines;
    cell = cell.map((l) => (_.trim(l).split(/\s+/).map(parseFloat)));

    // Scale cell by units
    if (ccart) {
        let u = blocks['LATTICE_CART']['units'] || 'ang';
        cell = cell.map((l) => (l.map((x) => (x*unit_conv[u]))));
    }
    else if (cabc) {
        let u = blocks['LATTICE_ABC']['units'] || 'ang';
        // scale just the first row by units
        cell[0] = cell[0].map((x) => (x*unit_conv[u]));
    }

    let elems = [];
    let positions = [];

    let pblock = pabs? blocks['POSITIONS_ABS'].lines : blocks['POSITIONS_FRAC'].lines;

    pblock.forEach((l) => {
        l = _.trim(l).split(/\s+/);
        if (l.length < 4) 
            throw Error('Incomplete line in positions block');
        elems.push(l[0]);
        positions.push(l.slice(1,4).map(parseFloat));
        // scale by units if in absolute units
        if (pabs) {
            // if units is not defined, assume angstroms
            let u = blocks['POSITIONS_ABS']['units'] || 'ang';
            positions[positions.length-1] = positions[positions.length-1].map((x) => (x*unit_conv[u]));
        }
    });
    
    var a = new Atoms(elems, positions, cell, {}, pfrac);

    var structs = {};
    structs[filename] = a;

    return structs;
}

export { load };