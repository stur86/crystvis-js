'use strict';

var $ = require('jquery');

var Renderer = require('./lib/render.js').Renderer;

// Bootstrap the whole thing!
$(document).ready(function() {
    var r = new Renderer('.main-app-content', 640, 480);
    r.test();
});