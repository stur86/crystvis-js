'use strict';

/**
 * @fileoverview  Optional lil-gui control panel for a CrystVis instance.
 *
 * Usage (vanilla JS)
 * ------------------
 *   import { createGUIPanel } from '@ccp-nc/crystvis-js';
 *
 *   const vis = new CrystVis('#container', 0, 0);
 *   const gui = createGUIPanel(vis);        // panel shown by default
 *   gui.hide();                             // programmatically hide
 *   gui.show();                             // or show again
 *   document.getElementById('btn').onclick = () => gui._hidden ? gui.show() : gui.hide();
 *
 * Usage (React, e.g. MagresView 2)
 * ---------------------------------
 *   // In a component that owns the CrystVis instance:
 *   const guiRef = useRef(null);
 *
 *   // After viewer is initialised:
 *   guiRef.current = createGUIPanel(viewer);
 *   guiRef.current.hide();   // hidden by default; user reveals via a button
 *
 *   // Toggle button handler:
 *   function togglePanel() {
 *       const gui = guiRef.current;
 *       if (!gui) return;
 *       gui._hidden ? gui.show() : gui.hide();
 *   }
 *
 *   // Cleanup:
 *   return () => { guiRef.current?.destroy(); };
 *
 * Sections
 * --------
 *   Scene          – theme preset, background colour
 *   Lighting       – ambient + directional intensity, light direction (XYZ)
 *   Labels         – label colour
 *   Selection highlight – aura fill/border, fraction, opacity
 *   Unit cell      – box colour, a/b/c-axis colours
 *   Structure      – supercell, molecular-crystal mode, VdW scale  (→ Reload)
 *   Displayed atoms – display-mode preset, atom sphere scale/opacity
 *   Bonds          – radius, opacity, show/hide
 */

import GUI from 'lil-gui';

// ── CSS theme injection ────────────────────────────────────────────────────────

const PANEL_STYLE_ID = 'crystvis-gui-styles';

/**
 * Inject the panel theme CSS once per document.
 * Uses the "spectral dark" aesthetic: deep navy-black background, cyan accent,
 * IBM Plex Sans labels, IBM Plex Mono for numeric values.
 * @private
 */
function _injectPanelStyles() {
    if (typeof document === 'undefined') return; // SSR guard
    if (document.getElementById(PANEL_STYLE_ID)) return;

    // Load IBM Plex fonts from Google Fonts (best match for scientific UIs)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.id = PANEL_STYLE_ID;
    style.textContent = `
/* ── CrystVis GUI panel — "Spectral Dark" theme ── */

/*
 * Custom properties are declared on both the root AND every nested .lil-gui
 * (each folder is its own .lil-gui element). Without the nested selector,
 * lil-gui's own ".lil-gui { --background-color: … }" rule would override
 * the inherited values on child folders — a locally-matched rule always
 * beats an inherited one, regardless of the parent's specificity.
 */
.lil-gui.crystvis-panel,
.lil-gui.crystvis-panel .lil-gui {
    --background-color:       #080c15;
    --text-color:             #c2d4e8;
    --title-background-color: #04070e;
    --title-text-color:       #38c8e8;
    --widget-color:           #111826;
    --hover-color:            #1a2537;
    --focus-color:            #1e2f4a;
    --number-color:           #7dd3fc;
    --string-color:           #6ee7b7;
    --font-family:            'IBM Plex Sans', system-ui, sans-serif;
    --font-size:              11.5px;
    --row-height:             26px;
    --widget-height:          20px;
    --border-radius:          5px;
    --padding:                4px;
}

/* Root panel extras (border/shadow only on the outer container) */
.lil-gui.crystvis-panel {
    border: 1px solid rgba(56, 200, 232, 0.13) !important;
    border-radius: 10px !important;
    overflow: hidden !important;
    box-shadow:
        0 28px 60px rgba(0, 0, 0, 0.78),
        0  0   0  1px rgba(56, 200, 232, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
}

/* Panel title bar */
.lil-gui.crystvis-panel > .title {
    background: linear-gradient(90deg, #04070e 0%, #080f1c 100%) !important;
    border-bottom: 1px solid rgba(56, 200, 232, 0.12) !important;
    font-size: 9.5px !important;
    font-weight: 500 !important;
    letter-spacing: 0.15em !important;
    text-transform: uppercase !important;
    padding: 10px 12px 10px 14px !important;
}

/* Pulsing status dot before title */
.lil-gui.crystvis-panel > .title::before {
    content: '';
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #06b6d4;
    box-shadow: 0 0 8px #06b6d4, 0 0 3px #06b6d4;
    margin-right: 9px;
    vertical-align: middle;
    flex-shrink: 0;
    animation: cv-dot-pulse 2.8s ease-in-out infinite;
}

@keyframes cv-dot-pulse {
    0%,100% { opacity: 1;   box-shadow: 0 0 8px #06b6d4, 0 0 3px #06b6d4; }
    50%      { opacity: 0.5; box-shadow: 0 0 4px #06b6d4; }
}

/* Folder header rows */
.lil-gui.crystvis-panel .lil-gui.folder > .title {
    background: transparent !important;
    border-top: 1px solid rgba(255, 255, 255, 0.04) !important;
    border-bottom: none !important;
    font-size: 9px !important;
    font-weight: 500 !important;
    letter-spacing: 0.13em !important;
    text-transform: uppercase !important;
    color: #4d6880 !important;
    padding: 8px 12px !important;
    transition: background 0.18s ease, color 0.18s ease;
}

.lil-gui.crystvis-panel .lil-gui.folder > .title:hover {
    background: rgba(6, 182, 212, 0.06) !important;
    color: #7fb8d6 !important;
}

/* Suppress the inherited status dot on folder titles */
.lil-gui.crystvis-panel .lil-gui.folder > .title::before {
    display: none !important;
}

/* Open folder: title gets a stronger accent */
.lil-gui.crystvis-panel .lil-gui.folder:not(.closed) > .title {
    color: #7dafc8 !important;
    border-bottom: 1px solid rgba(125, 175, 200, 0.08) !important;
}

/* Controller rows */
.lil-gui.crystvis-panel .controller {
    border-top: none !important;
    padding: 0 10px !important;
}

.lil-gui.crystvis-panel .controller .name {
    color: #506070 !important;
    font-size: 10.5px !important;
    letter-spacing: 0.01em !important;
}

/* Number value display / text input */
.lil-gui.crystvis-panel .controller.number input[type=text],
.lil-gui.crystvis-panel .controller.number input[type=number] {
    font-family: 'IBM Plex Mono', monospace !important;
    font-size: 10.5px !important;
    border-radius: 3px !important;
    border: 1px solid rgba(56, 200, 232, 0.14) !important;
    background: rgba(6, 182, 212, 0.04) !important;
}

/* Range sliders — accent colour */
.lil-gui.crystvis-panel input[type=range] {
    accent-color: #06b6d4;
}

/* Dropdowns */
.lil-gui.crystvis-panel select {
    border-radius: 4px !important;
    border: 1px solid rgba(56, 200, 232, 0.18) !important;
    background: #111826 !important;
    color: #93c5fd !important;
    font-size: 11px !important;
    cursor: pointer;
}

/* Checkboxes */
.lil-gui.crystvis-panel input[type=checkbox] {
    accent-color: #06b6d4;
    width: 13px;
    height: 13px;
    cursor: pointer;
}

/* Button controllers (functions) */
.lil-gui.crystvis-panel .controller.button .name {
    width: 100% !important;
    text-align: center !important;
    color: #06b6d4 !important;
    font-size: 10px !important;
    font-weight: 500 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    border: 1px solid rgba(6, 182, 212, 0.28) !important;
    border-radius: 5px !important;
    padding: 5px 8px !important;
    background: rgba(6, 182, 212, 0.05) !important;
    transition: all 0.18s ease !important;
    margin: 3px 0 !important;
}

.lil-gui.crystvis-panel .controller.button:hover .name {
    background: rgba(6, 182, 212, 0.14) !important;
    border-color: rgba(6, 182, 212, 0.55) !important;
    color: #67e8f9 !important;
    box-shadow: 0 0 12px rgba(6, 182, 212, 0.18) !important;
}

/* Color pickers */
.lil-gui.crystvis-panel .controller.color input[type=color] {
    border-radius: 3px !important;
    border: 1px solid rgba(56, 200, 232, 0.2) !important;
    cursor: pointer;
}

/* Thin custom scrollbar */
.lil-gui.crystvis-panel .children::-webkit-scrollbar      { width: 4px; }
.lil-gui.crystvis-panel .children::-webkit-scrollbar-track { background: transparent; }
.lil-gui.crystvis-panel .children::-webkit-scrollbar-thumb {
    background: rgba(56, 200, 232, 0.18);
    border-radius: 2px;
}
`;
    document.head.appendChild(style);
}

// ── Colour helpers ─────────────────────────────────────────────────────────────

/**
 * Convert a Three.js / crystvis-js hex integer (e.g. 0xffffff) to a CSS
 * colour string (e.g. '#ffffff') that lil-gui colour pickers expect.
 * Falls back to white for null / undefined.
 * @param {number|null} h
 * @returns {string}
 */
function hexToCss(h) {
    if (h == null) return '#ffffff';
    return '#' + Math.floor(h).toString(16).padStart(6, '0');
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Create and attach a lil-gui panel that controls the given CrystVis instance.
 * The returned GUI is shown immediately; call `gui.hide()` to start hidden.
 *
 * @param {import('./visualizer.js').CrystVis} vis
 * @param {HTMLElement} [container]  Optional DOM element to mount the panel into.
 *   When provided, lil-gui renders with `position: relative` so the panel flows
 *   inline with the page.  When omitted the panel is appended to `<body>` (fixed,
 *   top-right corner — the lil-gui default).
 * @returns {GUI}  The lil-gui root; call `gui.destroy()` to remove the panel.
 */
export function createGUIPanel(vis, container = null) {

    _injectPanelStyles();

    const guiOpts = { title: 'CrystVis Controls', width: 310 };
    if (container) guiOpts.container = container;
    const gui = new GUI(guiOpts);
    gui.domElement.classList.add('crystvis-panel');

    const app = vis.appearance;

    // ── Mutable state object that lil-gui binds to ─────────────────────────────

    const state = {

        // ── Scene ──────────────────────────────────────────────────────────────
        theme:      'dark',
        background: hexToCss(app.background),

        // ── Lighting ───────────────────────────────────────────────────────────
        ambient:     app.lighting.ambient     ?? 0.3,
        directional: app.lighting.directional ?? 0.6,
        lightX:  0.0,
        lightY:  1.0,
        lightZ: -1.0,

        // ── Labels ─────────────────────────────────────────────────────────────
        labelColor: hexToCss(app.label.color),
        labelSize:  app.label.size ?? 0.04,
        // ── Selection highlight / aura ─────────────────────────────────────────
        highlightColor:          hexToCss(app.highlight.color),
        highlightBorder:         hexToCss(app.highlight.borderColor),
        highlightBorderFraction: app.highlight.borderFraction ?? 0.3,
        highlightOpacity:        app.highlight.opacity        ?? 0.5,

        // ── Unit cell ──────────────────────────────────────────────────────────
        cellLineColor: hexToCss(app.cell.lineColor),
        cellAxisX:     hexToCss(app.cell.axisX),
        cellAxisY:     hexToCss(app.cell.axisY),
        cellAxisZ:     hexToCss(app.cell.axisZ),

        // ── Structure (needs reload) ────────────────────────────────────────────
        supercellX:       1,
        supercellY:       1,
        supercellZ:       1,
        molecularCrystal: false,
        vdwScaling:       1.0,
        applyStructure:   () => _applyStructure(),

        // ── Displayed atoms ────────────────────────────────────────────────────
        displayMode:  'Unit cell',
        globalScale:  1.0,
        atomOpacity:  1.0,

        // ── Bonds ──────────────────────────────────────────────────────────────
        bondRadius:  0.2,
        bondOpacity: 1.0,
        showBonds:   true,
    };

    // ── Private helpers ────────────────────────────────────────────────────────

    /** Run `fn(displayed)` only when a model is visible. */
    function withDisplayed(fn) {
        if (vis.displayed) fn(vis.displayed);
    }

    /** Return all bond images for the current model (empty array if none). */
    function allBonds() {
        return (vis.model && vis.model._bond_images) ? vis.model._bond_images : [];
    }

    /**
     * Set atom sphere opacity WITHOUT propagating to bond opacity.
     * The public atom.opacity setter always updates connected bond meshes, so
     * we use the mesh directly here.
     */
    function setAtomSphereOpacity(v) {
        withDisplayed(d => {
            d.atoms.forEach(a => {
                // a.mesh (public getter) triggers lazy allocation; a._mesh may be null.
                const mesh = a.mesh;
                if (mesh) mesh.atom_opacity = v;
            });
        });
    }

    /** Apply bond opacity to all bond halves in the current model. */
    function setBondOpacity(v) {
        allBonds().forEach(b => {
            b.opacity1 = v;
            b.opacity2 = v;
        });
    }

    // ── Display mode controller ref (so _applyStructure can update it) ─────────
    let displayModeCtrl = null;

    /** Apply the selected display-mode preset. */
    function _applyDisplayMode() {
        if (!vis.model) return;
        const mode = state.displayMode;
        if (mode === 'Unit cell') {
            vis.displayed = vis.model.find({ cell: [[0, 0, 0]] });
        } else if (mode === 'All atoms') {
            vis.displayed = vis.model.find({ all: [] });
        } else if (mode === '5 Å sphere') {
            vis.displayed = vis.model.find({ sphere: [[0, 0, 0], 5.0] });
        }
    }

    /**
     * Reload the current model with the supercell / molecularCrystal / vdwScaling
     * values from the GUI state, then re-apply the display mode.
     */
    function _applyStructure() {
        if (!vis.modelName) return;

        vis.reloadModel(vis.modelName, {
            supercell:        [state.supercellX, state.supercellY, state.supercellZ],
            molecularCrystal: state.molecularCrystal,
            vdwScaling:       state.vdwScaling,
        });

        // A supercell larger than 1×1×1 means show all images, not just cell origin.
        if (state.supercellX > 1 || state.supercellY > 1 || state.supercellZ > 1) {
            state.displayMode = 'All atoms';
            if (displayModeCtrl) displayModeCtrl.updateDisplay();
        }

        _applyDisplayMode();

        // Bond settings must be re-applied because reloadModel creates new bond images.
        allBonds().forEach(b => { b.radius = state.bondRadius; });
        allBonds().forEach(b => { b.opacity1 = state.bondOpacity; b.opacity2 = state.bondOpacity; });
        if (!state.showBonds) allBonds().forEach(b => { b.visible = false; });

        // Re-apply atom sphere opacity
        setAtomSphereOpacity(state.atomOpacity);
    }

    // lil-gui controllers have no .title() method — set the native DOM tooltip instead.
    const tip = (ctrl, text) => { ctrl.domElement.setAttribute('title', text); return ctrl; };

    // ── Section 1 – Scene ──────────────────────────────────────────────────────

    const sceneFolder = gui.addFolder('Scene');

    tip(sceneFolder
        .add(state, 'theme', ['dark', 'light'])
        .name('Theme'), 'Switch between dark and light background themes')
        .onChange(v => { app.theme = v; });

    sceneFolder
        .addColor(state, 'background')
        .name('Background colour')
        .onChange(v => { app.background = v; });

    // ── Section 2 – Lighting ───────────────────────────────────────────────────

    const lightFolder = gui.addFolder('Lighting');

    tip(lightFolder
        .add(state, 'ambient', 0, 2, 0.01)
        .name('Ambient intensity'), 'Uniform base illumination — raise if shadows are too dark')
        .onChange(v => { app.lighting.ambient = v; });

    tip(lightFolder
        .add(state, 'directional', 0, 2, 0.01)
        .name('Directional intensity'), 'Strength of the directional (sun-like) light')
        .onChange(() => {
            app.lighting.setDirectional(
                state.directional, state.lightX, state.lightY, state.lightZ);
        });

    const lightDirFolder = lightFolder.addFolder('Light direction');
    // lightX/Y/Z are unit direction components; the renderer scales them by
    // LIGHT_DIR_SCALE (2000) relative to camera depth so changes are visible.
    const _updateDir = () => app.lighting.setDirectional(
        state.directional, state.lightX, state.lightY, state.lightZ);

    tip(lightDirFolder.add(state, 'lightX', -2000, 2000, 10).name('X'), 'Light source X offset in camera space').onChange(_updateDir);
    tip(lightDirFolder.add(state, 'lightY', -2000, 2000, 10).name('Y'), 'Light source Y offset in camera space').onChange(_updateDir);
    tip(lightDirFolder.add(state, 'lightZ', -2000, 2000, 10).name('Z'), 'Light source Z offset in camera space — negative = in front of camera (headlight)').onChange(_updateDir);
    lightDirFolder.close();

    // ── Section 3 – Labels ────────────────────────────────────────────────────

    const labelFolder = gui.addFolder('Labels');

    labelFolder
        .addColor(state, 'labelColor')
        .name('Label colour')
        .onChange(v => { app.label.color = v; });

    tip(labelFolder
        .add(state, 'labelSize', 0.01, 0.15, 0.005)
        .name('Label size'), 'World-space height of atom label text')
        .onChange(v => { app.label.size = v; });

    labelFolder.close();

    // ── Section 4 – Selection highlight ───────────────────────────────────────

    const hlFolder = gui.addFolder('Selection highlight');

    hlFolder
        .addColor(state, 'highlightColor')
        .name('Fill colour')
        .onChange(v => { app.highlight.color = v; });

    hlFolder
        .addColor(state, 'highlightBorder')
        .name('Border colour')
        .onChange(v => { app.highlight.borderColor = v; });

    tip(hlFolder
        .add(state, 'highlightBorderFraction', 0, 1, 0.01)
        .name('Border fraction'), 'Fraction of the selection aura radius occupied by the solid border ring (0 = thin, 1 = full)')
        .onChange(v => { app.highlight.borderFraction = v; });

    hlFolder
        .add(state, 'highlightOpacity', 0, 1, 0.01)
        .name('Opacity')
        .onChange(v => { app.highlight.opacity = v; });

    hlFolder.close();

    // ── Section 5 – Unit cell ──────────────────────────────────────────────────

    const cellFolder = gui.addFolder('Unit cell appearance');

    cellFolder
        .addColor(state, 'cellLineColor')
        .name('Box colour')
        .onChange(v => { app.cell.lineColor = v; });

    cellFolder
        .addColor(state, 'cellAxisX')
        .name('a-axis colour')
        .onChange(v => { app.cell.axisX = v; });

    cellFolder
        .addColor(state, 'cellAxisY')
        .name('b-axis colour')
        .onChange(v => { app.cell.axisY = v; });

    cellFolder
        .addColor(state, 'cellAxisZ')
        .name('c-axis colour')
        .onChange(v => { app.cell.axisZ = v; });

    cellFolder.close();

    // ── Section 6 – Structure (requires reload) ────────────────────────────────

    const structFolder = gui.addFolder('Structure  ⚠ requires reload');

    tip(structFolder.add(state, 'supercellX', 1, 5, 1).name('Supercell a'), 'Number of unit-cell repeats along the a axis');
    tip(structFolder.add(state, 'supercellY', 1, 5, 1).name('Supercell b'), 'Number of unit-cell repeats along the b axis');
    tip(structFolder.add(state, 'supercellZ', 1, 5, 1).name('Supercell c'), 'Number of unit-cell repeats along the c axis');
    tip(structFolder.add(state, 'molecularCrystal').name('Molecular crystal'), 'Complete molecules that straddle a periodic boundary (useful for organic crystals)');
    tip(structFolder.add(state, 'vdwScaling', 0.2, 3.0, 0.05).name('VdW radius scale'), 'Global multiplier applied to all Van-der-Waals radii — affects covalent bond detection');
    tip(structFolder.add(state, 'applyStructure').name('→  Apply & Reload'), 'Reload the structure with the settings above (required for supercell / VdW changes)');

    // ── Section 7 – Displayed atoms ───────────────────────────────────────────

    const displayFolder = gui.addFolder('Displayed atoms');

    displayModeCtrl = tip(displayFolder
        .add(state, 'displayMode', ['Unit cell', 'All atoms', '5 Å sphere'])
        .name('Show'), 'Unit cell: origin images only  |  All atoms: entire supercell  |  5 Å sphere: atoms within 5 Å of origin')
        .onChange(() => _applyDisplayMode());

    tip(displayFolder
        .add(state, 'globalScale', 0.1, 3.0, 0.05)
        .name('Atom scale'), 'Global multiplier for all atom sphere sizes')
        .onChange(v => withDisplayed(d => d.setProperty('scale', v)));

    tip(displayFolder
        .add(state, 'atomOpacity', 0.0, 1.0, 0.01)
        .name('Atom sphere opacity'), 'Opacity of atom spheres only — does not affect bond cylinders')
        // Bypasses atom.opacity setter so that bond opacity is NOT affected.
        .onChange(v => setAtomSphereOpacity(v));

    // ── Section 8 – Bonds ─────────────────────────────────────────────────────

    const bondFolder = gui.addFolder('Bonds');

    tip(bondFolder
        .add(state, 'bondRadius', 0.02, 0.5, 0.01)
        .name('Bond radius (Å)'), 'Cylinder radius of all bond segments, in Ångströms')
        .onChange(v => allBonds().forEach(b => { b.radius = v; }));

    bondFolder
        .add(state, 'bondOpacity', 0.0, 1.0, 0.01)
        .name('Bond opacity')
        .onChange(v => setBondOpacity(v));

    bondFolder
        .add(state, 'showBonds')
        .name('Show bonds')
        .onChange(v => allBonds().forEach(b => { b.visible = v; }));

    // ── Sync from model when a new model is displayed ──────────────────────────

    vis.onDisplayChange((name) => {
        if (!name) return;

        const params = vis.getModelParameters(name);
        if (params) {
            const sc = params.supercell || [1, 1, 1];
            state.supercellX       = sc[0];
            state.supercellY       = sc[1];
            state.supercellZ       = sc[2];
            state.molecularCrystal = params.molecularCrystal || false;
            state.vdwScaling       = params.vdwScaling       || 1.0;
        }

        // Reset per-session atom/bond values
        state.globalScale   = 1.0;
        state.atomOpacity   = 1.0;
        state.bondRadius    = 0.2;
        state.bondOpacity   = 1.0;
        state.showBonds     = true;

        gui.controllersRecursive().forEach(c => c.updateDisplay());
    });

    return gui;
}
