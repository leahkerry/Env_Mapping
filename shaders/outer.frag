precision highp float;

uniform sampler2D uTexture;

const float radius = 4.0;

varying vec3 v_posEye;

const float PI = 3.141592653589793;

// TODO: implement textureLocation function
vec2 textureLocation(vec3 dirWorld) {
    float Px = dirWorld[0];
    float Py = dirWorld[1];
    float Pz = dirWorld[2];

    // u = atan2(x,z) / 2pi
    // v = (asin(y) / (2.0 * pi)) + 0.5;
    float u = atan(Pz,Px) / (2.0 * PI);
    float v = asin(-1.0 * Py / radius) / PI + 0.5;
    
    return vec2(u, v);
}
void main() {
    vec3 worldPt = v_posEye;
    vec2 vTexCoord = textureLocation(worldPt);
    vec4 texelColor = texture2D(uTexture, vTexCoord);

    gl_FragColor = texelColor;
}