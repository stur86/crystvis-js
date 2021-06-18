'use strict';

/**
 * @fileoverview Function for loading XYZ files
 * @package
 */

import _ from 'lodash';
import { Atoms } from 'crystcif-parse';

function load(contents, filename) {

    // Split the file into lines
    let lines = _.split(contents, '\n');

    // Parse the first line: number of atoms
    let N = parseInt(_.trim(lines[0]));
    if (isNaN(N) || lines.length < N + 2) {
        throw Error('Invalid XYZ file');
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
                    throw Error('Invalid Extended XYZ file');
                }
            }
            if (props['Properties'].slice(0, 19) != 'species:S:1:pos:R:3') {
                throw Error('Invalid Extended XYZ file');
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
            throw Error('Invalid XYZ file');
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

    filename = filename || 'xyz';

    let structs = {};
    structs[filename] = a;

    return structs;
}

export { load };