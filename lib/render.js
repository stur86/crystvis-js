'use strict';

// NPM imports
var $ = require('jquery');
var _ = require('lodash');
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var IsoSurf = require('isosurface');

// Internal imports
var renderTextSprite = require('./rendertext.js').renderTextSprite;

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

    // Set up the animation
    this._animate();
}

Renderer.prototype = {
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
    _addAtom: function(xyz, r, color, res) {
        color = color || 0xffffff;
        r = r || 1;
        res = res || 32; // Number of segments
        var geo = new THREE.SphereGeometry(r, res, res);
        var mat = new THREE.MeshPhongMaterial({ color: color });
        var atom = new THREE.Mesh(geo, mat);
        atom.position.copy(xyz);

        this._g._ab.add(atom);

        return atom;
    },
    _addBond: function(xyz0, xyz1, r, c0, c1, res) {
        c0 = c0 || 0xffffff;
        c1 = c1 || 0xffffff;
        res = res || 32;
        var p0 = xyz0.clone();
        var p1 = xyz1.clone();

        var dp = p1.clone();
        dp.sub(p0);
        var l = dp.length();

        // Halfpoint?
        var hv = p0.clone();
        hv.addScaledVector(dp, 0.5);

        var geo = new THREE.CylinderGeometry(r, r, l / 2.0, res);
        geo.rotateX(Math.PI / 2.0);
        var rmat = new THREE.Matrix4();
        rmat.lookAt(p0, p1, new THREE.Vector3(0, 0, 1));

        var bond = new THREE.Group();
        var mat0 = new THREE.MeshPhongMaterial({ color: c0 });
        var mat1 = new THREE.MeshPhongMaterial({ color: c1 });
        var bond0 = new THREE.Mesh(geo, mat0);
        bond0.position.copy(p0.clone().addScaledVector(dp, 0.25));
        bond0.setRotationFromMatrix(rmat);
        var bond1 = new THREE.Mesh(geo, mat1);
        bond1.position.copy(p1.clone().addScaledVector(dp, -0.25));
        bond1.setRotationFromMatrix(rmat);

        bond.add(bond0);
        bond.add(bond1);

        this._g._ab.add(bond);

        return bond;
    },
    _addLattice: function(lattice_cart, lw) {

        // Linewidth
        lw = lw || 1;

        // Add a representation of a cartesian lattice given as a matrix
        var boxGeom = new THREE.Geometry();

        // Create all vertices and faces
        for (var xs = 0; xs <= 1; ++xs) {
            for (var ys = 0; ys <= 1; ++ys) {
                for (var zs = 0; zs <= 1; ++zs) {
                    var fp = new THREE.Vector3(xs, ys, zs)
                        .applyMatrix3(lattice_cart);
                    boxGeom.vertices.push(fp);
                }
            }
        }

        boxGeom.faces = [
            new THREE.Face3(0, 1, 2),
            new THREE.Face3(2, 1, 3),
            new THREE.Face3(4, 5, 6),
            new THREE.Face3(6, 5, 7),
            new THREE.Face3(0, 1, 4),
            new THREE.Face3(4, 1, 5),
            new THREE.Face3(2, 3, 6),
            new THREE.Face3(6, 3, 7),
            new THREE.Face3(0, 2, 4),
            new THREE.Face3(4, 2, 6),
            new THREE.Face3(1, 3, 5),
            new THREE.Face3(5, 3, 7),
        ];

        boxGeom = new THREE.EdgesGeometry(boxGeom); // Convert to wireframe
        var boxMat = new THREE.LineBasicMaterial({
            color: 0xaaaaaa,
            linewidth: lw
        });
        var boxMesh = new THREE.LineSegments(boxGeom, boxMat);
        this._g._latt.add(boxMesh);

        // Now add arrows
        var lattArrows = new THREE.Group();
        var origin = new THREE.Vector3(0, 0, 0);
        var elems = lattice_cart.elements;
        for (var i = 0; i < 3; ++i) {
            var dir = new THREE.Vector3(elems[3 * i], elems[3 * i + 1], elems[3 * i + 2]);
            var l = dir.length() / 3.0;
            dir.normalize();
            var arr = new THREE.ArrowHelper(dir, origin, l,
                [0xff0000, 0x00ff00, 0x0000ff][i]);
            arr.line.material.linewidth = lw * 1.2; // Must be slightly thicker
            lattArrows.add(arr);
        }

        this._g._latt.add(lattArrows);

        return [boxMesh, lattArrows];
    },
    _addSprite: function(xyz, map, size, color) {
        var smap = new THREE.TextureLoader().load( map );
        var smat = new THREE.SpriteMaterial( { map: smap, color: color } );
        var sprite = new THREE.Sprite( smat );
        sprite.position.copy(xyz);
        sprite.renderOrder = 2;
        
        this._g._sprites.add( sprite );

        return sprite;
    },
    _addBillBoard: function(xyz, text, size, parameters) {
        var bb = renderTextSprite(text, size, parameters);
        bb.position.copy(xyz);
        bb.renderOrder = 2;

        this._g._bboards.add(bb);

        return bb;
    },
    _addEllipsoid: function(center, ax1, ax2, ax3, color,
        opacity, wframe, res, tol) {

        color = color || 0xffffff;
        opacity = opacity || 1;
        res = res || 16;
        tol = tol || 1e-5;
        wframe = wframe || 0; // If > 0, used as linewidth
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

        var geo = new THREE.SphereGeometry(1, res, res);
        var mat = new THREE.MeshPhongMaterial({
            color: color,
            transparent: opacity < 1,
            opacity: opacity,
            depthWrite: false, // This is necessary to have proper rendering on top of transparent surfaces.
        });
        mat.wireframe = wframe > 0;
        mat.wireframeLinewidth = wframe;
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
    _addIsosurface: function(field, threshold, cell, color, opacity, wframe,
        method) {
        /*
        Build an isosurface from the data found in field, using threshold
        as a cutoff. Field must be a triple nested array ordered in such a
        way that:

        field[x][y][z]

        is the value at x, y, z. Dimensions must be consistent. Field will
        be considered as spanning the orthorombic cell. If no cell is 
        passed, field's own dimensions will be used.

        Three methods are available:
        0 = surface nets
        1 = marching cubes
        2 = marching tetrahedra
        */

        color = color || 0xffffff;
        opacity = opacity || 1;
        wframe = wframe || 0;
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


        var isofunc = IsoSurf[['surfaceNets',
            'marchingCubes',
            'marchingTetrahedra'
        ][method]];

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
        var mat = new THREE.MeshPhongMaterial({
            color: color,
            transparent: opacity < 1,
            opacity: opacity,
            depthWrite: false, // This is necessary to have proper rendering on top of transparent surfaces.
            side: THREE.DoubleSide
        });
        mat.wireframe = wframe > 0;
        mat.wireframeLinewidth = wframe;
        var isosurf = new THREE.Mesh(geo, mat);
        isosurf.renderOrder = 0.5;

        this._g._surfs.add(isosurf);

        return isosurf;
    },
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
                colors = function(p, v, i) { return colors_arr[i]; }
                break;
            default:
                var colors_val = colors;
                colors = function(p, v, i) { return colors_val; }
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
    addClickListener: function(listener, group) {
        var cl = [listener, group];
        this._rcastlist.push(cl);
        return cl;
    },
    removeClickListener: function(cl) {
        _.pull(this._rcastlist, cl);
    },
    setAmbLight: function(intensity) {
        this._l._amb.intensity = intensity;
    },
    setDirLight: function(intensity, px, py, pz) {
        this._l._dir.intensity = intensity;
        this._l._dir.position.set(px || 0, py || 0, pz || 0);
    },
    test: function() {
        var geometry = new THREE.SphereGeometry(1, 32, 32);
        var material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        cube.name = 'Cube';
        this._s.add(cube);
        var geometry = new THREE.SphereGeometry(0.3, 32, 32);
        var material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(2, 0, 0)
        cube.name = 'Cube';
        this._s.add(cube);
    }
}

exports.Renderer = Renderer;