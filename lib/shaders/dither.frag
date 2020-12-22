uniform vec3 color;
uniform float opacity;
uniform float illum;
uniform vec2 shift;
uniform float ditherN;
uniform bool netting;
uniform float netScale;
uniform sampler2D ditherTex;

varying vec3 vNormal;
varying highp vec2 vUv;

void main() {
// This shader simply checks the coordinates on screen of the pixel to be drawn
// and discards it based on the dithering matrix and alpha value if it has to be transparent.
// In this way we go round all the complexities of intersecting transparent solids with much greater efficiency.
// Check Wikipedias article on ordered dithering for further reference.
   vec2 ditherCoords;
   if (netting) {
       ditherCoords = vUv*ditherN*netScale;
   }
   else {
       ditherCoords = gl_FragCoord.xy;
   }
   float iN = mod(ditherCoords.x+shift.x, ditherN)/ditherN;
   float jN = mod(ditherCoords.y+shift.y, ditherN)/ditherN;
   vec4 ditherCol = texture2D(ditherTex, vec2(iN, jN));
   if (ditherCol.r > opacity)
       discard;
// Lighting is also handled very simply, just a fraction of front illumination + ambient light.
// This mostly because for some reason I cant get it to work with proper lighting (possibly a bug in THREE.js).
   vec3 light = cameraPosition;
   light = normalize(light);
   float dProd = max(0., dot(light, vNormal));
// We combine everything in the final color
   gl_FragColor = vec4(color*((dProd-1.)*illum+1.), 1.);
}