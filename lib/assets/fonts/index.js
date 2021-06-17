'use strict';

import {
    BitmapFont
} from './font.js';

import * as Fonts from './bmpfonts.js';

// Load the actual fonts
const RubikMedium = new BitmapFont(Fonts.rubikMediumFont, Fonts.rubikMediumTexture);

export {
    RubikMedium
};