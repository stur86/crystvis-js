import esbuild from 'esbuild';
import path from 'path';
import {
    fileURLToPath
} from 'url';

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));

const toBuild = [
    '../lib/assets/fonts/bmpfonts.in.js',
    '../lib/shaders/index.in.js'
];

toBuild.forEach((inputFile) => {

    var outputFile = inputFile.replace('.in.js', '.js');

    esbuild.build({
        entryPoints: [path.join(__dirname, inputFile)],
        bundle: true,
        platform: 'node',
        outfile: path.join(__dirname, outputFile),
        loader: {
            '.png': 'dataurl',
            '.fnt': 'dataurl',
            '.frag': 'text',
            '.vert': 'text'
        }
    });
});