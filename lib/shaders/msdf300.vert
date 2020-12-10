#version 300 es

// GLSL 3.0 compliant version of the MSDF shader from three-bmfont-text
// Taken from https://github.com/Jam3/three-bmfont-text/issues/38

in vec2 uv;
in vec4 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * position;
}