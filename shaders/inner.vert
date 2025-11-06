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

// varying vec3 R;

void main() {
    // v_normalEye = normalize(a_normal);
    
    // Convert eye point and normal to object space
    v_posEye = vec3(u_modelViewMatrix * vec4(a_position, 1.0));
    v_normalEye = vec3(u_modelViewMatrix * vec4(a_normal, 0.0));
    // v_normalEye = u_normalMatrix * a_normal; // This could also be right? Idk :D

    // Set gl_position
    gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
}