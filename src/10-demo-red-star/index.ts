import { isCanvasElement } from '../utils/utils'

function createShader (gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('create shader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('compile shader failed: ' + message)
}
window.onload = function () {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('get canvas failed')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('create gl failed')
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, 'attribute vec4 position;void main(){gl_Position=position;}')
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    'precision mediump float;void main(){gl_FragColor=vec4(1.0, 0, 0, 1.0);}'
  )
  const program = gl.createProgram()
  if (!program) throw new Error('create program failed')
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
  if (!buffer) throw new Error('create buffer failed')
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // 1
      0, 0.8, 1, 1,
      // 2
      0.3, -0.3, 1, 1,
      // 3
      -0.5, 0.4, 1, 1,
      // 4
      0.5, 0.4, 1, 1,
      // 5
      -0.3, -0.3, 1, 1
    ]),
    gl.STATIC_DRAW
  )
  const index = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(index)
  gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 0, 0)

  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.clearColor(1, 1, 1, 1)
  gl.drawArrays(gl.LINE_LOOP, 0, 5)
}
