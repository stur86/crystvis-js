'use strict';

/**
 * @fileoverview Function for loading Magres files
 * @module
 */

import _ from 'lodash';
import {
    Atoms
} from '@ccp-nc/crystcif-parse';
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
    // CASTEP <22.1.1 has a bug where species with in in-species index >99 
    // runs into the species label.
    // To handle those cases, we need to check if the species label has
    // an integer >99 at the end, and if so, remove it from the label
    // and add it to the index.
    
    // use regex to find any integer at the end of the species label
    let sp_re = /([a-zA-Z]+)([0-9]+)$/;
    let sp_match = sp.match(sp_re);
    if (sp_match) {
        // if the integer is >99 and the line has 10 elements instead of 11, 
        // remove it from the label and add it to the index
        let rogue_int = parseInt(sp_match[2]);
        if (rogue_int > 99 && line.length == 10) {
            console.log(`
            Badly formatted .magres file. 
            A line has a species label with an integer >99 at the end, 
            which suggests a writing-overflow (known bug in CASTEP). 
            e.g. 'Fe100' instead of 'Fe 100'.
            The integer has been removed from the label and added to the index.
            `)
            
            sp = sp_match[1];
            // insert the rogue integer into 
            // the line array at the correct position
            line.splice(1, 0, rogue_int);
        }
    }


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

/**
 * Parse the magres_old block to extract hyperfine (HF) tensors and the
 * magnetogyric ratios table.
 *
 * The magres_old block is free-text output produced by older CASTEP versions.
 * Each atom section looks like:
 *
 *   ============
 *   Atom: H        1
 *   ============
 *   H        1 Coordinates  ...
 *
 *   TOTAL tensor
 *
 *      a11   a12   a13
 *      a21   a22   a23
 *      a31   a32   a33
 *
 *   H        1 Eigenvalue  A_xx  ...
 *   ...
 *   H        1 Iso:  ... (MHz)
 *
 * The tensor values are in MHz.
 *
 * The header table looks like either:
 *   H      Isotope   1             GAMMA =  2.6752E+08 rad T-1 s-1
 *   H:Mu    User defined.            GAMMA =  8.5162E+08 rad T-1 s-1
 *
 * @param {string}  text        Contents of the magres_old block
 * @param {Array}   mlabels     Array of [species, index] pairs for each atom
 * @param {int}     N           Number of atoms
 * @returns {Object}            { hf_data: Array<TensorData|null>,
 *                                gamma_ratios: Object<string, {isotope, gamma}> }
 */
function parseMagresOldBlock(text, mlabels, N) {
    const lines = text.split('\n');
    const hf_data = new Array(N).fill(null);
    const gamma_ratios = {};   // species label → { isotope: int|null, gamma: float }

    let current_sp = null;
    let current_idx = null;
    // 'idle' | 'reading_rows' | 'waiting_eigenvalue_label'
    let state = 'idle';
    let tensor_rows = [];
    let pending_tensor = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Parse magnetogyric ratio table lines:
        //   "H      Isotope   1             GAMMA =  2.6752E+08 rad T-1 s-1"
        //   "H:Mu    User defined.            GAMMA =  8.5162E+08 rad T-1 s-1"
        const gamma_iso_match = line.match(/^(\S+)\s+Isotope\s+(\d+)\s+GAMMA\s*=\s*([+-]?[\d.]+E[+-]?\d+)/i);
        if (gamma_iso_match) {
            gamma_ratios[gamma_iso_match[1]] = {
                isotope: parseInt(gamma_iso_match[2]),
                gamma: parseFloat(gamma_iso_match[3])
            };
            continue;
        }
        const gamma_user_match = line.match(/^(\S+)\s+User defined\.\s+GAMMA\s*=\s*([+-]?[\d.]+E[+-]?\d+)/i);
        if (gamma_user_match) {
            gamma_ratios[gamma_user_match[1]] = {
                isotope: null,
                gamma: parseFloat(gamma_user_match[2])
            };
            continue;
        }

        // Look for "Atom: ELEM INDEX"
        const atom_match = line.match(/^Atom:\s+(\S+)\s+(\d+)$/);
        if (atom_match) {
            current_sp = atom_match[1];
            current_idx = parseInt(atom_match[2]);
            state = 'idle';
            tensor_rows = [];
            pending_tensor = null;
            continue;
        }

        // Look for the "TOTAL tensor" header (exact match – not "TOTAL Shielding Tensor" etc.)
        if (line === 'TOTAL tensor') {
            state = 'reading_rows';
            tensor_rows = [];
            pending_tensor = null;
            continue;
        }

        if (state === 'reading_rows' && current_sp !== null) {
            if (line === '') continue;

            const parts = line.split(/\s+/).filter(s => s !== '');
            const nums = parts.map(parseFloat);

            if (nums.length === 3 && nums.every(n => !isNaN(n))) {
                tensor_rows.push(nums);
                if (tensor_rows.length === 3) {
                    // Matrix complete – wait for Eigenvalue label to confirm it's HF
                    pending_tensor = tensor_rows.slice();
                    state = 'waiting_eigenvalue_label';
                    tensor_rows = [];
                }
            } else {
                // Unexpected non-numeric line – abort
                state = 'idle';
                tensor_rows = [];
            }
            continue;
        }

        if (state === 'waiting_eigenvalue_label' && current_sp !== null) {
            if (line === '') continue;

            // Look for "SPECIES INDEX Eigenvalue LABEL VALUE"
            // HF tensors use A_xx / A_yy / A_zz.
            // EFG uses V_xx, shielding uses sigma_xx – we skip those.
            const eval_match = line.match(/Eigenvalue\s+(\S+)/);
            if (eval_match) {
                const label = eval_match[1]; // e.g. A_xx, V_xx, sigma_xx
                if (label.startsWith('A_')) {
                    // Confirmed hyperfine – store the tensor
                    const idx = _.findIndex(mlabels, x =>
                        x[0] === current_sp && x[1] === current_idx
                    );
                    if (idx >= 0) {
                        hf_data[idx] = new TensorData(pending_tensor);
                    }
                }
                // Any other label (V_xx, sigma_xx, …) – silently discard
                state = 'idle';
                pending_tensor = null;
            }
            // Non-eigenvalue lines (could be blank) – keep waiting
            continue;
        }
    }

    return { hf_data, gamma_ratios };
}

function load(contents, filename='magres') {

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
    let b_alt_re = /<(\/)?([a-zA-Z_]+)>/;   // Alternative version (old magres tags)
    let mtagtype_detected = false;          // Have we found out which type of tags are used?
    let block_name = null;
    let block_lines = [];

    for (let i = 1; i < lines.length; ++i) {

        let b_match = lines[i].match(b_re);

        if (!mtagtype_detected) {
            let b_alt_match = lines[i].match(b_alt_re);
            if (b_alt_match) {
                mtagtype_detected = true;
                b_re = b_alt_re;
                b_match = b_alt_match;
            }
            else if (b_match) {
                mtagtype_detected = true;
            }
        }

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
            if (lspl[0] === 'units') {
                let tag = lspl[1];
                if (tag in data && data[tag].lines.length > 0) {
                    // We're being forgiving only of the case where a unit definition is duplicated
                    throw Error('Invalid Magres file format: units specified after tag ' + tag + ' has been used');
                }
                data[tag] = {
                    'units': lspl[2],
                    'lines': []
                };
            } else if (lspl[0] !== '') {
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

    // Reject if we don't have a cell
    if (!cell) {
        throw Error('No unit cell found in Magres file. We only support Magres files with a Lattice block.');
    }
    
    // Read in the atom positions and species
    let elems = [];
    let pos = [];
    let mlabels = [];
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

            // CASTEP custom species use the form ELEMENT:LABEL (e.g. H:Mu).
            // Strip the colon-suffix to recover a valid element symbol while
            // keeping the full species identifier in mlabels/labels for lookup.
            elems.push(l[0].split(':')[0]);
            mlabels.push([l[1], parseInt(l[2])]);
            labels.push(l[1]);
            pos.push(_.map(l.slice(3,6), function(x) {
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
    atoms.set_array('labels', labels);
    atoms.set_array('magres-labels', mlabels);

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
                let data = MagresParsers[tag_type](l, u, mlabels);
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

    // Parse hyperfine tensors and gamma ratios from magres_old block
    const magres_old_text = blocks['magres_old'];
    if (magres_old_text && typeof magres_old_text === 'string') {
        const { hf_data, gamma_ratios } = parseMagresOldBlock(magres_old_text, mlabels, N);
        if (hf_data.some(d => d !== null)) {
            atoms.set_array('hf', hf_data);
        }
        if (Object.keys(gamma_ratios).length > 0) {
            atoms.info['hf-gyromagnetic-ratios'] = gamma_ratios;
        }
    }

    let structs = {};
    structs[filename] = atoms;

    return structs;
}

export {
    load
};