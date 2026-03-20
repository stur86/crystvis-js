'use strict';

const CrystVis = require('../lib/visualizer.js').CrystVis;
const Primitives = require('../lib/primitives/index.js');
const { createGUIPanel } = require('../lib/gui-panel.js');

var visualizer = new CrystVis('#main-app', 0, 0);
visualizer.highlight_selected = true;
visualizer.theme = 'dark';

// Attach the GUI panel into the right-hand sidebar (inline, no overlap)
var guiPanel = createGUIPanel(visualizer, document.getElementById('gui-mount'));

function showError(msg) {
    var banner = document.getElementById('error-banner');
    banner.textContent = msg + '  (click to dismiss)';
    banner.style.display = 'block';
    banner.onclick = function() { banner.style.display = 'none'; };
}

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
        var loaded;
        try {
            loaded = visualizer.loadModels(reader.result, extension, name, {
                supercell: [sx, sy, sz],
                molecularCrystal: mcryst,
            });
        } catch (e) {
            showError('Could not load file: ' + e.message);
            return;
        }

        var modelName = Object.keys(loaded)[0];
        if (loaded[modelName] !== 0) {
            showError('Failed to load "' + modelName + '": ' + loaded[modelName]);
            return;
        }
        visualizer.displayModel(modelName);
        visualizer.displayed = visualizer.model.find({
            'all': []
        });

        // Update checkbox/slider states based on available data in the loaded model
        var model = visualizer.model;

        var ellipsoidCheck = document.getElementById('ellipsoid-check');
        var msSlider = document.getElementById('ms-scale');
        var hasMs = model.hasArray('ms');
        ellipsoidCheck.disabled = !hasMs;
        msSlider.disabled = !hasMs;
        if (!hasMs && ellipsoidCheck.checked) {
            ellipsoidCheck.checked = false;
            visualizer.displayed.removeEllipsoids('ms');
        }

        var hfEllipsoidCheck = document.getElementById('hf-ellipsoid-check');
        var hfSlider = document.getElementById('hf-scale');
        var hasHf = model.hasArray('hf');
        hfEllipsoidCheck.disabled = !hasHf;
        hfSlider.disabled = !hasHf;
        if (!hasHf && hfEllipsoidCheck.checked) {
            hfEllipsoidCheck.checked = false;
            visualizer.displayed.removeEllipsoids('hf');
        }

        // Isosurface only makes sense once a model (with a cell) is loaded
        document.getElementById('isosurf-check').disabled = false;

    };
}

window.changeDisplayed = function(query) {
    var select = visualizer.model.find(query);
    visualizer.displayed = select;
}

window.changeLabels = function() {
    var val = document.getElementById('label-check').checked;
    if (val) {
        visualizer.displayed.addLabels((a, i) => (a.crystLabel), 'labels', (a, i) => ({
            shift: [1.2*a.radius, 0, 0]
        }));
    } else {
        visualizer.displayed.removeLabels('labels');
    }
}

window.changeEllipsoids = function() {
    var val = document.getElementById('ellipsoid-check').checked;
    var scale = parseFloat(document.getElementById('ms-scale').value);
    if (val) {
        visualizer.displayed.find({
            'elements': 'H'
        }).addEllipsoids((a) => {
            return a.getArrayValue('ms');
        }, 'ms', {
            scalingFactor: scale,
            opacity: 0.2
        });
    } else {
        visualizer.displayed.removeEllipsoids('ms');
    }
}

window.changeMsScale = function() {
    document.getElementById('ms-scale-val').textContent = parseFloat(document.getElementById('ms-scale').value).toFixed(3);
    if (document.getElementById('ellipsoid-check').checked) {
        window.changeEllipsoids();
    }
}

window.changeHFEllipsoids = function() {
    var val = document.getElementById('hf-ellipsoid-check').checked;
    var scale = parseFloat(document.getElementById('hf-scale').value);
    if (val) {
        // Show HF (hyperfine) tensor ellipsoids for all atoms that have data
        visualizer.displayed.addEllipsoids((a) => {
            try {
                return a.getArrayValue('hf');
            } catch(e) {
                return null;
            }
        }, 'hf', {
            scalingFactor: scale,
            opacity: 0.3
        });
    } else {
        visualizer.displayed.removeEllipsoids('hf');
    }
}

window.changeHfScale = function() {
    document.getElementById('hf-scale-val').textContent = parseFloat(document.getElementById('hf-scale').value).toFixed(3);
    if (document.getElementById('hf-ellipsoid-check').checked) {
        window.changeHFEllipsoids();
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

// display test message
window.displayMessage = function() {
    var message = document.getElementById('message').value;
    visualizer.addNotification(message);
}

// clear messages
window.clearMessages = function() {
    visualizer.clearNotifications();
}

// ─── Camera state demo ───────────────────────────────────────────────────────

// Keep a snapshot of the last saved camera state so Restore can use it.
var _savedCameraState = null;

/** Pretty-print a camera state snapshot into the textarea. */
function updateCameraTextarea(state) {
    var ta = document.getElementById('camera-json');
    if (ta) ta.value = JSON.stringify(state, null, 2);
}

/** Mark the status line briefly then clear it. */
function setCameraStatus(msg) {
    var el = document.getElementById('camera-status');
    if (!el) return;
    el.textContent = msg;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.textContent = ''; }, 2500);
}

// Live-update the textarea whenever the user rotates / pans / zooms.
visualizer.onCameraChange(function(state) {
    updateCameraTextarea(state);
});

/** Save the current camera position so it can be restored later. */
window.saveCamera = function() {
    _savedCameraState = visualizer.getCameraState();
    updateCameraTextarea(_savedCameraState);
    setCameraStatus('View saved.');
};

/** Restore the most recently saved camera snapshot. */
window.restoreCamera = function() {
    if (!_savedCameraState) {
        setCameraStatus('Nothing saved yet — click Save view first.');
        return;
    }
    visualizer.setCameraState(_savedCameraState);
    setCameraStatus('View restored.');
};

/** Copy the current textarea JSON to the clipboard. */
window.copyCameraJSON = function() {
    var ta = document.getElementById('camera-json');
    if (!ta || !ta.value) { setCameraStatus('Nothing to copy yet.'); return; }
    navigator.clipboard.writeText(ta.value)
        .then(() => setCameraStatus('Copied to clipboard.'))
        .catch(() => { ta.select(); document.execCommand('copy'); setCameraStatus('Copied (fallback).'); });
};

/** Parse whatever is in the textarea and apply it as the camera state. */
window.applyPastedJSON = function() {
    var ta = document.getElementById('camera-json');
    if (!ta || !ta.value) { setCameraStatus('Textarea is empty.'); return; }
    try {
        var state = JSON.parse(ta.value);
        visualizer.setCameraState(state);
        setCameraStatus('Camera state applied.');
    } catch (e) {
        setCameraStatus('Invalid JSON: ' + e.message);
    }
};

// Appearance: colours, lighting and theme are now handled by the GUI panel.
