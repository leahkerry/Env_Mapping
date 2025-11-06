attribute vec3 a_position;
attribute vec3 a_normal;

const float radius = 8.0;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;

varying vec3 v_normalEye;
varying vec3 v_posEye; 

void main() {
    // TODO: compute gl_Position and other variables
    v_normalEye = a_normal;
    v_posEye = a_position;
    // TODO: compute gl_Position
    gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(v_posEye, 1.0);
}