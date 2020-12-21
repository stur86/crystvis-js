'use strict';

const CrystVis = require('../lib/visualizer.js').CrystVis;
const Primitives = require('../lib/primitives/index.js');

var visualizer = new CrystVis('#main-app', 640, 480);
visualizer.highlight_selected = true;

visualizer._renderer.add(new Primitives.AtomMesh([0,0,0], 1.2, 0x00ffaa));
visualizer._renderer.add(new Primitives.EllipsoidMesh({
    eigenvalues: [6, 2, 3],
    eigenvectors: [[1, -1, 0], 
                   [1,  1, 0], 
                   [0,  0, 1]],
    opacity: 0.3,
}));

window.loadFile = function() {
    var file = document.getElementById('file-load').files[0];
    var reader = new FileReader();
    var extension = file.name.split('.').pop();

    var sx = parseInt(document.getElementById("scell-x").value) || 1;
    var sy = parseInt(document.getElementById("scell-y").value) || 1;
    var sz = parseInt(document.getElementById("scell-z").value) || 1;

    reader.readAsText(file);
    reader.onload = function() {
        var name = file.name.split('.')[0];
        var loaded = visualizer.loadModels(reader.result, extension, name, [sx, sy, sz]);
        visualizer.displayModel(loaded[0]);
        visualizer.displayed = visualizer.model.find(['all']);
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