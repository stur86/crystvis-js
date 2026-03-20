# Changelog

All notable changes to crystvis-js will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-03-11

### Added
- `CrystVis.dispose()` — full teardown of the WebGL context, animation loop, orbit
  controls, resize observer and all event listeners. `isDisposed` getter reflects state.
  Methods throw if called on a disposed instance. (#17)
- `CrystVis.getCameraState()` / `setCameraState(state)` — snapshot and restore the
  camera position, target and zoom level as a plain serialisable object. (#20)
- `CrystVis.onCameraChange(callback)` — subscribe to live camera-change events
  (rotate / pan / zoom); returns an unsubscribe function. (#20)
- `CrystVis.getModelSource(name)` — retrieve the raw file text and extension originally
  passed to `loadModels()`. (#20)
- `CrystVis.getModelParameters(name)` — retrieve the merged loading parameters used when
  a model was last loaded or reloaded. (#20)
- `CrystVis.getModelMeta(name)` — retrieve `{ prefix, originalName }` metadata stored at
  load time. (#20)
- `CrystVis.onModelListChange(callback)` — subscribe to events fired whenever the set of
  loaded models changes (load, delete, unloadAll); returns an unsubscribe function. (#20)
- `CrystVis.onDisplayChange(callback)` — subscribe to events fired whenever the displayed
  model changes; callback receives the new model name or `null`. (#20)
- `CrystVis.unloadAll()` — remove all loaded models atomically (one renderer clear, one
  set of change events). (#20)
- `ModelView.toIndices()` — serialise a selection to a plain index array. (#20)
- `ModelView.toLabels()` — serialise a selection to an array of crystallographic site
  labels (`crystLabel`), resilient to atom-index reordering. (#20)
- `Model.viewFromIndices(indices)` — reconstruct a `ModelView` from a saved index array. (#20)
- `Model.viewFromLabels(labels)` — reconstruct a `ModelView` from a saved label array. (#20)
- `Renderer.getCameraState()` / `setCameraState(state)` / `onCameraChange(callback)` —
  lower-level camera state API used by `CrystVis`. (#20)
- Visualisation of hyperfine tensors from `magres_old` blocks in Magres files as
  ellipsoids. (#19)

### Fixed
- `loadModels()` return value corrected in README and JSDoc: it returns a status object
  (keys = model names, values = `0` or error string), not an array. (#18)

### Changed
- Updated several dependencies. (#12, #13, #16)

## [0.6.1] - 2026-01-22

### Changed
 - Added support for selecting a specific frame when loading multi-frame XYZ/Extended XYZ files via an `index` option.
 - Proper handling and conversion of per-atom 9-element tensors in Extended XYZ files: `ms` (magnetic shielding) and `efg` tensors are detected and converted to `TensorData` objects.
 - Improved Extended XYZ parsing: stricter handling of atom lines and properties to avoid accidental token merging when input contains stray newlines.
 - Parser now reports clearer errors for malformed Extended XYZ files.

## [0.6.0] - 2025-07-18

### Added
- Documentation on Three.js migration.
- Improved error handling for shader compilation.
- Better color space handling for all primitives.

### Changed
- Updated Three.js from version 0.137 to 0.178.
- Fixed color handling across all primitives to work with new Three.js color management.
- Fixed shader handling for GLSL 3.0 compatibility.
- Improved text rendering with better color handling and transparency.
- Refined material properties for better appearance in the new renderer.

### Fixed
- Color issues when upgrading to Three.js 0.178.
- Text rendering and transparency problems.
- Shader compilation errors with GLSL 3.0.
- EllipsoidMesh color handling with different material types.
- Proper handling of atoms and bond materials.
