'use strict';

const CrystVis = require('../lib/visualizer.js').CrystVis;
const Primitives = require('../lib/primitives/index.js');

var visualizer = new CrystVis('#main-app', 640, 480);
visualizer.highlight_selected = true;

window.loadFile = function() {
    var file = document.getElementById('file-load').files[0];
    var reader = new FileReader();
    var extension = file.name.split('.').pop();

    var sx = parseInt(document.getElementById("scell-x").value) || 1;
    var sy = parseInt(document.getElementById("scell-y").value) || 1;
    var sz = parseInt(document.getElementById("scell-z").value) || 1;

    reader.readAsText(file);
    reader.onload = function() {
        var mcryst = document.getElementById('molcryst-check').checked;
        var name = file.name.split('.')[0];
        var loaded = visualizer.loadModels(reader.result, extension, name, {
            supercell: [sx, sy, sz],
            molecularCrystal: mcryst
        });
        visualizer.displayModel(loaded[0]);
        visualizer.displayed = visualizer.model.find({
            'all': []
        });
    };
}

window.changeDisplayed = function(query) {
    var select = visualizer.model.find(query);
    visualizer.displayed = select;
}

window.changeLabels = function() {
    var val = document.getElementById('label-check').checked;
    if (val) {
        visualizer.displayed.addLabels();
    } else {
        visualizer.displayed.removeLabels();
    }
}

window.changeEllipsoids = function() {
    var val = document.getElementById('ellipsoid-check').checked;
    if (val) {
        visualizer.displayed.find({
            'elements': 'H'
        }).addEllipsoids((a) => {
            return a.getArrayValue('ms');
        }, 'ms', {
            scalingFactor: 0.05,
            opacity: 0.2
        });

    } else {
        visualizer.displayed.removeEllipsoids('ms');
    }
}

var isosurface = null;
window.changeIsosurface = function() {
    var val = document.getElementById('isosurf-check').checked;

    // Create the data
    var field = [];
    for (let x = 0; x < 15; x += 1) {
        field.push([]);
        for (let y = 0; y < 15; y += 1) {
            field[x].push([]);
            for (let z = 0; z < 15; z += 1) {
                var r = Math.pow(x-8, 2);
                r += Math.pow(y-8, 2);
                r += Math.pow(z-8, 2);
                r = Math.sqrt(r);
                field[x][y].push(r);
            }
        }
    }


    if (val) {
        var cell =  visualizer.model.cell;
        isosurface = new Primitives.IsosurfaceMesh(field, 6.0, cell, 
            {
                opacityMode: Primitives.IsosurfaceMesh.RENDER_WFRAME,
                isoMethod: Primitives.IsosurfaceMesh.ISO_SURFACE_NETS
            });
        visualizer.addPrimitive(isosurface);
    } else {
        if (isosurface) {
            visualizer.removePrimitive(isosurface);
        }
    }

}