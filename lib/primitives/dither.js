'use strict';

/** 
 * @fileoverview Functions for a dithering-based transparent material
 * @module
 */

import _ from 'lodash';
import * as THREE from 'three';
import * as Shaders from '../shaders/index.js';

/**
 * Recursive function to generate a power-of-two ordered dithering matrix
 * 
 * @param {int} n          Power of two index. The returned matrix will have a 2^n side.
 */
function makeDitherMatrix(n) {
    var dM2 = [0., 0.5, 0.75, 0.25];
    if (n <= 1) {
        return dM2;
    } else {
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
            var v = M0[x1 % N0 + (y1 % N0) * N0] + dM2[x2 + 2 * y2] / N02;
            M1.push(v);
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
    var dM = makeDitherMatrix(n);
    dM = dM.map(function(x) {
        return Math.floor((x + 0.5 / (N * N)) * 256);
    });
    dM = new Uint8Array(dM);

    var tx = new THREE.DataTexture(dM, N, N, THREE.RedFormat);
    tx.needsUpdate = true;

    return tx;
}

/**
 * Generate a pseudorandom shift for the dither texture. Designed to ensure
 * reproducibility given a float seed
 *
 * @param  {int}    N       Size of texture
 * @param  {float}  seed    Seed number used to generate the shift
 */
function rndShift(N, seed) {
    var a = 349588123;
    var b = 123958341;
    var sx = Math.pow(Math.sin(a*seed+b), 2)*N;
    var sy = Math.pow(Math.cos(b*seed+a), 2)*N;
    return new THREE.Vector2(sx, sy);
}

class DitherMaterial extends THREE.ShaderMaterial {

    /**
     * Initialise a DitherMaterial, a material that offers transparency with a
     * dithering method (and thus meshes better when multiple transparent
     * surfaces are overlapping).
     *  
     * @param  {Object} parameters  Options:
     *                                  - color
     *                                  - opacity
     *                                  - illumination 
     *                                  - n (controls the size of the dither texture, mostly can be left alone)
     *                                  - netting (if true, uses a different dithering system, applying object instead of screen
     *                                             coordinates)
     *                                  - netScale (scaling factor for the object coordinates; only used if netting = true)
     */
    constructor(parameters = {}) {

        var defaults = {
            color: 0xffffff,
            opacity: 0.5,
            illumination: 0.5,
            n: 5,
            netting: false,
            netScale: 5.0,
            shiftSeed: null
        };


        parameters = _.merge(defaults, parameters);

        // Safety check to avoid completely bricking the user's memory
        var n = Math.min(parameters.n, 10); // This way ditherTex will never be bigger than 1024x1024
        var N = Math.pow(2, n);
        var shift = rndShift(N, (parameters.shiftSeed == null? Math.random() : parameters.shiftSeed));
        var ditherTex = makeDitherTexture(n);

        super({
            uniforms: {
                color: new THREE.Uniform(new THREE.Color(parameters.color)),
                opacity: new THREE.Uniform(parameters.opacity),
                illum: new THREE.Uniform(parameters.illumination),
                shift: new THREE.Uniform(shift),
                ditherN: new THREE.Uniform(N),
                ditherTex: new THREE.Uniform(ditherTex),
                netting: new THREE.Uniform(parameters.netting),
                netScale: new THREE.Uniform(parameters.netScale),
            },
            fragmentShader: Shaders.ditherFragShader,
            vertexShader: Shaders.ditherVertShader,
            depthTest: true,
        });

        this.side = THREE.DoubleSide;
    }

    get color() {
        return this.uniforms.color.value.getHex();
    }

    set color(c) {
        this.uniforms.color.value.set(c);
        this.uniformsNeedUpdate = true;
    }

    get opacity() {
        return this.uniforms.opacity.value;
    }

    set opacity(o) {
        if (this.uniforms) {
            // This check is necessary since we're overriding the original 
            // property, otherwise we get an error when calling super()
            this.uniforms.opacity.value = o;
            this.uniformsNeedUpdate = true;
        }
    }
}

export {
    DitherMaterial
};