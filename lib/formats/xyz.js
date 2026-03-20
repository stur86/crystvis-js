'use strict';

/**
 * @fileoverview Function for loading XYZ files
 * @module
 */

import _ from 'lodash';
import { Atoms } from '@ccp-nc/crystcif-parse';
import { TensorData } from '../tensor.js';

/**
 * Load an Extended XYZ file (optionally multi-frame), extracting NMR tensor data as TensorData objects.
 *
 * Only the Extended XYZ format (with a unit cell specified via the Lattice property) is supported.
 * Standard/plain XYZ files (without a cell) are not supported and will result in an error.
 * Extended XYZ files can contain additional per-atom properties, including NMR tensors (e.g., magnetic shielding or EFG tensors)
 * stored as 9 real values per atom. These are automatically converted to TensorData objects if the property name matches
 * the provided shielding_tag or efg_tag (defaults: 'ms' and 'efg').
 *
 * Multi-frame files are supported: use the index argument to select a frame (default: -1, last frame).
 *
 * @param {string} contents - The contents of the Extended XYZ file.
 * @param {string} [filename='xyz'] - Optional name for the returned structure (used as key in result object).
 * @param {string} [shielding_tag='ms'] - Property name to treat as magnetic shielding tensor (9 real values per atom).
 * @param {string} [efg_tag='efg'] - Property name to treat as EFG tensor (9 real values per atom).
 * @param {number} [index=-1] - Frame index to load (0-based, negative counts from end; default -1 = last frame).
 * @returns {Object} Dictionary mapping filename to Atoms object. Per-atom tensor arrays are stored as TensorData objects.
 * @throws {Error} If the file is not valid Extended XYZ (e.g., missing cell), or if tensor arrays are malformed.
 *
 * Example usage:
 *   load(contents, 'mystruct', 'ms', 'efg', -1)
 *   // Returns: { mystruct: Atoms }
 *   // Atoms.get_array('ms')[0] is a TensorData instance
 */
function load(contents, filename='xyz', shielding_tag='ms', efg_tag='efg', index=-1) {

    // Split into frames
    let lines = _.split(contents, '\n');
    let frames = [];
    let i = 0;
    while (i < lines.length) {
        // Skip empty lines
        while (i < lines.length && _.trim(lines[i]) === '') i++;
        if (i >= lines.length) break;
        let lineContent = _.trim(lines[i]);
        if (lineContent === '') {
            i++;
            continue;
        }
        let N = parseInt(lineContent);
        if (isNaN(N) || N <= 0) {
            i++;
            continue;
        }
        // Check if we have enough lines for this frame
        if (i + N + 1 >= lines.length) break;
        let frame = lines.slice(i, i + N + 2);
        frames.push(frame);
        i += N + 2;
    }
    if (frames.length === 0) {
        throw Error('No valid frames found in XYZ/Extended XYZ file.');
    }
    // Select frame
    let frame_idx = index < 0 ? frames.length + index : index;
    if (frame_idx < 0 || frame_idx >= frames.length) {
        throw Error('Frame index out of range for XYZ/Extended XYZ file.');
    }
    lines = frames[frame_idx];

    // Parse the first line: number of atoms
    let N = parseInt(_.trim(lines[0]));
    if (isNaN(N) || lines.length < N + 2) {
        throw Error('Invalid XYZ/Extended XYZ frame: could not parse atom count or frame is too short.');
    }

    // Parse the second line: comments
    let info = lines[1];
    // Check if it's extended format
    let rext = /([A-Za-z_]+)=(([A-Za-z0-9.:_-]+)|"([^"]+)")/g;
    let matches = [];
    let cell = null;
    let columns = [];
    
    let m;
    while ((m = rext.exec(info)) !== null) {
        matches.push(m);
    }
    
    if (matches.length > 0) {
        // It's extended! But does it have the right keywords?
        let props = {};
        for (let i = 0; i < matches.length; ++i) {
            m = matches[i];
            props[m[1]] = m[3] || m[4];
        }
        if ((_.has(props, 'Lattice') && _.has(props, 'Properties'))) {
            // Parse the lattice
            let latt = _.split(props['Lattice'], /\s+/).filter(s => s.length > 0);
            cell = [];
            for (let i = 0; i < 3; ++i) {
                let row = _.map(latt.slice(3 * i, 3 * i + 3), parseFloat);
                if (row.some(v => isNaN(v))) {
                    throw Error('Invalid Extended XYZ file: could not parse cell row.');
                }
                cell.push(row);
            }
            if (!props['Properties'].startsWith('species:S:1:pos:R:3')) {
                throw Error('Invalid Extended XYZ file: Properties string does not start with species:S:1:pos:R:3');
            }
            // Parse the properties
            let propre = /([A-Za-z_]+):(S|R|I):([0-9]+)/g;
            while ((m = propre.exec(props['Properties'])) !== null) {
                columns.push({
                    'name': m[1],
                    'type': m[2],
                    'n': parseInt(m[3]),
                });
            }
        }

        info = _.omit(props, ['Lattice', 'Properties']);
    } else {
        info = {
            'comment': info
        };
    }

    // Check if we have a cell
    if (cell === null) {
        throw Error('No unit cell (Lattice property) found in this file. Only Extended XYZ format with a cell is supported; plain XYZ files are not supported.');
    }

    // Initialize arrays for additional properties (skip species and pos which are columns 0 and 1)
    let arrays = {};
    for (let i = 2; i < columns.length; ++i) {
        arrays[columns[i].name] = [];
    }

    // Parse the following lines: atoms
    let elems = [];
    let pos = [];
    // Determine expected number of tokens per atom line:
    // species (1) + pos (3) + sum of additional property token counts
    let expected_tokens = 1 + 3;
    for (let c = 2; c < columns.length; ++c) {
        expected_tokens += columns[c].n;
    }

    for (let i = 0; i < N; ++i) {
        let line_index = i + 2;
        let line = lines[line_index];
        let lspl = _.split(line, /\s+/).filter(s => s.length > 0);

        // Expect the atom line to contain all tokens; do not attempt to merge
        // subsequent physical lines. If token count is insufficient, fail fast.
        if (lspl.length < expected_tokens) {
            throw Error('Invalid Extended XYZ file: insufficient property values on line ' + (i + 3));
        }
        
        // Read species (column 0)
        elems.push(lspl[0]);
        
        // Track current position in split line
        let col_idx = 1;
        
        // Read positions (column 1: pos:R:3)
        let position = [];
        for (let j = 0; j < 3; ++j) {
            position.push(parseFloat(lspl[col_idx++]));
        }
        if (position.some(v => isNaN(v))) {
            throw Error('Invalid XYZ file: could not parse atom position.');
        }
        pos.push(position);
        
        // Read additional properties (columns 2+)
        for (let c = 2; c < columns.length; ++c) {
            let col = columns[c];
            let v = [];
            let parser = {
                'S': function(s) { return String(s); },
                'R': function(s) { return parseFloat(s); },
                'I': function(s) { return parseInt(s); },
            }[col.type];
            
            for (let k = 0; k < col.n; ++k) {
                if (col_idx >= lspl.length) {
                    throw Error('Invalid Extended XYZ file: insufficient property values on line ' + (i + 3));
                }
                v.push(parser(lspl[col_idx++]));
            }
            
            // Convert 9-element real arrays into TensorData immediately for shielding/EFG
            if (col.type === 'R' && col.n === 9 && (col.name === shielding_tag || col.name === efg_tag)) {
                if (v.length !== 9) {
                    throw Error('Invalid tensor array for ' + col.name);
                }
                v = new TensorData([
                    [v[0], v[1], v[2]],
                    [v[3], v[4], v[5]],
                    [v[6], v[7], v[8]]
                ]);
            } else {
                v = v.length > 1 ? v : v[0];
            }
            
            arrays[col.name].push(v);
        }
    }

    let a = new Atoms(elems, pos, cell, info);
    
    // Add all arrays to atoms object
    for (let name in arrays) {
        a.set_array(name, arrays[name]);
    }

    let structs = {};
    structs[filename] = a;

    return structs;
}

export { load };