attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_modelMatrix;
uniform mat3 u_normalMatrix;

uniform mat4 u_invProjectionMatrix;
uniform mat4 u_invModelViewMatrix;
uniform mat4 u_invModelMatrix;
uniform mat3 u_invNormalMatrix;

varying vec3 v_posEye;
varying vec3 v_normalEye;

varying vec3 reflectedVector;

void main() {
    // v_normalEye = normalize(a_normal);
    // v_posEye = a_position;
    
    // Convert point and normal to camera space
    v_posEye = vec3(u_modelViewMatrix * vec4(a_position, 1.0));
    v_normalEye = u_normalMatrix * a_normal;

    // Set gl_position
    gl_Position = u_projectionMatrix * u_modelViewMatrix * u_modelMatrix * vec4(a_position, 1.0);

    // Normalize eye point and normal
    vec3 eye = normalize(v_posEye);
    vec3 normal = normalize(v_normalEye);

    // Get world position of object
    vec3 worldPosition = vec3(u_modelMatrix * vec4(a_position, 1.0));
    // Camera position in world space - Object position in world space = view vector
    vec3 viewVector = normalize(v_posEye - worldPosition);

    // Get reflected vector
    reflectedVector = reflect(viewVector, normal);
    // Convert reflected vector back
    // R = vec3(u_invModelViewMatrix * vec4(R, 0.0));
}