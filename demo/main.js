'use strict';

const CrystVis = require('../lib/visualizer.js').CrystVis;

var visualizer = new CrystVis('#main-app', {'width': 640, 'height': 480});

window.loadFile = function() {
    var file = document.getElementById('file-load').files[0];
    var reader = new FileReader();
    var extension = file.name.split('.').pop();
    
    reader.readAsText(file);
    reader.onload = function() {
        var name = file.name.split('.')[0];
        var loaded = visualizer.loadModels(reader.result, extension, name);
        visualizer.displayModel(loaded[0]);
    };
}