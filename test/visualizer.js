'use strict';

/**
 * Tests for CrystVis.dispose() and the isDisposed guard.
 *
 * These tests run in Node.js (no DOM / WebGL) by constructing a CrystVis
 * instance via Object.create so we can supply lightweight mock objects in
 * place of the real THREE.WebGLRenderer and OrbitControls.
 */

import * as chai from 'chai';
import { CrystVis, _buildAppearanceController } from '../lib/visualizer.js';

const expect = chai.expect;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the bare minimum mock Renderer that dispose() expects to find on
 * this._renderer.  Each call-count field starts at 0 so tests can assert
 * that the matching method was called exactly once.
 * Mirrors the boundary methods added to the real Renderer in render.js.
 */
function makeMockRenderer() {
    const renderer = {
        _disposed: false,
        _disposeCalls: 0,
        _setCameraStateCalls: [],
        _cameraChangeHandlers: [],
        _cameraState: { position: { x: 0, y: 0, z: 10 }, target: { x: 0, y: 0, z: 0 }, zoom: 1 },

        // ── Appearance state (mirrors Renderer constructor defaults) ─────────
        _theme: {
            background:     0x000000,
            foreground:     0xffffff,
            highlight:      0x00ff00,
            cell_line_color: 0xffffff,
            label_color:    0xffffff,
        },
        // label colour injected into new TextSprites
        _labelColor:          0xffffff,
        // aura appearance injected into new AuraMesh instances
        _auraFill:            0xaaaa00,
        _auraBorder:          0xffff00,
        _auraBorderFraction:  0.8,
        _auraOpacity:         0.8,
        // cell axis colours
        _cell_x_color: 0xff0000,
        _cell_y_color: 0x00ff00,
        _cell_z_color: 0x0000ff,
        // selbox CSS state (live setters update these)
        selbox_bkg_color:    0x1111aa,
        selbox_border_color: 0x5555dd,
        selbox_opacity:      0.5,

        // theme: forward to _theme so appearance namespace can read it
        get theme() { return this._theme; },
        set theme(t) { this._theme = t; },

        // ── Boundary colour/light methods ─────────────────────────────────────
        setClearColor(c) {
            this._theme = Object.assign({}, this._theme, { background: c });
        },
        setLabelColor(c) {
            this._labelColor = c;
            this._theme = Object.assign({}, this._theme, { label_color: c });
        },
        setCellLineColor(c) {
            this._theme = Object.assign({}, this._theme, { cell_line_color: c });
        },
        setAuraFill(c)           { this._auraFill = c; },
        setAuraBorder(c)         { this._auraBorder = c; },
        setAuraBorderFraction(v) { this._auraBorderFraction = v; },
        setAuraOpacity(v)        { this._auraOpacity = v; },
        setCellAxisX(c)          { this._cell_x_color = c; },
        setCellAxisY(c)          { this._cell_y_color = c; },
        setCellAxisZ(c)          { this._cell_z_color = c; },

        // ── Lighting call-tracking ─────────────────────────────────────────────
        _ambientLightCalls:     [],
        _directionalLightCalls: [],
        setAmbientLight(intensity) {
            this._ambientLightCalls.push(intensity);
        },
        setDirectionalLight(intensity, px, py, pz) {
            this._directionalLightCalls.push({ intensity, px, py, pz });
        },

        // ── Other methods ──────────────────────────────────────────────────────
        dispose() {
            this._disposed = true;
            this._disposeCalls++;
        },
        clear() {},
        addNotifications() {},
        clearNotifications() {},
        resetOrbitCenter() {},
        add() {},
        remove() {},
        getCameraState() {
            return Object.assign({}, this._cameraState,
                { position: Object.assign({}, this._cameraState.position),
                  target:   Object.assign({}, this._cameraState.target) });
        },
        setCameraState(state) {
            this._setCameraStateCalls.push(state);
            if (state) Object.assign(this._cameraState, state);
        },
        onCameraChange(cb) {
            this._cameraChangeHandlers.push(cb);
            return () => {
                this._cameraChangeHandlers =
                    this._cameraChangeHandlers.filter(h => h !== cb);
            };
        },
        /** Trigger all registered camera-change handlers (test helper). */
        _fireCameraChange() {
            const state = this.getCameraState();
            this._cameraChangeHandlers.forEach(h => h(state));
        },
    };
    return renderer;
}

/**
 * Return a CrystVis instance whose constructor has been bypassed so that
 * no DOM element or WebGL context is needed.  The internal _renderer is
 * replaced with the supplied mock (or a fresh mock if none is given).
 */
function makeMockVis(mockRenderer) {
    const r = mockRenderer || makeMockRenderer();

    // Bypass the real constructor to avoid DOM / WebGL requirements
    const vis = Object.create(CrystVis.prototype);

    vis._isDisposed = false;
    vis._renderer = r;
    vis._loader = { load() { return {}; } };
    vis._models = {};
    vis._current_model = null;
    vis._current_mname = null;
    vis._displayed = null;
    vis._selected = null;
    vis._notifications = [];
    vis._atom_click_events = {};
    vis._atom_click_defaults = {};
    vis._atom_box_event = null;
    vis._hsel = false;
    vis.cifsymtol = 1e-2;

    // New state added by this batch of features
    vis._model_sources    = {};
    vis._model_parameters = {};
    vis._model_meta       = {};
    vis._model_list_change_cbs = [];
    vis._display_change_cbs    = [];
    vis._camera_change_cbs     = [];
    // Wire the renderer's camera-change signal to the vis callback array,
    // mirroring what the real constructor does.
    vis._camera_unsub = r.onCameraChange((state) => {
        vis._camera_change_cbs.forEach(cb => cb(state));
    });

    // Build the vis.appearance namespace (mirrors what the real constructor does)
    vis._appearance = _buildAppearanceController(vis);

    return { vis, renderer: r };
}

// ---------------------------------------------------------------------------
// Tests: dispose()
// ---------------------------------------------------------------------------

describe('CrystVis#dispose', function () {

    it('should set isDisposed to true', function () {
        const { vis } = makeMockVis();
        expect(vis.isDisposed).to.be.false;
        vis.dispose();
        expect(vis.isDisposed).to.be.true;
    });

    it('should call renderer.dispose() exactly once', function () {
        const { vis, renderer } = makeMockVis();
        vis.dispose();
        expect(renderer._disposeCalls).to.equal(1);
    });

    it('should null the internal _renderer reference', function () {
        const { vis } = makeMockVis();
        vis.dispose();
        expect(vis._renderer).to.be.null;
    });

    it('should null _current_model and _current_mname', function () {
        const { vis } = makeMockVis();
        vis._current_mname = 'test';
        vis.dispose();
        expect(vis._current_model).to.be.null;
        expect(vis._current_mname).to.be.null;
    });

    it('should clear the _models map', function () {
        const { vis } = makeMockVis();
        vis._models = { a: {}, b: {} };
        vis.dispose();
        expect(Object.keys(vis._models)).to.have.length(0);
    });

    it('should clear model source / parameter / meta stores', function () {
        const { vis } = makeMockVis();
        vis._model_sources    = { a: { text: 'x', extension: 'cif' } };
        vis._model_parameters = { a: { supercell: [1,1,1] } };
        vis._model_meta       = { a: { prefix: 'cif', originalName: 'a' } };
        vis.dispose();
        expect(Object.keys(vis._model_sources)).to.have.length(0);
        expect(Object.keys(vis._model_parameters)).to.have.length(0);
        expect(Object.keys(vis._model_meta)).to.have.length(0);
    });

    it('should clear lifecycle and camera-change callback arrays', function () {
        const { vis } = makeMockVis();
        vis._model_list_change_cbs.push(() => {});
        vis._display_change_cbs.push(() => {});
        vis._camera_change_cbs.push(() => {});
        vis.dispose();
        expect(vis._model_list_change_cbs).to.have.length(0);
        expect(vis._display_change_cbs).to.have.length(0);
        expect(vis._camera_change_cbs).to.have.length(0);
    });

    it('should unsubscribe from renderer camera-change on dispose', function () {
        const { vis, renderer } = makeMockVis();
        // One handler was registered by makeMockVis wiring
        expect(renderer._cameraChangeHandlers).to.have.length(1);
        vis.dispose();
        expect(renderer._cameraChangeHandlers).to.have.length(0);
    });

    it('should clear atom event callbacks', function () {
        const { vis } = makeMockVis();
        vis._atom_click_events = { 1: () => {} };
        vis._atom_box_event = () => {};
        vis.dispose();
        expect(Object.keys(vis._atom_click_events)).to.have.length(0);
        expect(vis._atom_box_event).to.be.null;
    });

    it('should be idempotent: calling dispose() twice is harmless', function () {
        const { vis, renderer } = makeMockVis();
        vis.dispose();
        vis.dispose();
        // renderer.dispose() should only have been called the first time
        expect(renderer._disposeCalls).to.equal(1);
    });

});

// ---------------------------------------------------------------------------
// Tests: isDisposed guard
// ---------------------------------------------------------------------------

describe('CrystVis#isDisposed guard', function () {

    it('loadModels() should throw after disposal', function () {
        const { vis } = makeMockVis();
        vis.dispose();
        expect(() => vis.loadModels('data', 'xyz')).to.throw(
            /cannot call loadModels\(\) on a disposed instance/
        );
    });

    it('displayModel() should throw after disposal', function () {
        const { vis } = makeMockVis();
        vis.dispose();
        expect(() => vis.displayModel('mymodel')).to.throw(
            /cannot call displayModel\(\) on a disposed instance/
        );
    });

    it('reloadModel() should throw after disposal', function () {
        const { vis } = makeMockVis();
        vis.dispose();
        expect(() => vis.reloadModel('mymodel')).to.throw(
            /cannot call reloadModel\(\) on a disposed instance/
        );
    });

    it('unloadAll() should throw after disposal', function () {
        const { vis } = makeMockVis();
        vis.dispose();
        expect(() => vis.unloadAll()).to.throw(
            /cannot call unloadAll\(\) on a disposed instance/
        );
    });

    it('isDisposed getter returns false before disposal', function () {
        const { vis } = makeMockVis();
        expect(vis.isDisposed).to.be.false;
    });

    it('isDisposed getter returns true after disposal', function () {
        const { vis } = makeMockVis();
        vis.dispose();
        expect(vis.isDisposed).to.be.true;
    });

});

// ---------------------------------------------------------------------------
// Tests: camera state (§1)
// ---------------------------------------------------------------------------

describe('CrystVis#getCameraState / setCameraState', function () {

    it('getCameraState() delegates to the renderer', function () {
        const { vis, renderer } = makeMockVis();
        const state = vis.getCameraState();
        expect(state).to.deep.equal(renderer._cameraState);
    });

    it('getCameraState() returns a snapshot (not the live object)', function () {
        const { vis, renderer } = makeMockVis();
        const state = vis.getCameraState();
        // Mutate the returned snapshot – the renderer's state must not change
        state.zoom = 999;
        expect(renderer._cameraState.zoom).to.not.equal(999);
    });

    it('setCameraState() delegates to the renderer', function () {
        const { vis, renderer } = makeMockVis();
        const newState = { position: { x: 1, y: 2, z: 3 }, target: { x: 0, y: 0, z: 0 }, zoom: 2 };
        vis.setCameraState(newState);
        expect(renderer._setCameraStateCalls).to.have.length(1);
        expect(renderer._setCameraStateCalls[0]).to.equal(newState);
    });

});

describe('CrystVis#onCameraChange', function () {

    it('registers a callback that fires when the renderer emits a camera change', function () {
        const { vis, renderer } = makeMockVis();
        const received = [];
        vis.onCameraChange(state => received.push(state));
        renderer._fireCameraChange();
        expect(received).to.have.length(1);
        expect(received[0]).to.have.keys(['position', 'target', 'zoom']);
    });

    it('supports multiple subscribers', function () {
        const { vis, renderer } = makeMockVis();
        let countA = 0, countB = 0;
        vis.onCameraChange(() => countA++);
        vis.onCameraChange(() => countB++);
        renderer._fireCameraChange();
        expect(countA).to.equal(1);
        expect(countB).to.equal(1);
    });

    it('returned unsubscribe function stops future callbacks', function () {
        const { vis, renderer } = makeMockVis();
        const received = [];
        const unsub = vis.onCameraChange(state => received.push(state));
        renderer._fireCameraChange(); // fires once
        unsub();
        renderer._fireCameraChange(); // should NOT reach the callback
        expect(received).to.have.length(1);
    });

});

// ---------------------------------------------------------------------------
// Tests: model source / parameters / metadata (§2, §3)
// ---------------------------------------------------------------------------

describe('CrystVis#getModelSource / getModelParameters / getModelMeta', function () {

    it('getModelSource() returns null for unknown model', function () {
        const { vis } = makeMockVis();
        expect(vis.getModelSource('missing')).to.be.null;
    });

    it('getModelSource() returns a cloned copy of stored source', function () {
        const { vis } = makeMockVis();
        vis._model_sources['m'] = { text: 'data...', extension: 'cif' };
        const src = vis.getModelSource('m');
        expect(src).to.deep.equal({ text: 'data...', extension: 'cif' });
        // Mutating the returned copy must not affect the store
        src.text = 'modified';
        expect(vis._model_sources['m'].text).to.equal('data...');
    });

    it('getModelParameters() returns null for unknown model', function () {
        const { vis } = makeMockVis();
        expect(vis.getModelParameters('missing')).to.be.null;
    });

    it('getModelParameters() returns a cloned copy of stored parameters', function () {
        const { vis } = makeMockVis();
        vis._model_parameters['m'] = { supercell: [2, 2, 1], molecularCrystal: true };
        const params = vis.getModelParameters('m');
        expect(params).to.deep.equal({ supercell: [2, 2, 1], molecularCrystal: true });
        params.supercell[0] = 99;
        expect(vis._model_parameters['m'].supercell[0]).to.equal(2);
    });

    it('getModelMeta() returns null for unknown model', function () {
        const { vis } = makeMockVis();
        expect(vis.getModelMeta('missing')).to.be.null;
    });

    it('getModelMeta() returns a cloned copy of stored metadata', function () {
        const { vis } = makeMockVis();
        vis._model_meta['m'] = { prefix: 'cif', originalName: 'struct' };
        const meta = vis.getModelMeta('m');
        expect(meta).to.deep.equal({ prefix: 'cif', originalName: 'struct' });
        meta.prefix = 'changed';
        expect(vis._model_meta['m'].prefix).to.equal('cif');
    });

});

// ---------------------------------------------------------------------------
// Tests: lifecycle events (§4)
// ---------------------------------------------------------------------------

describe('CrystVis#onModelListChange', function () {

    it('fires with the current model-name list', function () {
        const { vis } = makeMockVis();
        vis._models = { a: {}, b: {} };
        const received = [];
        vis.onModelListChange(names => received.push(names));
        vis._emitModelListChange();
        expect(received).to.have.length(1);
        expect(received[0].sort()).to.deep.equal(['a', 'b']);
    });

    it('fires when deleteModel is called', function () {
        const { vis } = makeMockVis();
        // Inject a stub model that deleteModel won't choke on
        vis._models = { m: {} };
        // displayModel() (called inside deleteModel when current) calls renderer.clear()
        // and _emitDisplayChange – fine with our mock
        const received = [];
        vis.onModelListChange(names => received.push(names.slice()));
        vis.deleteModel('m');
        expect(received).to.have.length(1);
        expect(received[0]).to.deep.equal([]);
    });

    it('returned unsubscribe function prevents future callbacks', function () {
        const { vis } = makeMockVis();
        vis._models = { a: {} };
        const received = [];
        const unsub = vis.onModelListChange(names => received.push(names));
        vis._emitModelListChange();
        unsub();
        vis._emitModelListChange();
        expect(received).to.have.length(1);
    });

});

describe('CrystVis#onDisplayChange', function () {

    it('fires with null when displayModel() is called with no args', function () {
        const { vis } = makeMockVis();
        const received = [];
        vis.onDisplayChange(name => received.push(name));
        vis.displayModel(); // clear
        expect(received).to.have.length(1);
        expect(received[0]).to.be.null;
    });

    it('returned unsubscribe function prevents future callbacks', function () {
        const { vis } = makeMockVis();
        const received = [];
        const unsub = vis.onDisplayChange(name => received.push(name));
        vis.displayModel();
        unsub();
        vis.displayModel();
        expect(received).to.have.length(1);
    });

});

// ---------------------------------------------------------------------------
// Tests: unloadAll (§5)
// ---------------------------------------------------------------------------

describe('CrystVis#unloadAll', function () {

    it('clears all model stores', function () {
        const { vis } = makeMockVis();
        vis._models           = { a: {}, b: {} };
        vis._model_sources    = { a: { text: 'x', extension: 'cif' }, b: { text: 'y', extension: 'xyz' } };
        vis._model_parameters = { a: {}, b: {} };
        vis._model_meta       = { a: {}, b: {} };

        vis.unloadAll();

        expect(Object.keys(vis._models)).to.have.length(0);
        expect(Object.keys(vis._model_sources)).to.have.length(0);
        expect(Object.keys(vis._model_parameters)).to.have.length(0);
        expect(Object.keys(vis._model_meta)).to.have.length(0);
    });

    it('emits onModelListChange with an empty list', function () {
        const { vis } = makeMockVis();
        vis._models = { a: {} };
        const received = [];
        vis.onModelListChange(names => received.push(names.slice()));
        vis.unloadAll();
        expect(received).to.have.length(1);
        expect(received[0]).to.deep.equal([]);
    });

    it('emits onDisplayChange with null', function () {
        const { vis } = makeMockVis();
        vis._models = { a: {} };
        const received = [];
        vis.onDisplayChange(name => received.push(name));
        vis.unloadAll();
        expect(received).to.have.length(1);
        expect(received[0]).to.be.null;
    });

    it('throws after disposal', function () {
        const { vis } = makeMockVis();
        vis.dispose();
        expect(() => vis.unloadAll()).to.throw(/cannot call unloadAll\(\) on a disposed instance/);
    });

});
// ---------------------------------------------------------------------------
// Tests: appearance API namespace (vis.appearance.*)
// ---------------------------------------------------------------------------

describe('CrystVis appearance API — vis.appearance.background', function () {

    it('getter reads background from renderer theme', function () {
        const { vis, renderer } = makeMockVis();
        renderer._theme = Object.assign({}, renderer._theme, { background: 0xff0000 });
        expect(vis.appearance.background).to.equal(0xff0000);
    });

    it('setter calls renderer.setClearColor()', function () {
        const { vis, renderer } = makeMockVis();
        const calls = [];
        renderer.setClearColor = (c) => {
            calls.push(c);
            renderer._theme = Object.assign({}, renderer._theme, { background: c });
        };
        vis.appearance.background = 0x123456;
        expect(calls).to.have.length(1);
        expect(calls[0]).to.equal(0x123456);
    });

});

describe('CrystVis appearance API — vis.appearance.label', function () {

    it('label.color getter reads _labelColor from renderer', function () {
        const { vis, renderer } = makeMockVis();
        renderer._labelColor = 0x111111;
        expect(vis.appearance.label.color).to.equal(0x111111);
    });

    it('label.color setter calls renderer.setLabelColor()', function () {
        const { vis, renderer } = makeMockVis();
        const calls = [];
        renderer.setLabelColor = function(c) { calls.push(c); this._labelColor = c; };
        vis.appearance.label.color = 0x222222;
        expect(calls).to.have.length(1);
        expect(calls[0]).to.equal(0x222222);
    });

    it('label.color setter retroactively updates existing atom label sprites', function () {
        const { vis, renderer } = makeMockVis();
        const labelA = { color: 0xffffff };
        const labelB = { color: 0xffffff };
        vis._current_model = {
            atoms: [
                { _labels: { name: labelA } },
                { _labels: { name: labelB } },
            ],
        };
        renderer.setLabelColor = function(c) { this._labelColor = c; };
        renderer._labelColor = 0xaabbcc;
        vis.appearance.label.color = 0xaabbcc;
        expect(labelA.color).to.equal(0xaabbcc);
        expect(labelB.color).to.equal(0xaabbcc);
    });

    it('label.color setter does not throw when no model is displayed', function () {
        const { vis } = makeMockVis();
        vis._current_model = null;
        expect(() => vis.appearance.label.color = 0x123456).to.not.throw();
    });

});

describe('CrystVis appearance API — vis.appearance.highlight', function () {

    it('highlight.color getter reads _auraFill from renderer', function () {
        const { vis, renderer } = makeMockVis();
        renderer._auraFill = 0xaaaaff;
        expect(vis.appearance.highlight.color).to.equal(0xaaaaff);
    });

    it('highlight.color setter calls renderer.setAuraFill()', function () {
        const { vis, renderer } = makeMockVis();
        const calls = [];
        renderer.setAuraFill = function(c) { calls.push(c); this._auraFill = c; };
        vis.appearance.highlight.color = 0xbbbbff;
        expect(calls).to.have.length(1);
        expect(calls[0]).to.equal(0xbbbbff);
    });

    it('highlight.color setter retroactively updates live AuraMesh fill', function () {
        const { vis, renderer } = makeMockVis();
        const aura = { fill: 0xffffff, border: 0xffffff, borderFraction: 0.8, opacity: 0.8 };
        vis._current_model = { atoms: [{ _aura: aura }] };
        renderer.setAuraFill = function(c) { this._auraFill = c; };
        renderer._auraFill   = 0xccccff;
        vis.appearance.highlight.color = 0xccccff;
        expect(aura.fill).to.equal(0xccccff);
    });

    it('highlight.borderColor getter reads _auraBorder from renderer', function () {
        const { vis, renderer } = makeMockVis();
        renderer._auraBorder = 0xddddff;
        expect(vis.appearance.highlight.borderColor).to.equal(0xddddff);
    });

    it('highlight.borderFraction getter reads _auraBorderFraction', function () {
        const { vis, renderer } = makeMockVis();
        renderer._auraBorderFraction = 0.5;
        expect(vis.appearance.highlight.borderFraction).to.equal(0.5);
    });

    it('highlight.opacity getter reads _auraOpacity', function () {
        const { vis, renderer } = makeMockVis();
        renderer._auraOpacity = 0.4;
        expect(vis.appearance.highlight.opacity).to.equal(0.4);
    });

    it('highlight.color setter does not throw without a current model', function () {
        const { vis } = makeMockVis();
        vis._current_model = null;
        expect(() => vis.appearance.highlight.color = 0xffffff).to.not.throw();
    });

});

describe('CrystVis appearance API — vis.appearance.cell', function () {

    it('cell.lineColor getter reads cell_line_color from renderer theme', function () {
        const { vis, renderer } = makeMockVis();
        renderer._theme = Object.assign({}, renderer._theme, { cell_line_color: 0x333333 });
        expect(vis.appearance.cell.lineColor).to.equal(0x333333);
    });

    it('cell.lineColor setter calls renderer.setCellLineColor()', function () {
        const { vis, renderer } = makeMockVis();
        const calls = [];
        renderer.setCellLineColor = function(c) {
            calls.push(c);
            this._theme = Object.assign({}, this._theme, { cell_line_color: c });
        };
        vis.appearance.cell.lineColor = 0x444444;
        expect(calls).to.have.length(1);
        expect(calls[0]).to.equal(0x444444);
    });

    it('cell.lineColor setter retroactively updates the live BoxMesh', function () {
        const { vis, renderer } = makeMockVis();
        renderer.setCellLineColor = function(c) {
            this._theme = Object.assign({}, this._theme, { cell_line_color: c });
        };
        const box = { color: 0xffffff };
        vis._current_model = { box, atoms: [] };
        renderer._theme.cell_line_color = 0x556677;
        vis.appearance.cell.lineColor = 0x556677;
        expect(box.color).to.equal(0x556677);
    });

    it('cell.lineColor setter does not throw when no model is displayed', function () {
        const { vis } = makeMockVis();
        vis._current_model = null;
        expect(() => vis.appearance.cell.lineColor = 0x123456).to.not.throw();
    });

    it('cell.lineColor setter does not throw for non-periodic model (no box)', function () {
        const { vis } = makeMockVis();
        vis._current_model = { box: null, atoms: [] };
        expect(() => vis.appearance.cell.lineColor = 0x123456).to.not.throw();
    });

    it('cell.axisX getter reads _cell_x_color from renderer', function () {
        const { vis, renderer } = makeMockVis();
        renderer._cell_x_color = 0xff1234;
        expect(vis.appearance.cell.axisX).to.equal(0xff1234);
    });

    it('cell.axisX setter calls renderer.setCellAxisX() and updates live AxesMesh', function () {
        const { vis, renderer } = makeMockVis();
        const calls = [];
        renderer.setCellAxisX = function(c) { calls.push(c); this._cell_x_color = c; };
        const axes = { xColor: 0xffffff };
        vis._current_model = { axes };
        vis.appearance.cell.axisX = 0xabcdef;
        expect(calls).to.have.length(1);
        expect(axes.xColor).to.equal(0xabcdef);
    });

    it('cell.axisY setter calls renderer.setCellAxisY() and updates live AxesMesh', function () {
        const { vis, renderer } = makeMockVis();
        const calls = [];
        renderer.setCellAxisY = function(c) { calls.push(c); this._cell_y_color = c; };
        const axes = { yColor: 0xffffff };
        vis._current_model = { axes };
        vis.appearance.cell.axisY = 0x112233;
        expect(calls).to.have.length(1);
        expect(axes.yColor).to.equal(0x112233);
    });

    it('cell.axisZ setter calls renderer.setCellAxisZ() and updates live AxesMesh', function () {
        const { vis, renderer } = makeMockVis();
        const calls = [];
        renderer.setCellAxisZ = function(c) { calls.push(c); this._cell_z_color = c; };
        const axes = { zColor: 0xffffff };
        vis._current_model = { axes };
        vis.appearance.cell.axisZ = 0x667788;
        expect(calls).to.have.length(1);
        expect(axes.zColor).to.equal(0x667788);
    });

});

describe('CrystVis appearance API — vis.appearance.selbox', function () {

    it('selbox.background getter reads from renderer', function () {
        const { vis, renderer } = makeMockVis();
        renderer.selbox_bkg_color = 0xaaaaff;
        expect(vis.appearance.selbox.background).to.equal(0xaaaaff);
    });

    it('selbox.background setter writes to renderer', function () {
        const { vis, renderer } = makeMockVis();
        vis.appearance.selbox.background = 0xbbbbff;
        expect(renderer.selbox_bkg_color).to.equal(0xbbbbff);
    });

    it('selbox.border getter reads from renderer', function () {
        const { vis, renderer } = makeMockVis();
        renderer.selbox_border_color = 0xccccff;
        expect(vis.appearance.selbox.border).to.equal(0xccccff);
    });

    it('selbox.border setter writes to renderer', function () {
        const { vis, renderer } = makeMockVis();
        vis.appearance.selbox.border = 0xddddff;
        expect(renderer.selbox_border_color).to.equal(0xddddff);
    });

    it('selbox.opacity getter reads from renderer', function () {
        const { vis, renderer } = makeMockVis();
        renderer.selbox_opacity = 0.3;
        expect(vis.appearance.selbox.opacity).to.equal(0.3);
    });

    it('selbox.opacity setter writes to renderer', function () {
        const { vis, renderer } = makeMockVis();
        vis.appearance.selbox.opacity = 0.75;
        expect(renderer.selbox_opacity).to.equal(0.75);
    });

});

describe('CrystVis appearance API — vis.appearance.lighting', function () {

    it('lighting.ambient setter calls renderer.setAmbientLight()', function () {
        const { vis, renderer } = makeMockVis();
        vis.appearance.lighting.ambient = 0.8;
        expect(renderer._ambientLightCalls).to.deep.equal([0.8]);
    });

    it('lighting.ambient getter returns the stored value', function () {
        const { vis } = makeMockVis();
        vis.appearance.lighting.ambient = 0.55;
        expect(vis.appearance.lighting.ambient).to.equal(0.55);
    });

    it('lighting.directional setter calls renderer.setDirectionalLight()', function () {
        const { vis, renderer } = makeMockVis();
        vis.appearance.lighting.directional = 0.6;
        expect(renderer._directionalLightCalls).to.have.length(1);
        expect(renderer._directionalLightCalls[0].intensity).to.equal(0.6);
    });

    it('lighting.directional getter returns the stored value', function () {
        const { vis } = makeMockVis();
        vis.appearance.lighting.directional = 0.45;
        expect(vis.appearance.lighting.directional).to.equal(0.45);
    });

    it('lighting.setDirectional(i, x, y, z) calls renderer.setDirectionalLight with all args', function () {
        const { vis, renderer } = makeMockVis();
        vis.appearance.lighting.setDirectional(0.6, 1, -1, 0);
        expect(renderer._directionalLightCalls).to.have.length(1);
        expect(renderer._directionalLightCalls[0]).to.deep.equal({ intensity: 0.6, px: 1, py: -1, pz: 0 });
    });

    it('lighting.setDirectional() passes null for omitted direction components', function () {
        const { vis, renderer } = makeMockVis();
        vis.appearance.lighting.setDirectional(0.4);
        const call = renderer._directionalLightCalls[0];
        expect(call.intensity).to.equal(0.4);
        expect(call.px).to.be.null;
        expect(call.py).to.be.null;
        expect(call.pz).to.be.null;
    });

});

describe('CrystVis appearance API — vis.appearance.theme and vis.theme shortcut', function () {

    it('appearance.theme getter reads the renderer theme', function () {
        const { vis, renderer } = makeMockVis();
        const t = { background: 0xabcdef, foreground: 0x000000, highlight: 0xff00ff,
                    cell_line_color: 0x888888, label_color: 0xcccccc };
        renderer._theme = t;
        expect(vis.appearance.theme).to.equal(t);
    });

    it('appearance.theme setter with string "dark" sets a dark background', function () {
        const { vis, renderer } = makeMockVis();
        vis.appearance.theme = 'dark';
        expect(renderer._theme).to.have.property('background');
        expect(renderer._theme.background).to.equal(0x000000);
    });

    it('appearance.theme setter with string "light" sets a light background', function () {
        const { vis, renderer } = makeMockVis();
        vis.appearance.theme = 'light';
        expect(renderer._theme).to.have.property('background');
        expect(renderer._theme.background).to.equal(0xffffff);
    });

    it('appearance.theme setter retroactively updates the live BoxMesh', function () {
        const { vis } = makeMockVis();
        const box = { color: 0xffffff };
        vis._current_model = { box, atoms: [] };
        vis.appearance.theme = { background: 0x000000, foreground: 0xffffff, highlight: 0x00ff00,
                                 cell_line_color: 0xaabbcc, label_color: 0xffffff };
        expect(box.color).to.equal(0xaabbcc);
    });

    it('appearance.theme setter retroactively updates existing atom labels', function () {
        const { vis, renderer } = makeMockVis();
        const labelA = { color: 0xffffff };
        const labelB = { color: 0xffffff };
        vis._current_model = {
            box: null,
            atoms: [
                { _labels: { name: labelA } },
                { _labels: { name: labelB } },
            ],
        };
        renderer._labelColor = 0x112233;
        vis.appearance.theme = { background: 0x000000, foreground: 0x000000, highlight: 0x00ff00,
                                 cell_line_color: 0xffffff, label_color: 0x112233 };
        expect(labelA.color).to.equal(0x112233);
        expect(labelB.color).to.equal(0x112233);
    });

    it('appearance.theme setter with unknown string throws', function () {
        const { vis } = makeMockVis();
        expect(() => vis.appearance.theme = 'notheme').to.throw(/Theme notheme not found/);
    });

    it('vis.theme shortcut getter delegates to vis.appearance.theme', function () {
        const { vis, renderer } = makeMockVis();
        const t = renderer._theme;
        expect(vis.theme).to.equal(t);
    });

    it('vis.theme shortcut setter delegates to vis.appearance.theme', function () {
        const { vis, renderer } = makeMockVis();
        vis.theme = 'light';
        expect(renderer._theme.background).to.equal(0xffffff);
    });

    it('vis.theme shortcut setter with unknown string throws', function () {
        const { vis } = makeMockVis();
        expect(() => vis.theme = 'notheme').to.throw(/Theme notheme not found/);
    });

});