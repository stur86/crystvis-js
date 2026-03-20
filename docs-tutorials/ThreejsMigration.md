# Three.js Migration Notes

## Upgrade from Three.js 0.137 to 0.178

With the release of version 0.6.0, `crystvis-js` has been updated to use Three.js 0.178 (from the previous version 0.137). This represents a significant upgrade with several important changes that developers should be aware of.

### Key Changes

1. **Color Management**:
   - Three.js has changed how colors are handled between versions
   - Colors are now handled in the sRGB color space by default with more strict enforcement
   - Color methods like `getHex()` now return values in sRGB color space
   - Use `renderer.outputColorSpace = THREE.SRGBColorSpace` (replaces older `outputEncoding = THREE.sRGBEncoding`)

2. **Shader Compatibility**:
   - GLSL shaders now require explicit version declarations through the `glslVersion` parameter
   - When using `RawShaderMaterial` with GLSL 3.0, you must specify `glslVersion: THREE.GLSL3`
   - The `#version` directive should not be included manually in the shader code when using `glslVersion`, as Three.js will inject it automatically
   - Including your own `#version` directive will cause a duplication error

3. **Material Properties**:
   - Material property handling has been updated
   - Use `.set()` method for colors instead of direct assignment with `new THREE.Color()`
   - Direct assignment with `=` may not trigger internal updates properly anymore
   - Some material properties may require different configuration for the same visual result

### Texture Handling

If your application uses textures (e.g., from loaded models or images), they now require explicit color space declaration:

```javascript
// Old approach (pre-0.6.0)
texture.encoding = THREE.sRGBEncoding;

// New approach (0.6.0+)
texture.colorSpace = THREE.SRGBColorSpace;
```

### Breaking Changes

If you're extending `crystvis-js` or using it in a custom way, be aware of these breaking changes:

1. **Color Setting**:
   ```javascript
   // Old approach (pre-0.6.0)
   material.color = new THREE.Color(hexValue);
   
   // New approach (0.6.0+)
   material.color.set(hexValue);
   ```

2. **Shader Usage**:
   ```javascript
   // Old approach (pre-0.6.0)
   new THREE.RawShaderMaterial({
       vertexShader: shader,
       fragmentShader: shader
   });
   
   // New approach (0.6.0+)
   new THREE.RawShaderMaterial({
       vertexShader: shader,
       fragmentShader: shader,
       glslVersion: THREE.GLSL3  // For GLSL 3.0 shaders
   });
   ```

3. **Renderer Configuration**:
   - The default rendering equations have changed slightly
   - Materials may appear different (usually more physically accurate but sometimes duller)
   - Lighting and material properties may need adjustment for the same visual appearance
   - Explicitly use `renderer.outputColorSpace = THREE.SRGBColorSpace` as the new API (post-r139)
   - Physically correct lighting model updates may affect appearance
   - The default values of `material.toneMapped` or lighting intensities might need tuning

### Recommendations

If you're using `crystvis-js` as a dependency:
- Update your code to use `.set()` for color changes
- If you're extending the library with custom shaders, ensure you set `glslVersion` correctly
- Test your visualizations thoroughly after upgrading

If you're maintaining a fork:
- Review all color operations in your codebase
- Check all shader implementations for version directive issues
- Consider adjusting material parameters to maintain consistent appearance

## Future Compatibility

We will continue to update Three.js dependencies in future releases. To minimize migration issues:

1. Avoid direct Three.js class extensions where possible
2. Use the provided APIs rather than accessing Three.js objects directly
3. When using Three.js directly, follow their recommended practices for forward compatibility

For questions or issues related to this migration, please open an issue on the [GitHub repository](https://github.com/ccp-nc/crystvis-js/issues).
