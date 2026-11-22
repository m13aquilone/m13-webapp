/**
 * Liquid distortion transition: a fullscreen-quad WebGL shader that melts one
 * image into the next through flowing fractal noise, with a rising noisy
 * reveal front, slight chromatic aberration and a thin cyan edge.
 */

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uProgress;
uniform float uTime;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

vec4 sampleRGBA(sampler2D tex, vec2 uv, vec2 shift) {
  vec4 c = texture2D(tex, uv);
  return vec4(texture2D(tex, uv + shift).r, c.g, texture2D(tex, uv - shift).b, c.a);
}

void main() {
  vec2 uv = vUv;
  float p = uProgress;
  float bump = sin(3.14159265 * p);

  vec2 q = vec2(fbm(uv * 3.0 + uTime * 0.08), fbm(uv * 3.0 + vec2(5.2, 1.3) - uTime * 0.06));
  float n = fbm(uv * 2.4 + q * 1.8);
  vec2 dir = (q - 0.5) * 2.0;

  vec2 uvFrom = uv + dir * 0.2 * p + vec2(0.0, 0.07 * p);
  vec2 uvTo = uv - dir * 0.2 * (1.0 - p) - vec2(0.0, 0.07 * (1.0 - p));

  float field = n * 0.7 + uv.y * 0.3;
  float front = p * 1.5 - 0.25;
  float m = smoothstep(field - 0.09, field + 0.09, front);

  vec2 ca = dir * 0.01 * bump;
  vec4 col = mix(sampleRGBA(uFrom, uvFrom, ca), sampleRGBA(uTo, uvTo, ca), m);

  float edge = 1.0 - smoothstep(0.0, 0.022, abs(field - front));
  col.rgb = mix(col.rgb, vec3(0.0, 0.76, 0.82) * col.a, edge * bump * 0.45);

  gl_FragColor = col;
}`;

export type Liquid = {
  setPair: (from: number, to: number) => void;
  render: (progress: number, time: number) => void;
  resize: (width: number, height: number) => void;
  destroy: () => void;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Returns null when WebGL is unavailable, so callers can fall back to a crossfade. */
export function createLiquid(canvas: HTMLCanvasElement, images: HTMLImageElement[]): Liquid | null {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const textures = images.map((img) => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    return tex;
  });

  const uFrom = gl.getUniformLocation(program, "uFrom");
  const uTo = gl.getUniformLocation(program, "uTo");
  const uProgress = gl.getUniformLocation(program, "uProgress");
  const uTime = gl.getUniformLocation(program, "uTime");
  gl.uniform1i(uFrom, 0);
  gl.uniform1i(uTo, 1);

  return {
    setPair(from, to) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[from]);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[to]);
    },
    render(progress, time) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uProgress, progress);
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    },
    destroy() {
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
