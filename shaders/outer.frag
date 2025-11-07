precision highp float;

uniform sampler2D uTexture;

const float radius = 8.0;

varying vec3 v_posEye;

const float PI = 3.141592653589793;


vec2 textureLocation(vec3 dirWorld) {
    float Px = dirWorld[0];
    float Py = dirWorld[1];
    float Pz = dirWorld[2];

    float theta = atan(-Pz,Px);
    float u = 0.0;

    if (theta < 0.0) {
        u = -theta / (2.0 * PI);
    } else {
        u = 1.0 - (theta / (2.0 * PI));
    }

    // float u = atan(Pz,Px) / (2.0 * PI);
    float v = asin(-Py / radius) / PI + 0.5;
    
    return vec2(u, v);
}
void main() {
    vec3 worldPt = v_posEye;
    vec2 vTexCoord = textureLocation(worldPt);
    vec4 texelColor = texture2D(uTexture, vTexCoord);

    gl_FragColor = texelColor;
}