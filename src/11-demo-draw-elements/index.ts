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
  throw new Error('compile shader failed:' + message)
}

function createBuffer (gl: WebGLRenderingContext, type: GLenum, data: Float32Array | Uint16Array) {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('create buffer failed')
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, data, gl.STATIC_DRAW)
  return buffer
}
window.onload = function () {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('get canvas failed')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('not gl')
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, 'attribute vec4 position;void main(){gl_Position=position;}')
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    'precision mediump float;void main(){gl_FragColor=vec4(1.0, 0, 0,1);}'
  )
  const program = gl.createProgram()
  if (!program) throw new Error('create program failed')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? ''
    gl.deleteProgram(program)
    throw new Error('link program failed: ' + message)
  }
  gl.useProgram(program)
  const arr = [
    0, 0, 1, 1,
    //
    -0.2, -0.2, 1, 1,
    //
    0.2, -0.2, 1, 1,
    //
    -0.2, 0.2, 1, 1,
    //
    0.2, 0.2, 1, 1
  ]
  createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(arr))
  const indexArr = [0, 1, 2, /** */ 0, 1, 3, /** */ 0, 3, 4, /** */ 0, 4, 2]
  createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArr))
  const index = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(index)
  gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 0, 0)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.clearColor(1, 1, 1, 1)
  gl.drawElements(gl.TRIANGLES, indexArr.length, gl.UNSIGNED_SHORT, 0)
}
