
precision highp float;

uniform float opacity;
uniform vec3 fill;
uniform vec3 border;
uniform float border_f;
in vec2 vUv;
out vec4 myOutputColor;

void main() {
  
  vec2 r = vUv-vec2(0.5, 0.5);
  float rnorm = sqrt(r.x*r.x+r.y*r.y)*2.0;

  if (rnorm > 1.0-border_f) {
    myOutputColor.rgb = border;
    myOutputColor.a = 1.0;
  }
  else {
    myOutputColor.rgb = fill;
    myOutputColor.a = opacity;
  }

}