import generateBMFont from 'msdf-bmfont-xml';
import fs from 'fs';
import path from 'path';
import * as glob from 'glob';


// We update by hand whenever we want to build a new font
const fontList = [
    'fonts/Rubik/static/Rubik-Medium.ttf',
    'fonts/OpenSans/static/OpenSans/OpenSans-Medium.ttf'
];

const defaultCharset = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩÅ°".split('');


const savePath = 'lib/assets/fonts';

// Clean up the destination path!
var old_files = glob.sync(path.join(savePath, '*.+(png|fnt)'));
old_files.forEach((fname, index) => {
    fs.unlinkSync(fname);
});

for (var i in fontList) {
    const fname = fontList[i];

    generateBMFont(fname, {charset: defaultCharset}, (error, textures, font) => {

        textures.forEach((texture, index) => {

            var save = path.basename(texture.filename) + '.png';
            save = path.join(savePath, save);

            fs.writeFile(save, texture.texture, (err) => {
                if (err) throw err;
            });

        });

        var save = path.basename(font.filename);
        save = path.join(savePath, save);

        fs.writeFile(save, font.data, (err) => {
            if (err) throw err;
        });

    });
}