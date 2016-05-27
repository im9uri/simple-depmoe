attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aColor;

uniform vec2 projectionVector;
uniform vec2 offsetVector;

varying vec2 vTextureCoord;
varying vec4 vColor;

const vec2 center = vec2(-1.0, 1.0);

void main(void) {
   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);
   vTextureCoord = aTextureCoord;
   vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;
   vColor = vec4(color * aColor.x, aColor.x);
}
