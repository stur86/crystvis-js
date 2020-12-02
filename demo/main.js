'use strict';

const CrystVis = require('../lib/visualizer.js').CrystVis;

var visualizer = new CrystVis('#main-app', 640, 480);
visualizer.highlight_selected = true;

visualizer.action_atom_click_middle = function(c) {
    console.log(c);
}
visualizer.action_atom_click_right = function(c) {
    console.log('Wrong button!');
}

visualizer.onAtomClick();

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
        //visualizer.displayed = visualizer.model.find(['cell', [0,0,0]]);
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
    }
    else {
        visualizer.displayed.removeLabels();
    }
}