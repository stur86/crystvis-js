'use strict';

/** 
 * @fileoverview Class for loading different types of input files
 * @package 
 */

const _ = require('lodash');
const Atoms = require('crystcif-parse').Atoms;

var Loader = function () {

}

Loader.prototype = {
    /**
     * Load an (extended) XYZ file from its contents
     *
     * @param {String} contents         File contents
     * 
     * @returns {Atoms}                 Parsed structure
     */
    loadXYZ(contents) {

        // Split the file into lines
        var lines = _.split(contents, '\n');

        // Parse the first line: number of atoms
        var N = parseInt(_.trim(lines[0]));
        if (isNaN(N) || lines.length < N + 2) {
            throw 'Invalid XYZ file';
        }

        // Parse the second line: comments
        var info = lines[1];
        // Check if it's extended format
        var ext = false;
        var rext = /([A-Za-z]+)=(([A-Za-z0-9.:]+)|"([\s0-9.]+)")/g;
        var m = rext.exec(info);
        var matches = [];
        var cell = null;
        var arrays = [];
        while (m != null) {
            matches.push(m);
            m = rext.exec(info);
        }
        if (matches.length > 0) {
            // It's extended! But does it have the right keywords?
            var props = {};
            for (var i = 0; i < matches.length; ++i) {
                m = matches[i];
                props[m[1]] = m[3] || m[4];
            }
            if ((_.has(props, 'Lattice') && _.has(props, 'Properties'))) {
                // It's valid!
                ext = true;
                // Parse the lattice
                var latt = _.split(props['Lattice'], /\s+/);
                cell = [];
                for (var i = 0; i < 3; ++i) {
                    cell.push(_.map(latt.slice(3 * i, 3 * i + 3), parseFloat));
                    if (cell[i].indexOf(NaN) > -1) {
                        throw 'Invalid Extended XYZ file';
                    }
                }
                if (props['Properties'].slice(0, 19) != 'species:S:1:pos:R:3') {
                    throw 'Invalid Extended XYZ file';
                }
                // Parse the properties
                var propre = /([A-Za-z]+):(S|R|I):([0-9]+)/g;
                var columns = [];
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
        }
        else {
            info = { 'comment': info };
        }

        // Parse the following lines: atoms
        var elems = [];
        var pos = [];
        for (var i = 0; i < N; ++i) {
            var lspl = _.split(lines[i + 2], /\s+/);
            elems.push(lspl[0]);
            pos.push(_.map(lspl.slice(1, 4), parseFloat));
            if (pos.indexOf(NaN) > -1) {
                throw 'Invalid XYZ file';
            }

            // Any additional parsing required?
            if (ext) {
                lspl.splice(0, 4);
                for (var j = 0; j < arrays.length; ++j) {
                    var v = [];
                    var parser = {
                        'S': String,
                        'R': parseFloat,
                        'I': parseInt,
                    }[arrays[j].type];
                    for (var k = 0; k < arrays[j].n; ++k) {
                        v.push(parser(lspl.splice(0)));
                    }
                    v = v.length > 1? v : v[0];
                    arrays[j].val.push(v);
                }
            }
        }

        var a
        if (!ext) {
            a = new Atoms(elems, pos, null, info);
        }
        else {
            a = new Atoms(elems, pos, cell, info);
            for (var i = 0; i < arrays.length; ++i) {
                a.set_array(arrays[i].name, arrays[i].val);
            }
        }

        return a;
    }
}

exports.Loader = Loader;