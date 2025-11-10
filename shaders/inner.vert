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

varying vec3 viewVector;
varying vec3 reflectedVector;

void main() {    
    // Get eye point and normal in world space
    vec3 a_normalCam = u_normalMatrix * a_normal;
    v_normalEye = normalize(a_normalCam);    

    // Get world position of object
    vec3 worldPosition = vec3(u_invModelViewMatrix * u_modelMatrix * vec4(a_position, 1.0));
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_posEye = worldPos.xyz;

    // Camera position in world space - Object position in world space = view vector
    viewVector = normalize(v_posEye - worldPosition);

    // Get reflected vector
    vec3 worldNormal = vec3(u_modelMatrix * vec4(a_normal, 0.0));
    reflectedVector = normalize(reflect(viewVector, worldNormal)); // dependent on outer env --> stay in world space
    

    // Set gl_position
    gl_Position = u_projectionMatrix * u_modelViewMatrix * u_modelMatrix * vec4(a_position, 1.0);
}