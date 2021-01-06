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

// // A special treatment for fonts.js. Needs some definitions injected
// esbuild.build({
//     entryPoints: [path.join(__dirname, '../lib/assets/fonts/threebmfont.in.js')],
//     bundle: true,
//     inject: [path.join(__dirname, 'plugins-shim.js')],   // Crude, but a necessary fix for load-bmfont
//     define: {
//         Buffer: 'Buffer',
//         THREE: 'THREE',
//     },
//     platform: 'node',
//     outfile: path.join(__dirname, '../lib/assets/fonts/threebmfont.js')    
// });

