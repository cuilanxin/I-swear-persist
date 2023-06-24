import { isCanvasElement } from '../utils/utils'
import { fragmentSource, vertexSource } from './shader'
import ss from '../static/山水原图.png'

function createShader (gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('shader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('shader message: ' + message)
}

function createProgram (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()
  if (!program) throw new Error('program failed')
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
  throw new Error('program message: ' + message)
}

function createBuffer (gl: WebGLRenderingContext, type: GLenum, size: Uint16Array | Float32Array) {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('buffer failed')
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, size, gl.STATIC_DRAW)
  return buffer
}

function draw (gl: WebGLRenderingContext) {
  gl.clearColor(1, 1, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
}

window.onload = function () {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('canvas failed')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('gl failed')
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = createProgram(gl, vertexShader, fragmentShader)

  createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
    -1, 1, 0, 1, /** */ 0, 1,
    1, 1, 0, 1, /** */ 1, 1,
    -1, -1, 0, 1, /** */ 0, 0,
    1, -1, 0, 1, /** */1, 0
  ]))

  createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
    0, 1, 2,
    2, 1, 3
  ]))
  const positionIndex = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(positionIndex)
  gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 6 * 4, 0)

  const inVarIndex = gl.getAttribLocation(program, 'inVar')
  gl.enableVertexAttribArray(inVarIndex)
  gl.vertexAttribPointer(inVarIndex, 2, gl.FLOAT, false, 6 * 4, 4 * 4)

  const img = new Image()
  img.src = ss
  img.onload = function () {
    const texture = gl.createTexture()
    if (!texture) throw new Error('texture failed')
    gl.activeTexture(gl.TEXTURE_2D)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    const textureIndex = gl.getUniformLocation(program, 'texture')
    gl.uniform1f(textureIndex, 1)

    draw(gl)
  }
}
