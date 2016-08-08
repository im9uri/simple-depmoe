
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec2 vBlurTexCoords[12];

void main(void)
{
    float strength = 2.5;
    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;

    // X Blur Coords
    vBlurTexCoords[ 0] = aTextureCoord + vec2(-0.012 * strength, 0.0);
    vBlurTexCoords[ 1] = aTextureCoord + vec2(-0.008 * strength, 0.0);
    vBlurTexCoords[ 2] = aTextureCoord + vec2(-0.004 * strength, 0.0);
    vBlurTexCoords[ 3] = aTextureCoord + vec2( 0.004 * strength, 0.0);
    vBlurTexCoords[ 4] = aTextureCoord + vec2( 0.008 * strength, 0.0);
    vBlurTexCoords[ 5] = aTextureCoord + vec2( 0.012 * strength, 0.0);

    vBlurTexCoords[ 6] = aTextureCoord + vec2(0.0, -0.012 * strength);
    vBlurTexCoords[ 7] = aTextureCoord + vec2(0.0, -0.008 * strength);
    vBlurTexCoords[ 8] = aTextureCoord + vec2(0.0, -0.004 * strength);
    vBlurTexCoords[ 9] = aTextureCoord + vec2(0.0,  0.004 * strength);
    vBlurTexCoords[10] = aTextureCoord + vec2(0.0,  0.008 * strength);
    vBlurTexCoords[11] = aTextureCoord + vec2(0.0,  0.012 * strength);


    vColor = vec4(aColor.rgb, aColor.a);
}
