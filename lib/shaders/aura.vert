
in vec2 uv;
in vec4 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float targScale;
uniform float targRadius;
out vec2 vUv;

float smax( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(a-b)/k, 0.0, 1.0 );
    return k*h*(1.0-h)+mix( b, a, h );
}

void main() {
  vUv = uv;

  mat4 mView = modelViewMatrix;
  float s = targScale;
  float h = 2.0/projectionMatrix[1][1];
  // We use a smooth maximum to make it so that the aura is as big as
  // targScale times the height of the screen in the zoom out limit, but also
  // always slightly bigger than the size of the atom itself.
  s = smax(s*h, 1.1*targRadius, targRadius);

  for (int i = 0; i < 3; ++i) {
      for (int j = 0; j < 3; ++j) {

          mView[i][j] = (i == j)? s : 0.0;

      }
  }

  gl_Position = projectionMatrix * mView * position;
}