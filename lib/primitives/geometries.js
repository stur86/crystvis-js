'use strict';

/**
 * @fileoverview Geometries used multiple times, generated once for economy
 */

import * as THREE from 'three';

const resolution = 16;

const unitSphere = new THREE.SphereBufferGeometry(1.0, resolution, resolution);
const unitCylinder = new THREE.CylinderBufferGeometry(1, 1, 1, resolution);
unitCylinder.rotateX(Math.PI / 2.0);

export {
    unitSphere,
    unitCylinder
};