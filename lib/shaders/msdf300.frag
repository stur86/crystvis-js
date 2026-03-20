// GLSL 3.0 compliant version of the MSDF shader from three-bmfont-text
// Taken from https://github.com/Jam3/three-bmfont-text/issues/38

precision highp float;

uniform float opacity;
uniform vec3 color;
uniform sampler2D map;
in vec2 vUv;
out vec4 myOutputColor;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  vec3 s = texture(map, vUv).rgb;
  float sigDist = median(s.r, s.g, s.b) - 0.5;
  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
  
  myOutputColor = vec4(color.xyz, alpha * opacity);
  if (myOutputColor.a < 0.0001) discard;
}