precision mediump float;
void main() {
 float d = distance(vec2(0.5, 0.5), gl_PointCoord.xy);
 vec3 color = (1.0 - smoothstep(0.2, 0.5, d) ) * vec3(1.0, 0.0, 0.0);
 gl_FragColor = vec4(color, 1.0);
}
