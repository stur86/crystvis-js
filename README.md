# crystvis-js

A [Three.js](https://threejs.org/) based crystallographic visualisation tool. It reads multiple file formats and renders them with WebGL to a `canvas` element, allowing the user to interact with them. 

> **Note:** Version 0.6.0 includes a major update from Three.js 0.137 to 0.178. See [Three.js Migration Notes](docs-tutorials/ThreejsMigration.md) and [CHANGELOG](CHANGELOG.md) for details.

A few of the key functionality:

* visualize popular file formats as ball-and-stick structures, easily embedded within a webpage, with orbit mouse control for rotation and zooming;
* interactive visualisation responsive to user clicks via customizable callbacks;
* high definition text labels;
* advanced searching and selection functions to interact with specific subset of atoms (select by proximity, bonding, species and more);
* smart visualisation of molecular crystal: reconstruct full molecules across the periodic boundary;
* compute and display isosurfaces from volumetric data;
* visualize tensor data as ellipsoids centred on atoms.

### Supported formats 

The currently supported file formats are the following:

* **CIF**, using [crystcif-parse](https://github.com/CCP-NC/crystcif-parse);
* **XYZ**, specifically the Extended XYZ such as the one written by the [Atomic Simulation Environment](https://wiki.fysik.dtu.dk/ase/);
* **CELL**, input file supported by the DFT package [CASTEP](http://www.castep.org/);
* **Magres**, output file format for simulated NMR parameters used by CASTEP and Quantum Espresso and developed by the [CCP for NMR Crystallography](https://www.ccpnc.ac.uk/).

### Getting started 

In order to install `crystvis-js`, simply use the Node Package Manager:

```bash
npm install crystvis-js --save
```

You can then create a visualizer for your webpage by simply importing and instantiating it:

```js
import CrystVis from 'crystvis-js';

const visualizer = new CrystVis('#target-id', 800, 600)
```

will create an 800x600 canvas with the visualizer inside the element specified by the given selector. To load a model, simply load the contents of your file as a text string and then pass them to the visualizer's `loadModels` method:

```js
var loaded = visualizer.loadModels(contents);
console.log('Models loaded: ', loaded);
// loaded is an object: keys are model names, values are 0 (success) or an error string
var modelName = Object.keys(loaded)[0];
if (loaded[modelName] !== 0) {
    console.error('Failed to load model:', loaded[modelName]);
} else {
    visualizer.displayModel(modelName);
}
```

### API highlights

Full JSDoc documentation is available at [ccp-nc.github.io/crystvis-js](https://ccp-nc.github.io/crystvis-js/).

#### Camera state — save, restore and react to view changes

```js
// Snapshot the current camera (position, target, zoom) — plain JSON-serialisable object
const snap = visualizer.getCameraState();
// { position: {x,y,z}, target: {x,y,z}, zoom: 1 }

// Restore a previously saved snapshot
visualizer.setCameraState(snap);

// React to every rotate/pan/zoom (returns an unsubscribe function)
const unsub = visualizer.onCameraChange(state => {
    console.log('Camera moved:', state);
});
unsub(); // stop listening
```

#### Lifecycle events — react to model and display changes

```js
// Fired whenever models are loaded, deleted, or all cleared
const unsubList = visualizer.onModelListChange(names => {
    console.log('Loaded models:', names);
});

// Fired whenever displayModel() completes; receives model name or null
const unsubDisplay = visualizer.onDisplayChange(name => {
    console.log('Now displaying:', name);
});

// Remove all loaded models in one atomic operation
visualizer.unloadAll();
```

#### Model metadata — access source and parameters after loading

```js
// Retrieve the raw file text and extension originally passed to loadModels()
const src = visualizer.getModelSource(modelName);
// { text: '...', extension: 'cif' }

// Retrieve the merged loading parameters (supercell, molecularCrystal, …)
const params = visualizer.getModelParameters(modelName);

// Retrieve prefix and original structure name
const meta = visualizer.getModelMeta(modelName);
// { prefix: 'cif', originalName: 'struct' }
```

#### Scene appearance — background, colours and lighting

All appearance properties live under `vis.appearance.*` and take effect immediately, retroactively updating any already-rendered objects.

```js
// ── Background ────────────────────────────────────────────────────────────────

// Background colour (hex int, CSS string, or any THREE.Color-compatible value)
visualizer.appearance.background = '#1a1a2e';
visualizer.appearance.background = 0x1a1a2e;   // equivalent

// ── Atom label colour ─────────────────────────────────────────────────────────

// Colour for text labels added via view.addLabels(); updates existing sprites immediately
visualizer.appearance.label.color = 0xffffff;

// ── Highlight (aura) ──────────────────────────────────────────────────────────

visualizer.appearance.highlight.color          = '#00ffcc';  // fill colour
visualizer.appearance.highlight.borderColor    = '#ffffff';  // outer ring colour
visualizer.appearance.highlight.borderFraction = 0.15;       // ring width 0–1
visualizer.appearance.highlight.opacity        = 0.6;        // 0 = transparent, 1 = opaque

// ── Unit-cell lines ───────────────────────────────────────────────────────────

visualizer.appearance.cell.lineColor = '#888888';   // wireframe box
visualizer.appearance.cell.axisX     = '#ff4444';   // a-axis arrow
visualizer.appearance.cell.axisY     = '#44ff44';   // b-axis arrow
visualizer.appearance.cell.axisZ     = '#4444ff';   // c-axis arrow

// ── Selection-box overlay (drag to multi-select) ──────────────────────────────

visualizer.appearance.selbox.background = '#1111aa';
visualizer.appearance.selbox.border     = '#5555dd';
visualizer.appearance.selbox.opacity    = 0.4;

// ── Lighting ──────────────────────────────────────────────────────────────────

// Ambient (scene-wide) light intensity (default 0.3)
visualizer.appearance.lighting.ambient = 0.5;

// Directional light intensity (preserves current direction)
visualizer.appearance.lighting.directional = 0.8;

// Directional light intensity + direction; pass null to keep any component unchanged
visualizer.appearance.lighting.setDirectional(0.8, 0, 1, -1);
visualizer.appearance.lighting.setDirectional(0.6, null, null, -1);   // only change pz

// ── Full theme replacement ────────────────────────────────────────────────────

// Built-in presets ('dark' is the default)
visualizer.appearance.theme = 'light';
visualizer.appearance.theme = 'dark';

// Fully custom theme object
visualizer.appearance.theme = {
    background:      0x1a1a2e,
    foreground:      0xeaeaea,
    highlight:       0x00ffcc,
    cell_line_color: 0x888888,
    label_color:     0xffffff,
};

// vis.theme is kept as a shortcut alias for vis.appearance.theme
visualizer.theme = 'light';
```

#### Optional GUI control panel

`crystvis-js` ships a ready-made floating control panel built on
[lil-gui](https://lil-gui.georgealways.com/). It exposes some common
appearance parameters — lighting, colours, atom/bond sizes, supercell, and
display mode — without any manual wiring.

**No additional install needed.** `lil-gui` is listed as a peer dependency
and bundled automatically when you build with esbuild / Vite / webpack.

##### Vanilla JS

```js
import { CrystVis, createGUIPanel } from '@ccp-nc/crystvis-js';

const vis = new CrystVis('#app');
const gui = createGUIPanel(vis);   // attaches to <body> by default

// The returned lil-gui instance gives you full control:
gui.hide();     // collapse / hide the panel programmatically
gui.show();     // reveal it again
gui.destroy();  // remove it from the DOM entirely
```

##### Mounting into a specific container

Pass any DOM element as the second argument to `createGUIPanel` and the panel
will be appended there instead of `<body>`:

```js
const container = document.getElementById('controls');
const gui = createGUIPanel(vis, container);
```

##### React / Vue (e.g. MagresView 2)

```jsx
import { useEffect, useRef } from 'react';
import { CrystVis, createGUIPanel } from '@ccp-nc/crystvis-js';

function Viewer() {
    const mountRef = useRef(null);
    const visRef   = useRef(null);
    const guiRef   = useRef(null);

    useEffect(() => {
        visRef.current = new CrystVis(mountRef.current);
        guiRef.current = createGUIPanel(visRef.current);
        return () => { guiRef.current?.destroy(); };
    }, []);

    const togglePanel = () => {
        const gui = guiRef.current;
        gui._hidden ? gui.show() : gui.hide();
    };

    return (
        <>
            <div ref={mountRef} style={{ width: '100%', height: '600px' }} />
            <button onClick={togglePanel}>Toggle controls</button>
        </>
    );
}
```

##### Panel sections

| Section | Controls |
|---------|----------|
| **Scene** | Theme preset (dark / light), background colour |
| **Lighting** | Ambient intensity, directional intensity, XYZ light direction |
| **Labels** | Label text colour |
| **Selection highlight** | Fill colour, border colour, border fraction, opacity |
| **Unit cell appearance** | Box colour, a / b / c axis colours |
| **Structure ⚠ requires reload** | Supercell a/b/c (1–5), molecular crystal flag, VdW radius scale, Apply & Reload button |
| **Displayed atoms** | Show mode (Unit cell / All atoms / 5 Å sphere), atom scale, atom sphere opacity |
| **Bonds** | Bond radius (Å), bond opacity, show/hide bonds |

> **Note on "Apply & Reload":** the *Structure* section changes (supercell size, VdW
> scaling, molecular-crystal mode) take effect only after clicking **→ Apply & Reload**,
> because they require the bond graph to be recomputed.

#### Selection serialisation — save and reconstruct atom subsets

```js
// Serialise a selection to plain data
const indices = visualizer.selected.toIndices(); // number[]
const labels  = visualizer.selected.toLabels();  // string[] (crystLabel per atom)

// Reconstruct from indices later
visualizer.selected = visualizer.model.viewFromIndices(indices);

// Reconstruct from labels — resilient to atom-index reordering on reload
visualizer.selected = visualizer.model.viewFromLabels(labels);
```

### Preparing for development

If you want to develop for crystvis-js, you should follow these steps:

* fork the repository
* clone the forked repository locally to your system
* install all the required packages, *including the development dependencies*, with `npm install --production=false`

You're then ready to develop. In particular you can use:

* `npm test` to run with Mocha the suite of tests found in `./test`
* `npm start` to start a server that includes the in-browser tests from `./test/test-html` as well as the demo from `./demo`
* `npm run docs` to compile the documents
* `npm run deploy-docs` to compile the documents and then deploy them to the `gh-pages` branch of your repository

#### Fonts and shaders

Some additional steps are necessary when dealing with fonts and shaders. You generally shouldn't worry about these when working 
with most of the code, but in some special cases it might be necessary to do this.

Fonts in crystvis-js need to be translated to a bitmap format to be usable. In other words, a regular font format (like a TTF file)
must be rendered into a bitmap texture and a table of coordinates designating each letter to then be used in graphical rendering. This operation
relies on the library `msdf-bmfont-xml` and is executed by running the command `npm run build-fonts`. The original fonts are found in
the `./fonts` folder, and they get rendered to `./lib/assets/fonts`. This command needs only to be rerun *if the TTF files change*.

Shaders are provided as `.frag` and `.vert` files. Both shaders and font textures need to baked directly into the JavaScript files in order to be 
included in the final build. Since ESBuild (the package used to build crystvis-js) has a hard time dealing with them in the final pass, they get
pre-baked with an additional step that only needs to be repeated whenever either of them changes. This consists of taking "template" JS files (for
shaders it's `./lib/shaders/index.in.js`, for fonts `./lib/assets/fonts/bmpfonts.in.js`) and rebuilding them into final files with the 
assets imported in data URL form. The script to do this is `npm run build-resources`. This command only needs to be rerun *if the fonts were rebuilt, if the shader
code was edited, or if any of the two template files was changed*.