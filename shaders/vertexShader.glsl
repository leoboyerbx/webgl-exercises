attribute vec2 aPosition;

uniform mat4 uTransform;

void main() {
    gl_Position = uTransform * vec4(aPosition, 0.0, 1.0);
}
