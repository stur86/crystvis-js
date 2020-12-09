varying vec3 vNormal;
varying highp vec2 vUv;

void main() {
   vNormal = normal;
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
   vUv = uv;
}