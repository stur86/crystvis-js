#version 300 es

// GLSL 3.0 compliant version of the MSDF shader from three-bmfont-text
// Taken from https://github.com/Jam3/three-bmfont-text/issues/38

in vec2 uv;
in vec4 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float targScale;
uniform bool fixRotation;
uniform bool fixScale;
uniform vec3 shift;
out vec2 vUv;

void main() {
  vUv = uv;

  mat4 mView = modelViewMatrix;
  float s = targScale;
  s = fixScale? s*2.0/projectionMatrix[1][1] : s;

  if (fixRotation) {
    for (int i = 0; i < 3; ++i) {
        for (int j = 0; j < 3; ++j) {

            mView[i][j] = (i == j)? s : 0.0;

            if (i == 1) {
                mView[i][j] = -mView[i][j];
            }
        }
    }
  }

  vec4 shift4 = vec4(0.,0.,0.,0.);
  shift4.xyz = shift;

  gl_Position = projectionMatrix * mView * position + shift4;
}