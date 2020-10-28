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

/**
 * An object containing an Atomic structure and taking care of its periodic
 * nature, allowing querying and selection, and so on.
 * @class
 * @param {crystcif.Atoms} atoms   Atomic structure, in crystcif's Atoms format
 */
function Model(atoms) {

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

        this._supercell = [1, 1, 1]; // Default starting supercell size
    }

    this._supercell_grid = [
        [0, 0, 0]
    ];

    this._computeBonds();
    this._computeMolecules();

    // Parser for queries

    this._qparse = new QueryParser({
            'elements': this._queryElements,
            'cell': this._queryCell,
            'box': this._queryBox,
            'sphere': this._querySphere
        }, this,
        function(x, y) {
            return _.isEqual(x, y);
        });

    // By default no rendering
    this.setRenderer(null);

    // Scale of atoms and bonds (value, absolute)
    this._atoms_scale = [1.0, false];
    this._bonds_scale = [1.0, false];
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
        return _.clone(this._supercell);
    },
    set supercell(scell) {
        if (!this._periodic)
            return;
        this._supercell = scell;
        this._supercell_grid = utils.supercellGrid(scell);
    },
    get supercell_grid() {
        return _.cloneDeep(this._supercell_grid);
    },
    get images() {
        if (this.periodic)
            return this.atomImages(this._supercell);
        else
            return this.atomImages([1, 1, 1]);
    },
    /**
     * Compute the bonds within the model. For internal use
     */
    _computeBonds() {

        this._bonds = [];

        // Van der Waals radii by element
        var vdwr = _.map(this.symbols, function(s) {
            return data.getVdwRadius(s);
        });
        var maxr = _.max(vdwr);

        var cell = this.cell;
        var sgrid = [[0, 0 ,0]];
        var p = this.positions;

        if (this._periodic) {
            var scell = this.minimumSupercell(maxr);
            sgrid = utils.supercellGrid(scell);
        }
    
        // Now iterate over all atom pairs
        for (var i = 0; i < this.length; ++i) {
            var p1 = p[i];
            this._bonds.push({});
            for (var j = i; j < this.length; ++j) {
                var p2 = p[j];
                this._bonds[i][j] = [];

                for (var k = 0; k < sgrid.length; ++k) {
                    var c = sgrid[k];
                    if ((i == j) && (c[0] == 0 && c[1] == 0 && c[2] == 0)) {
                        // Just the same atom, skip
                        continue;
                    }
                    var r = mjs.multiply(c, cell);
                    r = mjs.add(p2, r);
                    r = mjs.subtract(r, p1);
                    r = mjs.norm(r);
                    if (r < (vdwr[i]+vdwr[j])/2.0) {
                        // Bond!
                        this._bonds[i][j].push(c);
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

        if (this.length < 2) {
            // No molecules can be computed
            this._molecules = null;
            return;            
        }

        var mol_sets = [];
        var unsorted_atoms = _.range(this.length);

        // Compile a full (two-directional) list of links
        var links = _.cloneDeep(this._bonds);
        for (var i = 0; i < this.length; ++i) {
            for (var j in this._bonds[i]) {
                var jn = parseInt(j);
                if (!(i in links[jn]))
                    links[jn][i] = [];
                for (var k = 0; k < this._bonds[i][j].length; ++k) {
                    var c = this._bonds[i][j][k];
                    links[jn][i].push(mjs.multiply(c, -1));
                }
            }
        }

        while (unsorted_atoms.length > 0) {
            var mol_queue = [[unsorted_atoms.shift(), [0,0,0]]];
            var current_mol = [];
            var current_mol_cells = [];
            while (mol_queue.length > 0) {
                var ac1 = mol_queue.shift();
                var a1 = ac1[0];
                var c1 = ac1[1];

                current_mol.push(a1);
                current_mol_cells.push(c1);
                // Find linked atoms
                var link1 = links[a1];
                for (var i in link1) {
                    var a2 = parseInt(i);
                    // Is a2 still unsorted?
                    if (!unsorted_atoms.includes(a2) || _.size(link1[i]) == 0)
                        continue;

                    for (var j = 0; j < link1[i].length; ++j) {
                        var c2 = link1[i][j];
                        mol_queue.push([a2, mjs.add(c1, c2)]);                        
                    }

                    unsorted_atoms.splice(unsorted_atoms.indexOf(a2), 1);
                }
            }
            mol_sets.push([
                current_mol,
                current_mol_cells]);
        }

        for (var i = 0; i < mol_sets.length; ++i) {

            var model = this;
            var mol = _.zipWith(mol_sets[i][0], mol_sets[i][1], function(a_i, cell) {
                return new AtomImage(model, a_i, cell);
            });

            this._molecules.push(mol);
        }

    },

    /**
     * Return a list of all AtomImages within the given supercell.
     * 
     * @param  {int[]} scell  Supercell to return images for
     * @return {AtomImage[]}  List of AtomImage objects
     */
    atomImages(scell) {
        scell = scell || this.supercell
        var sgrid = utils.supercellGrid(scell);
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
     * Convert fractional coordinates to absolute
     * 
     * @param  {float[]} fx Fractional coordinates
     * @return {float[]}    Absolute coordinates
     */
    frac2abs(fx) {
        if (!this.periodic) {
            return null
        }
        return mjs.multiply(fx, this._atoms._cell);
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
        return mjs.multiply(x, this._atoms._inv_cell);
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

        var that = this;
        var images = _.map(found, function(x) {
            return new AtomImage(that, x[0], x[1]);
        });

        return images;
    },
    /**
     * Set a renderer for this model's graphics
     * 
     * @param {Renderer} renderer The renderer to use for this Model
     */
    setRenderer(renderer) {

        this._renderer = renderer;
        // Reset all graphics
        this._graphics = {
            'atoms': {},
            'bonds': {},
            'cell': null
        };

    },
    /**
     * Remove renderer and erase all graphics
     */
    unsetRenderer() {

        if (this._renderer)
            this._renderer.clear();

        this._renderer = null;
        this._graphics = {};

    },
    /**
     * Set one or more atoms as visible/invisible in the current renderer
     * 
     * @param  {AtomImage[]}    aimages     List of atoms whose visibility to set
     * @param  {Boolean}        value       Value to give to the visibility
     */
    setAtomsVisibility(aimages, value) {

        if (!this._renderer) {
            throw 'No renderer set on this Model';
        }

        var r = this._renderer;
        var ga = this._graphics.atoms;
        _.forEach(aimages, function(aimg) {
            var a;
            var id = aimg.id;
            // Does it exist or not?
            if (id in ga) {
                a = ga[id];
            } else {
                a = r._addAtom(aimg.xyz, aimg.vdwRadius / 4.0, aimg.cpkColor);
                ga[id] = a;
            }
            a.visible = value;
        });

        this.setAtomsScale();
    },
    /**
     * Set the scale of atoms in the model.
     * 
     * @param {Number}  s    Scale to set
     * @param {Boolean} size If true, use s as an absolute size rather than a scale
     */
    setAtomsScale(s, size) {

        s = s || this._atoms_scale[0];
        size = size || this._atoms_scale[1];

        this._atoms_scale = [s, size];

        _.forEach(this._graphics.atoms, function(a) {
            var r = 1.0;
            if (size) {
                r = a.geometry.parameters.radius;
            }
            a.scale.set(s/r, s/r, s/r);
        });
    },
    /**
     * Set the visibility of bonds in between the given images
     * 
     * @param  {AtomImage[]}    aimages     List of atoms whose bonds' visibility to set
     * @param  {Boolean}        value       Value to give to the visibility
     */
    setBondsVisibility(aimages, value) {

        if (!this._renderer) {
            throw 'No renderer set on this Model';
        }

        var r = this._renderer;
        var gb = this._graphics.bonds;

        for (var i = 0; i < aimages.length; ++i) {
            var im1 = aimages[i];
            var id1 = im1.id;
            for (var j = i+1; j < aimages.length; ++j) {
                var im2 = aimages[j];
                var id2 = im2.id;

                // Are these two bonded?
                if (!(j in this._bonds[i]))
                    continue;

                var c = mjs.subtract(im2.ijk, im1.ijk);
                c = _.find(this._bonds[i][j], function(x) {
                    return (x[0] == c[0] && x[1] == c[1] && x[2] == c[2]);
                });

                if (c == null) 
                    continue;

                var b;
                var idb = id1 + '=' + id2;
                if (idb in gb) {
                    b = gb[idb];
                } else {
                    b = r._addBond(im1.xyz, im2.xyz, 0.2, 
                                   im1.cpkColor, im2.cpkColor);
                    gb[idb] = b;
                }
                b.visible = value;
            }
        }

        this.setBondsScale();
    },
    /**
     * Set the scale of bonds in the model.
     * 
     * @param {Number}  s    Scale to set
     * @param {Boolean} size If true, use s as an absolute size rather than a scale
     */
    setBondsScale(s, size) {

        s = s || this._bonds_scale[0];
        size = size || this._bonds_scale[1];

        this._bonds_scale = [s, size];

        _.forEach(this._graphics.bonds, function(b) {
            var r = 1.0;
            if (size) {
                r = b.children[0].geometry.parameters.radiusTop;
            }
            b.children[0].scale.set(s/r, s/r, 1);
            b.children[1].scale.set(s/r, s/r, 1);
        });
    },    
    /**
     * Set the crystal cell, if present, visible/invisible in the current renderer
     * 
     * @param {Boolean} box_value   Whether the box should be visible
     * @param {Boolean} ax_value    Whether the axes should be visible
     */
    setCellVisibility(box_value, ax_value) {

        if (!this._renderer) {
            throw 'No renderer set on this Model';
        }

        if (this.cell == null) {
            throw 'System is not periodic and has no cell';
        }

        if (this._graphics.cell == null) {
            // Create it
            var c = this._renderer._addLattice(this.cell);
            this._graphics.cell = {
                'box': c[0],
                'axes': c[1]
            };
        }

        this._graphics.cell.axes.visible = ax_value;
        this._graphics.cell.box.visible = box_value;
    },

    // Query functions. These are for internal use and return references
    // to atom images in the form [index, [i,j,k]]
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
        for (var i = 0; i < this._supercell_grid.length; ++i) {
            var cell = this._supercell_grid[i];
            found = found.concat(_.map(indices, function(x) {
                return [x, cell]
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

        var N = this.length;
        var found = _.map(_.range(N), function(x) {
            return [x, ijk]
        });

        return found;
    },

    _queryBox(x0, x1) {

        // var imgs = this.images;

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
                    var p0 = this.frac2abs([i, j, k]);
                    for (var a = 0; a < this.length; ++a) {
                        var p = _.clone(this._positions[a]);
                        if (p0 != null)
                            p = mjs.add(p, p0);

                        // Is it in the box?
                        var isin = _.reduce(p, function(r, x, e) {
                            return (r && (xmin[e] <= x) && (x <= xmax[e]));
                        }, true);

                        if (isin)
                            found.push([a, [i, j, k]]);
                    }
                }
            }
        }

        return found;
    },

    _querySphere(x0, r) {

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
                    var p0 = this.frac2abs([i, j, k]);
                    for (var a = 0; a < this.length; ++a) {
                        var p = _.clone(this._positions[a]);
                        if (p0 != null)
                            p = mjs.add(p, p0);

                        // Is it in the sphere?
                        var isin = mjs.distance(p, x0) <= r;

                        if (isin)
                            found.push([a, [i, j, k]]);
                    }
                }
            }
        }

        return found;
    }

}

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
    this._id = this._index + '_' + _.join(this._ijk, '_')

    this._xyz0 = model.positions[index];

    if (!model.periodic) {
        this._fxyz0 = null;
        this._fxyz = null;
        this._xyz = this._xyz0;
    } else {
        this._fxyz0 = model.scaled_positions[index];
        this._fxyz = mjs.add(this._fxyz0, ijk);
        this._xyz = mjs.multiply(this._fxyz, model._cell);
    }
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
    get ijk() {
        return _.cloneDeep(this._ijk);
    },
    get xyz0() {
        return _.cloneDeep(this._xyz0);
    },
    get xyz() {
        return _.cloneDeep(this._xyz);
    },
    get fxyz0() {
        return _.cloneDeep(this._fxyz0);
    },
    get fxyz() {
        return _.cloneDeep(this._fxyz);
    },
    // Check equality with another image
    equals(ai) {
        return (this._model == ai._model &&
            this._index == ai._index &&
            _.isEqual(this._ijk, ai._ijk));
    },
    // Return a copy, possibly shifted to a different cell
    copy(shift=[0,0,0]) {
        return new AtomImage(this._model, 
                             this._index, 
                             mjs.add(this._ijk, shift));
    }
}

exports.Model = Model;
exports.AtomImage = AtomImage;