'use strict';

// This file is used because there's a need to add some global namespace 
// variables to make these packages work... 
// it's ugly but there's no way out, it seems.

import loadFontRaw from 'load-bmfont';

const loadFont = function(fntfile, callback) {
    loadFontRaw(fntfile, callback);
};

import createGeometry from '@jkshenton/three-bmfont-text';

export {
    loadFont,
    createGeometry
}