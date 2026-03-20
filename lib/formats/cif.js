'use strict';

/**
 * @fileoverview Function for loading CIF files (wrapper)
 * @module
 */

import _ from 'lodash';
import { Atoms } from '@ccp-nc/crystcif-parse';

function load(contents, filename) {

    let structs = Atoms.readCif(contents);

    if (filename) {
        structs = _.mapKeys(structs, (v, k) => (filename + '_' + k));
    }

    return structs;
}

export { load };