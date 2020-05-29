'use strict';

/** 
 * @fileoverview Functions for a dithering-based transparent material
 * @package
 */

/**
 * Recursive function to generate a power-of-two ordered dithering matrix
 * 
 * @param {int} n          Power of two index. The returned matrix will have a 2^n side.
 */
function makeDitherMatrix(n) {
    var dM2 = [0., 0.5, 0.75, 0.25];
    if (n <= 1) {
        return dM2;
    }
    else {
        var M1 = [];
        var M0 = makeDitherMatrix(n - 1);
        var N0 = Math.pow(2, n - 1);
        var N1 = Math.pow(2, n);
        var N02 = Math.pow(2, 2 * n - 2);
        var N12 = Math.pow(2, 2 * n);
        for (var i = 0; i < N12; ++i) {
            var x1 = i % N1;
            var y1 = Math.floor(i / N1);
            var x2 = Math.floor(x1 / N0);
            var y2 = Math.floor(y1 / N0);
            M1.push(M0[x1 % N0 + (y1 % N0) * N0] + dM2[x2 + 2 * y2] / N02);
        }
        return M1;
    }
}

/**
 * Generate an ordered dithering matrix in the form of a THREE.js DataTexture
 * 
 * @param {int} n           Power of two index. The returned matrix will have a 2^n side.
 */
function makeDitherTexture(n) {
    // n is the power of two exponent
    var N = Math.pow(2, n);
    var imd = [];
    var dM = makeDitherMatrix(n);
    dM = dM.map(function (x) { return Math.floor((x + 0.5 / (N * N)) * 256); });
    dM = new Uint8Array(dM);
    
    var tx = new THREE.DataTexture(dM, N, N, THREE.LuminanceFormat);
    tx.needsUpdate = true;

    return tx;
}

// Shaders
var ditherVertShader = [
    'varying vec3 vNormal;',
    'varying highp vec2 vUv;',
    'void main() {',
    '   vNormal = normal;',
    '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);',
    '   vUv = uv;',
    '}'
].join('\n');

var ditherFragShader = [
    'uniform vec3 color;',
    'uniform float alpha;',
    'uniform float illum;',
    'uniform vec2 shift;',
    'uniform float ditherN;',
    'uniform bool netting;',
    'uniform float netScale;',
    'uniform sampler2D ditherTex;',
    'varying vec3 vNormal;',
    'varying highp vec2 vUv;',
    'void main() {',
    // This shader simply checks the coordinates on screen of the pixel to be drawn
    // and discards it based on the dithering matrix and alpha value if it has to be transparent.
    // In this way we go round all the complexities of intersecting transparent solids with much greater efficiency.
    // Check Wikipedia's article on ordered dithering for further reference.
    '   vec2 ditherCoords;',
    '   if (netting) {',
    '       ditherCoords = vUv*ditherN*netScale;',
    '   }',
    '   else {',
    '       ditherCoords = gl_FragCoord.xy;',
    '   }',
    '   float iN = mod(ditherCoords.x+shift.x, ditherN)/ditherN;',
    '   float jN = mod(ditherCoords.y+shift.y, ditherN)/ditherN;',
    '   vec4 ditherCol = texture2D(ditherTex, vec2(iN, jN));',
    '   if (ditherCol.r > alpha)',
    '       discard;',
    // Lighting is also handled very simply, just a fraction of front illumination + ambient light.
    // This mostly because for some reason I can't get it to work with proper lighting (possibly a bug in THREE.js).
    '   vec3 light = cameraPosition;',
    '   light = normalize(light);',
    '   float dProd = max(0., dot(light, vNormal));',
    // We combine everything in the final color
    '   gl_FragColor = vec4(color*((dProd-1.)*illum+1.), 1.);',
    '}',
].join('\n');

/**
 * A material that applies transparency through dithering 
 * @class
 * 
 * parameters = {
 *  color: <hex>,
 *  alpha: <float>,
 *  illum: <float>,
 *  ditherN: <int>,
 *  shift: [<int>, <int>]
 * }
 */

var DitherMaterial = function (parameters) {

    this.type = 'DitherMaterial';
    this.color = parameters.color || new THREE.Color(0xffffff);
    this.alpha = parameters.alpha || 0.5;
    this.illum = parameters.illum || 0.5;
    this.n = parameters.n || 5;
    this.netting = parameters.netting || false;
    this.netScale = parameters.netScale || 5.0;
    // Safety check to avoid completely bricking the user's memory
    this.n = Math.min(this.n, 10); // This way ditherTex will never be bigger than 1024x1024
    var N = Math.pow(2, this.n);
    this.shift = parameters.shift || Array.from(Array(2), function () { return Math.random() * N; });
    this.ditherTex = makeDitherTexture(this.n);

    THREE.ShaderMaterial.call(this, {
        uniforms: {
            color: { type: 'v3', value: this.color },
            alpha: { type: 'f', value: this.alpha },
            illum: { type: 'f', value: this.illum },
            shift: { type: 'v2', value: this.shift },
            ditherN: { type: 'f', value: N },
            ditherTex: { type: 't', value: this.ditherTex },
            netting: { type: 'b', value: this.netting },
            netScale: { type: 'f', value: this.netScale }
        },
        fragmentShader: ditherFragShader,
        vertexShader: ditherVertShader,
        depthTest: true,
    });
};

DitherMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
DitherMaterial.prototype.constructor = DitherMaterial;

DitherMaterial.prototype.copy = function (source) {
    return new DitherMaterial(source);
};

exports.DitherMaterial = DitherMaterial;