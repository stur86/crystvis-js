'use strict';

/** 
 * @fileoverview Class for loading different types of input files
 * @package 
 */

import * as CIF from './formats/cif.js';
import * as XYZ from './formats/xyz.js';
import * as Magres from './formats/magres.js';

/**
 * Loader - Object used to load various file types into Atoms objects and
 * store any status and error messages resulting from failure.
 */
class Loader {

    static STATUS_UNUSED = -1;
    static STATUS_SUCCESS = 0;
    static STATUS_ERROR = 1;

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

    /** Load file from its contents and format 
     *
     * @param  {String} contents    File contents
     * @param  {String} format      File extension
     * @param  {String} filename    Name of the file. If provided, this will be
     *                              added as a prefix to all the names in the dictionary
     *
     * @return {Object}             Dictionary of parsed structure(s)
     */
    load(contents, format='cif', filename=null) {

        const parsers = {
            cif: CIF,
            xyz: XYZ,
            magres: Magres
        };

        format = format.toLowerCase();

        if (!(format in parsers)) {
            throw Error('Invalid file format');
        }

        this._error = '';

        let structs;

        try { 
            structs = parsers[format].load(contents, filename);
        } catch (err) {
            this._status = Loader.STATUS_ERROR;
            this._error = err.message;
            return;
        }

        this._status = Loader.STATUS_SUCCESS;

        return structs;
    }
}

export {
    Loader
}