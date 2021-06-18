# crystvis-js

A [Three.js](https://threejs.org/) based crystallographic visualisation tool. It reads multiple file formats and renders them with WebGL to a `canvas` element, allowing the user to interact with them. A few of the key functionality:

* visualize popular file formats as ball-and-stick structures, easily embedded within a webpage, with orbit mouse control for rotation and zooming;
* interactive visualisation responsive to user clicks via customizable callbacks;
* high definition text labels;
* advanced searching and selection functions to interact with specific subset of atoms (select by proximity, bonding, species and more);
* smart visualisation of molecular crystal: reconstruct full molecules across the periodic boundary;
* compute and display isosurfaces from volumetric data;
* visualize tensor data as ellipsoids centred on atoms.

### Supported formats 

The currently supported file formats are the following:

* **CIF**, using [crystcif-parse](https://github.com/stur86/crystcif-parse);
* **XYZ**, including Extended XYZ such as the one written by the [Atomic Simulation Environment](https://wiki.fysik.dtu.dk/ase/);
* **CELL**, input file supported by the DFT package [CASTEP](http://www.castep.org/);
* **Magres**, output file format for simulated NMR parameters used by CASTEP and Quantum Espresso and developed by the [CCP for NMR Crystallography](https://www.ccpnc.ac.uk/).

### Getting started 

In order to install `crystvis-js`, simply use the Node Package Manager:

    npm install crystvis-js --save

You can then create a visualizer for your webpage by simply importing and instantiating it:

```js

import CrystVis from 'crystvis-js';

const visualizer = CrystVis('#target-id', 800, 600);
```

will create an 800x600 canvas with the visualizer inside the element specified by the given selector. To load a model, simply load the contents of your file as a text string and then pass them to the visualizer's `loadModels` method:

```js 
var loaded = visualizer.loadModels(contents);
console.log('Models loaded: ', loaded);
visualizer.displayModel(loaded[0]);
```