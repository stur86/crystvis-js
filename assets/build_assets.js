import fs from 'fs';
import * as datauri from 'datauri/parser.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DataURIParser = datauri.default;

var files = fs.readdirSync(__dirname);
var parser = new DataURIParser();

console.log("Building all assets");

var assets = {};

for (var i in files) {
    var f = join(__dirname, files[i]);

    if (f == __filename) {
        // Skip self script
        continue;
    }

    console.log("\tBuilding " + files[i]);

    var ext = files[i].split('.')[1];
    var buffer = fs.readFileSync(f);

    assets[files[i]] = parser.format('.' + ext, buffer).content;
}

console.log("Writing assets.js file")

assets = "const assets = " + JSON.stringify(assets, null, 4) + ";";
assets += "\nexport { assets };";
fs.writeFile(join(__dirname, '../lib/assets.js'), assets, function(err) {
    if (err) {
        console.log("ERROR: ", err);
    }
    else {
        console.log("File written successfully");
    }
});