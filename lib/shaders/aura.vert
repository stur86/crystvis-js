#version 300 es

in vec2 uv;
in vec4 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float targScale;
out vec2 vUv;

void main() {
  vUv = uv;

  mat4 mView = modelViewMatrix;
  float s = targScale;
  s = s*2.0/projectionMatrix[1][1];

  for (int i = 0; i < 3; ++i) {
      for (int j = 0; j < 3; ++j) {

          mView[i][j] = (i == j)? s : 0.0;

      }
  }

  gl_Position = projectionMatrix * mView * position;
}