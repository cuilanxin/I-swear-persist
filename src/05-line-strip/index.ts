import { isCanvasElement } from '../utils/utils'

function getCanvas () {
  const canvasElement = document.getElementById('canvas_id')
  if (isCanvasElement(canvasElement)) return canvasElement
  throw new Error('没有canvas')
}

function getGl (params: HTMLCanvasElement) {
  const gl = params.getContext('webgl')
  if (gl) return gl
  throw new Error('没有 gl')
}

function createShader (params: WebGLRenderingContext, type: number, source: string) {
  const shader = params.createShader(type)
  if (!shader) throw new Error('shader 失败')
  params.shaderSource(shader, source)
  params.compileShader(shader)
  const success = params.getShaderParameter(shader, params.COMPILE_STATUS)
  if (success) return shader
  const message = params.getShaderInfoLog(shader) ?? ''
  params.deleteShader(shader)
  throw new Error('shader message' + message)
}

function createProgram (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()
  if (!program) throw new Error('没有 program')
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
  throw new Error('program message' + message)
}
function getVertexAttribute (gl: WebGLRenderingContext, program: WebGLProgram) {
  const index = gl.getAttribLocation(program, 'a_position')
  return index
}
function createBuffer (gl: WebGLRenderingContext, index: number) {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('没有 buffer')
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 0.1, 0.1, 0, 1, -0.4, 0.2, 0, 1]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(index)
  gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 4 * 4, 0 * 4)
}
function drawArrays (gl: WebGLRenderingContext) {
  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.LINE_STRIP, 0, 3)
}
window.onload = function () {
  try {
    const canvasElement = getCanvas()
    const gl = getGl(canvasElement)
    const vertexSource = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
        gl_PointSize = 10.0;
      }
    `
    const fragmentSource = `
      void main() {
        gl_FragColor = vec4(1.0, 0.5, 1.0, 1.0);
      }
    `
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
    const program = createProgram(gl, vertexShader, fragmentShader)
    const aPositionIndex = getVertexAttribute(gl, program)
    createBuffer(gl, aPositionIndex)
    drawArrays(gl)
  } catch (error: any) {
    alert(error.message)
  }
}
