export const vertexSource = `
  attribute vec4 position;
  attribute vec2 inVar;
  varying vec2 outVar;
  void main() {
    gl_Position = position;
    outVar = inVar;
  }
`

export const fragmentSource = `
  precision mediump float;
  uniform sampler2D texture;
  varying vec2 outVar;
  void main() {
    vec4 color = texture2D(texture, outVar);
    gl_FragColor = color;
  }
`
