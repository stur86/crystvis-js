'use strict';

/** 
 * @fileoverview Classes and methods for rendering using THREE.js
 * @package
 */

// NPM imports
const $ = require('jquery');
const _ = require('lodash');
const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const IsoSurf = require('isosurface');

// Internal imports
const RenderTextSprite = require('./rendertext.js').RenderTextSprite;
const DitherMaterial = require('./dither.js').DitherMaterial;
const Graphics = require('./graphics.js');

/** 
 * An object representing the THREE.js graphical renderer for atomic models 
 * @class
 * @param {string}  target      CSS selector for the target HTML element in which to put the renderer
 * @param {int}     width       Desired width for the renderer
 * @param {int}     height      Desired height for the renderer
 */
function Renderer(target, width, height) {

    // Grab the target element
    this._div = $(target);

    this._w = width;
    this._h = height;
    this._updateSize();

    // Renderer
    this._r = new THREE.WebGLRenderer();
    this._r.setPixelRatio(window.devicePixelRatio);
    this._r.setSize(this._w, this._h);
    this._div.append(this._r.domElement);

    // Scene
    this._s = new THREE.Scene();

    // Camera
    var ratio = this._w * 1.0 / this._h;
    var depth = 1000; // For now we use a constant
    this._c = new THREE.OrthographicCamera(-20, 20,
        20 / ratio, -20 / ratio,
        0.1, 2 * depth);
    this._c.position.set(0, 0, depth + 0.1);
    this._c.lookAt(new THREE.Vector3(0, 0, 0));
    this._s.add(this._c);

    // Lights
    this._l = {}
    this._l._amb = new THREE.AmbientLight(0xffffff, 0.2);
    this._l._amb.name = 'ambLight';
    this._l._dir = new THREE.DirectionalLight(0xffffff, 0.5);
    this._l._dir.position.set(0, 1, -1);
    this._l._dir.name = 'dirLight';
    this._s.add(this._l._amb); // Added to scene
    this._c.add(this._l._dir); // Added to camera (rotates with it)

    // Controls
    this._oc = new OrbitControls(this._c, this._r.domElement);
    this._oc.addEventListener('change', this._orbit_render.bind(this));

    // Raycast for clicks
    this._rcastlist = [];
    this._r.domElement.addEventListener('mousedown', this._raycastClick.bind(this));

    // Groups
    this._g = {};
    this._g._ab = new THREE.Group(); // Atoms and bonds
    this._g._latt = new THREE.Group(); // Lattice
    this._g._sprites = new THREE.Group(); // All sprites
    this._g._bboards = new THREE.Group(); // All billboard-like surfaces
    this._g._surfs = new THREE.Group(); // All surfaces (ellipsoids etc.)
    this._g._plots = new THREE.Group(); // All other plots

    for (var k in this._g) {
        this._s.add(this._g[k]);
    }

    // Color scheme
    this._cell_line_color = 0xaaaaaa;
    this._cell_x_color = 0xff0000;
    this._cell_y_color = 0x00ff00;
    this._cell_z_color = 0x0000ff;

    // Set up the animation
    this._animate();
}

// Constants
Renderer.PHONG = 0;
Renderer.DITHER = 1;
Renderer.WFRAME = 2;
Renderer.DITHERNET = 3;

Renderer.ISO_SURFACE_NETS = 0;
Renderer.ISO_MARCHING_CUBES = 1;
Renderer.ISO_MARCHING_TETRAHEDRA = 2;

// Convenient function to create materials based on modes
var matmake = {};
matmake[Renderer.PHONG] = function(color, opacity) {
    return new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        transparent: opacity < 1,
        opacity: opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
};
matmake[Renderer.DITHER] = function(color, opacity) {
    return new DitherMaterial({
        color: new THREE.Color(color),
        alpha: opacity,
    });
};
matmake[Renderer.WFRAME] = function(color, linewidth) {
    return new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        wireframe: true,
        wireframeLinewidth: linewidth
    });
};
matmake[Renderer.DITHERNET] = function(color, opacity) {
    return new DitherMaterial({
        color: new THREE.Color(color),
        alpha: opacity,
        netting: true,
    });
};

var isomethods = {};
isomethods[Renderer.ISO_SURFACE_NETS] = 'surfaceNets';
isomethods[Renderer.ISO_MARCHING_CUBES] = 'marchingCubes';
isomethods[Renderer.ISO_MARCHING_TETRAHEDRA] = 'marchingTetrahedra';

Renderer.prototype = {
    // Methods
    _render: function() {
        this._r.clear();
        this._r.render(this._s, this._c);
    },
    _orbit_render: function() {
        // Rescale billboards
        var z = this._c.zoom;
        _.forEach(this._g._bboards.children, function(bb) {
            bb.scale.copy(bb._basescale).multiplyScalar(bb._targsize / z);
        });
        this._render();
    },
    _animate: function() {
        requestAnimationFrame(this._animate.bind(this));
        this._render();
    },
    _updateSize: function() {
        this._w = this._w || this._div.innerWidth();
        this._h = this._h || this._div.innerHeight();
    },
    _raycastClick: function(e) {
        // We create a 2D vector
        var vector = new THREE.Vector2();
        // We set its position where the user clicked and we convert it to a number between -1 & 1
        vector.set(
            2 * (e.clientX / this._w) - 1,
            1 - 2 * (e.clientY / this._h)
        );

        // We create a raycaster, which is some kind of laser going through your scene
        var raycaster = new THREE.Raycaster();
        // We apply two parameters to the 'laser', its origin (where the user clicked) and the direction (what the camera 'sees')
        raycaster.setFromCamera(vector, this._c);

        // We get all the objects the 'laser' find on its way (it returns an array containing the objects)
        for (var i = 0; i < this._rcastlist.length; ++i) {

            var targ = this._rcastlist[i][1] || this._s;

            var intersects = raycaster.intersectObjects(targ.children);
            this._rcastlist[i][0](intersects);
        }
    },
    /**
     * Add an atom to the rendered model
     * 
     * @param {THREE.Vector3} xyz       Position
     * @param {float} r                 Radius
     * @param {THREE.Color} color       Color     
     * 
     * @returns {THREE.Mesh}           Rendered object
     */
    _addAtom: function(xyz, r, color) {

        if (xyz instanceof Array) {
            xyz = new THREE.Vector3(xyz[0], xyz[1], xyz[2]);
        }

        color = color || 0xffffff;
        r = r || 1;

        var atom = new Graphics.AtomMesh(r, color);
        atom.position.copy(xyz);

        this._g._ab.add(atom);

        return atom;
    },
    /**
     * Add a bond to the rendered model
     * 
     * @param {THREE.Vector3} xyz0      Start point
     * @param {THREE.Vector3} xyz1      End point
     * @param {float} r                 Radius
     * @param {THREE.Color} c0          First color
     * @param {THREE.Color} c1          Second color
     * 
     * @returns {THREE.Mesh}           Rendered object
     */
    _addBond: function(xyz0, xyz1, r, c0, c1) {

        if (xyz0 instanceof Array) {
            xyz0 = new THREE.Vector3(xyz0[0], xyz0[1], xyz0[2]);
        }

        if (xyz1 instanceof Array) {
            xyz1 = new THREE.Vector3(xyz1[0], xyz1[1], xyz1[2]);
        }

        c0 = c0 || 0xffffff;
        c1 = c1 || 0xffffff;

        var bond = new Graphics.BondMesh(xyz0, xyz1, r, c0, c1);

        this._g._ab.add(bond);

        return bond;
    },
    /**
     * Add lattice box
     * 
     * @param {THREE.Matrix3} lattice_cart   Lattice vectors
     * @param {float} lw                     Line width
     * 
     * @returns {THREE.Mesh}           Rendered object
     */
    _addLattice: function(lattice_cart, lw) {

        if (lattice_cart instanceof Array) {
            var lc = lattice_cart;
            lattice_cart = new THREE.Matrix3();
            lattice_cart.set(lc[0][0], lc[1][0], lc[2][0],
                lc[0][1], lc[1][1], lc[2][1],
                lc[0][2], lc[1][2], lc[2][2]);
        }

        // Linewidth
        lw = lw || 1;

        // Add a representation of a cartesian lattice given as a matrix
        
        var boxMesh = new Graphics.BoxMesh(lattice_cart, lw, this._cell_line_color);
        this._g._latt.add(boxMesh);

        // Now add arrows
        var lattArrows = new Graphics.AxesMesh(lattice_cart, lw * 1.2, [this._cell_x_color,
            this._cell_y_color,
            this._cell_z_color
        ]);

        this._g._latt.add(lattArrows);

        return [boxMesh, lattArrows];
    },
    /**
     * Add 2D sprite
     * 
     * @param {THREE.Vector3} xyz       Position
     * @param {string} map              Filename of the 2D image to use
     * @param {float} size              Size (side to side) of the rendered sprite
     * @param {THREE.Color} color       Color
     * 
     * @returns {THREE.Sprite}          Rendered object
     */
    _addSprite: function(xyz, map, size, color) {
        var smap = new THREE.TextureLoader().load(map);
        var smat = new THREE.SpriteMaterial({
            map: smap,
            color: color
        });
        var sprite = new THREE.Sprite(smat);
        sprite.position.copy(xyz);
        sprite.scale.copy(new THREE.Vector3(size, size, size));
        sprite.renderOrder = 2;

        this._g._sprites.add(sprite);

        return sprite;
    },
    /**
     * Add a text sprite that always faces the camera and always has the same size
     * 
     * @param {THREE.Vector3} xyz       Position
     * @param {string} text             Message
     * @param {float} size              Scale
     * @param {Object} parameters       Other parameters (font, color etc. - see rendertext.js for details)
     * 
     * @returns {THREE.Sprite}          Rendered object
     */
    _addBillBoard: function(xyz, text, size, parameters) {

        if (xyz instanceof Array) {
            xyz = new THREE.Vector3(xyz[0], xyz[1], xyz[2]);
        }
        
        var bb = new RenderTextSprite(text, size, parameters);
        bb.position.copy(xyz);
        bb.renderOrder = 2;

        this._g._bboards.add(bb);

        return bb;
    },
    /**
     * Add an ellipsoid to the model
     * 
     * @param {THREE.Vector3} center        Ellipsoid center
     * @param {THREE.Vector3} ax1           Axis 1
     * @param {THREE.Vector3} ax2           Axis 2
     * @param {THREE.Vector3} ax3           Axis 3
     * @param {THREE.Color} color           Color
     * @param {float} opacity               Opacity
     * @param {int} mode                    Mode of ellipsoid rendering (Renderer.PHONG, Renderer.DITHER or Renderer.WFRAME)
     * @param {int} res                     Resolution of the model
     * @param {float} tol                   Tolerance when calculating whether the axes are orthogonal
     * 
     * @returns {THREE.Mesh}           Rendered object
     */
    _addEllipsoid: function(center, ax1, ax2, ax3, color,
        opacity, mode, res, tol) {

        color = color || 0xffffff;
        opacity = opacity || 1;
        res = res || 16;
        tol = tol || 1e-5;
        // Check that the axes are truly orthogonal
        ax1 = ax1.clone();
        ax2 = ax2.clone();
        ax3 = ax3.clone();

        var e1 = ax1.length();
        var e2 = ax2.length();
        var e3 = ax3.length();

        ax1.normalize();
        ax2.normalize();
        ax3.normalize();

        if ((Math.abs(ax1.dot(ax2)) > tol) ||
            (Math.abs(ax1.dot(ax3)) > tol) ||
            (Math.abs(ax2.dot(ax3)) > tol)) {
            throw 'Axes are not orthogonal';
        }

        var geo = new THREE.SphereBufferGeometry(1, res, res);
        var mat = matmake[mode](color, opacity);
        // Double side only creates ugly effects and is quite pointless
        mat.side = THREE.FrontSide;

        var ellips = new THREE.Mesh(geo, mat);
        ellips.position.copy(center);
        // Scale
        ellips._basescale = new THREE.Vector3(e1, e2, e3);
        ellips.scale.copy(ellips._basescale);
        ellips.renderOrder = 0.5;

        ellips._rescale = function(s) {
            ellips.scale.copy(ellips._basescale.clone().multiplyScalar(s));
        }

        // Rotation matrix
        var dir1 = ax1.toArray();
        var dir2 = ax2.toArray();
        var dir3 = ax3.toArray();
        var rotm = new THREE.Matrix4();
        rotm.set(
            dir1[0], dir2[0], dir3[0], 0,
            dir1[1], dir2[1], dir3[1], 0,
            dir1[2], dir2[2], dir3[2], 0,
            0, 0, 0, 1);
        ellips.setRotationFromMatrix(rotm);

        this._g._surfs.add(ellips);

        return ellips;
    },
    /**
     * Build an isosurface from the data found in field, using threshold
     * as a cutoff. Field must be a triple nested array ordered in such a
     * way that:
     *  
     * field[x][y][z]
     *
     * is the value at x, y, z. Dimensions must be consistent. Field will
     * be considered as spanning the orthorombic cell. If no cell is 
     * passed, field's own dimensions will be used.
     *
     * Three methods are available:
     * 0 = surface nets
     * 1 = marching cubes
     * 2 = marching tetrahedra
     * 
     * @param {Array} field             Volumetric data
     * @param {float} threshold         Isosurface threshold 
     * @param {THREE.Matrix3} cell      Unit cell on which the data is defined
     * @param {THREE.Color} color       Color
     * @param {float} opacity           Opacity
     * @param {int} mode                Mode of isosurface rendering (Renderer.PHONG, Renderer.DITHER or Renderer.WFRAME)
     * @param {int} method              Method used to compute the isosurface
     * 
     * @returns {THREE.Mesh}           Rendered object
     */
    _addIsosurface: function(field, threshold, cell, color, opacity, mode,
        method) {

        color = color || 0xffffff;
        opacity = opacity || 1;
        method = method || 0;

        // First compute the isosurface vertices and faces
        var dims = [0, 0, 0];

        try {
            dims[0] = field.length;
            dims[1] = field[0].length;
            dims[2] = field[0][0].length;
        } catch (e) {
            // If we're here, something is wrong with field
            throw 'Invalid field for isosurface rendering';
        }

        cell = cell || new THREE.Matrix3(dims[0], 0, 0,
            0, dims[1], 0,
            0, 0, dims[2]);


        var isofunc = IsoSurf[isomethods[method]];

        if (isofunc == null) {
            throw 'Invalid method for isosurface rendering';
        }

        var mesh = isofunc(dims, function(x, y, z) {
            return field[x][y][z] - threshold;
        });

        // Convert positions to absolute coordinates
        var abspos = mesh.positions.map(function(xyz) {
            return (new THREE.Vector3(xyz[0] / dims[0],
                xyz[1] / dims[1],
                xyz[2] / dims[2])).applyMatrix3(cell);
        });

        // Now generate a mesh geometry
        var geo = new THREE.BufferGeometry();

        var verts = [];
        for (var i = 0; i < mesh.cells.length; ++i) {
            var face = mesh.cells[i];
            for (var j = 0; j < 3; ++j) {
                var v = abspos[face[j]];
                verts.push(v.x);
                verts.push(v.y);
                verts.push(v.z);
            }
        }

        verts = new Float32Array(verts);
        geo.addAttribute('position', new THREE.BufferAttribute(verts, 3));
        geo.computeVertexNormals();
        geo.computeFaceNormals();

        var mat = matmake[mode](color, opacity);
        var isosurf = new THREE.Mesh(geo, mat);
        isosurf.renderOrder = 0.5;

        this._g._surfs.add(isosurf);

        return isosurf;
    },
    /**
     * Add a vector field representation to the model
     * 
     * @param {Array} points            List of origins for the vectors
     * @param {Array} vectors           Vectors to plot
     * @param {*} colors                Colors for each vector. Can be a single color, an array of colors, or a function that takes 
     *                                  origin, vector, and index, and returns a color.
     * @param {float} scale             Scaling factor
     * 
     * @returns {THREE.Group}           Rendered object
     */
    _addVectorField: function(points, vectors, colors, scale) {

        var N = points.length;
        if (vectors.length != N)
            throw 'Points and vectors arrays not matching for vector field';

        // We always reduce colors to a function with signature (p, v, i) but
        // it can also be an array or a single scalar.
        colors = colors || 0xffffff;
        switch (typeof colors) {
            case 'function':
                break;
            case 'object':
                if (colors.length != N)
                    throw 'Colors array not matching for vector field';
                var colors_arr = colors.slice();
                colors = function(p, v, i) {
                    return colors_arr[i];
                }
                break;
            default:
                var colors_val = colors;
                colors = function(p, v, i) {
                    return colors_val;
                }
        }
        scale = scale || 1;

        var vfield = new THREE.Group();

        for (var i = 0; i < N; ++i) {
            var p = points[i];
            var v = vectors[i];
            var c = colors(p, v, i);
            var l = v.length();
            v.normalize();
            var arr = new THREE.ArrowHelper(v, p, l, c, 0.2 * l, 0.1 * l);
            vfield.add(arr);
        }

        this._g._plots.add(vfield);

        return vfield;
    },
    /* All the following functions simply remove objects of each type
     */
    _removeAtomBond: function(el) {
        this._g._ab.remove(el);
    },
    _removeLattice: function(el) {
        this._g._latt.remove(el);
    },
    _removeBillBoard: function(el) {
        this._g._bboards.remove(el);
    },
    _removeSurf: function(el) {
        this._g._surfs.remove(el);
    },
    _removeSprite: function(el) {
        this._g._sprites.remove(el);
    },
    /**
     * Add a listener for click events on a given group
     * 
     * @param {Function} listener       Listener function
     * @param {THREE.Group} group       Group on which to detect clicks
     * 
     * @returns {Array}                 Reference to the created listener
     */
    addClickListener: function(listener, group) {
        var cl = [listener, group];
        this._rcastlist.push(cl);
        return cl;
    },
    /**
     * Remove a listener
     * @param {Array} cl                Reference to the listener to remove (as returned by addClickListener) 
     */
    removeClickListener: function(cl) {
        _.pull(this._rcastlist, cl);
    },
    /**
     * Set properties of ambient light
     * 
     * @param {float} intensity     Intensity
     */
    setAmbLight: function(intensity) {
        this._l._amb.intensity = intensity;
    },
    /**
     * Set properties of directional light
     * 
     * @param {float} intensity     Intensity
     * @param {float} px            Direction, x
     * @param {float} py            Direction, y
     * @param {float} pz            Direction, z
     */
    setDirLight: function(intensity, px, py, pz) {
        px = px === null ? this._l.dir.position.x : px;
        py = py === null ? this._l.dir.position.y : py;
        pz = pz === null ? this._l.dir.position.z : pz;
        this._l._dir.intensity = intensity;
        this._l._dir.position.set(px, py, pz);
    },
    /**
     * Remove all currently rendered objects.
     */
    removeAllObjects: function() {
        // Remove atoms and bonds
        for (var i = 0; i < this._g._ab.children.length; ++i) {
            this._removeAtomBond(this._g._ab.children[i]);
        }
        // Remove lattice
        for (var i = 0; i < this._g._latt.children.length; ++i) {
            this._removeLattice(this._g._latt.children[i]);
        }
        // Remove billboards
        for (var i = 0; i < this._g._bboards.children.length; ++i) {
            this._removeBillBoard(this._g._bboards.children[i]);
        }
        // Remove surfaces
        for (var i = 0; i < this._g._surfs.children.length; ++i) {
            this._removeSurf(this._g._surfs.children[i]);
        }
        // Remove sprites
        for (var i = 0; i < this._g._sprites.children.length; ++i) {
            this._removeSprite(this._g._sprites.children[i]);
        }

    }
}

exports.Renderer = Renderer;