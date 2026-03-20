'use strict';

/** 
 * @fileoverview Class for loading different types of input files
 * @module 
 */

import * as CIF from './formats/cif.js';
import * as XYZ from './formats/xyz.js';
import * as Magres from './formats/magres.js';
import * as CELL from './formats/cell.js';

import { addStaticVar } from './utils.js';

/**
 * Loader - Object used to load various file types into Atoms objects and
 * store any status and error messages resulting from failure.
 */
class Loader {

    constructor() {
        this._status = Loader.STATUS_UNUSED;
        this._error = '';
    }

    get status() {
        return this._status;
    }

    get error_message() {
        return this._error;
    }

    /**
     * Load file from its contents and format
     *
     * @param  {String} contents    File contents
     * @param  {String} format      File extension
     * @param  {String} filename    Name of the file. If provided, this will be
     *                              added as a prefix to all the names in the dictionary
     * @param  {Object} [options]   Optional parser-specific options (e.g. {shielding_tag, efg_tag} for xyz)
     * @return {Object}             Dictionary of parsed structure(s)
     */
    load(contents, format='cif', filename=null, options={}) {

        const parsers = {
            cif: CIF,
            xyz: XYZ,
            magres: Magres,
            cell: CELL
        };

        format = format.toLowerCase();
        // Treat extxyz as xyz
        if (format === 'extxyz') {
            format = 'xyz';
        }

        this._error = '';

        if (!(format in parsers)) {
            throw Error('Invalid file format');
        }

        let structs;

        try {
            if (format === 'xyz') {
                // Support shielding_tag, efg_tag, and index for xyz
                const shielding = options.shielding_tag || 'ms';
                const efg = options.efg_tag || 'efg';
                const index = (typeof options.index === 'number') ? options.index : -1;
                // Pass filename only if provided; otherwise let parser use its default
                if (filename) {
                    structs = parsers[format].load(contents, filename, shielding, efg, index);
                } else {
                    structs = parsers[format].load(contents, undefined, shielding, efg, index);
                }
            } else if (filename) {
                structs = parsers[format].load(contents, filename);
            } else {
                structs = parsers[format].load(contents);
            }
        } catch (err) {
            // For XYZ parsing, let errors propagate so callers/tests can catch them.
            if (format === 'xyz') {
                throw err;
            }
            this._status = Loader.STATUS_ERROR;
            this._error = err.message || err;
            return;
        }

        this._status = Loader.STATUS_SUCCESS;

        return structs;
    }
}

// Define static properties old style, for better compatibility
addStaticVar(Loader, 'STATUS_UNUSED', -1);
addStaticVar(Loader, 'STATUS_SUCCESS', 0);
addStaticVar(Loader, 'STATUS_ERROR', 1);


export {
    Loader
}