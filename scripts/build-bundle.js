import esbuild from 'esbuild';

esbuild.build({
    entryPoints: [process.argv[2]],
    bundle: true,
    outfile: process.argv[3],
    loader: {
        '.png': 'dataurl',
        '.frag': 'text',
        '.vert': 'text'
    }
});