import { isCanvasElement } from '../utils/utils'
function getCanvas (): HTMLCanvasElement {
  const canvasElement = document.getElementById('canvas_id')
  if (isCanvasElement(canvasElement)) return canvasElement
  throw new Error('没有 canvas')
}

function getGl (canvas: HTMLCanvasElement): WebGLRenderingContext {
  const gl = canvas.getContext('webgl')
  if (gl) return gl
  throw new Error('没有 gl 能力')
}
function createShader (gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('没有 shader 能力')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('shader错误： ' + message)
}
function createProgram (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
  const program = gl.createProgram()
  if (!program) throw new Error('没有 program 能力')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    gl.useProgram(program)
    return program
  }
  const message = gl.getProgramInfoLog(program) ?? ''
  throw new Error('program错误： ' + message)
}

function drawArrays (gl: WebGLRenderingContext, program: WebGLProgram): number {
  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  return gl.getAttribLocation(program, 'a_position')
}
const vertexSource = `
attribute vec4 a_position;
void main(){
  gl_Position = a_position;
  gl_PointSize = 10.0;
}
`
const fragmentSource = `
void main() {
  gl_FragColor = vec4(1.0, 0.5, 1.0, 1.0);
}
`
window.onload = function () {
  const canvasElement = getCanvas()
  const gl = getGl(canvasElement)
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = createProgram(gl, vertexShader, fragmentShader)
  const aPositionIndex = drawArrays(gl, program)
  const arr = new Array<number>()
  canvasElement.addEventListener('click', ({ offsetX, offsetY }) => {
    const x = (offsetX / canvasElement.width) * 2 - 1
    const y = 1 - (offsetY / canvasElement.height) * 2
    arr.push(x, y, 0.0, 1.0)
    const buffer = gl.createBuffer()
    if (buffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(aPositionIndex)
      gl.vertexAttribPointer(aPositionIndex, 4, gl.FLOAT, false, 4 * 4, 0 * 4)
      gl.drawArrays(gl.POINTS, 0, arr.length / 4)
    }
  })
}
