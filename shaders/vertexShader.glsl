attribute vec2 aPosition;

void main() {
 gl_Position = vec4(aPosition, 0.0, 1.0);
 gl_PointSize = 10.0;
}
