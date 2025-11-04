attribute vec3 a_position;
attribute vec3 a_normal;

void main() {
    // TODO: compute gl_Position
    gl_Position = vec4(a_position, 1.0);
}