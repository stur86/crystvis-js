'use strict';

/**
 * @fileoverview    Contains a BitmapFont class designed to load bitmap fonts and ready them for use
 */

import _ from 'lodash';
import loadFont from 'load-bmfont';
import createGeometry from 'three-bmfont-text';
import {
    msdfVertShader,
    msdfFragShader
} from '../../shaders';
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

    getTextMaterial(color=0xffffff, opacity=1.0) {

        const texture = this.texture;

        return new THREE.RawShaderMaterial({
            uniforms: {
                opacity: new THREE.Uniform(opacity),
                map: new THREE.Uniform(texture),
                color: new THREE.Uniform(new THREE.Color(color))
            },
            side: THREE.DoubleSide,
            transparent: true,
            vertexShader: msdfVertShader,
            fragmentShader: msdfFragShader
        });

    }

    getTextGeometry(text, options = {}) {

        options.font = this.font;
        options.text = text;

        var geometry = createGeometry(options);

        return geometry;
    }
}

export {
    BitmapFont
}