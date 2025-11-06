precision highp float;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat3 u_normalMatrix;

uniform sampler2D uTexture;
uniform sampler2D uObjectTexture;
uniform vec3 u_lightDirWorld;

uniform int u_blend;
uniform int u_diffuse;

const float PI = 3.141592653589793;

varying vec3 v_normalEye;
varying vec3 v_posEye; 

// TODO: implement textureLocation function
vec2 textureLocation(vec3 dirWorld) {
    return vec2(0.0, 0.0);
}

void main() {
    float diffuse = 0.0;
    
    // if (u_diffuse) {
    diffuse = dot(v_normalEye, -u_lightDirWorld);
    gl_FragColor = vec4(diffuse, diffuse, diffuse, 1.0);
    // }
    // float diffuse = dot(v_normalEye, u_lightDirWorld);
    // gl_FragColor = vec4(diffuse, diffuse, diffuse, 1.0);
}