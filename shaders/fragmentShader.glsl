precision mediump float;
void main() {
 vec3 color = vec3(0.0, gl_PointCoord.xy);
 gl_FragColor = vec4(color.brg, 1.0);
}
