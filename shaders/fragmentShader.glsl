precision mediump float;

uniform float uLuminance;
varying vec3 vColor;

void main() {
 gl_FragColor = vec4(uLuminance * vColor, 1.0);
}
