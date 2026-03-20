'use strict';

import {
    BitmapFont
} from './font.js';

import * as Fonts from './bmpfonts.js';

// Load the actual fonts
// For some reason if I load more than one font at a time, it breaks...
// const RubikMedium = new BitmapFont(Fonts.rubikMediumFont, Fonts.rubikMediumTexture);
const OpenSans = new BitmapFont(Fonts.openSansFont, Fonts.openSansTexture);

export {
    OpenSans
};