/**
 * test/setup-dom.cjs
 *
 * Mocha --require hook (CommonJS) that installs a minimal jsdom window as
 * global so that DOM-dependent ES modules (THREE.js texture loader, jQuery,
 * etc.) can be imported in the Node.js test environment without crashing.
 */

'use strict';

const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="crystvis"></div></body></html>', {
    pretendToBeVisual: true,
    resources: 'usable',
});

// Helper: set a global, falling back to Object.defineProperty for read-only
// properties (e.g. navigator in Node.js 23+).
function setGlobal(name, value) {
    try {
        global[name] = value;
    } catch (_) {
        Object.defineProperty(global, name, { value, writable: true, configurable: true });
    }
}

// Expose browser globals expected by THREE.js, jQuery, etc.
setGlobal('window',            dom.window);
setGlobal('document',          dom.window.document);
setGlobal('navigator',         dom.window.navigator);
setGlobal('HTMLElement',       dom.window.HTMLElement);
setGlobal('HTMLCanvasElement', dom.window.HTMLCanvasElement);
setGlobal('AbortController',   dom.window.AbortController);
setGlobal('AbortSignal',       dom.window.AbortSignal);
setGlobal('Image',             dom.window.Image);
setGlobal('ImageData',         dom.window.ImageData);
setGlobal('XMLHttpRequest',    dom.window.XMLHttpRequest);
setGlobal('requestAnimationFrame',  (cb) => setTimeout(cb, 16));
setGlobal('cancelAnimationFrame',   (id) => clearTimeout(id));
setGlobal('ResizeObserver', class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
});

// Stub WebGL context so THREE.WebGLRenderer does not crash on getContext()
const canvasProto = dom.window.HTMLCanvasElement.prototype;
const _origGetContext = canvasProto.getContext;
canvasProto.getContext = function (type, ...args) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
        // Return a minimal WebGL stub that THREE can interrogate without causing
        // errors. Only the methods referenced during renderer initialisation
        // need to be present.
        const gl = {
            VERSION: 0x1F02,
            VENDOR: 0x1F00,
            RENDERER: 0x1F01,
            SHADING_LANGUAGE_VERSION: 0x8B8C,
            MAX_TEXTURE_IMAGE_UNITS: 0x8872,
            MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8B4C,
            MAX_TEXTURE_SIZE: 0x0D33,
            MAX_CUBE_MAP_TEXTURE_SIZE: 0x851C,
            MAX_VERTEX_ATTRIBS: 0x8869,
            MAX_VERTEX_UNIFORM_VECTORS: 0x8DFB,
            MAX_VARYING_VECTORS: 0x8DFC,
            MAX_FRAGMENT_UNIFORM_VECTORS: 0x8DFD,
            MAX_SAMPLES: 0x8D57,
            FRAMEBUFFER: 0x8D40,
            FRAMEBUFFER_COMPLETE: 0x8CD5,
            canvas: this,
            drawingBufferWidth: 300,
            drawingBufferHeight: 150,
            getContextAttributes: () => ({
                alpha: true,
                depth: true,
                stencil: true,
                antialias: false,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                powerPreference: 'default',
                failIfMajorPerformanceCaveat: false,
            }),
            getSupportedExtensions: () => [],
            getExtension: () => null,
            getParameter: (pname) => {
                switch (pname) {
                case gl.VERSION:
                    return 'WebGL 1.0';
                case gl.VENDOR:
                    return 'jsdom';
                case gl.RENDERER:
                    return 'jsdom WebGL stub';
                case gl.SHADING_LANGUAGE_VERSION:
                    return 'WebGL GLSL ES 1.0';
                case gl.MAX_TEXTURE_IMAGE_UNITS:
                case gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS:
                    return 16;
                case gl.MAX_TEXTURE_SIZE:
                case gl.MAX_CUBE_MAP_TEXTURE_SIZE:
                    return 4096;
                case gl.MAX_VERTEX_ATTRIBS:
                    return 16;
                case gl.MAX_VERTEX_UNIFORM_VECTORS:
                case gl.MAX_VARYING_VECTORS:
                case gl.MAX_FRAGMENT_UNIFORM_VECTORS:
                    return 1024;
                case gl.MAX_SAMPLES:
                    return 4;
                default:
                    return 0;
                }
            },
            getShaderPrecisionFormat: () => ({ rangeMin: 127, rangeMax: 127, precision: 23 }),
            createTexture: () => ({}),
            bindTexture: () => {},
            texParameteri: () => {},
            pixelStorei: () => {},
            activeTexture: () => {},
            enable: () => {},
            disable: () => {},
            blendEquation: () => {},
            blendFunc: () => {},
            depthFunc: () => {},
            depthMask: () => {},
            colorMask: () => {},
            clearColor: () => {},
            clearDepth: () => {},
            clearStencil: () => {},
            scissor: () => {},
            viewport: () => {},
            clear: () => {},
            useProgram: () => {},
            frontFace: () => {},
            cullFace: () => {},
            createBuffer: () => ({}),
            bindBuffer: () => {},
            bufferData: () => {},
            createFramebuffer: () => ({}),
            bindFramebuffer: () => {},
            createRenderbuffer: () => ({}),
            bindRenderbuffer: () => {},
            renderbufferStorage: () => {},
            framebufferRenderbuffer: () => {},
            framebufferTexture2D: () => {},
            createProgram: () => ({}),
            createShader: () => ({}),
            shaderSource: () => {},
            compileShader: () => {},
            attachShader: () => {},
            linkProgram: () => {},
            getProgramInfoLog: () => '',
            getProgramParameter: (p, pname) => {
                // LINK_STATUS
                if (pname === 35714) return true;
                return null;
            },
            getShaderParameter: () => true,
            getShaderInfoLog: () => '',
            getUniformLocation: () => ({}),
            getAttribLocation: () => 0,
            getActiveAttrib: () => null,
            getActiveUniform: () => null,
            uniform1i: () => {},
            uniform1f: () => {},
            uniform2f: () => {},
            uniform3f: () => {},
            uniform4f: () => {},
            uniformMatrix3fv: () => {},
            uniformMatrix4fv: () => {},
            vertexAttribPointer: () => {},
            enableVertexAttribArray: () => {},
            disableVertexAttribArray: () => {},
            drawArrays: () => {},
            drawElements: () => {},
            deleteBuffer: () => {},
            deleteTexture: () => {},
            deleteProgram: () => {},
            deleteShader: () => {},
            deleteFramebuffer: () => {},
            deleteRenderbuffer: () => {},
            isContextLost: () => false,
            getError: () => 0,
            // WebGL2 extras
            createVertexArray: () => ({}),
            bindVertexArray: () => {},
            deleteVertexArray: () => {},
            texImage2D: () => {},
            texImage3D: () => {},
            texStorage2D: () => {},
            texStorage3D: () => {},
            blitFramebuffer: () => {},
            readBuffer: () => {},
            drawBuffers: () => {},
            checkFramebufferStatus: () => gl.FRAMEBUFFER_COMPLETE,
            renderbufferStorageMultisample: () => {},
            createSampler: () => ({}),
            deleteSampler: () => {},
            bindSampler: () => {},
            samplerParameteri: () => {},
            samplerParameterf: () => {},
        };
        return gl;
    }
    if (_origGetContext) {
        return _origGetContext.call(this, type, ...args);
    }
    return null;
};
