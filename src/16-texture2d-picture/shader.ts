export const vertexSource = `
  attribute vec4 position;
  void main() {
    gl_Position = position;
  }
`

export const fragmentSource = `
  precision mediump float;
  uniform sampler2D texture;
  void main() {
    vec4 color = texture2D(texture,  gl_PointCoord);
    gl_FragColor = color;
  }
`
