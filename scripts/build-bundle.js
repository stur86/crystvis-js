import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

esbuild.build({
    entryPoints: [process.argv[2]],
    bundle: true,
    inject: [path.join(__dirname, 'plugins-shim.js')],   // Crude, but a necessary fix for load-bmfont
    define: {
        Buffer: 'Buffer',
        THREE: 'THREE',
        BUILD_GRAPHICS: true
    },
    outfile: process.argv[3],
    loader: {
        '.png': 'dataurl',
        '.fnt': 'dataurl',
        '.frag': 'text',
        '.vert': 'text'
    },
    target: [
    'chrome58',
    'firefox57',
    'safari11',
    'edge16',
    ]
});