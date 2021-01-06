'use strict';

// This file is used because there's a need to add some global namespace 
// variables to make these packages work... 
// it's ugly but there's no way out, it seems.

import * as THREE from 'three';
import {
    Buffer
} from 'buffer';

const loadFont = function(fntfile, callback) {
    var oldBuffer = globalThis.Buffer;
    globalThis.Buffer = Buffer;

    const loadFontRaw = require('load-bmfont');
    loadFontRaw(fntfile, (...args) => {
        callback.apply(this, args);
        globalThis.Buffer = oldBuffer;
    });
};

import createGeometry from '@stur86/three-bmfont-text';

export {
    loadFont,
    createGeometry
}