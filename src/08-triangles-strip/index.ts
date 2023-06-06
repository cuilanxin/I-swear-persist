import { isCanvasElement } from '../utils/utils'

function getCanvas () {
  const canvasElement = document.getElementById('canvas_id')
  if (isCanvasElement(canvasElement)) return canvasElement
  throw new Error('get canvas failed')
}
function getGl (canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl')
  if (gl) return gl
  throw new Error('get gl failed')
}
function createShader (gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('create shader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('init shader failed: ' + message)
}

window.onload = function () {
  const canvasElement = getCanvas()
  const gl = getGl(canvasElement)
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, 'attribute vec4 position;void main(){gl_Position = position;}')
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    'precision mediump float; void main(){gl_FragColor = vec4(1.0, 0.5, 1.0,1.0);}'
  )
  const program = gl.createProgram()
  if (!program) throw new Error('init program failed')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const programMessage = gl.getProgramInfoLog(program) ?? ''
    gl.deleteProgram(program)
    throw new Error('program link failed: ' + programMessage)
  }
  gl.useProgram(program)
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('init buffer failed')
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // 1
      0, 0, 0, 1,
      // 2
      0.2, 0.2, 0, 1,
      // 3
      0.4, 0, 0, 1,
      // 4
      0.7, 0.1, 0, 1
    ]),
    gl.STATIC_DRAW
  )
  const positionIndex = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(positionIndex)
  gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 4 * 4, 0 * 4)

  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.clearColor(1, 1, 1, 1)
  //   2    4
  // 1   3
  // 使用 上一个三角形的 2 3 定点边 加上第4个定点组成新的三角行
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
