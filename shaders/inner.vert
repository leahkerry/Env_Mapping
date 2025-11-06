attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;

varying vec3 v_normalEye;
varying vec3 v_posEye; 

void main() {
    // v_normalEye = a_normal;
    // vec3 test = vec3(1.0, 1.0, 1.0)
    v_normalEye = normalize(a_normal);
    v_posEye = a_position;
    // TODO: compute gl_Position
    gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(v_posEye, 1.0);
}