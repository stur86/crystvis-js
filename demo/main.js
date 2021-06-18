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
        visualizer.displayModel(Object.keys(loaded)[0]);
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
    for (let x = 0; x < 30; x += 1) {
        field.push([]);
        for (let y = 0; y < 30; y += 1) {
            field[x].push([]);
            for (let z = 0; z < 30; z += 1) {
                var r = Math.pow(x-15, 2);
                r += Math.pow(y-15, 2);
                r += Math.pow(z-15, 2);
                r = Math.sqrt(r);
                var phi = Math.acos((z-15)/r);
                field[x][y].push(r-Math.cos(3*phi)*0.2);
            }
        }
    }


    if (val) {
        var cell =  visualizer.model.cell;
        isosurface = new Primitives.IsosurfaceMesh(field, 7.0, cell, 
            {
                opacityMode: Primitives.IsosurfaceMesh.RENDER_WFRAME,
                isoMethod: Primitives.IsosurfaceMesh.ISO_SURFACE_NETS
            });
        visualizer.addPrimitive(isosurface);
        isosurface.color = '#ff0000';
    } else {
        if (isosurface) {
            visualizer.removePrimitive(isosurface);
        }
    }

}