attribute vec3 a_position;
attribute vec3 a_normal;

const float radius = 8.0;
void main() {
    // TODO: compute gl_Position and other variables
    gl_Position = vec4(a_position, 1.0);
}