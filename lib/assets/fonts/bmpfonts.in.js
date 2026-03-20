'use strict';

// This file is necessary because esbuild has issues taking care of these imports
// at compile time... so we pre-build a version of this file with the resources 
// inside as data URIs using the scripts/build-resources.js script. It can also
// be called as:
// 
//      npm run build-resources

import rubikMediumFont from './Rubik-Medium.fnt';
import rubikMediumTexture from './Rubik-Medium.png';
// opensans
import openSansFont from './OpenSans-Medium.fnt';
import openSansTexture from './OpenSans-Medium.png';

export {
    rubikMediumFont,
    rubikMediumTexture,
    openSansFont,
    openSansTexture
}