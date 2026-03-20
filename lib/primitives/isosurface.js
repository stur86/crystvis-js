'use strict';

import _ from 'lodash';
import * as THREE from 'three';
import IsoSurf from 'isosurface';
import {
    DitherMaterial
} from './dither.js';
import { cellMatrix3, addStaticVar } from '../utils.js';

class IsosurfaceMesh extends THREE.Mesh {

    constructor(field, threshold, lattice, parameters={}) {
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
         * @param {Array} lattice           Unit cell on which the data is defined
         * @param {Object} parameters       Options:
         *                                      color
         *                                      opacity
         *                                      opacityMode [IsosurfaceMesh.RENDER_DITHER,
         *                                                   IsosurfaceMesh.RENDER_PHONG,
         *                                                   IsosurfaceMesh.RENDER_WFRAME]
         *                                      isoMethod   [IsosurfaceMesh.ISO_SURFACE_NETS,
         *                                                   IsosurfaceMesh.ISO_MARCHING_CUBES
         *                                                   IsosurfaceMesh.ISO_MARCHING_TETRAHEDRA]
         */

        const defaults = {
            color: 0x00ff00,
            opacity: 0.5,
            opacityMode: IsosurfaceMesh.RENDER_DITHER,
            isoMethod: IsosurfaceMesh.ISO_SURFACE_NETS
        }

        parameters = _.merge(defaults, parameters);

        // First compute the isosurface vertices and faces
        var dims = [0, 0, 0];

        try {
            dims[0] = field.length;
            dims[1] = field[0].length;
            dims[2] = field[0][0].length;
        } catch {
            // If we're here, something is wrong with field
            throw Error('Invalid field for isosurface rendering');
        }

        if (lattice instanceof Array) {
            lattice = cellMatrix3(lattice);    
        }

        var isofunc = IsoSurf[parameters.isoMethod];

        if (isofunc == null) {
            throw Error('Invalid method for isosurface rendering');
        }

        var mesh = isofunc(dims, function(x, y, z) {
            return field[x][y][z] - threshold;
        });

        // Convert positions to absolute coordinates
        var abspos = mesh.positions.map(function(xyz) {
            return (new THREE.Vector3(xyz[0] / dims[0],
                xyz[1] / dims[1],
                xyz[2] / dims[2])).applyMatrix3(lattice);
        });

        // Now generate a mesh geometry
        var geometry = new THREE.BufferGeometry();

        var verts = [];
        for (let i = 0; i < mesh.cells.length; ++i) {
            var face = mesh.cells[i];
            for (var j = 0; j < 3; ++j) {
                var v = abspos[face[j]];
                verts.push(v.x);
                verts.push(v.y);
                verts.push(v.z);
            }
        }

        verts = new Float32Array(verts);
        geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
        geometry.computeVertexNormals();
        geometry.computeFaceNormals();

        var c = new THREE.Color(parameters.color);
        var material;

        switch (parameters.opacityMode) {
            case IsosurfaceMesh.RENDER_DITHER:
                material = new DitherMaterial({
                    color: c,
                    opacity: parameters.opacity
                });
                break;
            case IsosurfaceMesh.RENDER_PHONG:
                material = new THREE.MeshPhongMaterial({
                    transparent: true,
                    color: c,
                    opacity: parameters.opacity
                });
                break;
            case IsosurfaceMesh.RENDER_WFRAME:
                // Same as PHONG, but with wireframe set on
                material = new THREE.MeshPhongMaterial({
                    color: c,
                    wireframe: true
                });
                break;
            default:
                throw new Error('Invalid opacityMode argument passed to IsosurfaceMesh');
        }

        super(geometry, material);

        this.opacityMode = parameters.opacityMode;
        this.renderOrder = 0.5;
    }

    get color() {
        return this.material.color;
    }

    set color(c) {
        this.material.color.set(c);
    }

    get opacity() {
        return this.material.opacity;
    }

    set opacity(o) {
        if (this.opacityMode !== IsosurfaceMesh.RENDER_WFRAME) {
            this.material.opacity = o;
        }
    }

}

addStaticVar(IsosurfaceMesh, 'RENDER_DITHER', 0);
addStaticVar(IsosurfaceMesh, 'RENDER_PHONG', 1);
addStaticVar(IsosurfaceMesh, 'RENDER_WFRAME', 2);

addStaticVar(IsosurfaceMesh, 'ISO_SURFACE_NETS', 'surfaceNets');
addStaticVar(IsosurfaceMesh, 'ISO_MARCHING_CUBES', 'marchingCubes');
addStaticVar(IsosurfaceMesh, 'ISO_MARCHING_TETRAHEDRA', 'marchingTetrahedra');

export { IsosurfaceMesh };