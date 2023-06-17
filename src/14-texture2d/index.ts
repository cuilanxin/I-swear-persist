import { isCanvasElement } from '../utils/utils'
import point from './point16.png'

function createShader (gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('not shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('compile shader failed: ' + message)
}
function initTexture (gl: WebGLRenderingContext, program: WebGLProgram) {
  const uniformTexture = gl.getUniformLocation(program, 'texture')
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const textureHandle = gl.createTexture()
  if (!textureHandle) throw new Error('not texture')
  gl.bindTexture(gl.TEXTURE_2D, textureHandle)
  const image = new Image()
  image.src = point
  image.onload = function () {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)

    gl.uniform1i(uniformTexture, 0)

    gl.clearColor(1.0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, 4)
  }
}
window.onload = function () {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('not canvas')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('not webgl')
  const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    `
  attribute vec4 position; 
  void main() {
    gl_Position=position;
    gl_PointSize=60.0;
  }`
  )
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    `
  precision mediump float; 
  uniform sampler2D texture; 
  void main(){
    vec4 color =texture2D(texture,gl_PointCoord);
    if(color.a < 0.1)
      discard;
    gl_FragColor=color;
  }`
  )
  const program = gl.createProgram()
  if (!program) throw new Error('not program')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? ''
    gl.deleteProgram(program)
    throw new Error('link program failed' + message)
  }
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-0.5, 0.5, 1, 1, 0.5, 0.5, 1, 1, -0.5, -0.5, 1, 1, -0.5, 0.4, 1, 1]),
    gl.STATIC_DRAW
  )

  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 4, gl.FLOAT, false, 0, 0)

  initTexture(gl, program)

  // gl.clearColor(0.2, 0.2, 0.2, 1)
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // gl.drawArrays(gl.POINTS, 0, 3)
}
