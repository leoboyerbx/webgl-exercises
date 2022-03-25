attribute vec2 aPosition;

uniform vec2 uTranslate;
uniform float uScale;

void main()
{
    // Compute gl_Position in clip space, taking scale and translate into account
    // ..
    gl_Position =  vec4(aPosition.xy * uScale + uTranslate, 0.0, 1.0);
}
