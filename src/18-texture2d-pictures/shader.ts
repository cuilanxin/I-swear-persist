export const vertexSource = `
  attribute vec4 position;
  attribute vec2 inVarying;
  varying vec2 outVarying;
  void main() {
    gl_Position = position;
    outVarying = inVarying;
  }
`

export const fragmentSource = `
  precision mediump float;
  uniform sampler2D texture;
  uniform sampler2D texture2;
  varying vec2 outVarying;
  void main() {
    vec4 color = texture2D(texture, outVarying);
    vec4 color2 = texture2D(texture2, outVarying);
    gl_FragColor = color + color2;
  }
`
