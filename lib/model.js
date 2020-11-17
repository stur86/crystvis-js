'use strict';

/** 
 * @fileoverview Class holding the atomic models to be plotted
 * @package 
 */

const _ = require('lodash');
const mjs = require('mathjs');
const PeriodicTable = require('mendeleev').PeriodicTable;

const Atoms = require('crystcif-parse').Atoms;

const utils = require('./utils.js');
const data = require('./data.js');
const QueryParser = require('./query.js').QueryParser;
const ModelView = require('./modelview.js').ModelView;

/**
 * An 'image' of a single atom from a model. This represents a specific periodic copy of that atom (if applicable).
 * @class
 * @param {Model} model     The model from which the image is from
 * @param {int} index       Index of the atom in the model 
 * @param {Array} ijk       Indices of the cell in which the image is located
 */
function AtomImage(model, index, ijk) {

    this._model = model;
    this._index = index;
    this._ijk = ijk || [0, 0, 0];

    // String ID
    this._id = this._index + '_' + _.join(this._ijk, '_');
    // Integer index
    this._img_index = utils.supercellIndex(index, this._ijk,
        model.supercell, model.length);

    this._xyz0 = model._positions[index];

    this._bondsFrom = []; // BondImages of bonds for which this is atom1
    this._bondsTo = [];   // BondImages of bonds for which this is atom2

    if (!model.periodic) {
        this._fxyz0 = null;
        this._fxyz = null;
        this._xyz = this._xyz0;
    } else {
        this._fxyz0 = model._scaled_positions[index];
        this._fxyz = [this._fxyz0[0]+ijk[0], 
                      this._fxyz0[1]+ijk[1],
                      this._fxyz0[2]+ijk[2]];
        this._xyz = mjs.multiply(this._fxyz, model._cell);
    }

    // Visual properties
    this._visible = false;
    this._color = this.cpkColor;
    this._base_radius = this.vdwRadius / 4.0;
    this._scale = 1.0;
    this._opacity = 1.0;

    this._labels = [];
}

AtomImage.prototype = {
    get model() {
        return this._model;
    },
    get index() {
        return this._index;
    },
    get id() {
        return this._id;
    },
    get img_index() {
        return this._img_index;
    },
    get element() {
        return this._model._elems[this._index];
    },
    get number() {
        var el = PeriodicTable.getElement(this.element);
        return (el ? el.number : 0);
    },
    get cpkColor() {
        return data.getCpkColor(this.element);
    },
    get vdwRadius() {
        return data.getVdwRadius(this.element);
    },
    get bondsFrom() {
        return Array.from(this._bondsFrom);
    },
    get bondsTo() {
        return Array.from(this._bondsTo);
    },
    get bonds() {
        return _.concat(this._bondsFrom, this._bondsTo);
    },
    get ijk() {
        return Array.from(this._ijk);
    },
    get xyz0() {
        return Array.from(this._xyz0);
    },
    get xyz() {
        return Array.from(this._xyz);
    },
    get fxyz0() {
        return Array.from(this._fxyz0);
    },
    get fxyz() {
        return Array.from(this._fxyz);
    },
    get molecule_index() {
        return this._model._molinds[this._index];
    },
    get mesh() {
        return this._model._graphics.atoms[this._img_index];
    },
    set mesh(m) {
        this._model._graphics.atoms[this._img_index] = m;
    },
    get visible() {
        return this._visible;
    },
    set visible(v) {        
        this._visible = v;
        var mesh = this.mesh;
        if (mesh) {
            mesh.visible = v;
        } else if (v && this._model._renderer) {
            mesh = this._model._renderer._addAtom(this._xyz,
                this.radius,
                this._color);
            mesh.atom_opacity = this._opacity;
            mesh.image = this;
            this.mesh = mesh;
        }

        // Update connected bonds' visibility
        for (var i = 0; i < this._bondsFrom.length; ++i) {
            var b = this._bondsFrom[i];
            b.visible = b.visible;
        }

        for (var i = 0; i < this._bondsTo.length; ++i) {
            var b = this._bondsTo[i];
            b.visible = b.visible;
        }
    },
    get base_radius() {
        return this._base_radius;
    },
    set base_radius(r) {
        this._base_radius = r;
        var mesh = this.mesh;
        if (mesh) {
            mesh.atom_radius = this.radius;
        }
    },
    get scale() {
        return this._scale;
    },
    set scale(s) {
        this._scale = s;
        var mesh = this.mesh;
        if (mesh) {
            mesh.atom_radius = this.radius;
        }
    },
    get radius() {
        return this._scale*this._base_radius;
    },
    set radius(r) {
        this.scale = r/this._base_radius;
    },
    get color() {
        return this._color;
    },
    set color(c) {
        this._color = c;
        var mesh = this.mesh;
        if (mesh) {
            mesh.atom_color = c;
        }

        _.map(this._bondsFrom, function(b) {
            b.color1 = c;
        });

        _.map(this._bondsTo, function(b) {
            b.color2 = c;
        });

    },
    get opacity() {
        return this._opacity;
    },
    set opacity(o) {
        this._opacity = o;
        var mesh = this.mesh;
        if(mesh) {
            mesh.atom_opacity = o;
        }

        _.map(this._bondsFrom, function(b) {
            b.opacity1 = o;
        });

        _.map(this._bondsTo, function(b) {
            b.opacity2 = o;
        });

    },
    /**
     * Add a text label to the atom.
     * 
     * @param {String}  text     Content of the label
     * @param {Array}   shift    Shift in position of the label (relative to the atom)
     * @param {String}  name     Name to use to refer to the label (necessary to overwrite/erase later)
     * @param {Number}  size     Size of the label
     * @param {Object}  options  Dictionary of other options (e.g. font family, text color, etc. See RenderTextSprite)
     */
    addLabel(text, shift, name, size=1, options={}) {
        if (name[0] == '#') {
            throw '# is a reserved characters and label names can not begin with it';
        }
        var fname = '#' + this.img_index + '_' + name;
        this.removeLabel(fname); // Precautionary

        if (this._model._renderer) {
            var label = this._model._renderer._addBillBoard(this.xyz, text, size, shift, options);
            this._model._graphics.labels[fname] = label;
        }
    },
    /**
     * Remove the label of a given name
     * 
     * @param {String}  name     Name of the label
     */
    removeLabel(name) {
        var fname = '#' + this.img_index + '_' + name;

        var l = this._model._graphics.labels[fname];
        if (l)
            this._model._renderer._removeBillBoard(l);
        delete this._model._graphics.labels[fname];
    },
    // Check equality with another image
    equals(ai) {
        return (this._model == ai._model &&
            this._index == ai._index &&
            _.isEqual(this._ijk, ai._ijk));
    },
    // Return a copy, possibly shifted to a different cell
    copy(shift = [0, 0, 0]) {
        return new AtomImage(this._model,
            this._index,
            mjs.add(this._ijk, shift));
    },
}

/**
 * An 'image' of a single bond in the model. This represents the connection
 * between two specific AtomImages
 * @class
 * @param {Model}     model     The model from which the image is from
 * @param {AtomImage} im1       AtomImage from which the bond starts
 * @param {AtomImage} im2       AtomImage to which the bond ends
 */
function BondImage(model, im1, im2) {

    this._model = model;
    this._im1 = im1;
    this._im2 = im2;

    this._im1._bondsFrom.push(this);
    this._im2._bondsTo.push(this);

    this._key = this._im1.img_index + '_' + this._im2.img_index;

    // Visual properties
    this._visible = true;
    this._radius = 0.2;
    this._opacity = 1.0;    

}
BondImage.prototype = {
    get model() {
        return this._model;
    },
    get atom1() {
        return this._im1;
    },
    get atom2() {
        return this._im2;
    },
    get key() {
        // Used in dictionary for quick reference
        return this._key;
    },
    get mesh() {
        return this._model._graphics.bonds[this._key];
    },
    set mesh(m) {
        this._model._graphics.bonds[this._key] = m;
    },
    get radius() {
        return this._radius;
    },
    set radius(r) {
        this._radius = r;
        var mesh = this.mesh;
        if (mesh) {
            mesh.bond_radius = r;
        }
    },
    set color1(c) {
        var mesh = this.mesh;
        if(mesh) {
            mesh.bond_color_1 = c;
        }
    },
    set color2(c) {
        var mesh = this.mesh;
        if(mesh) {
            mesh.bond_color_2 = c;
        }
    },
    set opacity1(o) {
        var mesh = this.mesh;
        if(mesh) {
            mesh.bond_opacity_1 = o;
        }
    },
    set opacity2(o) {
        var mesh = this.mesh;
        if(mesh) {
            mesh.bond_opacity_2 = o;
        }
    },
    get visible() {
        return this._visible;
    },
    set visible(v) {
        this._visible = v;
        v = v && this.atom1.visible && this.atom2.visible;
        var mesh = this.mesh;
        if (mesh) {
            mesh.visible = v;
        } else if (v && this._model._renderer) {
            mesh = this._model._renderer._addBond(
                this.atom1.xyz, this.atom2.xyz, this._radius, 
                this.atom1.color, this.atom2.color);
            this.mesh = mesh;
        }
    }
}

/**
 * An object containing an Atomic structure and taking care of its periodic
 * nature, allowing querying and selection, and so on.
 * @class
 * @param {crystcif.Atoms}  atoms       Atomic structure, in crystcif's Atoms format
 * @param {Array}           supercell   Supercell size (only used if the structure is periodic)
 */
function Model(atoms, supercell = [1, 1, 1]) {

    this._atoms = atoms;
    this._data = {};

    /* Load the positions, cell, and other key data
       Important: to save memory, we're simply storing references.
       These are NOT to be changed!
    */
    this._elems = this._atoms._arrays['symbols'];
    this._nums = this._atoms._arrays['numbers'];
    this._positions = this._atoms._arrays['positions'];
    this._cell = this._atoms._cell;
    this._pbc = this._atoms._pbc;
    this._periodic = !this._pbc.includes(false);
    this._inv_cell = this._atoms._inv_cell;
    this._supercell = [1, 1, 1];
    this._supercell_grid = [
        [0, 0, 0]
    ];

    if (this._periodic) {
        // R matrix: indispensable for calculations of periodic distances
        this._r_matrix = mjs.multiply(this._cell, mjs.transpose(this._cell));
        var ediag = mjs.eigs(this._r_matrix);
        // Sort by eigenvalue
        ediag = _.zip(ediag.values, ediag.vectors);
        ediag = _.sortBy(ediag, function(x) {
            return x[0];
        });
        ediag = _.unzip(ediag);

        this._r_diag = {
            values: ediag[0],
            vectors: ediag[1],
        }

        this._supercell = supercell; // Default
        this._supercell_grid = utils.supercellGrid(supercell);
        this._scaled_positions = this._atoms.get_scaled_positions();
    }

    // Compile all images for this supercell
    this._atom_images = this.atomImages();

    this._computeBonds();
    this._computeMolecules();

    this._bond_images = this.bondImages();

    // Parser for queries
    this._qparse = new QueryParser({
            'all': this._queryAll,
            'elements': this._queryElements,
            'cell': this._queryCell,
            'box': this._queryBox,
            'sphere': this._querySphere
        }, this);

    // By default no rendering
    this.unsetRenderer();
}

Model.prototype = {
    // Using the .get_ methods of _atoms guarantees these are copies,
    // not pointers to the real thing
    get length() {
        return this._atoms.length();
    },
    get symbols() {
        return this._atoms.get_chemical_symbols();
    },
    get numbers() {
        return this._atoms.get_atomic_numbers();
    },
    get positions() {
        return this._atoms.get_positions();
    },
    get scaled_positions() {
        return this._atoms.get_scaled_positions();
    },
    get cell() {
        return this._atoms.get_cell();
    },
    get pbc() {
        return this._atoms.get_pbc();
    },
    get periodic() {
        return this._periodic;
    },
    get supercell() {
        return Array.from(this._supercell);
    },
    get supercell_grid() {
        return JSON.parse(JSON.stringify(this._supercell_grid));
    },
    get images() {
        return this._atom_images;
    },
    get axes() {
        return this._graphics.axes;
    },
    get box() {
        return this._graphics.box;
    },
    // Set and get arrays on the underlying Atoms object
    setArray(name, arr) {
        this._atoms.set_array(name, arr);
    },
    getArray(name) {
        return this._atoms.get_array(name);
    },
    /**
     * Compute the bonds within the model. For internal use
     */
    _computeBonds() {

        var N = this.length;
        this._bondmat = Array(N); // Bond matrix
        this._bondmat = _.map(this._bondmat, function(x) {
            return _.map(Array(N), function(y) {
                return [];
            });
        });

        // Van der Waals radii by element
        var vdwr = _.map(this.symbols, function(s) {
            return data.getVdwRadius(s);
        });
        var maxr = _.max(vdwr);

        var cell = this.cell;
        var sgrid = [
            [0, 0, 0]
        ];
        var p = this._positions;

        if (this._periodic) {
            var scell = this.minimumSupercell(maxr);
            sgrid = utils.supercellGrid(scell);
        }

        // Now iterate over all atom pairs
        for (var i = 0; i < this.length; ++i) {

            var p1 = p[i];

            for (var j = i; j < this.length; ++j) {

                var p2 = p[j];

                for (var k = 0; k < sgrid.length; ++k) {
                    var c = sgrid[k];
                    if ((i == j) && (c[0] == 0 && c[1] == 0 && c[2] == 0)) {
                        // Just the same atom, skip
                        continue;
                    }
                    var r = [0, 0, 0];
                    // Here we write the algebra explicitly 
                    // for efficiency reasons
                    if (this._periodic) {
                        r[0] = c[0] * cell[0][0] + c[1] * cell[1][0] + c[2] * cell[2][0];
                        r[1] = c[0] * cell[0][1] + c[1] * cell[1][1] + c[2] * cell[2][1];
                        r[2] = c[0] * cell[0][2] + c[1] * cell[1][2] + c[2] * cell[2][2];
                    }
                    r = [p2[0] - p1[0] + r[0], p2[1] - p1[1] + r[1], p2[2] - p1[2] + r[2]];
                    r = Math.sqrt(r[0] * r[0] + r[1] * r[1] + r[2] * r[2]);
                    if (r < (vdwr[i] + vdwr[j]) / 2.0) {
                        // Bond!
                        this._bondmat[i][j].push(c);
                        this._bondmat[j][i].push([-c[0], -c[1], -c[2]]);
                    }
                }
            }
        }
    },
    /**
     * Compute the molecules within the model. For internal use
     */
    _computeMolecules() {

        this._molecules = [];
        this._molinds = [];

        if (this.length < 2) {
            // No molecules can be computed
            this._molecules = null;
            return;
        }

        var mol_sets = [];
        var unsorted_atoms = _.range(this.length);

        while (unsorted_atoms.length > 0) {
            var mol_queue = [
                [unsorted_atoms.shift(), [0, 0, 0]]
            ];
            var current_mol = [];
            var current_mol_cells = [];
            while (mol_queue.length > 0) {
                var ac1 = mol_queue.shift();
                var a1 = ac1[0];
                var c1 = ac1[1];

                current_mol.push(a1);
                current_mol_cells.push(c1);
                // Find linked atoms
                var link1 = this._bondmat[a1];
                for (var i in link1) {
                    var a2 = parseInt(i);
                    var link12 = link1[i];
                    // Is a2 still unsorted?
                    if (!unsorted_atoms.includes(a2) || link12.length == 0)
                        continue;

                    for (var j = 0; j < link12.length; ++j) {
                        var c2 = link12[j];
                        mol_queue.push([a2, mjs.add(c1, c2)]);
                    }

                    unsorted_atoms.splice(unsorted_atoms.indexOf(a2), 1);
                }
            }
            mol_sets.push([
                current_mol,
                current_mol_cells
            ]);
        }

        for (var i = 0; i < mol_sets.length; ++i) {

            var mol = [];
            for (var j = 0; j < mol_sets[i][0].length; ++j) {
                mol.push(new AtomImage(this, mol_sets[i][0][j],
                    mol_sets[i][1][j]));
            }

            this._molecules.push(mol);
        }

        // Assign the molecule's index for each atom
        this._molinds = _.range(this.length);

        for (var i = 0; i < this._molecules.length; ++i) {
            var m = this._molecules[i];
            for (var j = 0; j < m.length; ++j) {
                var ai = m[j];
                this._molinds[ai.index] = i;
            }
        }
    },
    /**
     * Return a list of all AtomImages within the given supercell.
     * 
     * @param  {int[]} scell  Supercell to return images for
     * @return {AtomImage[]}  List of AtomImage objects
     */
    atomImages(scell) {
        var sgrid = this._supercell_grid;
        if (scell) {
            sgrid = utils.supercellGrid(scell);
        }
        var imgs = [];
        var indices = _.range(this.length);
        var model = this;
        for (var i = 0; i < sgrid.length; ++i) {
            var cell = sgrid[i];
            imgs = imgs.concat(_.map(indices, function(a) {
                return new AtomImage(model, a, cell);
            }));
        }
        return imgs;
    },
    /**
     * Return a list of all BondImages within the given supercell.
     * 
     * @param  {int[]} scell  Supercell to return images for
     * @return {BondImage[]}  List of BondImage objects
     */    
    bondImages(scell) {
        var sgrid = this._supercell_grid;
        if (scell) {
            sgrid = utils.supercellGrid(scell);
        }
        var bondimgs = [];        
        var indices = _.range(this.length);
        var model = this;

        for (var ii = 0; ii < this._atom_images.length; ++ii) {
            var im1 = this._atom_images[ii];
            var i = im1.index;
            var bonds = this._bondmat[i];
            var c1 = im1.ijk;
            for (var j = i; j < this.length; ++j) {
                var blist = bonds[j];
                for (var k = 0; k < blist.length; ++k) {
                    var r = blist[k];
                    var c2 = [c1[0]+r[0], c1[1]+r[1], c1[2]+r[2]];
                    var jj = utils.supercellIndex(j, c2, this._supercell, this.length);
                    if (jj >= 0 && jj < this._atom_images.length) {
                        var im2 = this._atom_images[jj];
                        var bimg = new BondImage(this, im1, im2);
                        bondimgs.push(bimg);
                    }
                }
            }
        }

        return bondimgs;
    },
    /**
     * Convert fractional coordinates to absolute
     * 
     * @param  {float[]} fx Fractional coordinates
     * @return {float[]}    Absolute coordinates
     */
    frac2abs(fx) {
        if (!this.periodic) {
            return null
        }
        var c = this._atoms._cell;
        return [fx[0]*c[0][0]+fx[1]*c[1][0]+fx[2]*c[2][0],
                fx[0]*c[0][1]+fx[1]*c[1][1]+fx[2]*c[2][1],
                fx[0]*c[0][2]+fx[1]*c[1][2]+fx[2]*c[2][2]];
        // return mjs.multiply(fx, this._atoms._cell);
    },
    /**
     * Convert absolute coordinates to fractional
     * 
     * @param  {float[]} x  Absolute coordinates
     * @return {float[]}    Fractional coordinates
     */
    abs2frac(x) {
        if (!this.periodic) {
            return null
        }
        var ic = this._atoms._inv_cell;
        return [x[0]*ic[0][0]+x[1]*ic[1][0]+x[2]*ic[2][0],
                x[0]*ic[0][1]+x[1]*ic[1][1]+x[2]*ic[2][1],
                x[0]*ic[0][2]+x[1]*ic[1][2]+x[2]*ic[2][2]];
    },
    /**
     * Compute and return the minimum supercell that guarantees
     * containing all atoms at a maximum distance r from those in the
     * [0,0,0] cell.
     * 
     * @param {float} r     
     */
    minimumSupercell(r) {

        var diag = _.map(this._r_diag.values, function(x) {
            return mjs.pow(x, -0.5)
        });
        var utransf_mat = mjs.multiply(this._r_diag.vectors, mjs.diag(diag));
        var utransf_norm = mjs.transpose(utransf_mat);
        for (var i = 0; i < 3; ++i) {
            var norm = mjs.norm(utransf_mat[i]);
            for (var j = 0; j < 3; ++j) {
                utransf_norm[j][i] *= r / norm;
            }
        }
        var qmatrix = mjs.multiply(utransf_mat, utransf_norm);
        var scell = [];
        for (var i = 0; i < 3; ++i) {
            var b = 0;
            for (var j = 0; j < 3; ++j) {
                b = Math.max(Math.ceil(Math.abs(qmatrix[i][j])), b);
            }
            scell.push(2 * b + 1);
        }

        return scell;
    },
    /**
     * Find a group of atoms based on a given query and return as AtomImages
     * @param  {Array} query  A search query for atoms. Must use nested lists 
     *                        of types and arguments, and can use logic 
     *                        operators $and, $or and $xor.
     * @return {AtomImage[]}  AtomImage objects for found atoms
     */
    find(query) {
        var found = this._qparse.parse(query);
        var mv = new ModelView(this, found);

        return mv;
    },
    /**
     * Set a renderer for this model's graphics
     * 
     * @param {Renderer} renderer The renderer to use for this Model
     */
    setRenderer(renderer) {

        this._renderer = renderer;
        // Reset all graphics
        this._initGraphics();
    },
    /**
     * Remove renderer and erase all graphics
     */
    unsetRenderer() {

        if (this._renderer)
            this._renderer.removeAllObjects();

        this._renderer = null;
        this._graphics = null;

    },
    // Internal methods used to render graphics
    _initGraphics() {

        this._graphics = {
            'atoms': {},
            'bonds': {},
            'labels': {},
            'axes': null,
            'box': null
        }

        if (this.periodic && this._renderer) {
            var axb = this._renderer._addLattice(this.cell);
            this._graphics.box = axb[0];
            this._graphics.axes = axb[1];
        }

    },
    /**
     * Set a property on a series of atom images
     * 
     * @param {AtomImage[]} aimages     List of AtomImages, or their indices
     * @param {String}      name        Name of the property to set
     * @param {String}      value       Value to set to the property
     */
    _setAtomsProperty(aimages, name, value) {

        // Value can be a single value or an Array
        var isarr = (value instanceof Array);

        for (var i = 0; i < aimages.length; ++i) {
            var id = aimages[i];
            if (id instanceof AtomImage)
                id = id.img_index;
            this._atom_images[id][name] = isarr ? value[i] : value;
        }

    },
    /**
     * Set a property on a series of bond images
     * 
     * @param {BondImage[]} aimages     List of BondImages
     * @param {String}      name        Name of the property to set
     * @param {String}      value       Value to set to the property
     */
    _setBondsProperty(bimages, name, value) {

        // Value can be a single value or an Array
        var isarr = (value instanceof Array);

        for (var i = 0; i < bimages.length; ++i) {
            var bimg = bimages[i];
            bimg[name] = isarr ? value[i] : value;
        }

    },
    // Query functions. These are for internal use. They return the indices of
    // AtomImages in the _atom_images array.
    _queryAll() {
        // All atoms
        return _.range(this._atom_images.length);
    },
    _queryElements(elems) {
        if (_.isString(elems)) {
            elems = [elems]; // A single symbol
        }

        var indices = _.reduce(this._elems, function(inds, s, i) {
            if (elems.indexOf(s) > -1) {
                inds.push(i);
            }
            return inds;
        }, []);

        var found = [];
        var scell = this._supercell;
        var n = this.length;
        for (var i = 0; i < this._supercell_grid.length; ++i) {
            var cell = this._supercell_grid[i];
            found = found.concat(_.map(indices, function(x) {
                return utils.supercellIndex(x, cell, scell, n);
            }));
        }

        return found;
    },

    _queryCell(ijk) {
        // Check if ijk is contained in the supercell's limits
        var ind = _.findIndex(this._supercell_grid, function(x) {
            return _.isEqual(x, ijk);
        });

        if (ind < 0) {
            return [];
        }

        var scell = this.supercell;
        var n = this.length;
        var found = _.map(_.range(n), function(x) {
            return utils.supercellIndex(x, ijk, scell, n);
        });

        return found;
    },

    _queryBox(x0, x1) {

        if (x0 instanceof AtomImage) {
            x0 = x0.xyz;
        }
        if (x1 instanceof AtomImage) {
            x1 = x1.xyz;
        }

        // Box sides?
        var box = _.zip(x0, x1);
        var xmin = _.map(box, _.min);
        var xmax = _.map(box, _.max);

        var fxmin;
        var fxmax;
        if (this.periodic) {
            var fx0 = this.abs2frac(x0);
            var fx1 = this.abs2frac(x1);
            var fbox = _.zip(fx0, fx1);
            fxmin = _.map(fbox, _.min);
            fxmax = _.map(fbox, _.max);
            fxmin = _.map(fxmin, Math.floor);
            fxmax = _.map(fxmax, Math.ceil);

            // Now add supercell limits
            var scmin = this._supercell_grid[0];
            var scmax = this._supercell_grid[this._supercell_grid.length - 1];
            fxmin = _.zipWith(fxmin, scmin, function(f, s) {
                return Math.max(f, s);
            });
            fxmax = _.zipWith(fxmax, scmax, function(f, s) {
                return Math.min(f, s + 1);
            });
        } else {
            fxmin = [0, 0, 0];
            fxmax = [1, 1, 1];
        }

        var found = []

        // Now iterate over the cells, and atoms
        for (var i = fxmin[0]; i < fxmax[0]; ++i) {
            for (var j = fxmin[1]; j < fxmax[1]; ++j) {
                for (var k = fxmin[2]; k < fxmax[2]; ++k) {
                    // var p0 = this.frac2abs([i, j, k]);
                    for (var a = 0; a < this.length; ++a) {

                        var ind = utils.supercellIndex(a, [i, j, k], this._supercell,
                            this.length);
                        var aimg = this._atom_images[ind];

                        // Is it in the box?
                        var isin = _.reduce(aimg.xyz, function(r, x, e) {
                            return (r && (xmin[e] <= x) && (x <= xmax[e]));
                        }, true);

                        if (isin)
                            found.push(ind);
                    }
                }
            }
        }

        return found;
    },
    _querySphere(x0, r) {

        if (x0 instanceof AtomImage) {
            x0 = x0.xyz; // Can use an atom as centre
        }

        var scell = [1, 1, 1];
        var cell0 = [0, 0, 0];
        var fx0 = this.abs2frac(x0);

        if (this.periodic) {
            // Supercell necessary for the search?
            scell = this.minimumSupercell(r);
            cell0 = _.map(fx0, Math.floor);
        }

        var fxmin;
        var fxmax;
        if (this.periodic) {
            fxmin = _.zipWith(cell0, scell, function(c0, s) {
                return c0 - (s - 1) / 2;
            });
            fxmax = _.zipWith(cell0, scell, function(c0, s) {
                return c0 + (s + 1) / 2;
            });

            // Now add supercell limits
            var scmin = this._supercell_grid[0];
            var scmax = this._supercell_grid[this._supercell_grid.length - 1];
            fxmin = _.zipWith(fxmin, scmin, function(f, s) {
                return Math.max(f, s);
            });
            fxmax = _.zipWith(fxmax, scmax, function(f, s) {
                return Math.min(f, s + 1);
            });
        } else {
            fxmin = [0, 0, 0];
            fxmax = [1, 1, 1];
        }

        var found = [];

        for (var i = fxmin[0]; i < fxmax[0]; ++i) {
            for (var j = fxmin[1]; j < fxmax[1]; ++j) {
                for (var k = fxmin[2]; k < fxmax[2]; ++k) {
                    for (var a = 0; a < this.length; ++a) {

                        var ind = utils.supercellIndex(a, [i, j, k], this._supercell,
                            this.length);
                        var aimg = this._atom_images[ind];

                        // Is it in the sphere?
                        var isin = mjs.distance(aimg.xyz, x0) <= r;

                        if (isin)
                            found.push(ind);
                    }
                }
            }
        }

        return found;
    }

}

exports.AtomImage = AtomImage;
exports.Model = Model;