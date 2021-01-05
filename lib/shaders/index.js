var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// lib/shaders/index.in.js
__export(exports, {
  auraFragShader: () => aura_default,
  auraVertShader: () => aura_default2,
  ditherFragShader: () => dither_default,
  ditherVertShader: () => dither_default2,
  msdfFragShader: () => msdf300_default,
  msdfVertShader: () => msdf300_default2
});

// lib/shaders/dither.frag
var dither_default = "uniform vec3 color;\nuniform float opacity;\nuniform float illum;\nuniform vec2 shift;\nuniform float ditherN;\nuniform bool netting;\nuniform float netScale;\nuniform sampler2D ditherTex;\n\nvarying vec3 vNormal;\nvarying highp vec2 vUv;\n\nvoid main() {\n// This shader simply checks the coordinates on screen of the pixel to be drawn\n// and discards it based on the dithering matrix and alpha value if it has to be transparent.\n// In this way we go round all the complexities of intersecting transparent solids with much greater efficiency.\n// Check Wikipedias article on ordered dithering for further reference.\n   vec2 ditherCoords;\n   if (netting) {\n       ditherCoords = vUv*ditherN*netScale;\n   }\n   else {\n       ditherCoords = gl_FragCoord.xy;\n   }\n   float iN = mod(ditherCoords.x+shift.x, ditherN)/ditherN;\n   float jN = mod(ditherCoords.y+shift.y, ditherN)/ditherN;\n   vec4 ditherCol = texture2D(ditherTex, vec2(iN, jN));\n   if (ditherCol.r > opacity)\n       discard;\n// Lighting is also handled very simply, just a fraction of front illumination + ambient light.\n// This mostly because for some reason I cant get it to work with proper lighting (possibly a bug in THREE.js).\n   vec3 light = cameraPosition;\n   light = normalize(light);\n   float dProd = max(0., dot(light, vNormal));\n// We combine everything in the final color\n   gl_FragColor = vec4(color*((dProd-1.)*illum+1.), 1.);\n}";

// lib/shaders/dither.vert
var dither_default2 = "varying vec3 vNormal;\nvarying highp vec2 vUv;\n\nvoid main() {\n   vNormal = normal;\n   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);\n   vUv = uv;\n}";

// lib/shaders/msdf300.frag
var msdf300_default = "#version 300 es\n\n// GLSL 3.0 compliant version of the MSDF shader from three-bmfont-text\n// Taken from https://github.com/Jam3/three-bmfont-text/issues/38\n\nprecision highp float;\n\nuniform float opacity;\nuniform vec3 color;\nuniform sampler2D map;\nin vec2 vUv;\nout vec4 myOutputColor;\n\nfloat median(float r, float g, float b) {\n  return max(min(r, g), min(max(r, g), b));\n}\n\nvoid main() {\n  vec3 s = texture(map, vUv).rgb;\n  float sigDist = median(s.r, s.g, s.b) - 0.5;\n  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);\n  myOutputColor = vec4(color.xyz, alpha * opacity);\n  if (myOutputColor.a < 0.0001) discard;\n}";

// lib/shaders/msdf300.vert
var msdf300_default2 = "#version 300 es\n\n// GLSL 3.0 compliant version of the MSDF shader from three-bmfont-text\n// Taken from https://github.com/Jam3/three-bmfont-text/issues/38\n\nin vec2 uv;\nin vec4 position;\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float targScale;\nuniform bool fixRotation;\nuniform bool fixScale;\nuniform vec3 shift;\nout vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n\n  mat4 mView = modelViewMatrix;\n  float s = targScale;\n  s = fixScale? s*2.0/projectionMatrix[1][1] : s;\n\n  if (fixRotation) {\n    for (int i = 0; i < 3; ++i) {\n        for (int j = 0; j < 3; ++j) {\n\n            mView[i][j] = (i == j)? s : 0.0;\n\n            if (i == 1) {\n                mView[i][j] = -mView[i][j];\n            }\n        }\n    }\n  }\n\n  vec4 shift4 = vec4(0.,0.,0.,0.);\n  shift4.xyz = shift;\n\n  gl_Position = projectionMatrix * mView * position + shift4;\n}";

// lib/shaders/aura.frag
var aura_default = "#version 300 es\n\nprecision highp float;\n\nuniform float opacity;\nuniform vec3 fill;\nuniform vec3 border;\nuniform float border_f;\nin vec2 vUv;\nout vec4 myOutputColor;\n\nvoid main() {\n  \n  vec2 r = vUv-vec2(0.5, 0.5);\n  float rnorm = sqrt(r.x*r.x+r.y*r.y)*2.0;\n\n  if (rnorm > 1.0-border_f) {\n    myOutputColor.rgb = border;\n    myOutputColor.a = 1.0;\n  }\n  else {\n    myOutputColor.rgb = fill;\n    myOutputColor.a = opacity;\n  }\n\n}";

// lib/shaders/aura.vert
var aura_default2 = "#version 300 es\n\nin vec2 uv;\nin vec4 position;\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float targScale;\nuniform float targRadius;\nout vec2 vUv;\n\nfloat smax( float a, float b, float k )\n{\n    float h = clamp( 0.5+0.5*(a-b)/k, 0.0, 1.0 );\n    return k*h*(1.0-h)+mix( b, a, h );\n}\n\nvoid main() {\n  vUv = uv;\n\n  mat4 mView = modelViewMatrix;\n  float s = targScale;\n  float h = 2.0/projectionMatrix[1][1];\n  // We use a smooth maximum to make it so that the aura is as big as\n  // targScale times the height of the screen in the zoom out limit, but also\n  // always slightly bigger than the size of the atom itself.\n  s = smax(s*h, 1.1*targRadius, targRadius);\n\n  for (int i = 0; i < 3; ++i) {\n      for (int j = 0; j < 3; ++j) {\n\n          mView[i][j] = (i == j)? s : 0.0;\n\n      }\n  }\n\n  gl_Position = projectionMatrix * mView * position;\n}";

// lib/shaders/index.in.js
"use strict";
