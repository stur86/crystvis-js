'use strict';

/**
 * @fileoverview Function for loading CIF files (wrapper)
 * @package
 */

import _ from 'lodash';
import { Atoms } from 'crystcif-parse';

function load(contents, filename) {

    let structs = Atoms.readCif(contents);

    if (filename) {
        structs = _.mapKeys(structs, (k) => (filename + '_' + k));
    }

    return structs;
}

export { load };