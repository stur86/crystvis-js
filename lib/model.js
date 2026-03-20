'use strict';

/** 
 * @fileoverview Class holding the atomic models to be plotted
 * @module
 */

import _ from 'lodash';
import * as mjs from 'mathjs';
import {
    PeriodicTable as PeriodicTable
} from 'mendeleev';

import {
    Atoms as Atoms
} from '@ccp-nc/crystcif-parse';

import * as utils from './utils.js';
import * as data from './data.js';
import {
    QueryParser as QueryParser
} from './query.js';
import {
    ModelView as ModelView
} from './modelview.js';


const LABEL_HEIGHT = 0.04; // For now fixed, just a value that works


/** An 'image' of a single atom from a model. This represents a specific periodic copy of that atom (if applicable). */
class AtomImage {

    /**
     * @class
     * @param {Model} model     The model from which the image is from
     * @param {int} index       Index of the atom in the model 
     * @param {Array} ijk       Indices of the cell in which the image is located
     */
    constructor(model, index, ijk) {

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
        this._bondsTo = []; // BondImages of bonds for which this is atom2

        if (!model.periodic) {
            this._fxyz0 = null;
            this._fxyz = null;
            this._xyz = this._xyz0;
        } else {
            this._fxyz0 = model._scaled_positions[index];
            this._fxyz = [this._fxyz0[0] + ijk[0],
                this._fxyz0[1] + ijk[1],
                this._fxyz0[2] + ijk[2]
            ];
            this._xyz = mjs.multiply(this._fxyz, model._cell);
        }

        this._isotope = null; // By default look up the model

        // Visual properties
        this._visible = false;
        this._color = this.cpkColor;
        this._uses_cpk = true;
        this._base_radius = this.vdwRadius / 4.0;
        this._scale = 1.0;
        this._opacity = 1.0;
        this._highlighted = false;

        this._mesh = null; // Will be created when first requested
        this._aura = null;

        this._labels = {};
        this._ellipsoids = {};
    }

    /**
     * Model this atom belongs to
     * @readonly
     * @type {Model}
     */
    get model() {
        return this._model;
    }

    /**
     * Renderer used by this atom
     * @readonly
     * @type {Renderer}
     */
    get renderer() {
        var m = this.model;

        if (m) {
            return m._renderer;
        }

        return null;
    }

    /**
     * Index of the atom
     * @readonly
     * @type {int}
     */
    get index() {
        return this._index;
    }

    /**
     * String ID of the image
     * @readonly
     * @type {String}
     */
    get id() {
        return this._id;
    }

    /**
     * Index of this image
     * @readonly
     * @type {int}
     */
    get imgIndex() {
        return this._img_index;
    }

    /**
     * Index of the species of this atom
     * @readonly
     * @type {int}
     */
    get speciesIndex() {
        return this._model._species_indices[this._index];
    }

    /**
     * Symbol of this atom's element
     * @readonly
     * @type {String}
     */
    get element() {
        return this._model._elems[this._index];
    }

    /**
     * Crystal site label of this atom
     * @readonly
     * @type {String}
     */
    get crystLabel() {
        return this._model._labels[this._index];
    }

    /**
     * Periodic table information for this atom's element
     * @readonly
     * @type {Object}
     */
    get elementData() {
        return data.getElementData(this.element);
    }

    /**
     * Information for this atom's isotope
     * @readonly
     * @type {Object}
     */
    get isotopeData() {
        let idata = this._isotope;
        if (idata === null) 
            idata = this._model._isotopes[this._index];
        return idata;
    }

    /**
     * Atomic mass of this atom's isotope
     * @type {int}
     */
    get isotope() {
        return this.isotopeData.A;
    }

    set isotope(A) {
        this._isotope = data.getIsotopeData(this.element, A);
        if (this._isotope === null)
            throw Error('Isotope does not exist for this element');
        // Reset color
        if (this._uses_cpk) {
            this.color = null;
        }
    }

    /**
     * Atomic mass of the global isotope set as default for this atom's species
     * @type {int}
     */
    set isotopeGlobal(A) {
        // Set the isotope for this atom in the model
        let iso = data.getIsotopeData(this.element, A);
        if (iso === null)
            throw Error('Isotope does not exist for this element');
        this._model._isotopes[this._index] = iso;
        // Reset color
        if (this._uses_cpk) {
            this.color = null;
        }
    }

    /**
     * Atomic number of element
     * @readonly
     * @type {int}
     */
    get number() {
        var el = PeriodicTable.getElement(this.element);
        return (el ? el.number : 0);
    }

    /**
     * Hex integer code of the conventional CPK color used for this element 
     * (altered in case of non-standard isotopes)
     * @readonly
     * @type {int}
     */
    get cpkColor() {
        return data.getCpkColor(this.element, this.isotope);
    }

    /**
     * Van dew Waals radius for this element
     * @readonly
     * @type {float}
     */
    get vdwRadius() {
        return data.getVdwRadius(this.element);
    }

    /**
     * Bonds from this atom
     * @readonly
     * @type {BondImage[]}
     */
    get bondsFrom() {
        return Array.from(this._bondsFrom);
    }

    /**
     * Bonds to this atom
     * @readonly
     * @type {BondImage[]}
     */
    get bondsTo() {
        return Array.from(this._bondsTo);
    }

    /**
     * All bonds connected to this atom
     * @readonly
     * @type {BondImage[]}
     */
    get bonds() {
        return _.concat(this._bondsFrom, this._bondsTo);
    }

    /**
     * All atoms bonded to this atom
     * @readonly
     * @type {AtomImage[]}
     */
    get bondedAtoms() {
        return _.concat(_.map(this._bondsFrom, function(b) {
                return b.atom2;
            }),
            _.map(this._bondsTo, function(b) {
                return b.atom1;
            }));
    }

    /**
     * Cell indices of this atom image
     * @readonly
     * @type {int[]}
     */
    get ijk() {
        return Array.from(this._ijk);
    }

    /** 
     * Position of this atom's original
     * @readonly
     * @type {float[]}
     */
    get xyz0() {
        return Array.from(this._xyz0);
    }

    /** 
     * Position of this atom image
     * @readonly
     * @type {float[]}
     */
    get xyz() {
        return Array.from(this._xyz);
    }

    /** 
     * Fractional coordinates of this atom's original
     * @readonly
     * @type {float[]}
     */
    get fxyz0() {
        return Array.from(this._fxyz0);
    }

    /** 
     * Fractional coordinates of this atom image
     * @readonly
     * @type {float[]}
     */
    get fxyz() {
        return Array.from(this._fxyz);
    }

    /** 
     * Index of the molecule this atom belongs to
     * @readonly
     * @type {int}
     */
    get moleculeIndex() {
        return this._model._molinds[this._index];
    }

    /**
     * Mesh corresponding to this atom image
     * @readonly
     * @type {AtomMesh}
     */
    get mesh() {
        var r = this.renderer;
        if (!this._mesh && r) {
            this._mesh = new r.Primitives.AtomMesh(this._xyz, this.radius, this._color);
            this._mesh.image = this;
        }
        return this._mesh;
    }

    /**
     * Aura used to highlight this atom image
     * @readonly
     * @type {AuraMesh}
     */
    get aura() {
        var r = this.renderer;
        if (!this._aura && r) {
            this._aura = new r.Primitives.AuraMesh({
                radius: this.radius,
                scale: 0.02,
                // Inject current renderer aura policy so the mesh is consistent
                // with any vis.appearance.highlight.* settings.
                ...(r._auraFill           !== undefined && { fill:            r._auraFill }),
                ...(r._auraBorder         !== undefined && { border:          r._auraBorder }),
                ...(r._auraBorderFraction !== undefined && { borderFraction:  r._auraBorderFraction }),
                ...(r._auraOpacity        !== undefined && { opacity:         r._auraOpacity }),
            });
            this.mesh.add(this._aura);
        }

        return this._aura;
    }

    // Get and set graphical properties

    /** 
     * Whether the atom is visible
     * @type {bool}
     */
    get visible() {
        return this._visible;
    }

    set visible(v) {

        this._visible = v;

        var mesh = this.mesh;

        if (v) {
            this.renderer.add(mesh, 'model');
        } else {
            this.renderer.remove(mesh, 'model');
        }

        // Update aura visibility
        this.highlighted = this._highlighted;

        // Update connected bonds' visibility
        for (let i = 0; i < this._bondsFrom.length; ++i) {
            let b = this._bondsFrom[i];
            b.visible = b._visible;
        }

        for (let i = 0; i < this._bondsTo.length; ++i) {
            let b = this._bondsTo[i];
            b.visible = b._visible;
        }
    }

    /** 
     * Starting radius of the atom
     * @type {float}
     */
    get baseRadius() {
        return this._base_radius;
    }

    set baseRadius(r) {
        if (r == null) { // Default value
            r = this.vdwRadius / 4.0;
        }
        this._base_radius = r;
        var mesh = this.mesh;
        mesh.atom_radius = this.radius;
    }

    /** 
     * Scale of the atom
     * @type {float}
     */
    get scale() {
        return this._scale;
    }

    set scale(s) {
        if (s == null) {
            s = 1;
        }
        this._scale = s;
        var mesh = this.mesh;
        mesh.atom_radius = this.radius;
    }

    /** 
     * Final radius of the atom (starting radius * scale)
     * @type {float}
     */
    get radius() {
        return this._scale * this._base_radius;
    }

    set radius(r) {
        if (r == null) {
            r == this.baseRadius;
        }
        this.scale = r / this._base_radius;
    }

    /**
     * Color of the atom
     * @type {int}
     */
    get color() {
        return this._color;
    }

    set color(c) {
        if (c === null) {
            c = this.cpkColor;
            this._uses_cpk = true;
        }
        else {
            this._uses_cpk = false;
        }
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

    }

    /**
     * Opacity of the atom
     * @type {float}
     */
    get opacity() {
        return this._opacity;
    }

    set opacity(o) {
        if (o == null) {
            o = 1;
        }
        this._opacity = o;
        var mesh = this.mesh;
        mesh.atom_opacity = o;

        _.map(this._bondsFrom, function(b) {
            b.opacity1 = o;
        });

        _.map(this._bondsTo, function(b) {
            b.opacity2 = o;
        });
    }   

    /**
     * Whether the atom is highlighted
     * @type {bool}
     */
    get highlighted() {
        return this._highlighted;
    }

    set highlighted(h) {
        if (h == null) {
            h = false;
        }
        this._highlighted = h;
        var aura = this.aura;
        if (h && this._visible) {
            aura.visible = true;
        } else {
            aura.visible = false;
        }
    }

    /**
     * Add a text label to the atom.
     * 
     * @param {String}  text        Content of the label
     * @param {String}  name        Name to use to refer to the label (necessary to overwrite/erase later)
     * @param {Object}  parameters  Dictionary of other options (e.g. font family, text color, etc. See TextSprite)
     */
    addLabel(text, name, parameters = {}) {
        this.removeLabel(name); // Precautionary

        var defaults = {
            faceCamera: true,
            fixScale: true,
            shift: [1.0*this.radius, 0, 0], // This just works well
            height: LABEL_HEIGHT,
        };

        var r = this.renderer;
        // Inject the renderer's current label colour and size so new sprites are
        // consistent with retroactive changes via vis.appearance.label.*.
        if (r && r._labelColor !== undefined) {
            defaults.color = r._labelColor;
        }
        if (r && r._labelHeight !== undefined) {
            defaults.height = r._labelHeight;
        }

        parameters = _.merge(defaults, parameters);
        parameters.position = [0, 0, 0]; // This is not customizable

        if (r) {
            var label = new r.Primitives.TextSprite(text, parameters);
            this._labels[name] = label;
            this.mesh.add(label);            
        }
    }

    /**
     * Remove the label of a given name
     * 
     * @param {String}  name     Name of the label
     */
    removeLabel(name) {

        let l = this._labels[name];
        if (l)
            this._mesh.remove(l);
        delete this._labels[name];
    }

    /**
     * Retrieve or set a label's properties
     * 
     * @param {String}  name     Name of the label
     * @param {String}  property Property to set
     * @param {?}       value    Value to set. If omitted, returns the current
     *                           value instead.
     */
    labelProperty(name, property, value = null) {
        if (value) {
            this._labels[name][property] = value;
        } else {
            return this._labels[name][property];
        }
    }

    /**
     * Add an ellipsoid to the atom.
     * 
     * @param {TensorData | Object | Array}     data   The data to base the
     *                                                 ellipsoid on. Can be:
     *                                                 - a TensorData object;
     *                                                 - an Object with 'eigenvalues'
     *                                                   and 'eigenvectors' members
     *                                                 - an Array of the form 
     *                                                 [eigenvalues, eigenvectors]
     * @param {String}                          name   Name of the ellipsoid
     * @param {Object}                          parameters Additional options to
     *                                                     pass (see EllipsoidMesh)
     */
    addEllipsoid(data, name, parameters = {}) {
        this.removeEllipsoid(name);

        parameters = _.clone(parameters); // Avoid editing the reference object

        if (data instanceof Array) {
            parameters.eigenvalues = data[0];
            parameters.eigenvectors = data[1];
        } else {
            parameters.eigenvalues = data.eigenvalues;
            parameters.eigenvectors = data.eigenvectors;
        }

        if (parameters.ditherSeed == null) {
            // As long as it's consistent for a given atom, the actual value is irrelevant
            let seed = utils.hashCode(this._fxyz + name);
            parameters.ditherSeed = seed/4294967295.0; // Reduce to ]0.5,-0.5]
        }

        var r = this.renderer;
        if (r) {
            var ellips = new r.Primitives.EllipsoidMesh(parameters);
            this._ellipsoids[name] = ellips;
            this.mesh.add(ellips);            
        }
    }

    /**
     * Remove the ellipsoid with a given name
     * 
     * @param {String}  name     Name of the ellipsoid
     */
    removeEllipsoid(name) {
        let l = this._ellipsoids[name];
        if (l)
            this._mesh.remove(l);
        delete this._ellipsoids[name];
    }

    /**
     * Retrieve or set an ellipsoid's properties
     * 
     * @param {String}  name     Name of the ellipsoid
     * @param {String}  property Property to set
     * @param {?}       value    Value to set. If omitted, returns the current
     *                           value instead.
     */
    ellipsoidProperty(name, property, value = null) {
        if (value) {
            this._ellipsoids[name][property] = value;
        } else {
            return this._ellipsoids[name][property];
        }
    }

    /**
     * Get the value for one array for this image
     * @param  {String} name    Name of the array
     * 
     * @return {*}              Value of the array for this atom
     */
    getArrayValue(name) {
        return this._model.getArray(name)[this._index];
    }

    // Check equality with another image
    equals(ai) {
        return (this._model == ai._model &&
            this._index == ai._index &&
            _.isEqual(this._ijk, ai._ijk));
    }

    // Return a copy, possibly shifted to a different cell
    copy(shift = [0, 0, 0]) {
        return new AtomImage(this._model,
            this._index,
            mjs.add(this._ijk, shift));
    }
}

/** An 'image' of a single bond in the model. This represents the connection
    between two specific AtomImages */
class BondImage {


    /**
     * @class
     * @param {Model}     model     The model from which the image is from
     * @param {AtomImage} im1       AtomImage from which the bond starts
     * @param {AtomImage} im2       AtomImage to which the bond ends
     */
    constructor(model, im1, im2) {

        this._model = model;
        this._im1 = im1;
        this._im2 = im2;

        this._im1._bondsFrom.push(this);
        this._im2._bondsTo.push(this);

        this._length = mjs.distance(this._im1.xyz, this._im2.xyz);

        this._key = this._im1.imgIndex + '_' + this._im2.imgIndex;

        // Visual properties
        this._visible = true;
        this._radius = 0.2;
        this._opacity = 1.0;

        this._mesh = null; // Created on first request

    }

    /**
     * Model this bond belongs to
     * @readonly
     * @type {Model}
     */
    get model() {
        return this._model;
    }

    /**
     * Renderer used by this bond
     * @readonly
     * @type {Renderer}
     */
    get renderer() {
        var m = this.model;
        if (m) {
            return m._renderer;
        }
        return null;
    }

    /**
     * First atom connected to this bond
     * @readonly
     * @type {AtomImage}
     */
    get atom1() {
        return this._im1;
    }

    /**
     * Second atom connected to this bond
     * @readonly
     * @type {AtomImage}
     */
    get atom2() {
        return this._im2;
    }

    /**
     * A unique string key used to quickly reference the bond
     * @readonly
     * @type {String}
     */
    get key() {
        // Used in dictionary for quick reference
        return this._key;
    }

    /**
     * Bond length in Angstroms
     * @readonly
     * @type {float}
     */
    get length() {
        return this._length;
    }

    /**
     * Mesh corresponding to this bond image
     * @readonly
     * @type {AtomMesh}
     */
    get mesh() {
        var r = this.renderer;
        if (!this._mesh && r) {
            this._mesh = new r.Primitives.BondMesh(this.atom1.xyz, this.atom2.xyz,
                this._radius,
                this.atom1.color, this.atom2.color);
        }
        return this._mesh;
    }

    /** 
     * Radius of the bond
     * @type {float}
     */
    get radius() {
        return this._radius;
    }

    set radius(r) {
        if (r == null) {
            r = 0.2;
        }
        this._radius = r;
        var mesh = this.mesh;
        if (mesh) {
            mesh.bond_radius = r;
        }
    }

    /**
     * First color of the bond
     * @type {int}
     */
    set color1(c) {
        if (c == null) {
            c = this._im1.color;
        }
        var mesh = this.mesh;
        if (mesh) {
            mesh.bond_color_1 = c;
        }
    }

    /**
     * Second color of the bond
     * @type {int}
     */
    set color2(c) {
        if (c == null) {
            c = this._im2.color;
        }
        var mesh = this.mesh;
        if (mesh) {
            mesh.bond_color_2 = c;
        }
    }

    /**
     * First opacity of the bond
     * @type {float}
     */
    set opacity1(o) {
        if (o == null) {
            o = this._im1.opacity;
        }
        var mesh = this.mesh;
        if (mesh) {
            mesh.bond_opacity_1 = o;
        }
    }

    /**
     * Second opacity of the bond
     * @type {float}
     */
    set opacity2(o) {
        if (o == null) {
            o = this._im2.opacity;
        }
        var mesh = this.mesh;
        if (mesh) {
            mesh.bond_opacity_2 = o;
        }
    }

    /**
     * Whether the bond is visible
     * @type {bool}
     */
    get visible() {
        return this._visible;
    }

    set visible(v) {

        this._visible = v;
        v = v && this.atom1.visible && this.atom2.visible;

        var mesh = this.mesh;
        if (v) {
            this.renderer.add(mesh, 'model');
        } else {
            this.renderer.remove(mesh, 'model');
        }

    }
}

class Model {


    /**
     * An object containing an Atomic structure and taking care of its periodic
     * nature, allowing querying and selection, and so on.
     * @class
     * @param {crystcif.Atoms}  atoms       Atomic structure, in crystcif's Atoms format
     * @param {Object}          parameters  Additional options:
     * 
     * - `supercell`
     * - `molecularCrystal` (if true, load full molecules in central unit cell)
     * - `useNMRActiveIsotopes` (if true, all isotopes are set by default to the most common
     *                                        one with non-zero spin)
     * - `vdwScaling` (scale van der Waals radii by a constant factor)
     * - `vdwElementScaling` (table of per-element factors to scale VdW radii by)
     */
    constructor(atoms, parameters = {}) {

        var defaults = {
            supercell: [1, 1, 1],
            molecularCrystal: false,
            useNMRActiveIsotopes: false,
            vdwScaling: 1.0,
            vdwElementScaling: {}
        };

        parameters = _.merge(defaults, parameters);

        this._vdwScaling = parameters.vdwScaling;
        this._vdwElementScaling = parameters.vdwElementScaling;

        const initMolecules = ((atoms, supercell) => {

            if (!(atoms instanceof Atoms)) {
                throw new Error('Model must be initialised with a loaded Atoms object');
            }

            this._atoms_base = atoms;
            this._data = {};

            /* Load the positions, cell, and other key data
               Important: to save memory, we're simply storing references.
               These are NOT to be changed!
            */


            this._elems = this._atoms_base._arrays['symbols'];
            this._isotopes = this._elems.map((el) => {
                const iso = parameters.useNMRActiveIsotopes? 'nmr' : null;
                let isodata = data.getIsotopeData(el, iso);
                if (isodata === null) {
                    // No NMR active isotope?
                    isodata = data.getIsotopeData(el);
                }

                return isodata;
            });
            this._nums = this._atoms_base._arrays['numbers'];
            this._positions = this._atoms_base._arrays['positions'];
            this._cell = this._atoms_base._cell;
            this._pbc = this._atoms_base._pbc;
            this._periodic = !this._pbc.includes(false);
            this._inv_cell = this._atoms_base._inv_cell;
            this._supercell = [1, 1, 1];
            this._supercell_grid = [
                [0, 0, 0]
            ];

            // Species indices (used for labels)
            let sp_count = {};
            this._species_indices = [];
            this._species_indices = this._elems.map((s, i) => {
                let c = sp_count[s];
                c = c? c : 0;
                sp_count[s] = c+1;
                return c;
            });

            let has_cif_labels = false;

            // Crystallographic labels
            if ('labels' in this._atoms_base._arrays) {
                // If any of the labels don't match the element,
                // then we're assuming they're crystallographic (CIF-style) labels
                if (this._atoms_base._arrays['labels'].some((l, i) => {
                    return l !== this._elems[i];
                })) {
                    // then use them
                    has_cif_labels = true;
                    this._labels = this._atoms_base._arrays['labels'];
                } else {
                    // otherwise, build new ones and
                    // throw a warning to user syaing we're doing this
                    this._labels = [];
                    for (let i = 0; i < this._elems.length; ++i) {
                        this._labels.push(this._elems[i] + '_' + (this._species_indices[i]+1));
                    }
                    console.warn('No crystallographic labels found in CIF file. Building new ones.');
                }
            }
            else {
                // Build them
                this._labels = [];
                for (let i = 0; i < this._elems.length; ++i) {
                    this._labels.push(this._elems[i] + '_' + (this._species_indices[i]+1));
                }
            }

            this._has_cif_labels = has_cif_labels; // defaults to false

            // Cryst label indices
            let lab_count = {};
            this._label_indices = [];
            this._label_indices = this._labels.map((s, i) => {
                let c = lab_count[s];
                c = c? c : 0;
                lab_count[s] = c+1;
                return c;
            });

            if (this._periodic) {
                // R matrix: indispensable for calculations of periodic distances
                this._r_matrix = mjs.multiply(this._cell, mjs.transpose(this._cell));
                var ediag = mjs.eigs(this._r_matrix);
                // Sort by eigenvalue 
                var evecs = ediag.eigenvectors.map(e => e.vector);
                ediag = _.zip(ediag.values, evecs);
                ediag = _.sortBy(ediag, function(x) {
                    return x[0];
                });
                ediag = _.unzip(ediag);

                this._r_diag = {
                    values: ediag[0],
                    vectors: ediag[1],
                };

                this._supercell = supercell; // Default
                this._supercell_grid = utils.supercellGrid(supercell);
                this._scaled_positions = this._atoms_base.get_scaled_positions();
            }

            // Compile all images for this supercell
            this._atom_images = this._atomImages();

            this._computeBonds();
            this._computeMolecules();


        }).bind(this);

        initMolecules(atoms, parameters.supercell);

        // if parameters.molecularCrystal, is null, we need to check if the atoms 
        // contains organic molecules -- i.e. if there is at least one  C-H bond
        if (parameters.molecularCrystal || (parameters.molecularCrystal === null &&
            this._queryCHBond())) {
            this._molecularCrystal = true;
            atoms = _.cloneDeep(atoms);
            var pos = this.positions;
            for (let i = 0; i < this.length; ++i) {
                let mol_i = this._molinds[i];
                let mol = this._molecules[mol_i];
                for (let j = 0; j < mol.length; ++j) {
                    var a = mol[j];
                    if (a.index == i) {
                        pos[i] = mjs.add(pos[i], this.fracToAbs(a.cell));
                    }
                }
            }

            atoms.set_array('positions', pos);
            initMolecules(atoms, parameters.supercell);
        }

        this._primitives = {}; // Any additional primitives drawn on this model

        this._bond_images = this._bondImages();

        // A special ModelView for convenience
        this._all = new ModelView(this, _.range(this._atom_images.length));

        // Parser for queries
        this._qparse = new QueryParser({
            'all': this._queryAll,
            'indices': this._queryIndices,
            'elements': this._queryElements,
            'cell': this._queryCell,
            'box': this._queryBox,
            'sphere': this._querySphere,
            'bonded': this._queryBonded,
            'molecule': this._queryMolecule,
        }, this);

        // By default no rendering
        this.renderer = null;
    }

    // Using the .get_ methods of _atoms guarantees these are copies,
    // not pointers to the real thing
    
    /**
     * Number of atoms in this model's original cell
     * @readonly
     * @type {int}
     */
    get length() {
        return this._atoms_base.length();
    }

    /**
     * Chemical symbols in this model's original cell
     * @readonly
     * @type {String[]}
     */
    get symbols() {
        return this._atoms_base.get_chemical_symbols();
    }

    /**
     * Atomic numbers in this model's original cell
     * @readonly
     * @type {int[]}
     */
    get numbers() {
        return this._atoms_base.get_atomic_numbers();
    }

    /**
     * Coordinates of the atoms in this model's original cell
     * @readonly
     * @type {Array[]}
     */
    get positions() {
        return this._atoms_base.get_positions();
    }

    /**
     * Fractional coordinates of the atoms in this model's original cell
     * @readonly
     * @type {Array[]}
     */
    get scaledPositions() {
        return this._atoms_base.get_scaled_positions();
    }

    /**
     * Unit cell of the model's original cell
     * @readonly
     * @type {Array[]}
     */
    get cell() {
        return this._atoms_base.get_cell();
    }

    /**
     * Periodic boundary conditions
     * @readonly
     * @type {bool[]}
     */
    get pbc() {
        return this._atoms_base.get_pbc();
    }

    /**
     * Additional information from the model's original cell
     * @readonly
     * @type {Object}
     */
    get info() {
        return this._atoms_base.info;
    }

    /**
     * Whether this model is periodic in all three directions of space
     * @readonly
     * @type {bool}
     */
    get periodic() {
        return this._periodic;
    }

    /**
     * Indices of each atom by their species (e.g. C1, C2, H1, C3, H2, etc.)
     * @readonly
     * @type {int[]}
     */
    get speciesIndices() {
        return Array.from(this._species_indices);   
    }

    /**
     * Crystallographic labels of each atom
     * @readonly
     * @type {String[]}
     */
    get crystalLabels() {
        return Array.from(this._labels);
    }

    /**
     * Shape of the supercell for this model
     * @readonly
     * @type {int[]}
     */
    get supercell() {
        return Array.from(this._supercell);
    }

    /**
     * Full grid of origin coordinates of the cells making up the supercell
     * @readonly
     * @type {Array[]}
     */
    get supercellGrid() {
        return JSON.parse(JSON.stringify(this._supercell_grid));
    }

    /**
     * Atom images in this model
     * @readonly
     * @type {AtomImage[]}
     */
    get atoms() {
        return Array.from(this._atom_images);
    }

    /**
     * ModelView containing all the atoms of the image
     * @readonly
     * @type {ModelView}
     */
    get all() {
        return this._all;
    }

    /**
     * Graphical object representing the unit cell's axes
     * @readonly
     * @type {AxesMesh}
     */
    get axes() {
        return this._cartesian_axes;
    }

    /**
     * Graphical object representing the unit cell's box
     * @readonly
     * @type {BoxMesh}
     */
    get box() {
        return this._cartesian_box;
    }

    /**
     * Global scaling factor for Van der Waals radii
     * @readonly
     * @type {float}
     */
    get vdwScaling() {
        return this._vdwScaling;
    }

    /**
     * Table of scaling factors by element for Van der Waals radii
     * @readonly
     * @type {Object}
     */
    get vdwElementScaling() {
        return JSON.parse(JSON.stringify(this._vdwElementScaling));
    }

    /**
     * Renderer used for this model's graphics
     * @type {Renderer}
     */
    set renderer(r) {


        if (r) {
            this._renderer = r;
            if (this.periodic) {
                // Create axes and box
                if (!this._cartesian_box) {
                    this._cartesian_box = new r.Primitives.BoxMesh(this.cell, {color:r.theme.cell_line_color});
                }
                if (!this._cartesian_axes) {
                    this._cartesian_axes = new r.Primitives.AxesMesh(this.cell, {
                        linewidth: 1.5
                    });
                }
                r.add(this._cartesian_box);
                r.add(this._cartesian_axes);
            }

            // And the primitives
            for (var name in this._primitives) {
                var p = this._primitives[name];
                r.add(p);
            }

        } else {

            if (this._renderer)
                this._renderer.clear();

            this._renderer = null;

        }
    }

    // Set and get arrays on the underlying Atoms object
    /**
     * Set an array for the underlying Atoms object
     * @param {String}  name Name of the array to use
     * @param {Array}   arr  Array to store
     */
    setArray(name, arr) {
        this._atoms_base.set_array(name, arr);
    }

    /**
     * Retrieve an array from the underlying Atoms object
     * @param   {String}    name    Name of the array to retrieve
     * @return  {Array}             Retrieved array
     */
    getArray(name) {
        return this._atoms_base.get_array(name);
    }

    /**
     * Check if an array exists in the underlying Atoms object
     * @param   {String}    name    Name of the array to check
     * @return  {bool}              Whether the array exists
     */
    hasArray(name) {
        return (name in this._atoms_base._arrays);
    }

    /**
     * Delete an array from the underlying Atoms object
     * @param   {String}    name    Name of the array to delete
     */
    deleteArray(name) {
        delete this._atoms_base._arrays[name];
    }

    // These functions are for adding and removing graphical representations
    // that are meant to be drawn on to of the existing 3D model
    
    /**
     * Add link drawn on model
     * 
     * @param {Atom | Array} from       Starting point
     * @param {Atom | Array} to         End point
     * @param {String} name             Name to use for the link object
     * @param {String} label            Text label to add to the link
     * @param {Object} parameters       Additional parameters (see LineMesh)
     */
    addLink(from, to, name = 'link', label = null, parameters = {}) {

        this.removeGraphics(name);

        parameters = _.clone(parameters); // Avoid editing the reference object

        var r = this._renderer;
        if (r) {
            var link = new r.Primitives.LineMesh(from, to, parameters);

            this._primitives[name] = link;
            r.add(link);

            if (label) {
                var text = new r.Primitives.TextSprite(label, {
                    color: parameters.color,
                    fixScale: true,
                    faceCamera: true,
                    height: parameters.height || LABEL_HEIGHT,
                    shift: [LABEL_HEIGHT, 0, 0],
                    onOverlay: parameters.onOverlay
                });
                link.add(text);                
            }
        }
    }

    /**
     * Add a sphere drawn on model
     * 
     * @param {Atom | Array}    center      Center of the sphere
     * @param {float}           radius      Radius of the sphere
     * @param {String}          name        Name to use for the sphere object
     * @param {Object}          parameters  Additional parameters (see EllipsoidMesh)
     */
    addSphere(center, radius, name='sphere', parameters = {}) {

        this.removeGraphics(name);

        var r = this._renderer;
        if (r) {

            parameters = _.merge({
                color: 0xffffff,
                opacity: 0.5,
                opacityMode: r.Primitives.EllipsoidMesh.DITHER,
                showCircles: true,
                showAxes: true
            }, parameters); // Avoid editing the reference object

            var sph = new r.Primitives.EllipsoidMesh({
                color: parameters.color,
                opacity: parameters.opacity,
                opacityMode: parameters.opacityMode,
                showCircles: parameters.showCircles,
                showAxes: parameters.showAxes,
                scalingFactor: radius,
                center: center
            });

            this._primitives[name] = sph;
            r.add(sph);
        }
    }

    /**
     * Remove the graphical object with a given name
     * 
     * @param {String}  name     Name of the graphical object to remove
     */
    removeGraphics(name) {
        var g = this._primitives[name];
        var r = this._renderer;
        if (g && r)
            r.remove(g);
        delete this._primitives[name];
    }

    /**
     * Remove all graphical objects
     */
    clearGraphics() {
        var r = this._renderer;

        if (r) {
            _.map(this._primitives, function(g) {
                r.remove(g);
            });            
        }

        this._primitives = {};
    }

    /**
     * Compute the bonds within the model. For internal use
     * @private
     */
    _computeBonds() {

        var N = this.length;
        this._bondmat = Array(N); // Bond matrix
        this._bondmat = _.map(this._bondmat, function() {
            return _.map(Array(N), function() {
                return [];
            });
        });

        // Van der Waals radii by element
        var vdwf = this._vdwScaling;
        var vdwf_table = this._vdwElementScaling;

        var vdwr = _.map(this.symbols, function(s) {
            var f = vdwf;

            if (s in vdwf_table) {
                f = vdwf_table[s];
            }

            return data.getVdwRadius(s)*f;
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
        for (let i = 0; i < this.length; ++i) {

            var p1 = p[i];

            for (let j = i; j < this.length; ++j) {

                var p2 = p[j];

                for (let k = 0; k < sgrid.length; ++k) {
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
                        this._bondmat[i][j].push([c[0], c[1], c[2]]);
                        this._bondmat[j][i].push([-c[0], -c[1], -c[2]]);
                    }
                }
            }
        }
    }

    /**
     * Check if any C-H bonds are present
     * @return {bool} Whether any C-H bonds are present
     * @private
     */
    _queryCHBond() {
        // make sure bondmat is present
        if (!this._bondmat) {
            this._computeBonds();
        }

        var symbols = this._atoms_base.get_chemical_symbols();
        var bondmat = this._bondmat;
        var n = symbols.length;
        for (var i = 0; i < n; i++) {
            var bonds = bondmat[i];
            var a = symbols[i];
            if (a == 'C') {
                // loop over bonds and check if any are H
                for (var j = 0; j < n; j++) {
                    // if bonds[j] is not an empty array
                    if (bonds[j].length) { 
                        if (symbols[j] == 'H') {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    
    

    /**
     * Compute the molecules within the model. For internal use
     * @private
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
                for (let i in link1) {
                    var a2 = parseInt(i);
                    var link12 = link1[i];
                    // Is a2 still unsorted?
                    if (!unsorted_atoms.includes(a2) || link12.length == 0)
                        continue;

                    for (let j = 0; j < link12.length; ++j) {
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

        for (let i = 0; i < mol_sets.length; ++i) {

            var mol = [];
            for (let j = 0; j < mol_sets[i][0].length; ++j) {
                mol.push({
                    'index': mol_sets[i][0][j],
                    'cell': mol_sets[i][1][j]
                });
            }

            this._molecules.push(mol);
        }

        // Assign the molecule's index for each atom
        this._molinds = _.range(this.length);

        for (let i = 0; i < this._molecules.length; ++i) {
            var m = this._molecules[i];
            for (let j = 0; j < m.length; ++j) {
                var a = m[j];
                this._molinds[a.index] = i;
            }
        }
    }

    /**
     * Return a list of all AtomImages within the given supercell.
     *
     * @private
     * @return {AtomImage[]}  List of AtomImage objects
     */
    _atomImages() {
        var sgrid = this._supercell_grid;
        var imgs = [];
        var indices = _.range(this.length);
        var model = this;
        for (let i = 0; i < sgrid.length; ++i) {
            var cell = sgrid[i];
            imgs = imgs.concat(_.map(indices, function(a) {
                return new AtomImage(model, a, cell);
            }));
        }
        return imgs;
    }

    /**
     * Return a list of all BondImages within the given supercell.
     *
     * @private
     * @return {BondImage[]}  List of BondImage objects
     */
    _bondImages() {
        var bondimgs = [];

        for (let ii = 0; ii < this._atom_images.length; ++ii) {
            var im1 = this._atom_images[ii];
            var i = im1.index;
            var bonds = this._bondmat[i];
            var c1 = im1.ijk;
            for (let j = i; j < this.length; ++j) {
                var blist = bonds[j];
                for (let k = 0; k < blist.length; ++k) {
                    var r = blist[k];
                    var c2 = [c1[0] + r[0], c1[1] + r[1], c1[2] + r[2]];
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
    }

    /**
     * Convert fractional coordinates to absolute
     * 
     * @param  {float[]} fx Fractional coordinates
     * @return {float[]}    Absolute coordinates
     */
    fracToAbs(fx) {
        if (!this.periodic) {
            return null
        }
        var c = this._atoms_base._cell;
        return [fx[0] * c[0][0] + fx[1] * c[1][0] + fx[2] * c[2][0],
            fx[0] * c[0][1] + fx[1] * c[1][1] + fx[2] * c[2][1],
            fx[0] * c[0][2] + fx[1] * c[1][2] + fx[2] * c[2][2]
        ];
    }

    /**
     * Convert absolute coordinates to fractional
     * 
     * @param  {float[]} x  Absolute coordinates
     * @return {float[]}    Fractional coordinates
     */
    absToFrac(x) {
        if (!this.periodic) {
            return null
        }
        var ic = this._atoms_base._inv_cell;
        return [x[0] * ic[0][0] + x[1] * ic[1][0] + x[2] * ic[2][0],
            x[0] * ic[0][1] + x[1] * ic[1][1] + x[2] * ic[2][1],
            x[0] * ic[0][2] + x[1] * ic[1][2] + x[2] * ic[2][2]
        ];
    }

    /**
     * Compute and return the minimum supercell that guarantees
     * containing all atoms at a maximum distance r from those in the
     * [0,0,0] cell.
     * 
     * @param {float}   r       Maximum distance that must be contained within the supercell
     */
    minimumSupercell(r) {

        var diag = _.map(this._r_diag.values, function(x) {
            return mjs.pow(x, -0.5)
        });
        var utransf_mat = mjs.multiply(this._r_diag.vectors, mjs.diag(diag));
        var utransf_norm = mjs.transpose(utransf_mat);
        for (let i = 0; i < 3; ++i) {
            var norm = mjs.norm(utransf_mat[i]);
            for (let j = 0; j < 3; ++j) {
                utransf_norm[j][i] *= r / norm;
            }
        }
        var qmatrix = mjs.multiply(utransf_mat, utransf_norm);
        var scell = [];
        for (let i = 0; i < 3; ++i) {
            var b = 0;
            for (let j = 0; j < 3; ++j) {
                b = Math.max(Math.ceil(Math.abs(qmatrix[i][j])), b);
            }
            scell.push(2 * b + 1);
        }

        return scell;
    }

    /**
     * Find a group of atoms based on a given query and return as AtomImages
     * @param  {Array} query  A search query for atoms. Must use nested lists 
     *                        of types and arguments, and can use logic 
     *                        operators $and, $or and $xor.
     * @return {ModelView}    ModelView object for found atoms
     */
    find(query) {
        var found = this._qparse.parse(query);
        return this.view(found);
    }

    /** Create a new ModelView for this model, using a given list of indices 
     *  @param {Array} indices Indices of atoms to include in the ModelView
     *
     *  @return {ModelView}   ModelView object for specified indices
     */
    view(indices) {
        return new ModelView(this, indices);
    }

    /**
     * Reconstruct a {@link ModelView} from a plain array of atom-image indices,
     * as produced by {@link ModelView#toIndices}.  This is the stable public API
     * for deserialising a saved selection.
     *
     * @param  {number[]} indices
     * @return {ModelView}
     */
    viewFromIndices(indices = []) {
        return this.view(indices);
    }

    /**
     * Reconstruct a {@link ModelView} from an array of crystallographic site
     * labels (`crystLabel`), as produced by {@link ModelView#toLabels}.  This
     * is resilient to atom-index reordering across reloads.
     *
     * @param  {string[]} labels
     * @return {ModelView}
     */
    viewFromLabels(labels = []) {
        const wanted = new Set(labels);
        const indices = [];
        for (let i = 0; i < this._atom_images.length; ++i) {
            if (wanted.has(this._atom_images[i].crystLabel)) {
                indices.push(i);
            }
        }
        return this.view(indices);
    }

    /**
     * Set a property on a series of atom images
     *
     * @private
     * @param {AtomImage[]} aimages     List of AtomImages, or their indices
     * @param {String}      name        Name of the property to set
     * @param {String}      value       Value to set to the property
     */
    _setAtomsProperty(aimages, name, value) {

        // Value can be a single value or an Array
        var isarr = (value instanceof Array);

        for (let i = 0; i < aimages.length; ++i) {
            var id = aimages[i];
            if (id instanceof AtomImage)
                id = id.imgIndex;
            this._atom_images[id][name] = isarr ? value[i] : value;
        }

    }

    /**
     * Set a property on a series of bond images
     *
     * @private
     * @param {BondImage[]} aimages     List of BondImages
     * @param {String}      name        Name of the property to set
     * @param {String}      value       Value to set to the property
     */
    _setBondsProperty(bimages, name, value) {

        // Value can be a single value or an Array
        var isarr = (value instanceof Array);

        for (let i = 0; i < bimages.length; ++i) {
            var bimg = bimages[i];
            bimg[name] = isarr ? value[i] : value;
        }

    }

    // Query functions. These are for internal use. They return the indices of
    // AtomImages in the _atom_images array.
    
    /**
     * @private
     */
    _queryAll() {
        // All atoms
        return _.range(this._atom_images.length);
    }

    /**
     * @private
     */
    _queryIndices(indices) {

        if (typeof(indices) == 'number') {
            indices = [indices]; // A single index
        }

        var scell = this.supercell;
        var n = this.length;
        var scgrid = this._supercell_grid;

        var found = _.map(indices, function(i) {
            return _.map(scgrid, function(ijk) {
                return utils.supercellIndex(i, ijk, scell, n);
            });
        });

        return _.flatten(found);
    }

    /**
     * @private
     */
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

        return this._queryIndices(indices);
    }

   /**
     * @private
     */
    _queryLabels(labels) {
        if (_.isString(labels)) {
            labels = [labels]; // A single label
        }
        var indices = _.reduce(this._labels, function(inds, s, i) {
            if (labels.indexOf(s) > -1) {
                inds.push(i);
            }
            return inds;
        }, []);

        return this._queryIndices(indices);
    }

    /**
     * @private
     */
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
    }

    /**
     * @private
     */
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
            var fx0 = this.absToFrac(x0);
            var fx1 = this.absToFrac(x1);
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
        for (let i = fxmin[0]; i < fxmax[0]; ++i) {
            for (let j = fxmin[1]; j < fxmax[1]; ++j) {
                for (let k = fxmin[2]; k < fxmax[2]; ++k) {
                    // var p0 = this.fracToAbs([i, j, k]);
                    for (let a = 0; a < this.length; ++a) {

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
    }

    /**
     * @private
     */
    _querySphere(x0, r) {

        if (x0 instanceof AtomImage) {
            x0 = x0.xyz; // Can use an atom as centre
        }

        var scell = [1, 1, 1];
        var cell0 = [0, 0, 0];
        var fx0 = this.absToFrac(x0);

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

        for (let i = fxmin[0]; i < fxmax[0]; ++i) {
            for (let j = fxmin[1]; j < fxmax[1]; ++j) {
                for (let k = fxmin[2]; k < fxmax[2]; ++k) {
                    for (let a = 0; a < this.length; ++a) {

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

    /**
     * @private
     */
    _queryBonded(atoms, distance = 1, exact = false) {

        if (atoms instanceof AtomImage || typeof(atoms) == 'number') {
            atoms = [atoms];
        }
        if (atoms instanceof ModelView) {
            atoms = atoms._images;
        }
        if (atoms instanceof Array && typeof(atoms[0]) == 'number') {
            var imgs = this._atom_images;
            atoms = _.map(atoms, function(i) {
                return imgs[i];
            });
        }

        if (distance < 1) {
            return [];
        }

        function a2ii(a) {
            return a.imgIndex;
        }

        // Find all atoms that are at most [distance] bonds away from the ones
        // passed as argument

        var bonded_tree = [atoms]; // We start with distance zero and build up
        var found = [];

        for (let d = 1; d <= distance; ++d) {
            var previous = bonded_tree[d - 1];
            var next = [];
            for (let i = 0; i < previous.length; ++i) {
                next = next.concat(previous[i].bondedAtoms);
            }
            bonded_tree.push(next);
            if (!exact) {
                found = found.concat(_.map(next, a2ii));
            } else if (d == distance) {
                found = _.map(next, a2ii);
            }
        }

        found = _.uniq(found); // Remove duplicate values
        found = _.difference(found, _.map(bonded_tree[0], function(a) {
            return a.imgIndex;
        })); // Remove the starting atoms

        return found;
    }

    /**
     * @private
     */
    _queryMolecule(atoms) {

        if (atoms instanceof AtomImage || typeof(atoms) == 'number') {
            atoms = [atoms];
        }
        if (atoms instanceof ModelView) {
            atoms = atoms._images;
        }
        if (atoms instanceof Array && typeof(atoms[0]) == 'number') {
            var imgs = this._atom_images;
            atoms = _.map(atoms, function(i) {
                return imgs[i];
            });
        }

        var found = [];

        // For each atom, select the whole molecule
        for (let i = 0; i < atoms.length; ++atoms) {
            var a = atoms[i];

            var ind = a.index;
            var mol_ind = this._molinds[ind];
            var mol = this._molecules[mol_ind];

            // Identify the atom
            var c0 = _.find(mol, function(am) {
                return am.index == ind;
            }).cell;

            // Supercell indices?
            for (let j = 0; j < mol.length; ++j) {
                var am = mol[j];
                var cm = mjs.subtract(am.cell, c0);
                var im = am.index;
                var iim = utils.supercellIndex(im, cm, this._supercell, this.length);
                if (iim >= 0 && iim < this._atom_images.length) {
                    found.push(iim);
                }
            }
        }

        return found;

    }

}

export {
    AtomImage,
    BondImage,
    Model
}