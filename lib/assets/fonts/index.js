'use strict';

import {
    BitmapFont
} from './font.js';

import rubikMediumFont from './Rubik-Medium.fnt';
import rubikMediumTexture from './Rubik-Medium.png';


// Load the actual fonts
const RubikMedium = new BitmapFont(rubikMediumFont, rubikMediumTexture);

export {
    RubikMedium
};