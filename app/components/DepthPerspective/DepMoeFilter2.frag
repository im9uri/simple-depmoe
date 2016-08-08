precision mediump float;

/*
 * scale : calm->normal->dynamic 메뉴의 값으로 (0 .. 1)의 값을 갖는다. 값이 커질수록 마우스 움직임 효과가 커진다.
 * focus : near->moddle->far 메뉴의 값으로 (0 .. 1)의 값을 갖는다. 값이 커질수록 마우스 움직임 반대방향으로 더 많이 픽셀을 본다. 작아질 수록 마우스 반대 방향으로 더 많은 픽셀을 본다.
 */

varying vec2 vTextureCoord;
varying vec4 vColor;
uniform sampler2D displacementMap;
uniform sampler2D uSampler;
uniform vec4 dimensions;
uniform vec2 mapDimensions;
uniform float scale; // calm -> normal -> dynamic
uniform vec2 offset;
uniform float focus; // near -> middle -> far

// TODO
// 급격히 depth의 변화가 있는 부분에 대해서는 step을 특별히 늘려주는게 해당 부분이 자연스럽게 보일 듯???

/*
 * COLORAVG : color averge 기법으로 색을 추정한다.
 * MAXSTEPS : 높을수록 더 세세하게 픽셀을 조사한다. 경계가 급격히 변하는데에서 좀 더 자연스럽게 보이게 해준다.
 * ENLARGE : 
 */

#define METHOD 1
#define CORRECT
#define COLORAVG
#define MAXSTEPS 16.0
#define ENLARGE 1.5
#define ANTIALIAS 2
#define CONFIDENCE_MAX 2.5

#define BRANCHLOOP  
#define BRANCHSAMPLE 
#define DEBUG 0
// #define DEBUGBREAK 2

#define UPSCALE 1.06
#define COMPRESSION 0.8
#define CORRECTION_MATH +( ( vec2((depth - dpos) / (dstep * correctPower)) * vstep ))
#define AA_TRIGGER 0.8

#ifdef ANTIALIAS
    #define LOOP_INDEX j
    float j = 0.0;
#endif
#ifndef LOOP_INDEX
    #define LOOP_INDEX i
#endif

#define BLURSTEP 8.0

const float upscale = UPSCALE;
float steps = MAXSTEPS;
const float compression = COMPRESSION;

float aspect = dimensions.x / dimensions.y; // 그림의 너비 비율 가로/세로
const float dmin = (1.0 - compression) / 2.0; // depth 최소값
const float dmax = (1.0 + compression) / 2.0; // depth 최대값
const float vectorCutoff = 0.0 + dmin - 0.0001; // ella: 0.0999
vec2 scale2 = vec2(scale) * vec2(1, -1) * vec2(ENLARGE) * vec2(min(1.0, 1.0/aspect), min(1.0, aspect));
mat2 baseVector = mat2(offset * (0.0 - focus) * scale2 * vec2(-1, -1),  // mouse 반대 방향으로 볼 픽셀들의 양 -> 적은 이동
                       offset * (1.0 - focus) * scale2 * vec2(-1, -1)); // mouse 방향으로 볼 픽셀들의 양 -> 큰 이동
float correctPower = 1.0;//max(1.0, steps / 8.0);


void main(void) {

    vec2 pos = (vTextureCoord - vec2(0.5)) / vec2(upscale) + vec2(0.5);
    mat2 vector = baseVector;
    float dstep = compression / (steps - 1.0);
    vec2 vstep = (vector[1] - vector[0]) / vec2((steps - 1.0)) ;
    #ifdef COLORAVG
    vec4 colSum = vec4(0.0);
    #else
    vec2 posSum = vec2(0.0);
    #endif

    float confidenceSum = 0.0;
    float minConfidence = dstep / 2.0;
    bool flag = false;

    /*
    float dep1 = 1.0 - texture2D(displacementMap, (pos + MAXSTEPS/3.0 * vstep)).r;
    float dep2 = 1.0 - texture2D(displacementMap, (pos - MAXSTEPS/3.0 * vstep)).r;
    float diff = dep1-dep2;
    if ((diff < 0.0 && -diff > dstep * 4.0)) {
        flag = true;
    }
    */

    for(float i = 0.0; i < MAXSTEPS; ++i) {
        vec2 vpos = pos + vector[1] - LOOP_INDEX * vstep;
        float dpos = 0.5 + compression / 2.0 - LOOP_INDEX * dstep;
        if (dpos >= vectorCutoff && confidenceSum < CONFIDENCE_MAX) {
            float depth = 1.0 - texture2D(displacementMap, vpos).r;
            // ella: darker -> close obj -> need large depth value
            /*
            if (flag) {
                depth = (dep1 + dep2) / 2.0;
            } 
            */

            depth = clamp(depth, dmin, dmax);
            float confidence = step(dpos, depth + 0.001);

            #ifndef ANTIALIAS
            #elif ANTIALIAS == 2 // go back halfstep, go forward fullstep - mult
            j += 1.0 + step(AA_TRIGGER, confidence) 
                * step(i, j) * -1.5; 
            #endif

            if (confidence > 0.0) {
                #ifdef COLORAVG    
                colSum += texture2D(uSampler, vpos CORRECTION_MATH) * confidence;
                #else
                posSum += (vpos CORRECTION_MATH) * confidence;    
                #endif
                confidenceSum += confidence;
            }

            #if DEBUG > 2
            gl_FragColor = vec4(vector[0] / 2.0 + 1.0, vector[1].xy / 2.0 + 1.0);
            #elif DEBUG > 1
            gl_FragColor = vec4(confidenceSum, depth, dpos, 0);
            #elif DEBUG > 0
            gl_FragColor = vec4(confidence, depth, dpos, 0);
            #endif
            #ifdef DEBUGBREAK 
            if (i == float(DEBUGBREAK)) {
                dpos = 0.0;
            }
            #endif
        }
    }

    //if (flag) {
    //    gl_FragColor = vec4(0.0, 1.0, 0.0, 0.0);
    //    return;
    //}

    #if defined(COLORAVG) && DEBUG == 0
    gl_FragColor = colSum / vec4(confidenceSum);
    #elif !defined(COLORAVG) && DEBUG == 0
    gl_FragColor = texture2D(uSampler, posSum / confidenceSum);
    #endif
}
