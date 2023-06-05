import { isCanvasElement } from '../utils/utils'

function getCanvas () {
  const canvasElement = document.getElementById('canvas_id')
  if (isCanvasElement(canvasElement)) return canvasElement
  throw new Error('not canvas element')
}
function getGl (canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl')
  if (gl) {
    // gl.viewport(0, 0, canvas.width, canvas.height)
    return gl
  }
  throw new Error('init webgl error')
}
function createShader (gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('create shader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('create shader fail message' + message)
}
function createProgram (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()
  if (!program) throw new Error('init program error')
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
  throw new Error('program message:' + message)
}
function createBuffer (gl: WebGLRenderingContext) {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('init buffer failed')
  return buffer
}
function initPoint (gl: WebGLRenderingContext, program: WebGLProgram, buffer: WebGLBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 0.2, 0.2, 0, 1, 0.4, 0, 0, 1]), gl.STATIC_DRAW)
  const index = gl.getAttribLocation(program, 'position_point')
  gl.enableVertexAttribArray(index)
  gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 0, 0 * 4)
}
function drawArrays (gl: WebGLRenderingContext) {
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.clearColor(1, 1, 1, 1)

  gl.drawArrays(gl.TRIANGLES, 0, 3)
}
window.onload = function () {
  const canvasElement = getCanvas()
  const gl = getGl(canvasElement)
  const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    'attribute vec4 position_point; void main(){ gl_Position = position_point; }'
  )
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, 'void main(){ gl_FragColor = vec4(1.0, 0.5, 1.0, 1.0); }')
  const program = createProgram(gl, vertexShader, fragmentShader)
  const buffer = createBuffer(gl)
  initPoint(gl, program, buffer)
  drawArrays(gl)
}
