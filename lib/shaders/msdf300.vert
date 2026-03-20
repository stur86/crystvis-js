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

  // When the scale is fixed, we make sure s and projection matrix cancel each other out
  s = fixScale? s*2.0/projectionMatrix[1][1] : s;

  // If rotation is fixed, the modelView matrix is made to contain scaling only
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
  // The shift is scaled so that it follows the camera's zoom
  vec4 pMshift = vec4(projectionMatrix[0][0], projectionMatrix[1][1], projectionMatrix[2][2], 1);
  shift4.xyz = shift;

  gl_Position = projectionMatrix * mView * position + shift4 * pMshift;
}