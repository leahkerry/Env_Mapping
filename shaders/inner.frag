precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uObjectTexture;

const float PI = 3.141592653589793;

// TODO: implement textureLocation function
vec2 textureLocation(vec3 dirWorld) {
    return vec2(0.0, 0.0);
}

void main() {
    // TODO: compute gl_FragColor
    gl_FragColor = vec4(1.0);
}