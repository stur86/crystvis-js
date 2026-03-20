'use strict';

/**
 * @fileoverview Geometries used multiple times, generated once for economy
 */

import * as THREE from 'three';

const resolution = 16;

const unitSphere = new THREE.SphereGeometry(1.0, resolution, resolution);
const unitCylinder = new THREE.CylinderGeometry(1, 1, 1, resolution);
unitCylinder.rotateX(Math.PI / 2.0);
const unitCircle = new THREE.CircleGeometry(1.0, resolution*2);

export {
    unitSphere,
    unitCylinder,
    unitCircle
};