'use strict';

/**
 * @fileoverview Function for loading CASTEP's Cell files
 * @package
 */

import _ from 'lodash';
import {
    Atoms
} from 'crystcif-parse';

function cellBlocks(lines) {
    const block_re = /%BLOCK\s+([A-Z_]+)/;
    const endblock_re = /%ENDBLOCK\s+([A-Z_]+)/;

    let blocks = {};
    _.forEach(lines, (l, i) => {
        let lu = l.toUpperCase();
        let ms = block_re.exec(lu);
        let me = endblock_re.exec(lu);


        if (ms) {
            if (ms[1] in blocks) {
                throw Error('Duplicated ' + ms[1] + ' block found');
            }
            blocks[ms[1]] = {start: i};
        } else if (me) {
            if (!(me[1] in blocks)) {
                throw Error('Block ' + me[1] + ' ends without starting');
            }

            blocks[me[1]]['end'] = i;
            // Assign the contents
            let i0 = blocks[me[1]].start;
            blocks[me[1]]['lines'] = lines.slice(i0+1, i);
        }
    });

    return blocks;
}

function load(contents, filename='cell') {

    // Split the file into lines
    let lines = _.split(contents, '\n');

    // Find blocks
    let blocks = cellBlocks(lines);

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

    let elems = [];
    let positions = [];

    let pblock = pabs? blocks['POSITIONS_ABS'].lines : blocks['POSITIONS_FRAC'].lines;

    pblock.forEach((l) => {
        l = _.trim(l).split(/\s+/);
        if (l.length < 4) 
            throw Error('Incomplete line in positions block');
        elems.push(l[0]);
        positions.push(l.slice(1,4).map(parseFloat));
    });
    
    var a = new Atoms(elems, positions, cell, {}, pfrac);

    var structs = {};
    structs[filename] = a;

    return structs;
}

export { load };