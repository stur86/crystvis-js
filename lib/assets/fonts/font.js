'use strict';

/**
 * @fileoverview    Contains a BitmapFont class designed to load bitmap fonts and ready them for use
 */

// Alpha test threshold for text material transparency
const ALPHA_TEST_THRESHOLD = 0.01;

// Luminance boost configuration constants
const LUMINANCE_BOOST_FACTOR = 1.2;
const LUMINANCE_BOOST_MAX = 0.95;

import _ from 'lodash';
import {
    loadFont,
    createGeometry
} from './threebmfont.js';
import * as Shaders from '../../shaders/index.js';
import * as THREE from 'three';

class BitmapFont {

    constructor(fntfile, pngfile) {

        const obj = this;
        this.font = null;
        this.texture = null;

        loadFont(fntfile, (err, font) => {
            obj.font = font;
        });

        const loader = new THREE.TextureLoader();

        this.texture = loader.load(pngfile);

    }

    get ready() {
        return (this.font != null && this.texture != null);
    }

    getTextMaterial(color = 0xffffff, opacity = 1.0, fixRotation = false,
        fixScale = false, targScale = 0.001, shift = [0, 0, 0], depthTest = true) {

        const texture = this.texture;

        if (shift instanceof Array) {
            shift = new THREE.Vector3(shift[0], shift[1], shift[2]);
        }
        
        // Handle color conversion more explicitly to avoid colorspace issues
        let textColor;
        if (typeof color === 'number') {
            // Convert hex color properly to ensure correct representation
            textColor = new THREE.Color();
            // Convert the hex number to a properly formatted hex string
            const hexString = '#' + ('000000' + color.toString(16)).slice(-6);
            textColor.set(hexString);
        } else if (color instanceof THREE.Color) {
            textColor = color.clone();
        } else {
            textColor = new THREE.Color(color);
        }
        
        // Boost color brightness for better visibility
        const hsl = textColor.getHSL({}); // getHSL returns an object with h, s, l
        hsl.l = Math.min(hsl.l * LUMINANCE_BOOST_FACTOR, LUMINANCE_BOOST_MAX);
        textColor.setHSL(hsl.h, hsl.s, hsl.l);

        return new THREE.RawShaderMaterial({
            uniforms: {
                opacity: new THREE.Uniform(opacity),
                map: new THREE.Uniform(texture),
                color: new THREE.Uniform(textColor),
                fixRotation: new THREE.Uniform(fixRotation),
                fixScale: new THREE.Uniform(fixScale),
                targScale: new THREE.Uniform(targScale),
                shift: new THREE.Uniform(shift)
            },
            side: THREE.DoubleSide,
            transparent: true,
            vertexShader: Shaders.msdfVertShader,
            fragmentShader: Shaders.msdfFragShader,
            depthTest: depthTest,
            depthWrite: false,
            glslVersion: THREE.GLSL3,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,
            alphaTest: ALPHA_TEST_THRESHOLD
        });
    }

    getTextGeometry(text, options = {}) {

        var defaults = {};

        options = _.merge(defaults, options);

        options.font = this.font;
        options.text = text;

        var geometry = createGeometry(options);

        return geometry;
    }
}

export {
    BitmapFont
}