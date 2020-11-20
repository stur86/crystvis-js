'use strict';

import { PeriodicTable as PeriodicTable } from 'mendeleev';

/**
 * @fileoverview Various data arrays and structures storing useful information
 * @private
 */

// Van der Waals radii by atomic number
var vdwRadii = [1.77, // Z = 0 is used as the default
    1.2, 1.4, 1.82, 1.7, 2.08,
    1.95, 1.55, 1.7, 1.73, 1.54, 2.27, 1.73, 2.05,
    2.1, 2.08, 2.0, 1.97, 1.88, 2.75, 1.973, 1.7,
    1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.63, 1.4, 1.39,
    1.87, 1.7, 1.85, 1.9, 2.1, 2.02, 1.7, 1.7, 1.7,
    1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.63, 1.72, 1.58,
    1.93, 2.17, 2.2, 2.06, 2.15, 2.16, 1.7, 1.7,
    1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7,
    1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7,
    1.7, 1.7, 1.7, 1.72, 1.66, 1.55, 1.96, 2.02,
    1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7,
    1.86, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7,
    1.7, 1.7, 1.7
];

var cpkColors = [0xff1493, // Z = 0 is used as the default
    0xffffff, 0xd9ffff, 0xcc80ff, 0xc2ff00, 0xffb5b5, 0x909090, 0x3050f8, 0xff0d0d,
    0x90e050, 0xb3e3f5, 0xab5cf2, 0x8aff00, 0xbfa6a6, 0xf0c8a0, 0xff8000, 0xffff30,
    0x1ff01f, 0x80d1e3, 0x8f40d4, 0x3dff00, 0xe6e6e6, 0xbfc2c7, 0xa6a6ab, 0x8a99c7,
    0x9c7ac7, 0xe06633, 0xf090a0, 0x50d050, 0xc88033, 0x7d80b0, 0xc28f8f, 0x668f8f,
    0xbd80e3, 0xffa100, 0xa62929, 0x5cb8d1, 0x702eb0, 0x00ff00, 0x94ffff, 0x94e0e0,
    0x73c2c9, 0x54b5b5, 0x3b9e9e, 0x248f8f, 0x0a7d8c, 0x006985, 0xc0c0c0, 0xffd98f,
    0xa67573, 0x668080, 0x9e63b5, 0xd47a00, 0x940094, 0x429eb0, 0x57178f, 0x00c900,
    0x70d4ff, 0xffffc7, 0xd9ffc7, 0xc7ffc7, 0xa3ffc7, 0x8fffc7, 0x61ffc7, 0x45ffc7,
    0x30ffc7, 0x1fffc7, 0x00ff9c, 0x00e675, 0x00d452, 0x00bf38, 0x00ab24, 0x4dc2ff,
    0x4da6ff, 0x2194d6, 0x267dab, 0x266696, 0x175487, 0xd0d0e0, 0xffd123, 0xb8b8d0,
    0xa6544d, 0x575961, 0x9e4fb5, 0xab5c00, 0x754f45, 0x428296, 0x420066, 0x007d00,
    0x70abfa, 0x00baff, 0x00a1ff, 0x008fff, 0x0080ff, 0x006bff, 0x545cf2, 0x785ce3,
    0x8a4fe3, 0xa136d4, 0xb31fd4, 0xb31fba, 0xb30da6, 0xbd0d87, 0xc70066, 0xcc0059,
    0xd1004f, 0xd90045, 0xe00038, 0xe6002e, 0xeb0026
];


function getVdwRadius(symbol) {
    var el = PeriodicTable.getElement(symbol);
    var Z = (el ? el.number : 0);
    return vdwRadii[Z];
}

function getCpkColor(symbol) {
    var el = PeriodicTable.getElement(symbol);
    var Z = (el ? el.number : 0);
    return cpkColors[Z];
}


exports.vdwRadii = vdwRadii;
exports.cpkColors = cpkColors;

exports.getVdwRadius = getVdwRadius;
exports.getCpkColor = getCpkColor;