precision mediump float;

varying vec2 vTextureCoord;
varying vec2 vBlurTexCoords[12];
varying vec4 vColor;

uniform sampler2D uSampler;

vec4 do_gaussian();
vec4 do_gaussian()
{
    vec4 fragColor = vec4(0.0);

    fragColor += texture2D(uSampler, vBlurTexCoords[ 0]);
    fragColor += texture2D(uSampler, vBlurTexCoords[ 1]);
    fragColor += texture2D(uSampler, vBlurTexCoords[ 2]);
    fragColor += texture2D(uSampler, vTextureCoord     );
    fragColor += texture2D(uSampler, vBlurTexCoords[ 3]);
    fragColor += texture2D(uSampler, vBlurTexCoords[ 4]);
    fragColor += texture2D(uSampler, vBlurTexCoords[ 5]);

    fragColor += texture2D(uSampler, vBlurTexCoords[ 6]);
    fragColor += texture2D(uSampler, vBlurTexCoords[ 7]);
    fragColor += texture2D(uSampler, vBlurTexCoords[ 8]);
    fragColor += texture2D(uSampler, vTextureCoord     );
    fragColor += texture2D(uSampler, vBlurTexCoords[ 9]);
    fragColor += texture2D(uSampler, vBlurTexCoords[10]);
    fragColor += texture2D(uSampler, vBlurTexCoords[11]);
    return (fragColor / vec4(14.0));
    //return vec4(0.0, 0.0, 0.0, 0.0);
}

#define COEFFI 3.5

float aspect = 0.75; // 그림의 너비 비율 가로/세로
vec2 vstep = vec2(0.015, 0.015) / vec2(1.0, aspect);
float dstep = 0.8 / 16.0;

void main(void)
{
    bool flag = false;
    // (top left) - (bottom right)
    float dep1 = 1.0 - texture2D(uSampler, (vTextureCoord + vstep)).r;
    float dep2 = 1.0 - texture2D(uSampler, (vTextureCoord - vstep)).r;
    float diff = dep1-dep2;

    // (left) - (right)
    float dep3 = 1.0 - texture2D(uSampler, (vTextureCoord + vstep * vec2(0.0, 1.0))).r;
    float dep4 = 1.0 - texture2D(uSampler, (vTextureCoord - vstep * vec2(0.0, 1.0))).r;
    float diff2 = dep3-dep4;

    // TODO
    // (top) - (bottom)
    // (top right) - (bottom left)

    if ((diff < 0.0 && -diff > dstep * COEFFI) ||
            (diff > 0.0 && diff > dstep * COEFFI) ||
            (diff2 < 0.0 && -diff2 > dstep * COEFFI) ||
            (diff2 > 0.0 && diff2 > dstep * COEFFI) 
            ) {
        flag = true;
    }

    if (flag) {
        gl_FragColor = do_gaussian();
        return;
    }

    gl_FragColor = texture2D(uSampler, vTextureCoord);
    return;
}
