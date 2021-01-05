'use strict';

import {
    BitmapFont
} from './font.js';

import {
    rubikMediumFont,
    rubikMediumTexture
} from './bmpfonts.js';

// Load the actual fonts
const RubikMedium = new BitmapFont(rubikMediumFont, rubikMediumTexture);

export {
    RubikMedium
};