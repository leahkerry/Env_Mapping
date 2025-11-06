precision highp float;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_modelMatrix;
uniform mat3 u_normalMatrix;

uniform mat4 u_invProjectionMatrix;
uniform mat4 u_invModelViewMatrix;
uniform mat4 u_invModelMatrix;
uniform mat3 u_invNormalMatrix;

uniform sampler2D uTexture;
uniform sampler2D uObjectTexture;
uniform vec3 u_lightDirWorld;

uniform float u_blend;
uniform int u_diffuse;

const float radius = 8.0;

const float PI = 3.141592653589793;

varying vec3 v_normalEye;
varying vec3 v_posEye; 

// varying vec3 R;

vec2 textureLocation(vec3 dirWorld) {
    float Px = dirWorld[0];
    float Py = dirWorld[1];
    float Pz = dirWorld[2];

    float u = atan(Pz,Px) / (2.0 * PI);
    float v = asin(-1.0 * Py / radius) / PI + 0.5;
    
    return vec2(u, v);
}

// vec4 new_final_color = ambient + blend*texture_color
    // + (1-blend)*diffuse + specular
void main() {
    float diffuse = 1.0;

    // Normalize eye point and normal
    vec3 eye = normalize(v_posEye);
    vec3 normal = normalize(v_normalEye);

    // Get reflected point
    vec3 R = reflect(eye, normal);
    // Convert reflected point back to world space
    R = vec3(u_modelViewMatrix * vec4(R, 0.0));

    vec2 R_texture = textureLocation(R);
    // vec2 R_texture = vec2(R[0], R[1]);

    // get texture color of reflected environment and object
    vec4 texColorWorld = texture2D(uTexture, R_texture);
    vec4 texColorObj = texture2D(uObjectTexture, R_texture);

    // Point w/o reflection:
    // vec2 vTexCoord = textureLocation(v_posEye);
    // // get texture color of environment and object
    // vec4 texColorWorld = texture2D(uTexture, vTexCoord);
    // vec4 texColorObj = texture2D(uObjectTexture, vTexCoord);

    // blend
    vec4 texColor = u_blend * texColorObj + (1.0 - u_blend) * texColorWorld;

    if (u_diffuse == 1) {
        diffuse = dot(v_normalEye, -u_lightDirWorld);
    } 
    gl_FragColor = vec4(diffuse * texColor[0], diffuse * texColor[1], diffuse * texColor[2], 1.0);
}