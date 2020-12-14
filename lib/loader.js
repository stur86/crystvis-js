'use strict';

/** 
 * @fileoverview Class for loading different types of input files
 * @package 
 */

import _ from 'lodash';
import {
    Atoms as Atoms
} from 'crystcif-parse';

import {
    TensorData
} from './tensor.js';

const _MagresUnits = {
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
function _parseNoAtomLine(line, units) {
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

function _parseOneAtomLine(line, units, labels) {
    // Species label + index, then nine numbers
    let sp = line[0];
    let sp_i = parseInt(line[1]);
    let i = _.findIndex(labels, function(x) {
        return (x[0] == sp) && (x[1] == sp_i);
    });
    let ltrim = Array.from(line).splice(2);

    let ans = {
        i: i,
        tens: _parseNoAtomLine(ltrim, units)
    }

    return ans;
}

function _parseTwoAtomLine(line, units, labels) {
    let sp1 = line[0]
    let sp1_i = parseInt(line[1]);
    let i1 = _.findIndex(labels, function(x) {
        return (x[0] == sp1) && (x[1] == sp1_i);
    });
    let ltrim = Array.from(line).splice(2);

    let ans = _parseOneAtomLine(ltrim, units, labels);

    ans = {
        i1: i1,
        i2: ans.i,
        tens: ans.tens
    };

    return ans;
}

const _MagresParsers = {
    sus: _parseNoAtomLine,
    ms: _parseOneAtomLine,
    efg: _parseOneAtomLine,
    isc: _parseTwoAtomLine
}


/**
 * Loader - Object used to load various file types into Atoms objects and
 * store any status and error messages resulting from failure.
 */
let Loader = function() {

    this._status = -1;
    this._error = '';

}

Loader.prototype = {

    get status() {
        return this._status;
    },

    get error_message() {
        return this._error;
    },

    /**
     * Load a CIF file from its contents
     * 
     * @param  {String} contents    File contents
     * 
     * @return {Object}             Dictionary of parsed structure(s)
     */
    loadCIF(contents) {

        this._error = '';

        let structs

        try {
            structs = Atoms.readCif(contents);
        } catch (err) {
            this._status = Loader.STATUS_ERROR;
            this._error = err;
            return;
        }

        this._status = Loader.STATUS_SUCCESS;

        return structs;

    },

    /**
     * Load an (extended) XYZ file from its contents
     *
     * @param {String} contents         File contents
     * 
     * @returns {crystcif.Atoms}        Parsed structure
     */
    loadXYZ(contents) {

        this._error = '';

        // Split the file into lines
        let lines = _.split(contents, '\n');

        // Parse the first line: number of atoms
        let N = parseInt(_.trim(lines[0]));
        if (isNaN(N) || lines.length < N + 2) {
            this._status = Loader.STATUS_ERROR;
            this._error = 'Invalid XYZ file';
            return;
        }

        // Parse the second line: comments
        let info = lines[1];
        // Check if it's extended format
        let ext = false;
        let rext = /([A-Za-z]+)=(([A-Za-z0-9.:]+)|"([\s0-9.]+)")/g;
        let m = rext.exec(info);
        let matches = [];
        let cell = null;
        let arrays = [];
        while (m != null) {
            matches.push(m);
            m = rext.exec(info);
        }
        if (matches.length > 0) {
            // It's extended! But does it have the right keywords?
            let props = {};
            for (let i = 0; i < matches.length; ++i) {
                m = matches[i];
                props[m[1]] = m[3] || m[4];
            }
            if ((_.has(props, 'Lattice') && _.has(props, 'Properties'))) {
                // It's valid!
                ext = true;
                // Parse the lattice
                let latt = _.split(props['Lattice'], /\s+/);
                cell = [];
                for (let i = 0; i < 3; ++i) {
                    cell.push(_.map(latt.slice(3 * i, 3 * i + 3), parseFloat));
                    if (cell[i].indexOf(NaN) > -1) {
                        this._status = Loader.STATUS_ERROR;
                        this._error = 'Invalid Extended XYZ file';
                        return;
                    }
                }
                if (props['Properties'].slice(0, 19) != 'species:S:1:pos:R:3') {
                    this._status = Loader.STATUS_ERROR;
                    this._error = 'Invalid Extended XYZ file';
                    return;
                }
                // Parse the properties
                let propre = /([A-Za-z]+):(S|R|I):([0-9]+)/g;
                let columns = [];
                m = propre.exec(props['Properties'])
                while (m != null) {
                    columns.push({
                        'name': m[1],
                        'type': m[2],
                        'n': parseInt(m[3]),
                        'val': [],
                    });
                    m = propre.exec(props['Properties']);
                }
                // We know the first two are just species and pos
                arrays = columns.slice(2);
            }

            info = _.omit(props, ['Lattice', 'Properties']);
        } else {
            info = {
                'comment': info
            };
        }

        // Parse the following lines: atoms
        let elems = [];
        let pos = [];
        for (let i = 0; i < N; ++i) {
            let lspl = _.split(lines[i + 2], /\s+/);
            elems.push(lspl[0]);
            pos.push(_.map(lspl.slice(1, 4), parseFloat));
            if (pos.indexOf(NaN) > -1) {
                this._status = Loader.STATUS_ERROR;
                this._error = 'Invalid XYZ file';
                return;
            }

            // Any additional parsing required?
            if (ext) {
                lspl.splice(0, 4);
                for (let j = 0; j < arrays.length; ++j) {
                    let v = [];
                    let parser = {
                        'S': String,
                        'R': parseFloat,
                        'I': parseInt,
                    }[arrays[j].type];
                    for (let k = 0; k < arrays[j].n; ++k) {
                        v.push(parser(lspl.splice(0)));
                    }
                    v = v.length > 1 ? v : v[0];
                    arrays[j].val.push(v);
                }
            }
        }

        let a = new Atoms(elems, pos, cell, info);
        if (ext) {
            for (let i = 0; i < arrays.length; ++i) {
                a.set_array(arrays[i].name, arrays[i].val);
            }
        }

        this._status = Loader.STATUS_SUCCESS;

        return a;
    },

    /**
     * Load a Magres file from its contents
     *
     * @param {String} contents         File contents
     * 
     * @returns {crystcif.Atoms}        Parsed structure
     */
    loadMagres(contents) {

        this._error = '';

        const known_blocks = ['atoms', 'magres'];
        let lines = _.split(contents, '\n');

        // First line contains version
        let v_re = /#\$magres-abinitio-v([0-9]+\.[0-9]+)/;
        let v_match = lines[0].match(v_re);

        if (!v_match) {
            this._status = Loader.STATUS_ERROR;
            this._error = 'Invalid Magres file format: no version line';
            return;
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
                        this._status = Loader.STATUS_ERROR;
                        this._error = 'Invalid Magres file format: block closed without opening';
                        return;
                    }
                } else {
                    if (block_name) {
                        this._status = Loader.STATUS_ERROR;
                        this._error = 'Invalid Magres file format: block opened without closing';
                        return;
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
                        this._status = Loader.STATUS_ERROR;
                        this._error = 'Invalid Magres file format: units specified after tag ' + tag + ' has been used';
                        return;
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
            this._status = Loader.STATUS_ERROR;
            this._error = 'Invalid Magres file format: does not contain atoms block';
            return;
        }

        // Read in the cell, if present
        let cell = null;
        if ('lattice' in ablock) {
            let u = 1.0;
            let uname = ablock.lattice.units;
            if (uname) {
                u = _MagresUnits.length[uname];
                if (!u) {
                    this._status = Loader.STATUS_ERROR;
                    this._error = 'Invalid Magres file format: invalid units for cell';
                    return;
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
                u = _MagresUnits.length[uname];
                if (!u) {
                    this._status = Loader.STATUS_ERROR;
                    this._error = 'Invalid Magres file format: invalid units for atom';
                    return;
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
            this._status = Loader.STATUS_ERROR;
            this._error = 'Invalid Magres file format: no atom position data found';
            return;
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
                    u = _MagresUnits[tag_type][uname];
                    if (!u) {
                        this._status = Loader.STATUS_ERROR;
                        this._error = 'Invalid Magres file format: invalid units for ' + tag;
                        return;
                    }
                }

                // Initialise as dictionary
                let tag_dimension;
                let tag_data;
                switch (_MagresParsers[tag_type]) {
                    case _parseNoAtomLine:
                        tag_dimension = 0;
                        break;
                    case _parseOneAtomLine:
                        tag_dimension = 1;
                        tag_data = new Array(N);
                        break;
                    case _parseTwoAtomLine:
                        tag_dimension = 2;
                        tag_data = _.times(N, function() {
                            return new Array(N);
                        });
                }

                for (let i = 0; i < mblock[tag].lines.length; ++i) {
                    let l = mblock[tag].lines[i];
                    let data = _MagresParsers[tag_type](l, u, labels);
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

        this._status = Loader.STATUS_SUCCESS;

        return atoms;
    }
}

// Constant status types
Object.defineProperty(Loader, "STATUS_UNUSED", {
    value: -1
});
Object.defineProperty(Loader, "STATUS_SUCCESS", {
    value: 0
});
Object.defineProperty(Loader, "STATUS_ERROR", {
    value: 1
});


export {
    Loader
}