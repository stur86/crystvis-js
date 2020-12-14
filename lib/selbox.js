'use strict';

/** 
 * @fileoverview Selection box handling for the renderer. Taken from the THREE
 * example files in
 *
 * 'three/examples/jsm/interactive/SelectionBox.js'
 * 'three/examples/jsm/interactive/SelectionHelper.js'
 *
 * but slightly customised for the specific needs of this app.
 * 
 * @package
 */

import {
    Frustum,
    Vector3,
    Vector2
} from 'three';
import $ from 'jquery';

import {
    AtomMesh
} from './primitives';

/**
 * This is a class to check whether objects are in a selection area in 3D space
 */

var SelectionBox = (function() {

    var frustum = new Frustum();
    var center = new Vector3();

    var tmpPoint = new Vector3();

    var vecNear = new Vector3();
    var vecTopLeft = new Vector3();
    var vecTopRight = new Vector3();
    var vecDownRight = new Vector3();
    var vecDownLeft = new Vector3();

    var vecFarTopLeft = new Vector3();
    var vecFarTopRight = new Vector3();
    var vecFarDownRight = new Vector3();
    var vecFarDownLeft = new Vector3();

    var vectemp1 = new Vector3();
    var vectemp2 = new Vector3();
    var vectemp3 = new Vector3();

    function SelectionBox(camera, scene, deep) {

        this.camera = camera;
        this.scene = scene;
        this.startPoint = new Vector3();
        this.endPoint = new Vector3();
        this.collection = [];
        this.deep = deep || Number.MAX_VALUE;

    }

    SelectionBox.prototype.select = function(startPoint, endPoint, target = null) {

        this.startPoint = startPoint || this.startPoint;
        this.endPoint = endPoint || this.endPoint;
        this.collection = [];

        target = target || this.scene;

        this.updateFrustum(this.startPoint, this.endPoint);
        this.searchChildInFrustum(frustum, target);

        return this.collection;

    };

    SelectionBox.prototype.updateFrustum = function(startPoint, endPoint) {

        startPoint = startPoint || this.startPoint;
        endPoint = endPoint || this.endPoint;

        // Avoid invalid frustum

        if (startPoint.x === endPoint.x) {

            endPoint.x += Number.EPSILON;

        }

        if (startPoint.y === endPoint.y) {

            endPoint.y += Number.EPSILON;

        }

        this.camera.updateProjectionMatrix();
        this.camera.updateMatrixWorld();

        if (this.camera.isPerspectiveCamera) {

            tmpPoint.copy(startPoint);
            tmpPoint.x = Math.min(startPoint.x, endPoint.x);
            tmpPoint.y = Math.max(startPoint.y, endPoint.y);
            endPoint.x = Math.max(startPoint.x, endPoint.x);
            endPoint.y = Math.min(startPoint.y, endPoint.y);

            vecNear.setFromMatrixPosition(this.camera.matrixWorld);
            vecTopLeft.copy(tmpPoint);
            vecTopRight.set(endPoint.x, tmpPoint.y, 0);
            vecDownRight.copy(endPoint);
            vecDownLeft.set(tmpPoint.x, endPoint.y, 0);

            vecTopLeft.unproject(this.camera);
            vecTopRight.unproject(this.camera);
            vecDownRight.unproject(this.camera);
            vecDownLeft.unproject(this.camera);

            vectemp1.copy(vecTopLeft).sub(vecNear);
            vectemp2.copy(vecTopRight).sub(vecNear);
            vectemp3.copy(vecDownRight).sub(vecNear);
            vectemp1.normalize();
            vectemp2.normalize();
            vectemp3.normalize();

            vectemp1.multiplyScalar(this.deep);
            vectemp2.multiplyScalar(this.deep);
            vectemp3.multiplyScalar(this.deep);
            vectemp1.add(vecNear);
            vectemp2.add(vecNear);
            vectemp3.add(vecNear);

            let planes = frustum.planes;

            planes[0].setFromCoplanarPoints(vecNear, vecTopLeft, vecTopRight);
            planes[1].setFromCoplanarPoints(vecNear, vecTopRight, vecDownRight);
            planes[2].setFromCoplanarPoints(vecDownRight, vecDownLeft, vecNear);
            planes[3].setFromCoplanarPoints(vecDownLeft, vecTopLeft, vecNear);
            planes[4].setFromCoplanarPoints(vecTopRight, vecDownRight, vecDownLeft);
            planes[5].setFromCoplanarPoints(vectemp3, vectemp2, vectemp1);
            planes[5].normal.multiplyScalar(-1);

        } else if (this.camera.isOrthographicCamera) {

            var left = Math.min(startPoint.x, endPoint.x);
            var top = Math.max(startPoint.y, endPoint.y);
            var right = Math.max(startPoint.x, endPoint.x);
            var down = Math.min(startPoint.y, endPoint.y);

            vecTopLeft.set(left, top, -1);
            vecTopRight.set(right, top, -1);
            vecDownRight.set(right, down, -1);
            vecDownLeft.set(left, down, -1);

            vecFarTopLeft.set(left, top, 1);
            vecFarTopRight.set(right, top, 1);
            vecFarDownRight.set(right, down, 1);
            vecFarDownLeft.set(left, down, 1);

            vecTopLeft.unproject(this.camera);
            vecTopRight.unproject(this.camera);
            vecDownRight.unproject(this.camera);
            vecDownLeft.unproject(this.camera);

            vecFarTopLeft.unproject(this.camera);
            vecFarTopRight.unproject(this.camera);
            vecFarDownRight.unproject(this.camera);
            vecFarDownLeft.unproject(this.camera);

            let planes = frustum.planes;

            planes[0].setFromCoplanarPoints(vecTopLeft, vecFarTopLeft, vecFarTopRight);
            planes[1].setFromCoplanarPoints(vecTopRight, vecFarTopRight, vecFarDownRight);
            planes[2].setFromCoplanarPoints(vecFarDownRight, vecFarDownLeft, vecDownLeft);
            planes[3].setFromCoplanarPoints(vecFarDownLeft, vecFarTopLeft, vecTopLeft);
            planes[4].setFromCoplanarPoints(vecTopRight, vecDownRight, vecDownLeft);
            planes[5].setFromCoplanarPoints(vecFarDownRight, vecFarTopRight, vecFarTopLeft);
            planes[5].normal.multiplyScalar(-1);

        } else {

            console.error('THREE.SelectionBox: Unsupported camera type.');

        }

    };

    SelectionBox.prototype.searchChildInFrustum = function(frustum, object) {

        if (object instanceof AtomMesh) {

            if (object.material !== undefined) {

                if (object.geometry.boundingSphere === null) object.geometry.computeBoundingSphere();

                center.copy(object.geometry.boundingSphere.center);

                center.applyMatrix4(object.matrixWorld);

                if (frustum.containsPoint(center)) {

                    this.collection.push(object);

                }

            }

        }

        if (object.children.length > 0) {

            for (var x = 0; x < object.children.length; x++) {

                this.searchChildInFrustum(frustum, object.children[x]);

            }

        }

    };

    return SelectionBox;

})();


var SelectionHelper = (function() {

    function SelectionHelper(selectionBox, renderer, cssClassName) {

        this.element = $('<div>');
        this.element.addClass(cssClassName);

        this.element.css({
            'position': 'fixed',
            'pointerEvents': 'none',
            'display': 'none',
            'border-width': '1px',
            'border-style': 'solid',
            'background-color': 'rgb(255, 0, 0)', // Default style
            'opacity': 0.5
        });

        this.minBoxSize = 10.0;

        this.renderer = renderer;
        this.domElement = this.renderer._r.domElement;
        this.domElement.parentElement.appendChild(this.element.get(0));

        this.selBox = selectionBox;

        this.startPoint = new Vector2();
        this.pointTopLeft = new Vector2();
        this.pointBottomRight = new Vector2();

        this.isDown = false;
        this.selectOverCallback = null;

        this.domElement.addEventListener('pointerdown', function(event) {

            if (event.shiftKey) {
                this.isDown = true;
                this.onSelectStart(event);
            }

        }.bind(this), false);

        this.domElement.addEventListener('pointermove', function(event) {

            if (this.isDown && event.shiftKey) {

                this.onSelectMove(event);

            }

        }.bind(this), false);

        this.domElement.addEventListener('pointerup', function(event) {

            if (this.isDown && event.shiftKey) {
                this.isDown = false;
                this.onSelectOver(event);
            }

        }.bind(this), false);

        this.domElement.addEventListener('keyup', function(event) {

            if (event.key == 'Shift' && this.isDown) {
                this.isDown = false;
                this.onSelectOver(event);
            }

        }.bind(this), false);

    }

    SelectionHelper.prototype.onSelectStart = function(event) {

        this.element.css({
            'display': 'block',
            'left': event.clientX + 'px',
            'top': event.clientY + 'px',
            'width': '0px',
            'height': '0px'
        });

        this.startPoint.x = event.clientX;
        this.startPoint.y = event.clientY;

        this.pointBottomRight.x = this.startPoint.x;
        this.pointBottomRight.y = this.startPoint.y;
        this.pointTopLeft.x = this.startPoint.x;
        this.pointTopLeft.y = this.startPoint.y;

    };

    SelectionHelper.prototype.onSelectMove = function(event) {

        this.pointBottomRight.x = Math.max(this.startPoint.x, event.clientX);
        this.pointBottomRight.y = Math.max(this.startPoint.y, event.clientY);
        this.pointTopLeft.x = Math.min(this.startPoint.x, event.clientX);
        this.pointTopLeft.y = Math.min(this.startPoint.y, event.clientY);

        this.element.css({
            'left': this.pointTopLeft.x + 'px',
            'top': this.pointTopLeft.y + 'px',
            'width': (this.pointBottomRight.x - this.pointTopLeft.x) + 'px',
            'height': (this.pointBottomRight.y - this.pointTopLeft.y) + 'px'
        });

    };

    SelectionHelper.prototype.onSelectOver = function() {

        this.element.css('display', 'none');

        if (this.selectOverCallback) {

            var p1 = this.renderer.documentToWorld(this.pointBottomRight.x, this.pointBottomRight.y);
            var p2 = this.renderer.documentToWorld(this.pointTopLeft.x, this.pointTopLeft.y);

            // Skip if they're too close
            var boxSize = Math.abs(this.pointBottomRight.x - this.pointTopLeft.x) +
                Math.abs(this.pointBottomRight.y - this.pointTopLeft.y);

            if (boxSize > this.minBoxSize)
                this.selectOverCallback(p1, p2);
        }

    };

    return SelectionHelper;

})();


export {
    SelectionBox,
    SelectionHelper
};