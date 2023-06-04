import { isCanvasElement } from '../utils/utils'
function getCanvas () {
  const canvas = document.getElementById('canvas_id')
  if (isCanvasElement(canvas)) return canvas
  throw new Error('not find canvas')
}
function getGl (canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl')
  if (gl) return gl
  throw new Error('create failed gl')
}
function createShader (gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('create filed shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('shader compile message: ' + message)
}
function createProgram (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()
  if (!program) throw new Error('create filed program')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    gl.useProgram(program)
    return program
  }
  const message = gl.getProgramInfoLog(program) ?? ''
  gl.deleteProgram(program)
  throw new Error('program link message: ' + message)
}
function createBuffer (gl: WebGLRenderingContext, program: WebGLProgram) {
  const aPositionIndex = gl.getAttribLocation(program, 'a_position')
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('create buffer filed')
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 0, 1, 0.2, 0.2, 0, 1, -0.4, 0.2, 0, 1, -0.01, -0.4, 0, 1]),
    gl.STATIC_DRAW
  )
  gl.enableVertexAttribArray(aPositionIndex)
  gl.vertexAttribPointer(aPositionIndex, 4, gl.FLOAT, false, 4 * 4, 0 * 4)
  return buffer
}
function drawArrays (gl: WebGLRenderingContext) {
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.clearColor(1, 1, 1, 1)

  gl.drawArrays(gl.LINE_LOOP, 0, 4)
}
window.onload = function () {
  const canvasElement = getCanvas()
  const gl = getGl(canvasElement)
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, 'attribute vec4 a_position; void main() { gl_Position = a_position; }')
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, 'void main() { gl_FragColor = vec4(1.0, 0.5, 1.0, 1.0); }')
  const program = createProgram(gl, vertexShader, fragmentShader)
  createBuffer(gl, program)
  drawArrays(gl)
}
